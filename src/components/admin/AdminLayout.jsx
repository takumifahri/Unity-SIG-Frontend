"use client"

import { useEffect, useState, useRef } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { Menu } from "@mui/icons-material"
import { FaUser, FaSignOutAlt, FaCog, FaChevronDown } from "react-icons/fa"
import axios from "axios"
import Avatar from "@mui/material/Avatar"
import AdminSidebar from "./AdminSidebar"

// Simple Sheet component for mobile sidebar
function Sheet({ children, isOpen, onClose }) {
    return (
      <div className={("fixed inset-0 z-50", isOpen ? "block" : "hidden")}>
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        <div
          className={(
            "fixed inset-y-0 left-0 z-50 bg-[#5D4037] w-64 shadow-xl transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    )
  }
  

const AdminLayout = () => {
  // You can use your actual auth context here
  const { isAuth, user, logout } = {
    isAuth: () => true,
    user: {},
    logout: () => console.log("Logging out"),
  } // Replace with useAuth();

  const [dataMe, setUsers] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  const me = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      console.log("me masuk : ", res.data.user)
      setUsers(res.data.user)

      if (res.data.user.role !== "admin" && res.data.user.role !== "owner" && res.data.user.role !== "developer") {
        navigate("/login")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      // Handle error - maybe redirect to login
    }
  }

  useEffect(() => {
    me()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
        <AdminSidebar isMobile={true} onClose={() => setIsSidebarOpen(false)} />
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header with menu button */}
        <header className="md:hidden bg-[#5D4037] text-white p-4 shadow-md flex items-center justify-between">
          <button className="p-2 rounded hover:bg-[#4E342E] transition-colors" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </button>
          <h1 className="text-xl font-bold">Admin Panel</h1>

          {/* Mobile notification icon */}
          <div className="relative">
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              1
            </span>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
        </header>

        {/* Desktop Navbar */}
        <div className="bg-white shadow-sm w-full flex justify-end">
          <div className="flex justify-between items-center px-4 py-3 md:px-8">
            <div className="profile relative flex items-center space-x-4" ref={dropdownRef}>
              <div className="relative">
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  1
                </span>
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <div
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded-full py-1 px-2 transition-colors"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <Avatar
                  alt={dataMe?.name || "User"}
                  src={
                    dataMe?.profile_photo
                      ? `${process.env.REACT_APP_API_URL}/${dataMe?.profile_photo}`
                      : "/avatar-placeholder.png"
                  }
                  sx={{ width: 36, height: 36 }}
                />
                <div className="flex flex-col items-start">
                  <span className="text-gray-700 text-sm font-medium">{dataMe?.name || "User"}</span>
                  <span className="text-gray-500 text-xs">{dataMe?.role || "Admin"}</span>
                </div>
                <FaChevronDown
                  className={`text-gray-500 transition-transform duration-200 ${dropdownOpen ? "transform rotate-180" : ""}`}
                  size={14}
                />
              </div>

              {/* Enhanced Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                  {/* User info section */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-sm font-medium text-gray-700">{dataMe?.name || "User"}</p>
                    <p className="text-xs text-gray-500 truncate">{dataMe?.email || "user@example.com"}</p>
                  </div>

                  <ul className="py-2">
                    <li>
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => navigate("/profile")}
                      >
                        <FaUser className="mr-3 text-gray-500" size={16} />
                        <span>Profile</span>
                      </button>
                    </li>
                    <li>
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => navigate("/settings")}
                      >
                        <FaCog className="mr-3 text-gray-500" size={16} />
                        <span>Settings</span>
                      </button>
                    </li>
                    <li className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        onClick={() => logout()}
                      >
                        <FaSignOutAlt className="mr-3 text-red-500" size={16} />
                        <span>Logout</span>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-8 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
