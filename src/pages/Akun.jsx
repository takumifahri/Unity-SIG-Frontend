import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Container, Row, Col, Card, Tab, Nav, Form, Table } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import { BiSolidFaceMask } from "react-icons/bi"
import { FaCrown } from "react-icons/fa6"
import { MdOutlineVerifiedUser } from "react-icons/md"
import { 
  Box, 
  Typography, 
  Select, 
  MenuItem, 
  FormControl, 
  Divider, 
  Grid, 
  Paper,
  Snackbar,
  Alert,
  AlertTitle
} from "@mui/material"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import Button from "@mui/material/Button"
import Pagination from "@mui/material/Pagination"
import { Link } from "react-router-dom"
import LocationInfo from "../components/locaation-info"
import LocationMap from "../components/location-map"

function Akun() {
  const navigate = useNavigate();
  const { user, isAuth, Logout, token, loading } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const [filterType, setFilterType] = useState("Custom");
  const [orders, setOrders] = useState([]);
  const [mapPosition, setMapPosition] = useState([]);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // success, error, warning, info
    autoHideDuration: 5000,
    title: ""
  });

  const [page, setPage] = useState(() => {
    const savedPage = localStorage.getItem("currentOrderPage")
    return savedPage ? Number.parseInt(savedPage, 10) : 1
  });

  const [locationSearch, setLocationSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Save current page to localStorage
  useEffect(() => {
    localStorage.setItem("currentOrderPage", page)
  }, [page]);

  const itemsPerPage = 5;

  // Utility function to safely access nested properties
  const safeGet = useCallback((obj, path, fallback = "") => {
    try {
      return path.split(".").reduce((o, key) => o[key], obj) || fallback
    } catch (e) {
      return fallback
    }
  }, []);

  // Handle closing the snackbar
  const handleCloseSnackbar = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({...prev, open: false}));
  }, []);

  // Show snackbar message
  const showSnackbar = useCallback((message, severity = "info", title = "", duration = 5000) => {
    setSnackbar({
      open: true,
      message,
      severity,
      autoHideDuration: duration,
      title
    });
  }, []);

  // Fetch orders
  const getOrder = useCallback(async () => {
    try {
      const resp = await axios.get(`${process.env.REACT_APP_API_URL}/api/order/tracking`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
        },
      })
      setOrders(resp.data.data)
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      showSnackbar(
        "Gagal mengambil data pesanan. Silakan coba lagi nanti.", 
        "error", 
        "Error"
      );
    }
  }, [token, showSnackbar]);

  // Check if user is logged in and fetch data
  useEffect(() => {
    if (!loading) {
      if (!isAuth() || !token) {
        navigate("/login")
      } else {
        getOrder()
        setProfileLoading(false)
      }
    }
  }, [isAuth, navigate, token, loading, getOrder]);

  // Filter orders based on selected type
  const filteredOrders = useMemo(() => {
    if (filterType === "Default") {
      return [...(orders?.custom_orders || []), ...(orders?.orders || [])]
    } else if (filterType === "Custom") {
      return orders?.custom_orders || []
    } else {
      return orders?.orders || []
    }
  }, [filterType, orders]);

  // Handle filter type change
  const handleFilterChange = useCallback((event) => {
    setFilterType(event.target.value)
  }, []);

  // Navigate to order detail
  const handleDetailClick = useCallback((order) => {
    // First check if the order object exists
    if (!order) {
      console.error("Order object is undefined or null");
      showSnackbar("Detail pesanan tidak dapat ditampilkan", "error", "Error");
      return;
    }
  
    // Log the complete order for debugging
    console.log("Order being clicked:", order);
    
    // Determine if this is a custom order
    const isCustomOrder = Boolean(
      order.jenis_baju || 
      order.sumber_kain ||
      order.custom_order_id || 
      order.gambar_referensi ||
      filterType === "Custom"
    );
    
    if (isCustomOrder) {
      // For custom orders, prioritize custom_order_unique_id
      const orderUniqueId = order.custom_order_unique_id || order.id;
      
      // Log for debugging
      console.log(`Custom order detected. Using ID: ${orderUniqueId}`);
      
      if (orderUniqueId) {
        // Navigate to custom order detail page
        navigate(`/customOrder/${orderUniqueId}`);
      } else {
        console.error("No valid custom order ID found:", order);
        showSnackbar("ID pesanan custom tidak ditemukan", "error", "Error");
      }
    } else {
      // For regular catalog orders
      const orderUniqueId = order.order_unique_id || 
                        order.transaction?.order_unique_id || 
                        order.id;
      
      // Log for debugging
      console.log(`Catalog order detected. Using ID: ${orderUniqueId}`);
      
      if (orderUniqueId) {
        // Navigate to regular order detail page
        navigate(`/orderDetail/${orderUniqueId}`);
      } else {
        console.error("No valid catalog order ID found:", order);
        showSnackbar("ID pesanan tidak ditemukan", "error", "Error");
      }
    }
  }, [navigate, showSnackbar, filterType]);


  // User info state
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
  });

  // Password states
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // State for edit mode and temporary data
  const [isEditing, setIsEditing] = useState(false);
  const [tempUserInfo, setTempUserInfo] = useState({ ...userInfo });

  // Password visibility toggle
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Update user info when auth user changes
  useEffect(() => {
    if (user) {
      // Extract user data regardless of structure
      const userData = user.user || user;
      
      // Get latitude and longitude directly from userData
      const lat = userData.latitude ? Number(userData.latitude) : null;
      const lng = userData.longitude ? Number(userData.longitude) : null;
      
      // If we have valid coordinates, set them in mapPosition
      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        setMapPosition([lat, lng]);
      }

      setUserInfo({
        nama: userData.name || userData.email || "",
        email: userData.email || "",
        telepon: userData.phone || userData.telepon || "",
        gender: userData.gender || "",
        profile_photo: userData.profile_photo || 
          `${process.env.REACT_APP_API_URL}/${userData.profile_photo || ""}`,
        total_order: userData.total_order || 0,
        role: userData.role || "",
        google_id: userData.google_id || "",
        facebook_id: userData.facebook_id || "",
        latitude: lat,
        longitude: lng,
        address: userData.address || "",
      });

      // Also update tempUserInfo with the same values
      setTempUserInfo({
        nama: userData.name || userData.email || "",
        email: userData.email || "",
        telepon: userData.phone || userData.telepon || "",
        gender: userData.gender || "",
        profile_photo: userData.profile_photo || 
          `${process.env.REACT_APP_API_URL}/${userData.profile_photo || ""}`,
        total_order: userData.total_order || 0,
        role: userData.role || "",
        google_id: userData.google_id || "",
        facebook_id: userData.facebook_id || "",
        latitude: lat,
        longitude: lng,
        address: userData.address || "",
      });

      setProfileLoading(false);
    }
  }, [user]);

  // Update profile photo
  const updatePhoto = useCallback(async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("profile_photo", e.target.files[0]);

    try {
      showSnackbar("Mengupload foto...", "info", "Proses");

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/profile/update_avatar`, 
        formData, 
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
          },
        }
      );

      setUserInfo((prev) => ({
        ...prev,
        profile_photo: response.data.profile_photo,
      }));

      showSnackbar("Foto profil berhasil diperbarui!", "success", "Berhasil");
      
      // Refresh the page after successful update
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error("Error updating photo:", error);
      showSnackbar(
        error.response?.data?.message || "Gagal memperbarui foto profil!", 
        "error", 
        "Error"
      );
    }
  }, [token, showSnackbar]);

  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    number: false,
    uppercase: false,
    lowercase: false,
  });

  // Order history state
  const [orderHistory, setOrderHistory] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Handle token from URL (for password reset cases, etc.)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");

    if (urlToken) {
      localStorage.setItem("token", urlToken);
      // Clean token from URL for security
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  // Fetch order history
  useEffect(() => {
    const fetchOrderHistory = async () => {
      if (token) {
        try {
          setOrdersLoading(true);
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/order/history`, 
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
              },
            }
          );
          setOrderHistory(response.data.data || []);
        } catch (error) {
          console.error("Error fetching order history:", error);
          showSnackbar(
            "Gagal mengambil riwayat pesanan. Silakan coba lagi nanti.", 
            "error", 
            "Error"
          );
        } finally {
          setOrdersLoading(false);
        }
      }
    };

    fetchOrderHistory();
  }, [token, showSnackbar]);

  // Validate email
  const validateEmail = useCallback((email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }, []);

  // Validate phone number
  const validatePhone = useCallback((phone) => {
    if (!phone) return true; // Allow empty phone
    const re = /^[0-9]{10,13}$/;
    return re.test(phone);
  }, []);

  // Handle edit toggle
  const handleEditToggle = useCallback(() => {
    if (isEditing) {
      // If in edit mode and clicked cancel, revert to original data
      setTempUserInfo({ ...userInfo });
    }
    setIsEditing(!isEditing);
  }, [isEditing, userInfo]);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setTempUserInfo(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Search location
  const searchLocation = useCallback(async () => {
    if (!locationSearch.trim()) return;

    setIsSearching(true);
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: locationSearch,
          format: "json",
          limit: 5,
        },
      });

      setSearchResults(response.data);
    } catch (err) {
      console.error("Error searching location:", err);
      showSnackbar("Gagal mencari lokasi", "error", "Error");
    } finally {
      setIsSearching(false);
    }
  }, [locationSearch, showSnackbar]);

  // Handle select location
  const handleSelectLocation = useCallback((result) => {
    const lat = Number.parseFloat(result.lat);
    const lon = Number.parseFloat(result.lon);

    setMapPosition([lat, lon]);
    setTempUserInfo(prev => ({
      ...prev,
      latitude: lat,
      longitude: lon,
      address: result.display_name || "",
    }));
    setSearchResults([]);
    setLocationSearch("");
  }, []);

  // Handle password input change
  const handlePasswordInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value,
    }));

    if (name === "newPassword") {
      validatePasswordRules(value);
    }
  }, []);

  // Validate password rules
  const validatePasswordRules = useCallback((password) => {
    setPasswordValidation({
      length: password.length >= 8,
      number: /[0-9]/.test(password),
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
    });
  }, []);

  // Handle info update
  const handleInfoUpdate = useCallback(async (e) => {
    e.preventDefault();

    // Validate input
    if (!tempUserInfo.nama.trim()) {
      showSnackbar("Nama tidak boleh kosong", "error", "Error");
      return;
    }

    // Validate email
    if (!validateEmail(tempUserInfo.email)) {
      showSnackbar("Format email tidak valid", "error", "Error");
      return;
    }

    if (tempUserInfo.telepon && !validatePhone(tempUserInfo.telepon)) {
      showSnackbar("Format nomor telepon tidak valid", "error", "Error");
      return;
    }

    try {
      showSnackbar("Menyimpan perubahan...", "info", "Proses");

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
      );

      // Update userInfo with temporary data
      setUserInfo({ ...tempUserInfo });
      showSnackbar("Informasi akun berhasil diperbarui!", "success", "Berhasil");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      showSnackbar(
        error.response?.data?.message || "Gagal memperbarui informasi akun!", 
        "error", 
        "Error"
      );
    }
  }, [tempUserInfo, validateEmail, validatePhone, token, showSnackbar]);

  // Handle password change
  const handlePasswordChange = useCallback(async (e) => {
    e.preventDefault();

    // Validate all rules are met
    const allRulesMet = Object.values(passwordValidation).every((rule) => rule);

    if (!allRulesMet) {
      showSnackbar("Password harus memenuhi semua kriteria", "error", "Error");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      showSnackbar("Password baru tidak cocok!", "error", "Error");
      return;
    }

    try {
      showSnackbar("Mengubah password...", "info", "Proses");

      // Make API call to update password
      await axios.put(
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
        }
      );

      showSnackbar("Password berhasil diubah!", "success", "Berhasil");

      // Reset form and feedback
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordValidation({
        length: false,
        number: false,
        uppercase: false,
        lowercase: false,
      });
    } catch (error) {
      console.error("Error changing password:", error);
      showSnackbar(
        error.response?.data?.message || "Gagal mengubah password!", 
        "error", 
        "Error"
      );
    }
  }, [passwords, passwordValidation, token, showSnackbar]);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback((field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  }, []);

  // Handle logout with confirmation
  const handleLogout = useCallback(() => {
    // Show snackbar with cancel action instead of SweetAlert2
    setSnackbar({
      open: true,
      message: "Apakah Anda yakin ingin keluar?",
      severity: "warning",
      title: "Konfirmasi Logout",
      action: (
        <>
          <Button color="inherit" size="small" onClick={handleCloseSnackbar}>
            BATAL
          </Button>
          <Button 
            color="inherit" 
            size="small" 
            onClick={() => {
              Logout();
              navigate("/login");
            }}
          >
            KELUAR
          </Button>
        </>
      ),
      autoHideDuration: null // Don't auto-hide
    });
  }, [Logout, navigate, handleCloseSnackbar]);

  // Send reset password link
  const sendResetLink = useCallback(async () => {
    try {
      showSnackbar("Mengirim link reset password...", "info", "Proses");

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
        }
      );

      showSnackbar("Link reset password telah dikirim ke email Anda", "success", "Berhasil", 6000);
    } catch (error) {
      console.error(error);
      showSnackbar("Gagal mengirim link reset password", "error", "Error");
    }
  }, [userInfo.email, token, showSnackbar]);

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
    );
  }

  // Helper function to determine chip color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case "Selesai":
        return "success";
      case "Dikirim":
        return "primary";
      case "Dibatalkan":
        return "error";
      default:
        return "warning";
    }
  };

  // Redirect if not authenticated
  if (!isAuth() || !user) {
    return null; // The useEffect will handle redirection
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
                          src={`${process.env.REACT_APP_API_URL}/${userInfo.profile_photo}`|| userInfo.profile_photo}
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

                  <h5 className="flex justify-center mt-3">
                    {userInfo.nama}
                    {userInfo.role === "developer" && <MdOutlineVerifiedUser className="text-danger ms-2" size={20} />}
                    {userInfo.role === "user" && <BiSolidFaceMask className="ms-2 text-primary" size={20} />}
                    {userInfo.role === "owner" && <FaCrown className="ms-2 text-warning" size={20} />}
                    {userInfo.role === "admin" && <MdOutlineVerifiedUser className="ms-2 text-info" size={20} />}
                  </h5>
                  <p className="text-muted">{userInfo.email}</p>
                </div>
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link 
                      eventKey="history" 
                      className={({ isActive }) => 
                        `transition-all rounded px-3 py-2 mb-1 ${
                          isActive 
                            ? "bg-[#D2B48C] text-white font-medium" 
                            : "text-gray-700 hover:bg-gray-100"
                        }`
                      }
                    >
                      Riwayat Pesanan
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      eventKey="account" 
                      className={({ isActive }) => 
                        `transition-all rounded px-3 py-2 mb-1 ${
                          isActive 
                            ? "bg-[#D2B48C] text-white font-medium" 
                            : "text-gray-700 hover:bg-gray-100"
                        }`
                      }
                    >
                      Informasi Akun
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      eventKey="order" 
                      className={({ isActive }) => 
                        `transition-all rounded px-3 py-2 mb-1 ${
                          isActive 
                            ? "bg-[#D2B48C] text-white font-medium" 
                            : "text-gray-700 hover:bg-gray-100"
                        }`
                      }
                    >
                      Tracking Ordermu
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      eventKey="password" 
                      className={({ isActive }) => 
                        `transition-all rounded px-3 py-2 mb-1 ${
                          isActive 
                            ? "bg-[#D2B48C] text-white font-medium" 
                            : "text-gray-700 hover:bg-gray-100"
                        }`
                      }
                    >
                      Ubah Password
                    </Nav.Link>
                  </Nav.Item>
                  {["owner", "developer", "admin"].includes(userInfo.role) && (
                    <Nav.Item>
                      <Nav.Link onClick={() => navigate("/admin/dashboard")} className="text-black">
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
                    ) : orderHistory && orderHistory.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover border-top">
                          <thead className="bg-light">
                            <tr>
                              <th className="py-3">No.</th>
                              <th className="py-3">Tanggal</th>
                              <th className="py-3">Nama Produk</th>
                              <th className="py-3">Gambar</th>
                              <th className="py-3">Jumlah</th>
                              <th className="py-3">Total Harga</th>
                              <th className="py-3">Status</th>
                              <th className="py-3 text-center">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orderHistory.map((order, index) => (
                              <tr key={index} className="align-middle">
                                <td>{index + 1}</td>
                                <td>
                                  {new Date(order.created_at).toLocaleDateString("id-ID", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </td>
                                <td>
                                  <div className="fw-medium">
                                    {order.catalog?.nama_katalog || order.custom_order?.jenis_baju || "Produk"}
                                  </div>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="position-relative">
                                      {(() => {
                                        // Mengolah data gambar dari struktur data baru
                                        let imageUrl;
                                        try {
                                          // Coba ambil dari catalog
                                          if (order.catalog && Array.isArray(order.catalog.gambar) && order.catalog.gambar.length > 0) {
                                            imageUrl = order.catalog.gambar[0];
                                          } 
                                          // Atau dari bukti pembayaran jika tidak ada catalog
                                          else if (order.bukti_pembayaran) {
                                            imageUrl = order.bukti_pembayaran;
                                          }
                                          // Atau dari custom order jika ada
                                          else if (order.custom_order && order.custom_order.gambar_referensi) {
                                            const imgRef = order.custom_order.gambar_referensi;
                                            if (Array.isArray(imgRef) && imgRef.length > 0) {
                                              imageUrl = imgRef[0];
                                            } else if (typeof imgRef === 'string') {
                                              if (imgRef.startsWith('[') || imgRef.startsWith('{')) {
                                                const parsedImg = JSON.parse(imgRef);
                                                imageUrl = Array.isArray(parsedImg) ? parsedImg[0] : parsedImg;
                                              } else {
                                                imageUrl = imgRef;
                                              }
                                            }
                                          }
                                        } catch (err) {
                                          console.error("Error processing image data:", err);
                                        }
                                        
                                        return (
                                          <img
                                            src={imageUrl ? `${process.env.REACT_APP_API_URL}/${imageUrl}` : `${process.env.PUBLIC_URL}/images/default-product.jpg`}
                                            alt={order.catalog?.nama_katalog || "Product"}
                                            className="rounded border"
                                            style={{ width: "70px", height: "70px", objectFit: "cover" }}
                                            onError={(e) => {
                                              e.target.src = `${process.env.PUBLIC_URL}/images/default-product.jpg`;
                                            }}
                                          />
                                        );
                                      })()}
                                      
                                      {/* Tampilkan badge tambahan jika ada multi gambar */}
                                      {order.catalog && Array.isArray(order.catalog.gambar) && order.catalog.gambar.length > 1 && (
                                        <div 
                                          className="position-absolute top-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                                          style={{ 
                                            width: "24px", 
                                            height: "24px", 
                                            fontSize: "12px",
                                            transform: "translate(30%, -30%)",
                                            border: "2px solid white"
                                          }}
                                        >
                                          +{order.catalog.gambar.length - 1}
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Menampilkan skeleton untuk indikasi gambar tambahan */}
                                    {order.catalog && Array.isArray(order.catalog.gambar) && order.catalog.gambar.length > 1 && (
                                      <div className="ms-2 d-flex flex-column" style={{ gap: "4px" }}>
                                        {[...Array(Math.min(2, order.catalog.gambar.length - 1))].map((_, i) => (
                                          <div 
                                            key={i}
                                            className="bg-light rounded" 
                                            style={{ 
                                              width: "40px", 
                                              height: "12px",
                                              opacity: 0.7 - (i * 0.2)
                                            }}
                                          ></div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <div className="fw-medium">{order.jumlah || 0} pcs</div>
                                </td>
                                <td className="fw-medium">
                                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
                                    order.total_harga || 0,
                                  )}
                                </td>
                                <td>
                                  <span
                                    className={`badge rounded-pill bg-${
                                      order.status === "Selesai"
                                        ? "success"
                                        : order.status === "Sedang_Dikirim" || order.status === "Dikirim"
                                          ? "primary"
                                          : order.status === "Dibatalkan"
                                            ? "danger"
                                            : order.status === "Diproses"
                                              ? "info"
                                              : "warning"
                                    } py-2 px-3`}
                                  >
                                    {order.status.replace("_", " ")}
                                  </span>
                                </td>
                                <td className="text-center">
                                  <div className="d-flex flex-column flex-md-row gap-1 justify-content-center">
                                    <button
                                      onClick={() => navigate(`/orderDetail/${order.order_unique_id}`)}
                                      className="btn btn-sm btn-outline-primary"
                                      title="Lihat Detail Pesanan"
                                    >
                                      <i className="fas fa-eye me-1"></i>
                                      Detail
                                    </button>
                                    {order.status === "Selesai" && !order.isReviewed && (
                                      <button
                                        onClick={() => navigate(`/orderDetail/${order.order_unique_id}?tab=review`)}
                                        className="btn btn-sm btn-outline-success"
                                        title="Beri Review untuk Pesanan Ini"
                                      >
                                        <i className="fas fa-star me-1"></i>
                                        Review
                                      </button>
                                    )}
                                    {order.status === "Menunggu_Pembayaran" && (
                                      <button
                                        onClick={() => navigate(`/payment/${order.transaction?.transaction_unique_id || order.transaction_id}`)}
                                        className="btn btn-sm btn-outline-warning"
                                        title="Lanjutkan Pembayaran"
                                      >
                                        <i className="fas fa-credit-card me-1"></i>
                                        Bayar
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-5 border rounded bg-light">
                        <i className="fas fa-history fa-3x text-muted mb-3"></i>
                        <h5>Belum Ada Riwayat Pesanan</h5>
                        <p className="text-muted mb-4">Anda belum memiliki riwayat pesanan.</p>
                        <Button
                          variant="contained"
                          onClick={() => navigate('/katalog')}
                          sx={{ 
                            bgcolor: "#D9B99B", 
                            "&:hover": { bgcolor: "#C2A07B" },
                            px: 3
                          }}
                        >
                          Mulai Belanja
                        </Button>
                      </div>
                    )}
                  </Tab.Pane>
                  <Tab.Pane eventKey="account">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="mb-0">Informasi Akun</h4>
                      {!isEditing && (
                        <Button variant="outlined" color="primary" onClick={handleEditToggle}>
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
                              name="nama"
                              value={isEditing ? tempUserInfo.nama : userInfo.nama}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={isEditing ? tempUserInfo.email : userInfo.email}
                              onChange={handleInputChange}
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
                              name="telepon"
                              value={isEditing ? tempUserInfo.telepon : userInfo.telepon}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              placeholder="Contoh: 08123456789"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Gender</Form.Label>
                            <Form.Select
                              name="gender"
                              value={isEditing ? tempUserInfo.gender : userInfo.gender}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            >
                              <option value="">Pilih Gender</option>
                              <option value="male">Laki-laki</option>
                              <option value="female">Perempuan</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>

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
                              <Button variant="contained" onClick={searchLocation} disabled={isSearching}>
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
                        <div className="d-flex gap-2 mt-3">
                          <Button type="submit" variant="contained" color="primary">
                            Simpan Perubahan
                          </Button>
                          <Button type="button" variant="outlined" onClick={handleEditToggle}>
                            Batal
                          </Button>
                        </div>
                      )}
                    </Form>
                  </Tab.Pane>

                  {/* Tracking order */}
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

                    {filteredOrders?.length > 0 ? (
                      filteredOrders?.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((order) => {
                        // Parse JSON for image paths if they are in string format
                        let imageUrl = "";

                        // Helper function to extract the first image from JSON or array
                        const getFirstImage = (imageData) => {
                          if (!imageData) return "";
                          
                          try {
                            // If it's already a string URL, use it directly
                            if (typeof imageData === 'string' && (imageData.startsWith('http') || !imageData.includes('['))) {
                              return imageData;
                            }
                            
                            // If it's a JSON string, parse it and get the first item
                            if (typeof imageData === 'string') {
                              const parsed = JSON.parse(imageData);
                              if (Array.isArray(parsed) && parsed.length > 0) {
                                return parsed[0];
                              } else if (typeof parsed === 'object') {
                                // If it's an object with paths
                                return parsed.path || Object.values(parsed)[0] || "";
                              }
                            }
                            
                            // If it's already an array, just get the first item
                            if (Array.isArray(imageData) && imageData.length > 0) {
                              return imageData[0];
                            }
                          } catch (error) {
                            console.error("Error processing image data:", error);
                          }
                          
                          return "";
                        };

                        if (filterType === "Custom") {
                          // Handle custom_orders images
                          imageUrl = getFirstImage(order?.gambar_referensi);
                        } else if (filterType === "Catalog") {
                          // Handle catalog order images
                          imageUrl = getFirstImage(order?.catalog?.gambar);
                        } else {
                          // For default - try both sources
                          imageUrl = getFirstImage(order?.gambar_referensi) || getFirstImage(order?.catalog?.gambar);
                        }
                        
                        return (
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
                              src={`${process.env.REACT_APP_API_URL}/${imageUrl || "default-image-path.jpg"}`}
                              alt="Product"
                              sx={{
                              width: 100,
                              height: 100,
                              objectFit: "cover",
                              borderRadius: 1,
                              }}
                              onError={(e) => {
                              e.target.src = `${process.env.PUBLIC_URL}/images/default-product.jpg`;
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
                                Tanggal Pemesanan:
                              </Typography>{" "}
                              <Typography variant="body2" component="span">
                                {new Date(order?.created_at || order?.created_at).toLocaleDateString("id-ID", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                })}
                              </Typography>
                              </Box>
                              {filterType === "Custom" && (
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                <strong>Jenis:</strong> {order?.jenis_baju || "Custom Order"}
                              </Typography>
                              )}
                              {filterType === "Catalog" && (
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                <strong>Produk:</strong> {order?.catalog?.nama || "Produk Katalog"}
                              </Typography>
                              )}
                              {(order.price || order.total_harga) && (
                              <Typography variant="body3" fontWeight="bold" sx={{ mb: 1 }}>
                                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
                                order.price || order.total_harga || 0,
                                )}
                              </Typography>
                              )}
                              <Link
                              href="#"
                              underline="none"
                              color="primary"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDetailClick(order); // Kirim seluruh objek order
                              }}
                              >
                              <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                                <Button variant="outlined" color="primary" size="large">
                                Detail
                                </Button>
                                
                                {/* Payment button - shown for both custom and catalog orders */}
                                {(order?.status === "Menunggu_Pembayaran" || 
                                  order?.status === "menunggu pembayaran" ||
                                  order?.status === "belum_bayar" ||
                                  order?.status_pembayaran === "belum_bayar" ||
                                  order?.status_pembayaran === "Belum_Bayar" && order?.transaction.status !== 'pending') && (
                                  <Button 
                                    variant="contained" 
                                    color="success" 
                                    size="large"
                                    onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    
                                    // Debug logging
                                    console.log("=== ORDER CLICK DEBUG ===");
                                    console.log("Full order object:", order);
                                    console.log("Order type:", filterType);
                                    console.log("Order ID:", order?.id);
                                    console.log("Order status:", order?.status);
                                    console.log("Payment status:", order?.status_pembayaran);
                                    
                                    // Log all possible transaction ID fields
                                    console.log("Possible transaction IDs:");
                                    console.log("- order_unique_id:", order?.order_unique_id);
                                    console.log("- custom_orders.order_id:", order?.custom_orders?.order_id);
                                    console.log("- transaction.transaction_unique_id:", order?.transaction?.transaction_unique_id);
                                    console.log("- transaction_unique_id:", order?.transaction_unique_id);
                                    console.log("- transaction_id:", order?.transaction_id);
                                    
                                    // Navigate to payment page with transaction ID
                                    // Try all possible transaction ID locations
                                    const transactionId = order?.order_unique_id ||
                                          order?.order_id ||
                                          order?.transaction?.transaction_unique_id || 
                                          order?.transaction_unique_id ||
                                          order?.transaction_id;

                                    console.log("Selected transaction ID:", transactionId);

                                    if (transactionId) {
                                      console.log("Navigating to:", `/payment/${transactionId}`);
                                      navigate(`/payment/${transactionId}`);
                                    } else {
                                      console.error("No transaction ID found!");
                                      showSnackbar("ID transaksi tidak ditemukan", "error", "Error");
                                    }
                                    }}
                                  >
                                    Bayar
                                  </Button>
                                  )}
                              </Box>
                              </Link>
                            </Box>
                            </Grid>
                          </Grid>
                          </Paper>
                        );
                      })
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          Tidak ada pesanan {filterType === "Custom" ? "kustom" : filterType === "Catalog" ? "katalog" : ""} yang ditemukan.
                        </Typography>
                      </Box>
                    )}
                    
                    {filteredOrders?.length > 0 && (
                      <Box display="flex" justifyContent="center" mt={4}>
                        <Pagination
                          count={Math.ceil((filteredOrders?.length || 0) / itemsPerPage)}
                          page={page}
                          onChange={(event, value) => setPage(value)}
                          color="primary"
                        />
                      </Box>
                    )}
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
                            name="currentPassword"
                            value={passwords.currentPassword}
                            onChange={handlePasswordInputChange}
                            required
                          />
                          <Button
                            variant="link"
                            className="position-absolute end-0 top-50 translate-middle-y"
                            onClick={() => togglePasswordVisibility('current')}
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
                            name="newPassword"
                            value={passwords.newPassword}
                            onChange={handlePasswordInputChange}
                            required
                          />
                          <Button
                            variant="link"
                            className="position-absolute end-0 top-50 translate-middle-y"
                            onClick={() => togglePasswordVisibility('new')}
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
                            name="confirmPassword"
                            value={passwords.confirmPassword}
                            onChange={handlePasswordInputChange}
                            required
                          />
                          <Button
                            variant="link"
                            className="position-absolute end-0 top-50 translate-middle-y"
                            onClick={() => togglePasswordVisibility('confirm')}
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
                          variant="contained"
                          color="primary"
                          size="large"
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

        {/* MUI Snackbar for notifications */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={snackbar.autoHideDuration} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
            action={snackbar.action}
          >
            {snackbar.title && <AlertTitle>{snackbar.title}</AlertTitle>}
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Tab.Container>
    </Container>
  );
}

export default Akun;