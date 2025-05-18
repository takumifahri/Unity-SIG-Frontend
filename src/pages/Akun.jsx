"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Tab, Nav, Form, Table } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import Swal from "sweetalert2"
import { BiSolidFaceMask } from "react-icons/bi"
import { FaCrown } from "react-icons/fa6"
import { MdOutlineVerifiedUser } from "react-icons/md"
import { Box, Typography, Select, MenuItem, FormControl, Divider, Grid, Paper } from "@mui/material"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import Button from "@mui/material/Button"
import Pagination from "@mui/material/Pagination"
import { Link } from "react-router-dom"
import { Alert } from "@mui/material"
import LocationInfo from "../components/locaation-info"
import LocationMap from "../components/location-map"

function Akun() {
  const navigate = useNavigate()
  const { user, isAuth, Logout, token, loading } = useAuth()
  const [profileLoading, setProfileLoading] = useState(true)
  const [filterType, setFilterType] = useState("Custom")
  const [orders, setOrders] = useState([])
  const [mapPosition, setMapPosition] = useState([-6.588878, 106.806207])
  const [page, setPage] = useState(() => {
    const savedPage = localStorage.getItem("currentOrderPage")
    return savedPage ? Number.parseInt(savedPage, 10) : 1
  })
  const [locationSearch, setLocationSearch] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  useEffect(() => {
    localStorage.setItem("currentOrderPage", page)
  }, [page])

  const itemsPerPage = 5
  // Utility function to safely access nested properties
  const safeGet = (obj, path, fallback = "") => {
    try {
      return path.split(".").reduce((o, key) => o[key], obj) || fallback
    } catch (e) {
      return fallback
    }
  }

  const getOrder = async () => {
    try {
      const resp = await axios.get(`${process.env.REACT_APP_API_URL}/api/order/tracking`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
        },
      })
      console.log("order data:", resp.data.data)
      setOrders(resp.data.data)
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    }
  }

  // Check if user is logged in and fetch data
  useEffect(() => {
    if (!loading) {
      if (!isAuth() || !token) {
        console.log("No auth or token, redirecting to login")
        navigate("/login")
      } else {
        getOrder()
        setProfileLoading(false)
      }
    }
  }, [isAuth, navigate, token, loading])

  const filteredOrders =
    filterType === "Default"
      ? [...(orders?.custom_orders || []), ...(orders?.orders || [])]
      : filterType === "Custom"
        ? orders?.custom_orders
        : orders?.orders

  const handleFilterChange = (event) => {
    setFilterType(event.target.value)
  }

  const handleDetailClick = (orderId) => {
    if (filterType === "Custom") {
      navigate(`/pesanan/${orderId}`)
    } else if (filterType === "Catalog") {
      navigate(`/pesananJadi/${orderId}`)
    }
  }

  const [userInfo, setUserInfo] = useState({
    nama: "",
    email: "",
    telepon: "",
    gender: "",
    profile_photo: "",
    total_order: 0,
    role: "",
    google_id: "",
    facebook_id: "",
    label: "",
    latitude: 0,
    longitude: 0,
    address: "",
    city: "",
    region: "",
    postal_code: "",
  })

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // State for feedback
  const [feedback, setFeedback] = useState({
    type: "",
    message: "",
  })

  const [showPhotoForm, setShowPhotoForm] = useState(false)

  const updatePhoto = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("profile_photo", e.target.files[0])

    try {
      setFeedback({
        type: "info",
        message: "Mengupload foto...",
      })

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/profile/update_avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
        },
      })

      setUserInfo((prev) => ({
        ...prev,
        profile_photo: response.data.profile_photo,
      }))

      setFeedback({
        type: "success",
        message: "Foto profil berhasil diperbarui!",
      })

      // Refresh the page
      window.location.reload()
    } catch (error) {
      console.error("Error updating photo:", error)
      setFeedback({
        type: "danger",
        message: error.response?.data?.message || "Gagal memperbarui foto profil!",
      })
    }

    setTimeout(() => {
      setFeedback({ type: "", message: "" })
    }, 3000)
  }

  // State for edit mode and temporary data
  const [isEditing, setIsEditing] = useState(false)
  const [tempUserInfo, setTempUserInfo] = useState({ ...userInfo })

  // Update user info when auth user changes
  useEffect(() => {
    if (user) {
      console.log("User data in Akun component:", user)

      // Extract user data regardless of structure
      const userData = user.user || user

      // Extract location data safely
      const location = userData.location || {}

      setUserInfo({
        nama: safeGet(userData, "name") || safeGet(userData, "email", ""),
        email: safeGet(userData, "email", ""),
        telepon: safeGet(userData, "phone") || safeGet(userData, "telepon", ""),
        gender: safeGet(userData, "gender", ""),
        profile_photo:
          safeGet(userData, "profile_photo") ||
          `${process.env.REACT_APP_API_URL}/${safeGet(userData, "profile_photo", "")}`,
        total_order: safeGet(userData, "total_order", 0),
        role: safeGet(userData, "role", ""),
        google_id: safeGet(userData, "google_id", ""),
        facebook_id: safeGet(userData, "facebook_id", ""),
        label: safeGet(location, "label", ""),
        latitude: safeGet(location, "latitude", 0),
        longitude: safeGet(location, "longitude", 0),
        address: safeGet(location, "address", ""),
        city: safeGet(location, "city", ""),
        region: safeGet(location, "region", ""),
        postal_code: safeGet(location, "postal_code", ""),
      })

      // Also update tempUserInfo for editing
      setTempUserInfo({
        nama: safeGet(userData, "name") || safeGet(userData, "email", ""),
        email: safeGet(userData, "email", ""),
        telepon: safeGet(userData, "phone") || safeGet(userData, "telepon", ""),
        gender: safeGet(userData, "gender", ""),
        profile_photo:
          safeGet(userData, "profile_photo") ||
          `${process.env.REACT_APP_API_URL}/${safeGet(userData, "profile_photo", "")}`,
        total_order: safeGet(userData, "total_order", 0),
        role: safeGet(userData, "role", ""),
        google_id: safeGet(userData, "google_id", ""),
        facebook_id: safeGet(userData, "facebook_id", ""),
        label: safeGet(location, "label", ""),
        latitude: safeGet(location, "latitude", 0),
        longitude: safeGet(location, "longitude", 0),
        address: safeGet(location, "address", ""),
        city: safeGet(location, "city", ""),
        region: safeGet(location, "region", ""),
        postal_code: safeGet(location, "postal_code", ""),
      })

      setProfileLoading(false)
    }
  }, [user])

  console.log("profile photo path:", userInfo.profile_photo)

  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    number: false,
    uppercase: false,
    lowercase: false,
  })

  // State for visibility toggle
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  // Order history state
  const [orderHistory, setOrderHistory] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  // Handle token from URL (for password reset cases, etc.)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get("token")

    if (urlToken) {
      console.log("Found token in URL, storing it")
      localStorage.setItem("token", urlToken)

      // Clean token from URL for security
      const cleanUrl = window.location.origin + window.location.pathname
      window.history.replaceState({}, document.title, cleanUrl)
    }
  }, [])

  // Fetch order history
  useEffect(() => {
    const fetchOrderHistory = async () => {
      if (token) {
        try {
          setOrdersLoading(true)
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/order/history`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
            },
          })

          console.log("Order history response:", response.data.data)
          setOrderHistory(response.data.data || [])
          setOrdersLoading(false)
        } catch (error) {
          console.error("Error fetching order history:", error)
          setOrdersLoading(false)
        }
      }
    }

    fetchOrderHistory()
  }, [token])

  // Validate email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  // Validate phone number
  const validatePhone = (phone) => {
    if (!phone) return true // Allow empty phone
    const re = /^[0-9]{10,13}$/
    return re.test(phone)
  }

  const handleEditToggle = () => {
    if (isEditing) {
      // If in edit mode and clicked cancel, revert to original data
      setTempUserInfo({ ...userInfo })
    }
    setIsEditing(!isEditing)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setTempUserInfo({
      ...tempUserInfo,
      [name]: value,
    })
  }

  const searchLocation = async () => {
    if (!locationSearch.trim()) return

    setIsSearching(true)
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: locationSearch,
          format: "json",
          limit: 5,
        },
      })

      setSearchResults(response.data)
    } catch (err) {
      console.error("Error searching location:", err)
      setFeedback({
        type: "danger",
        message: "Gagal mencari lokasi",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectLocation = (result) => {
    const lat = Number.parseFloat(result.lat)
    const lon = Number.parseFloat(result.lon)

    setMapPosition([lat, lon])
    setTempUserInfo({
      ...tempUserInfo,
      latitude: lat,
      longitude: lon,
      address: result.display_name || "",
    })

    setSearchResults([])
    setLocationSearch("")
  }

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target
    setPasswords({
      ...passwords,
      [name]: value,
    })

    if (name === "newPassword") {
      validatePasswordRules(value)
    }
  }

  const handleInfoUpdate = async (e) => {
    e.preventDefault()

    // Validate input
    if (!tempUserInfo.nama.trim()) {
      setFeedback({
        type: "danger",
        message: "Nama tidak boleh kosong",
      })
      return
    }

    // Validate email
    if (!validateEmail(tempUserInfo.email)) {
      setFeedback({
        type: "danger",
        message: "Format email tidak valid",
      })
      return
    }

    if (tempUserInfo.telepon && !validatePhone(tempUserInfo.telepon)) {
      setFeedback({
        type: "danger",
        message: "Format nomor telepon tidak valid",
      })
      return
    }

    try {
      setFeedback({
        type: "info",
        message: "Menyimpan perubahan...",
      })

      // Make API call to update user data
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/profile/update_profile`,
        {
          name: tempUserInfo.nama,
          email: tempUserInfo.email,
          phone: tempUserInfo.telepon,
          gender: tempUserInfo.gender,
          address: tempUserInfo.address,
          latitude: tempUserInfo.latitude,
          longitude: tempUserInfo.longitude,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
          },
        },
      )

      // Update userInfo with temporary data
      setUserInfo({ ...tempUserInfo })

      setFeedback({
        type: "success",
        message: "Informasi akun berhasil diperbarui!",
      })

      // Disable edit mode
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      setFeedback({
        type: "danger",
        message: error.response?.data?.message || "Gagal memperbarui informasi akun!",
      })
    }

    setTimeout(() => {
      setFeedback({ type: "", message: "" })
    }, 3000)
  }

  const validatePasswordRules = (password) => {
    setPasswordValidation({
      length: password.length >= 8,
      number: /[0-9]/.test(password),
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
    })
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    // Validate all rules are met
    const allRulesMet = Object.values(passwordValidation).every((rule) => rule)

    if (!allRulesMet) {
      setFeedback({
        type: "danger",
        message: "Password harus memenuhi semua kriteria",
      })
      return
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setFeedback({
        type: "danger",
        message: "Password baru tidak cocok!",
      })
      return
    }

    try {
      setFeedback({
        type: "info",
        message: "Mengubah password...",
      })

      // Make API call to update password
      const change_password = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/user/change_password`,
        {
          current_password: passwords.currentPassword,
          new_password: passwords.newPassword,
          new_password_confirmation: passwords.confirmPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
          },
        },
      )

      setFeedback({
        type: "success",
        message: "Password berhasil diubah!",
      })

      // Reset form and feedback
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setPasswordValidation({
        length: false,
        number: false,
        uppercase: false,
        lowercase: false,
      })
    } catch (error) {
      console.error("Error changing password:", error)
      setFeedback({
        type: "danger",
        message: error.response?.data?.message || "Gagal mengubah password!",
      })
    }

    setTimeout(() => {
      setFeedback({ type: "", message: "" })
    }, 3000)
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    })
  }

  const handleLogout = () => {
    Swal.fire({
      title: "Apakah Anda yakin ingin keluar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, keluar",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        Logout()
        navigate("/login")
      }
    })
  }

  const sendResetLink = async () => {
    try {
      setFeedback({
        type: "info",
        message: "Mengirim link reset password...",
      })

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/profile/reset_password`,
        {
          email: userInfo.email,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
          },
        },
      )

      setFeedback({
        type: "success",
        message: "Link reset password telah dikirim ke email Anda",
      })

      Swal.fire({
        icon: "success",
        title: "Link Reset Password Terkirim",
        text: response.data.message,
      })
    } catch (error) {
      console.log(error)

      setFeedback({
        type: "danger",
        message: "Gagal mengirim link reset password",
      })

      Swal.fire({
        icon: "error",
        title: "Gagal mengirim link reset password",
        text: error.response?.data?.message || "Terjadi kesalahan",
      })
    }

    setTimeout(() => {
      setFeedback({ type: "", message: "" })
    }, 3000)
  }

  // Show loading while checking authentication or fetching profile
  if (loading || profileLoading) {
    return (
      <Container className="py-5">
        <Row>
          <Col md={3}>
            <Card className="mb-4">
              <Card.Body>
                <div className="text-center mb-3">
                  <div
                    className="rounded-circle mx-auto my-3 bg-secondary bg-opacity-25 shimmer"
                    style={{ width: "100px", height: "100px" }}
                  ></div>
                  <h5
                    className="mt-3 shimmer shimmer-text"
                    style={{ width: "60%", margin: "10px auto", height: "20px" }}
                  ></h5>
                  <p
                    className="text-muted shimmer shimmer-text"
                    style={{ width: "80%", margin: "10px auto", height: "15px" }}
                  ></p>
                </div>
                <Nav variant="pills" className="flex-column">
                  {[...Array(4)].map((_, index) => (
                    <Nav.Item key={index} className="mb-2">
                      <span
                        className="shimmer shimmer-text"
                        style={{ width: "80%", height: "15px", display: "block", margin: "0 auto" }}
                      ></span>
                    </Nav.Item>
                  ))}
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          <Col md={9}>
            <Card>
              <Card.Body>
                <h4 className="mb-4 shimmer shimmer-text" style={{ width: "50%", height: "25px" }}></h4>
                <div className="shimmer shimmer-block" style={{ height: "200px", borderRadius: "10px" }}></div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }
  // Helper function to determine chip color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case "Selesai":
        return "success"
      case "Dikirim":
        return "primary"
      case "Dibatalkan":
        return "error"
      default:
        return "warning"
    }
  }

  // Redirect if not authenticated
  if (!isAuth() || !user) {
    return null // The useEffect will handle redirection
  }

  return (
    <Container className="py-5">
      <Tab.Container defaultActiveKey="history">
        <Row>
          <Col md={3}>
            <Card className="mb-4">
              <Card.Body>
                <div className="text-center mb-3">
                  <div className="position-relative d-inline-block" style={{ width: "100px", height: "100px" }}>
                    {/* Foto Profil */}
                    <div
                      className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center overflow-hidden"
                      style={{ width: "100px", height: "100px" }}
                    >
                      {userInfo.profile_photo ? (
                        <img
                          src={`${process.env.REACT_APP_API_URL}/${userInfo.profile_photo}`}
                          alt="Profile"
                          className="rounded-circle w-100 h-100 object-fit-cover"
                        />
                      ) : (
                        <i className="fas fa-user fa-3x text-secondary"></i>
                      )}
                    </div>

                    {/* Tombol Kamera (dengan input file tersembunyi) */}
                    <label
                      className="btn btn-sm btn-primary position-absolute"
                      style={{
                        bottom: "0",
                        right: "0",
                        borderRadius: "50%",
                        padding: "6px 8px",
                        cursor: "pointer",
                      }}
                    >
                      <i className="fas fa-camera"></i>
                      <input
                        type="file"
                        accept="image/*"
                        name="profile_photo"
                        style={{ display: "none" }}
                        onChange={updatePhoto}
                      />
                    </label>
                  </div>

                  {/* <div className="mt-3">
                    <Button 
                      variant="outline-primary" 
                      onClick={updatePhoto}
                    >
                      <i className="fas fa-edit me-2"></i>
                      Edit Foto
                    </Button>
                  </div> */}
                  <h5 className="flex justify-center  ">
                    {userInfo.nama}
                    {userInfo.role === "developer" && <MdOutlineVerifiedUser className="text-danger" size={20} />}
                    {userInfo.role === "user" && <BiSolidFaceMask className="ms-2 text-primary" size={20} />}
                    {userInfo.role === "owner" && <FaCrown className="ms-2 text-warning" size={20} />}
                    {userInfo.role === "admin" && <MdOutlineVerifiedUser className="ms-2 text-info" size={20} />}
                  </h5>
                  <p className="text-muted">{userInfo.email}</p>
                  {/* {userInfo.role && (
                    <span className="badge bg-info">{userInfo.role}</span>
                  )} */}
                </div>
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="history">Riwayat Pesanan</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="account">Informasi Akun</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="order">Tracking Ordermu</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="password">Ubah Password</Nav.Link>
                  </Nav.Item>
                  {["owner", "developer", "admin"].includes(userInfo.role) && (
                    <Nav.Item>
                      <Nav.Link onClick={() => navigate("/admin/dashboard")} className=" text-black">
                        Menuju Admin
                      </Nav.Link>
                    </Nav.Item>
                  )}
                  <Nav.Item>
                    <Nav.Link onClick={handleLogout} className="text-danger">
                      Logout
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          <Col md={9}>
            <Card>
              <Card.Body>
                <Tab.Content>
                  <Tab.Pane eventKey="history">
                    <h4 className="mb-4">Riwayat Pesanan</h4>
                    {ordersLoading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3">Memuat riwayat pesanan...</p>
                      </div>
                    ) : orderHistory.length > 0 ? (
                      <Table responsive>
                        <thead>
                          <tr>
                            <th>No.</th>
                            <th>Tanggal</th>
                            <th>Nama Produk</th>
                            <th>Gambar</th>
                            <th>Jumlah</th>
                            <th>Total Harga</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderHistory.map((order, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>
                                {new Date(order.date).toLocaleDateString("id-ID", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </td>
                              <td>
                                {Array.isArray(order.items)
                                  ? order.items.map((item, itemIndex) => <td key={itemIndex}>{item.product_name}</td>)
                                  : order.items}
                              </td>
                              <td>
                                {Array.isArray(order.items)
                                  ? order.items.map((item, itemIndex) => (
                                      <img
                                        key={itemIndex}
                                        src={`${process.env.REACT_APP_API_URL}/${item.image}`}
                                        alt={item.product_name}
                                        style={{ width: "50px", height: "50px", objectFit: "cover" }} // Ukuran kecil
                                      />
                                    ))
                                  : order.items}
                              </td>
                              <td>
                                {Array.isArray(order.items)
                                  ? order.items.map((item, itemIndex) => <td key={itemIndex}>{item.quantity}</td>)
                                  : order.items}
                              </td>
                              <td>
                                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
                                  order.total_amount,
                                )}
                              </td>
                              <td>
                                <span
                                  className={`badge bg-${
                                    order.status === "Selesai"
                                      ? "success"
                                      : order.status === "Dikirim"
                                        ? "primary"
                                        : order.status === "Dibatalkan"
                                          ? "danger"
                                          : "warning"
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <Alert variant="info">Anda belum memiliki riwayat pesanan.</Alert>
                    )}
                  </Tab.Pane>
                  <Tab.Pane eventKey="account">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="mb-0">Informasi Akun</h4>
                      {!isEditing && (
                        <Button variant="outline-primary" onClick={handleEditToggle}>
                          <i className="fas fa-edit me-2"></i>
                          Edit Informasi
                        </Button>
                      )}
                    </div>

                    <Form onSubmit={handleInfoUpdate}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Nama Lengkap</Form.Label>
                            <Form.Control
                              type="text"
                              value={isEditing ? tempUserInfo.nama : userInfo.nama}
                              onChange={(e) => setTempUserInfo({ ...tempUserInfo, nama: e.target.value })}
                              disabled={!isEditing}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              type="email"
                              value={isEditing ? tempUserInfo.email : userInfo.email}
                              onChange={(e) => setTempUserInfo({ ...tempUserInfo, email: e.target.value })}
                              disabled={!isEditing}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Nomor Telepon</Form.Label>
                            <Form.Control
                              type="tel"
                              value={isEditing ? tempUserInfo.telepon : userInfo.telepon}
                              onChange={(e) => setTempUserInfo({ ...tempUserInfo, telepon: e.target.value })}
                              disabled={!isEditing}
                              placeholder="Contoh: 08123456789"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Gender</Form.Label>
                            <Form.Select
                              value={isEditing ? tempUserInfo.gender : userInfo.gender}
                              onChange={(e) => setTempUserInfo({ ...tempUserInfo, gender: e.target.value })}
                              disabled={!isEditing}
                            >
                              <option value="">Pilih Gender</option>
                              <option value="male">Laki-laki</option>
                              <option value="female">Perempuan</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>

                      {/* Display user role (read-only) */}
                      <Form.Group className="mb-3">
                        <Form.Label>Alamat Lengkap</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          name="address"
                          value={
                            isEditing
                              ? typeof tempUserInfo.address === "string"
                                ? tempUserInfo.address
                                : JSON.stringify(tempUserInfo.address)
                              : typeof userInfo.address === "string"
                                ? userInfo.address
                                : JSON.stringify(userInfo.address)
                          }
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </Form.Group>

                      {isEditing && (
                        <>
                          <h5 className="mt-4 mb-3">Lokasi Anda</h5>

                          {/* Location Search */}
                          <div className="mb-3">
                            <Form.Label>Cari Lokasi</Form.Label>
                            <div className="d-flex gap-2">
                              <Form.Control
                                type="text"
                                value={locationSearch}
                                onChange={(e) => setLocationSearch(e.target.value)}
                                placeholder="Cari alamat atau tempat..."
                              />
                              <Button variant="primary" onClick={searchLocation} disabled={isSearching}>
                                {isSearching ? "Mencari..." : "Cari"}
                              </Button>
                            </div>

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                              <div className="mt-2 border rounded overflow-auto" style={{ maxHeight: "200px" }}>
                                <ul className="list-group list-group-flush">
                                  {searchResults.map((result, index) => (
                                    <li
                                      key={index}
                                      className="list-group-item list-group-item-action"
                                      style={{ cursor: "pointer" }}
                                      onClick={() => handleSelectLocation(result)}
                                    >
                                      {result.display_name}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          <p className="text-muted mb-3">
                            Geser marker pada peta, gunakan pencarian, atau klik pada lokasi yang diinginkan untuk
                            memilih lokasi Anda.
                          </p>
                          <LocationMap
                            position={mapPosition}
                            setPosition={(newPosition) => {
                              setMapPosition(newPosition)
                              setTempUserInfo({
                                ...tempUserInfo,
                                latitude: newPosition[0],
                                longitude: newPosition[1],
                              })
                            }}
                          />
                          <LocationInfo
                            position={mapPosition}
                            isEditing={isEditing}
                            address={
                              typeof tempUserInfo.address === "string"
                                ? tempUserInfo.address
                                : JSON.stringify(tempUserInfo.address)
                            }
                          />
                        </>
                      )}

                      {isEditing && (
                        <div className="d-flex gap-2">
                          <Button type="submit" variant="primary">
                            Simpan Perubahan
                          </Button>
                          <Button type="button" variant="secondary" onClick={handleEditToggle}>
                            Batal
                          </Button>
                        </div>
                      )}
                    </Form>
                  </Tab.Pane>

                  {/* Trackiing order */}
                  <Tab.Pane eventKey="order">
                    <Typography
                      variant="h4"
                      component="h2"
                      align="center"
                      gutterBottom
                      sx={{ color: "#D2B48C", mb: 4 }}
                    >
                      Pesanan
                    </Typography>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Item
                      </Typography>
                      <FormControl variant="standard" sx={{ minWidth: 120 }}>
                        <Select
                          value={filterType}
                          onChange={handleFilterChange}
                          IconComponent={KeyboardArrowDownIcon}
                          disableUnderline
                          sx={{
                            fontWeight: "medium",
                            "& .MuiSelect-select": {
                              pr: 4,
                              py: 0,
                            },
                          }}
                        >
                          <MenuItem value="Custom">Custom</MenuItem>
                          <MenuItem value="Catalog">Catalog</MenuItem>
                          <MenuItem value="Default">Default</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {filteredOrders?.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((order) => (
                      <Paper
                        key={order.id}
                        elevation={1}
                        sx={{
                          mb: 3,
                          p: 2,
                          borderRadius: 2,
                          "&:last-child": { mb: 0 },
                        }}
                      >
                        <Grid container spacing={2}>
                          <Grid item>
                            <Box
                              component="img"
                              src={`${process.env.REACT_APP_API_URL}/${order?.gambar_referensi || (order?.catalog?.gambar) || "default-image-path.jpg"}`}
                              alt="Product"
                              sx={{
                                width: 100,
                                height: 100,
                                objectFit: "cover",
                                borderRadius: 1,
                              }}
                            />
                          </Grid>
                          <Grid item xs>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                height: "100%",
                              }}
                            >
                              <Box sx={{ mb: 1 }}>
                                <Typography variant="body2" color="text.secondary" component="span">
                                  Tanggal Pemesanan :
                                </Typography>{" "}
                                <Typography variant="body2" component="span">
                                  {new Date(order?.created_at || order?.created_at).toLocaleDateString("id-ID", {
                                    weekday: "long", // Nama hari
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </Typography>
                              </Box>
                              <Typography variant="body3" fontWeight="bold" sx={{ mb: 1 }}>
                                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
                                  order.price || order.total_harga || 0,
                                )}
                              </Typography>
                              <Link
                                href="#"
                                underline="none"
                                color="primary"
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleDetailClick(order?.id || order?.id)
                                }}
                              >
                                <Button variant="outlined" color="#6D4C3D" size="large">
                                  Detail
                                </Button>
                              </Link>
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                    <Box display="flex" justifyContent="center" mt={4}>
                      <Pagination
                        count={Math.ceil(filteredOrders?.length / itemsPerPage)}
                        page={page}
                        onChange={(event, value) => setPage(value)}
                        color="primary"
                      />
                    </Box>
                  </Tab.Pane>

                  {/* Ubah Password */}
                  <Tab.Pane eventKey="password">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="mb-0">Ubah Password</h4>
                    </div>
                    <Form onSubmit={handlePasswordChange}>
                      <Form.Group className="mb-3 position-relative">
                        <Form.Label>Password Saat Ini*</Form.Label>
                        <div className="position-relative">
                          <Form.Control
                            type={showPasswords.current ? "text" : "password"}
                            value={passwords.currentPassword}
                            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                            required
                          />
                          <Button
                            variant="link"
                            className="position-absolute end-0 top-50 translate-middle-y"
                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                            style={{ zIndex: 10 }}
                          >
                            <i className={`far fa-eye${showPasswords.current ? "-slash" : ""}`}></i>
                          </Button>
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-3 position-relative">
                        <Form.Label>Password Baru*</Form.Label>
                        <div className="position-relative">
                          <Form.Control
                            type={showPasswords.new ? "text" : "password"}
                            value={passwords.newPassword}
                            onChange={(e) => {
                              setPasswords({ ...passwords, newPassword: e.target.value })
                              validatePasswordRules(e.target.value)
                            }}
                            required
                          />
                          <Button
                            variant="link"
                            className="position-absolute end-0 top-50 translate-middle-y"
                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            style={{ zIndex: 10 }}
                          >
                            <i className={`far fa-eye${showPasswords.new ? "-slash" : ""}`}></i>
                          </Button>
                        </div>
                        <div className="mt-2">
                          <div className={`small ${passwordValidation.length ? "text-success" : "text-muted"}`}>
                            <i className={`fas fa-${passwordValidation.length ? "check" : "times"} me-2`}></i>
                            Minimal 8 karakter
                          </div>
                          <div className={`small ${passwordValidation.number ? "text-success" : "text-muted"}`}>
                            <i className={`fas fa-${passwordValidation.number ? "check" : "times"} me-2`}></i>
                            Minimal 1 angka
                          </div>
                          <div className={`small ${passwordValidation.uppercase ? "text-success" : "text-muted"}`}>
                            <i className={`fas fa-${passwordValidation.uppercase ? "check" : "times"} me-2`}></i>
                            Minimal 1 huruf kapital
                          </div>
                          <div className={`small ${passwordValidation.lowercase ? "text-success" : "text-muted"}`}>
                            <i className={`fas fa-${passwordValidation.lowercase ? "check" : "times"} me-2`}></i>
                            Minimal 1 huruf kecil
                          </div>
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-4 position-relative">
                        <Form.Label>Konfirmasi Password Baru*</Form.Label>
                        <div className="position-relative">
                          <Form.Control
                            type={showPasswords.confirm ? "text" : "password"}
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                            required
                          />
                          <Button
                            variant="link"
                            className="position-absolute end-0 top-50 translate-middle-y"
                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            style={{ zIndex: 10 }}
                          >
                            <i className={`far fa-eye${showPasswords.confirm ? "-slash" : ""}`}></i>
                          </Button>
                        </div>
                        <div className="mt-3">
                          <Button variant="link" className="text-decoration-none p-0" onClick={sendResetLink}>
                            Lupa password lama?
                          </Button>
                        </div>
                      </Form.Group>

                      <div className="d-grid">
                        <Button
                          type="submit"
                          variant="dark"
                          size="lg"
                          disabled={
                            !Object.values(passwordValidation).every((rule) => rule) ||
                            !passwords.confirmPassword ||
                            passwords.newPassword !== passwords.confirmPassword
                          }
                        >
                          KONFIRMASI PASSWORD BARU
                        </Button>
                      </div>
                    </Form>
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tambahkan Alert untuk feedback */}
        {feedback.message && (
          <Alert
            variant={feedback.type}
            dismissible
            onClose={() => setFeedback({ type: "", message: "" })}
            className="position-fixed top-0 end-0 m-3"
            style={{ zIndex: 1000 }}
          >
            {feedback.message}
          </Alert>
        )}
      </Tab.Container>
    </Container>
  )
}

export default Akun
