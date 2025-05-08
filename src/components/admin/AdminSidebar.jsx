import { useState, useEffect } from "react"
import { Link, Navigate, useLocation } from "react-router-dom"
import {
  MdDashboard,
  MdCheckroom,
  MdInventory,
  MdShoppingCart,
  MdAttachMoney,
  MdLocationOn,
  MdPeople,
  MdLogout,
} from "react-icons/md"
import { FaChevronDown, FaChevronRight } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
// Utility function to combine class names
const cn = (...classes) => classes.filter(Boolean).join(" ")

function AdminSidebar({ className, isMobile = false, onClose }) {
  const location = useLocation()
  const pathname = location.pathname
  const [openSubmenus, setOpenSubmenus] = useState({})

  // Initialize open submenus based on active path
  useEffect(() => {
    const newOpenSubmenus = {}

    menuItems.forEach((item) => {
      if (item.hasSubmenu && item.submenuItems) {
        const isSubmenuActive = item.submenuItems.some((subItem) => pathname === subItem.path)
        if (isSubmenuActive) {
          newOpenSubmenus[item.submenuKey] = true
        }
      }
    })

    setOpenSubmenus((prev) => ({ ...prev, ...newOpenSubmenus }))
  }, [pathname])

  const toggleSubmenu = (menu) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }))
  }

  const navigate = useNavigate()

  const handleToUserPage = async () => {
    // Implement your logout logic here
    // For example:
    // await logout();
    navigate("/akun")
    // Close mobile sidebar if applicable
    if (isMobile && onClose) {
      onClose()
    }
  }

  const handleNavigation = () => {
    // Close mobile sidebar after navigation (if on mobile)
    if (isMobile && onClose) {
      onClose()
    }
  }

  const menuItems = [
    {
      path: "/admin/dashboard",
      icon: <MdDashboard size={20} />,
      title: "Dashboard",
    },
    {
      title: "Pakaian",
      icon: <MdCheckroom size={20} />,
      hasSubmenu: true,
      submenuKey: "pakaian",
      submenuItems: [
        { path: "/admin/pakaian/tambah", title: "Tambah Pakaian" },
        { path: "/admin/pakaian/tabel", title: "Tabel Pakaian" },
      ],
    },
    {
      title: "Bahan",
      icon: <MdInventory size={20} />,
      hasSubmenu: true,
      submenuKey: "bahan",
      submenuItems: [
        { path: "/admin/bahan/tambah", title: "Tambah Bahan" },
        { path: "/admin/bahan/tabel", title: "Tabel Bahan" },
      ],
    },
    {
      path: "/admin/pemesanan",
      icon: <MdShoppingCart size={20} />,
      title: "Pemesanan",
    },
    {
      title: "Keuangan",
      icon: <MdAttachMoney size={20} />,
      hasSubmenu: true,
      submenuKey: "keuangan",
      submenuItems: [
        { path: "/admin/keuangan/pemasukan", title: "Pemasukan" },
        { path: "/admin/keuangan/pengeluaran", title: "Pengeluaran" },
      ],
    },
    {
      path: "/admin/sebaran-pelanggan",
      icon: <MdLocationOn size={20} />,
      title: "Sebaran Pelanggan",
    },
    {
      path: "/admin/akun-terdaftar",
      icon: <MdPeople size={20} />,
      title: "Akun Terdaftar",
    },
  ]

  const isActive = (path) => (path ? pathname === path : false)

  return (
    <div className={cn("h-[100dvh] w-64 bg-[#5D4037] text-white shadow-lg flex flex-col", className)}>
      {/* Header */}
      <div className="p-6 border-b border-[#795548] flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold tracking-wider">Admin Panel</h1>
      </div>

      {/* Menu Items */}
      <nav className="mt-4 flex-grow overflow-y-auto">
        {menuItems.map((item, index) => (
          <div key={index}>
            {item.hasSubmenu ? (
              // Menu with submenu
              <div>
                <button
                  onClick={() => toggleSubmenu(item.submenuKey)}
                  className={cn(
                    "w-full flex items-center justify-between px-6 py-3 text-sm transition-colors duration-200",
                    isActive(item.path)
                      ? "bg-[#3E2723] text-white"
                      : "text-gray-300 hover:bg-[#4E342E] hover:text-white",
                  )}
                >
                  <div className="flex items-center space-x-4">
                    <span className="w-6">{item.icon}</span>
                    <span className="font-medium">{item.title}</span>
                  </div>
                  {openSubmenus[item.submenuKey] ? <FaChevronDown size={16} /> : <FaChevronRight size={16} />}
                </button>
                {/* Submenu */}
                <div
                  className={cn(
                    "transition-all duration-300 overflow-hidden",
                    openSubmenus[item.submenuKey] ? "max-h-40" : "max-h-0",
                  )}
                >
                  {item.submenuItems?.map((subItem, subIndex) => (
                    <Link
                      key={subIndex}
                      to={subItem.path}
                      onClick={handleNavigation}
                      className={cn(
                        "flex items-center pl-16 pr-6 py-2 text-sm transition-colors duration-200",
                        isActive(subItem.path)
                          ? "bg-[#3E2723] text-white"
                          : "text-gray-300 hover:bg-[#4E342E] hover:text-white",
                      )}
                    >
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              // Menu without submenu
              <Link
                to={item.path || "#"}
                onClick={handleNavigation}
                className={cn(
                  "flex items-center px-6 py-3 text-sm transition-colors duration-200",
                  isActive(item.path) ? "bg-[#3E2723] text-white" : "text-gray-300 hover:bg-[#4E342E] hover:text-white",
                )}
              >
                <div className="flex items-center space-x-4">
                  <span className="w-6">{item.icon}</span>
                  <span className="font-medium">{item.title}</span>
                </div>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleToUserPage}
        className="w-full flex items-center px-6 py-3 text-sm transition-colors duration-200 text-gray-300 hover:bg-[#4E342E] hover:text-white border-t border-[#795548]"
      >
        <span className="w-6">
          <MdLogout size={20} />
        </span>
        <span className="font-medium ml-4">Kembali</span>
      </button>
        
      {/* Footer */}
      <div className="py-4 text-center text-sm text-gray-400 border-t border-[#795548]">
        <p>© Admin Panel 2024</p>
      </div>
    </div>
  )
}

export default AdminSidebar
