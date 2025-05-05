import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tab, Nav, Form, Button, Table, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import { BiSolidFaceMask } from "react-icons/bi";
import { FaCrown } from "react-icons/fa6";
import { MdOutlineVerifiedUser } from "react-icons/md";

function Akun() {
  const navigate = useNavigate();
  const { user, isAuth, Logout, token, loading } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  // const [imageError, setImageError] = useState(false);
  // const [imageUrl, setImageUrl] = useState("");
  
  // Check if user is logged in and fetch data
  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuth() && token) {
        try {
          setProfileLoading(true);
          // If you need additional user data outside of what's in AuthContext, fetch it here
          console.log("User authenticated, token available");
          // When using just AuthContext data, we'll set profileLoading to false in the user effect below
        } catch (error) {
          console.error("Error fetching additional user data:", error);
          setProfileLoading(false);
        }
      }
    };

    if (!loading) {
      if (!isAuth() || !token) {
        console.log("No auth or token, redirecting to login");
        navigate('/login');
      } else {
        fetchUserData();
      }
    }
  }, [isAuth, navigate, token, loading]);

  const [userInfo, setUserInfo] = useState({
    nama: '',
    email: '',
    telepon: '',
    gender: '',
    profile_photo: '',
    total_order: 0,
    role: '',
    google_id: '',
    facebook_id: '',
    label: '',
    latitude: 0,
    longitude: 0,
    address: '',
    city: '',
    region: '',
    postal_code: ''
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // State untuk feedback
  const [feedback, setFeedback] = useState({
    type: '',
    message: ''
  });

  const [showPhotoForm, setShowPhotoForm] = useState(false);
  
  const updatePhoto = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('profile_photo', e.target.files[0]);

    try {
      setFeedback({
        type: 'info',
        message: 'Mengupload foto...'
      });
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/profile/update_avatar`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      setUserInfo((prev) => ({
        ...prev,
        profile_photo: response.data.profile_photo
      }));

      setFeedback({
        type: 'success',
        message: 'Foto profil berhasil diperbarui!'
      });

      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error("Error updating photo:", error);
      setFeedback({
        type: 'danger',
        message: error.response?.data?.message || 'Gagal memperbarui foto profil!'
      });
    }
    
    setTimeout(() => {
      setFeedback({ type: '', message: '' });
    }, 3000);
  };
  
  // State untuk mode edit dan temporary data
  const [isEditing, setIsEditing] = useState(false);
  const [tempUserInfo, setTempUserInfo] = useState({...userInfo});

  // Update user info when auth user changes
  useEffect(() => {
    console.log("User data in Akun component:", user);
    if (user && user.user) {
      console.log("User data structure received:", user);
      setUserInfo({
        nama: user.user.name || '',
        email: user.user.email || '',
        telepon: user.user.phone || '',
        gender: user.user.gender || '',
        profile_photo: user.user.profile_photo || '' || `${process.env.REACT_APP_API_URL}/${user.profile_photo}` ,
        total_order: user.user.total_order || 0,
        role: user.user.role || '',
        google_id: user.user.google_id || '',
        facebook_id: user.user.facebook_id || '',
        label: user.user.location?.label || '',
        latitude: user.user.location?.latitude || 0,
        longitude: user.user.location?.longitude || 0,
        address: user.user.location?.address || '',
        city: user.user.location?.city || '',
        region: user.user.location?.region || '',
        postal_code: user.user.location?.postal_code || ''
      });
      setTempUserInfo({
        nama: user.user.name || '',
        email: user.user.email || '',
        telepon: user.user.phone || '',
        gender: user.user.gender || '',
        profile_photo: user.user.profile_photo || '' || `${process.env.REACT_APP_API_URL}/${user.profile_photo}`,
        total_order: user.user.total_order || 0,
        role: user.user.role || '',
        google_id: user.user.google_id || '',
        facebook_id: user.user.facebook_id || '',
        label: user.user.location?.label || '',
        latitude: user.user.location?.latitude || 0,
        longitude: user.user.location?.longitude || 0,
        address: user.user.location?.address || '',
        city: user.user.location?.city || '',
        region: user.user.location?.region || '',
        postal_code: user.user.location?.postal_code || ''
      });
      setProfileLoading(false);
    } else if (user) {
      // Handle if user structure is different
      console.log("User exists but structure is different than expected:", user);
      // Try to extract user info based on actual structure
      // This might be necessary if your API returns a different structure
      const userData = user.user || user;
      setUserInfo({
        nama: userData.name || '',
        email: userData.email || '',
        telepon: userData.phone || userData.telepon || '',
        gender: userData.gender || '',
        profile_photo: userData.profile_photo || `${process.env.REACT_APP_API_URL}/${userData.profile_photo}` || '',
        total_order: userData.total_order || 0,
        role: userData.role || '',
        google_id: userData.google_id || '',
        facebook_id: userData.facebook_id || '',
        label: userData.location?.label || '',
        latitude: userData.location?.latitude || 0,
        longitude: userData.location?.longitude || 0,
        address: userData.location?.address || '',
        city: userData.location?.city || '',
        region: userData.location?.region || '',
        postal_code: userData.location?.postal_code || ''
      });
      setTempUserInfo({
        nama: userData.name || '',
        email: userData.email || '',
        telepon: userData.phone || userData.telepon || '',
        gender: userData.gender || '',
        profile_photo: userData.profile_photo || `${process.env.REACT_APP_API_URL}/${userData.profile_photo}` || '',
        total_order: userData.total_order || 0,
        role: userData.role || '',
        google_id: userData.google_id || '',
        facebook_id: userData.facebook_id || '',
        label: userData.location?.label || '',
        latitude: userData.location?.latitude || 0,
        longitude: userData.location?.longitude || 0,
        address: userData.location?.address || '',
        city: userData.location?.city || '',
        region: userData.location?.region || '',
        postal_code: userData.location?.postal_code || ''
      });
      setProfileLoading(false);
    } else {
      console.log("No user data available yet");
    }
  }, [user]);

  console.log('poto',userInfo.profile_photo)
  // State untuk validasi password
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    number: false,
    uppercase: false,
    lowercase: false
  });

  // State untuk visibility toggle
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Contoh data pesanan (nanti bisa diambil dari API/database)
  const [orderHistory, setOrderHistory] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  
  // Handle token from URL (untuk kasus reset password dll)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
  
    if (urlToken) {
      console.log("Found token in URL, storing it");
      // Simpan token ke localStorage atau ke AuthContext
      localStorage.setItem('token', urlToken);
      
      // Bersihkan token dari URL agar tidak terlihat
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
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/order/history`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          });

          console.log("Order history response:", response.data.data);
          setOrderHistory(response.data.data || []);

          // Example API call to fetch order history
          // const response = await axios.get(
          //   `${process.env.REACT_APP_API_URL}/api/orders/history`,
          //   {
          //     headers: {
          //       Authorization: `Bearer ${token}`
          //     }
          //   }
          // );
          // setOrderHistory(response.data);
          setOrdersLoading(false);
        } catch (error) {
          console.error("Error fetching order history:", error);
          setOrdersLoading(false);
        }
      }
    };
    
    fetchOrderHistory();
  }, [token]);

  // Validasi email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Validasi nomor telepon
  const validatePhone = (phone) => {
    if (!phone) return true; // Allow empty phone for now
    const re = /^[0-9]{10,13}$/;
    return re.test(phone);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Jika sedang dalam mode edit dan klik batal, kembalikan ke data asli
      setTempUserInfo({...userInfo});
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempUserInfo({
      ...tempUserInfo,
      [name]: value
    });
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords({
      ...passwords,
      [name]: value
    });
    
    if (name === 'newPassword') {
      validatePasswordRules(value);
    }
  };

  const handleInfoUpdate = async (e) => {
    e.preventDefault();
    
    // Validasi input
    if (!tempUserInfo.nama.trim()) {
      setFeedback({
        type: 'danger',
        message: 'Nama tidak boleh kosong'
      });
      return;
    }

    // Validasi email
    if (!validateEmail(tempUserInfo.email)) {
      setFeedback({
        type: 'danger',
        message: 'Format email tidak valid'
      });
      return;
    }

    if (tempUserInfo.telepon && !validatePhone(tempUserInfo.telepon)) {
      setFeedback({
        type: 'danger',
        message: 'Format nomor telepon tidak valid'
      });
      return;
    }

    try {
      setFeedback({
        type: 'info',
        message: 'Menyimpan perubahan...'
      });
      
      // Make API call to update user data
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/profile/update_profile`, 
        {
          name: tempUserInfo.nama,
          email: tempUserInfo.email,
          phone: tempUserInfo.telepon,
          gender: tempUserInfo.gender,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update userInfo with temporary data
      setUserInfo({...tempUserInfo});
      
      setFeedback({
        type: 'success',
        message: 'Informasi akun berhasil diperbarui!'
      });

      // Nonaktifkan mode edit
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setFeedback({
        type: 'danger',
        message: error.response?.data?.message || 'Gagal memperbarui informasi akun!'
      });
    }

    setTimeout(() => {
      setFeedback({ type: '', message: '' });
    }, 3000);
  };

  const validatePasswordRules = (password) => {
    setPasswordValidation({
      length: password.length >= 8,
      number: /[0-9]/.test(password),
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password)
    });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Validasi semua rules terpenuhi
    const allRulesMet = Object.values(passwordValidation).every(rule => rule);
    
    if (!allRulesMet) {
      setFeedback({
        type: 'danger',
        message: 'Password harus memenuhi semua kriteria'
      });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setFeedback({
        type: 'danger',
        message: 'Password baru tidak cocok!'
      });
      return;
    }

    try {
      setFeedback({
        type: 'info',
        message: 'Mengubah password...'
      });
      
      // Make API call to update password
      const change_password = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/user/change_password`, 
        {
          current_password: passwords.currentPassword,
          new_password: passwords.newPassword,
          new_password_confirmation: passwords.confirmPassword
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setFeedback({
        type: 'success',
        message: 'Password berhasil diubah!'
      });

      // Reset form dan feedback
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordValidation({
        length: false,
        number: false,
        uppercase: false,
        lowercase: false
      });
    } catch (error) {
      console.error("Error changing password:", error);
      setFeedback({
        type: 'danger',
        message: error.response?.data?.message || 'Gagal mengubah password!'
      });
    }

    setTimeout(() => {
      setFeedback({ type: '', message: '' });
    }, 3000);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Apakah Anda yakin ingin keluar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, keluar',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        Logout();
        navigate('/login');
      }
    });
  };

  const sendResetLink = async() => {
    try {
      setFeedback({
        type: 'info',
        message: 'Mengirim link reset password...'
      });
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/profile/reset_password`,
        {
          email: userInfo.email,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
        }
      );
      
      setFeedback({
        type: 'success',
        message: 'Link reset password telah dikirim ke email Anda'
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Link Reset Password Terkirim',
        text: response.data.message,
      });
    } catch (error) {
      console.log(error);
      
      setFeedback({
        type: 'danger',
        message: 'Gagal mengirim link reset password'
      });
      
      Swal.fire({
        icon: 'error',
        title: 'Gagal mengirim link reset password',
        text: error.response?.data?.message || 'Terjadi kesalahan',
      });
    }
    
    setTimeout(() => {
      setFeedback({ type: '', message: '' });
    }, 3000);
  };

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
            style={{ width: '100px', height: '100px' }}
            ></div>
            <h5
            className="mt-3 shimmer shimmer-text"
            style={{ width: '60%', margin: '10px auto', height: '20px' }}
            ></h5>
            <p
            className="text-muted shimmer shimmer-text"
            style={{ width: '80%', margin: '10px auto', height: '15px' }}
            ></p>
          </div>
          <Nav variant="pills" className="flex-column">
            {[...Array(4)].map((_, index) => (
            <Nav.Item key={index} className="mb-2">
              <span
              className="shimmer shimmer-text"
              style={{ width: '80%', height: '15px', display: 'block', margin: '0 auto' }}
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
          <h4
            className="mb-4 shimmer shimmer-text"
            style={{ width: '50%', height: '25px' }}
          ></h4>
          <div
            className="shimmer shimmer-block"
            style={{ height: '200px', borderRadius: '10px' }}
          ></div>
          </Card.Body>
        </Card>
        </Col>
      </Row>
      </Container>
    );
  }

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
                <div
                  className="position-relative d-inline-block"
                  style={{ width: '100px', height: '100px' }}
                >
                  {/* Foto Profil */}
                  <div
                    className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center overflow-hidden"
                    style={{ width: '100px', height: '100px' }}
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
                      bottom: '0',
                      right: '0',
                      borderRadius: '50%',
                      padding: '6px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    <i className="fas fa-camera"></i>
                    <input
                      type="file"
                      accept="image/*"
                      name="profile_photo"
                      style={{ display: 'none' }}
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
                    {userInfo.role === 'developer' && <MdOutlineVerifiedUser className="text-danger" size={20} />}
                    {userInfo.role === 'user' && <BiSolidFaceMask className="ms-2 text-primary"  size={20} />}
                    {userInfo.role === 'owner' && <FaCrown className="ms-2 text-warning"  size={20}/>}
                    {userInfo.role === 'admin' && <MdOutlineVerifiedUser className="ms-2 text-info"   size={20}/>}
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
                    <Nav.Link eventKey="password">Tracking Ordermu</Nav.Link>
                  </Nav.Item>
                              <Nav.Item>
                    <Nav.Link eventKey="password">Ubah Password</Nav.Link>
                  </Nav.Item>
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
                              <td>{new Date(order.date).toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}</td>
                              <td>
                                {Array.isArray(order.items) ? (
                                    order.items.map((item, itemIndex) => (
                                      <td>{item.product_name}</td>
                                    ))
                                  ) : (
                                    order.items
                                )}
                              </td>
                              <td>
                                {Array.isArray(order.items) ? (
                                  order.items.map((item, itemIndex) => (
                                    <img
                                      key={itemIndex}
                                      src={`${process.env.REACT_APP_API_URL}/${item.image}`}
                                      alt={item.product_name}
                                      style={{ width: '50px', height: '50px', objectFit: 'cover' }} // Ukuran kecil
                                    />
                                  ))
                                ) : (
                                  order.items
                                )}
                              </td>
                              <td>
                                {Array.isArray(order.items) ? (
                                    order.items.map((item, itemIndex) => (
                                      <td>{item.quantity}</td>
                                    ))
                                  ) : (
                                    order.items
                                )}
                              </td>
                              <td>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(order.total_amount)}</td>
                              <td>
                                <span className={`badge bg-${
                                  order.status === 'Selesai' ? 'success' : 
                                  order.status === 'Dikirim' ? 'primary' : 
                                  order.status === 'Dibatalkan' ? 'danger' : 'warning'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <Alert variant="info">
                        Anda belum memiliki riwayat pesanan.
                      </Alert>
                    )}
                  </Tab.Pane>
                  <Tab.Pane eventKey="account">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="mb-0">Informasi Akun</h4>
                      {!isEditing && (
                        <Button 
                          variant="outline-primary" 
                          onClick={handleEditToggle}
                        >
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
                              onChange={(e) => setTempUserInfo({...tempUserInfo, nama: e.target.value})}
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
                              onChange={(e) => setTempUserInfo({...tempUserInfo, email: e.target.value})}
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
                              onChange={(e) => setTempUserInfo({...tempUserInfo, telepon: e.target.value})}
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
                              onChange={(e) => setTempUserInfo({...tempUserInfo, gender: e.target.value})}
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
                      {userInfo && (
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Address</Form.Label>
                              <Form.Control
                                type="text"
                                value={isEditing ? tempUserInfo.address : userInfo.address}  
                                placeholder='contoh: Jl. Raya No. 123'
                                className="bg-light"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Jumlah Pesanan</Form.Label>
                              <Form.Control
                                type="text"
                                value={userInfo.total_order || 0}
                                disabled
                                className="bg-light"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
          
                        
                      )}
             
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Label</Form.Label>
                            <Form.Control
                              type="text"
                              value={isEditing ? tempUserInfo.label : userInfo.label}  
                              placeholder='contoh: Jl. Raya No. 123'
                              className="bg-light"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>latitude</Form.Label>
                            <Form.Control
                                type="text"
                                value={isEditing ? tempUserInfo.latitude : userInfo.latitude}  
                                placeholder='contoh: Jl. Raya No. 123'
                                className="bg-light"
                              />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Longitude</Form.Label>
                            <Form.Control
                              type="text"
                              value={isEditing ? tempUserInfo.longitude : userInfo.longitude}  
                              placeholder='contoh: Jl. Raya No. 123'
                              className="bg-light"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>region</Form.Label>
                            <Form.Control
                                type="text"
                                value={isEditing ? tempUserInfo.region : userInfo.region}  
                                placeholder='contoh: Jl. Raya No. 123'
                                className="bg-light"
                              />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>city</Form.Label>
                            <Form.Control
                              type="text"
                              value={isEditing ? tempUserInfo.city : userInfo.city}  
                              placeholder='contoh: Jl. Raya No. 123'
                              className="bg-light"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>kode pos</Form.Label>
                            <Form.Control
                                type="text"
                                value={isEditing ? tempUserInfo.postal_code : userInfo.postal_code}  
                                placeholder='contoh: Jl. Raya No. 123'
                                className="bg-light"
                              />
                          </Form.Group>
                        </Col>
                      </Row>

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
                            onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                            required
                          />
                          <Button
                            variant="link"
                            className="position-absolute end-0 top-50 translate-middle-y"
                            onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                            style={{ zIndex: 10 }}
                          >
                            <i className={`far fa-eye${showPasswords.current ? '-slash' : ''}`}></i>
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
                              setPasswords({...passwords, newPassword: e.target.value});
                              validatePasswordRules(e.target.value);
                            }}
                            required
                          />
                          <Button
                            variant="link"
                            className="position-absolute end-0 top-50 translate-middle-y"
                            onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                            style={{ zIndex: 10 }}
                          >
                            <i className={`far fa-eye${showPasswords.new ? '-slash' : ''}`}></i>
                          </Button>
                        </div>
                        <div className="mt-2">
                          <div className={`small ${passwordValidation.length ? 'text-success' : 'text-muted'}`}>
                            <i className={`fas fa-${passwordValidation.length ? 'check' : 'times'} me-2`}></i>
                            Minimal 8 karakter
                          </div>
                          <div className={`small ${passwordValidation.number ? 'text-success' : 'text-muted'}`}>
                            <i className={`fas fa-${passwordValidation.number ? 'check' : 'times'} me-2`}></i>
                            Minimal 1 angka
                          </div>
                          <div className={`small ${passwordValidation.uppercase ? 'text-success' : 'text-muted'}`}>
                            <i className={`fas fa-${passwordValidation.uppercase ? 'check' : 'times'} me-2`}></i>
                            Minimal 1 huruf kapital
                          </div>
                          <div className={`small ${passwordValidation.lowercase ? 'text-success' : 'text-muted'}`}>
                            <i className={`fas fa-${passwordValidation.lowercase ? 'check' : 'times'} me-2`}></i>
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
                            onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                            required
                          />
                          <Button
                            variant="link"
                            className="position-absolute end-0 top-50 translate-middle-y"
                            onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                            style={{ zIndex: 10 }}
                          >
                            <i className={`far fa-eye${showPasswords.confirm ? '-slash' : ''}`}></i>
                          </Button>
                        </div>
                        <div className="mt-3">
                          <Button 
                            variant="link" 
                            className="text-decoration-none p-0" 
                            onClick={sendResetLink}
                          >
                            Lupa password lama?
                          </Button>
                        </div>
                      </Form.Group>
                      
                      <div className="d-grid">
                        <Button 
                          type="submit" 
                          variant="dark" 
                          size="lg"
                          disabled={!Object.values(passwordValidation).every(rule => rule) || 
                                   !passwords.confirmPassword ||
                                   passwords.newPassword !== passwords.confirmPassword}
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
            onClose={() => setFeedback({ type: '', message: '' })}
            className="position-fixed top-0 end-0 m-3"
            style={{ zIndex: 1000 }}
          >
            {feedback.message}
          </Alert>
        )}
      </Tab.Container>
    </Container>
  );
}

export default Akun;