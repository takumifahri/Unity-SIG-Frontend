import React, { useEffect, useState, useCallback } from 'react';
import { FaUserPlus, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Avatar,
  Badge,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Paper,
  Chip,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Person, Close, WhatsApp, Search } from "@mui/icons-material";

// Styled Badge untuk status online
const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

const AkunTerdaftar = () => {
  // State
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    photo: null,
    name: '',
    email: '',
    gender: '',
    address: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [formErrors, setFormErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);

  // Fetch accounts data
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setAccounts(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching accounts:", err);
      setError("Gagal memuat data akun. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Filter accounts based on search query
  const filteredAccounts = accounts.filter(account => 
    account.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle photo upload
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, photo: file }));
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = "Nama pengguna wajib diisi";
    
    if (!formData.email.trim()) {
      errors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Format email tidak valid";
    }
    
    if (!formData.phone.trim()) {
      errors.phone = "Nomor telepon wajib diisi";
    } else if (!/^[0-9]{10,13}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = "Nomor telepon harus 10-13 digit";
    }
    
    if (!formData.password) {
      errors.password = "Password wajib diisi";
    } else if (formData.password.length < 8) {
      errors.password = "Password minimal 8 karakter";
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Konfirmasi password tidak cocok";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle add account
  const handleAddAccount = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('role', formData.role);
      
      if (formData.photo) {
        formDataToSend.append('profile_photo', formData.photo);
      }
      
      await axios.post(`${process.env.REACT_APP_API_URL}/api/users/register`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      // Refresh accounts list
      fetchAccounts();
      
      // Reset form and close modal
      resetForm();
      setShowModal(false);
    } catch (err) {
      console.error("Error adding account:", err);
      setError(err.response?.data?.message || "Gagal menambahkan akun. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
      setLoading(true);
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/users/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        
        // Refresh accounts list
        fetchAccounts();
      } catch (err) {
        console.error("Error deleting account:", err);
        setError("Gagal menghapus akun. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle status change
  const handleStatusChange = async (id, isActive) => {
    setLoading(true);
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/users/${id}/status`, 
        { isActive: !isActive },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      // Refresh accounts list
      fetchAccounts();
    } catch (err) {
      console.error("Error updating account status:", err);
      setError("Gagal mengubah status akun. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      photo: null,
      name: '',
      email: '',
      gender: '',
      address: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'user'
    });
    setPhotoPreview(null);
    setFormErrors({});
  };

  // Get role color
  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return { bg: 'rgb(253, 236, 234)', text: 'rgb(211, 47, 47)' };
      case 'developer':
        return { bg: 'rgb(232, 244, 253)', text: 'rgb(2, 136, 209)' };
      case 'owner':
        return { bg: 'rgb(237, 231, 246)', text: 'rgb(123, 31, 162)' };
      default:
        return { bg: 'rgb(232, 245, 233)', text: 'rgb(46, 125, 50)' };
    }
  };

  return (
    <Container maxWidth="2xl" sx={{ py: 4 }}>
      {error && (
        <Paper 
          sx={{ 
            p: 2, 
            mb: 3, 
            bgcolor: 'error.light', 
            color: 'error.dark',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography>{error}</Typography>
          <IconButton size="small" onClick={() => setError(null)}>
            <Close fontSize="small" />
          </IconButton>
        </Paper>
      )}

      {error && (
        <Paper 
          sx={{ 
            p: 2, 
            mb: 3, 
            bgcolor: 'error.light', 
            color: 'error.dark',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography>{error}</Typography>
          <IconButton size="small" onClick={() => setError(null)}>
            <Close fontSize="small" />
          </IconButton>
        </Paper>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" sx={{ p: 4 }}>
          Akun Terdaftar
        </Typography>
        
        {/* Header dengan Search dan Add Button */}
        <Box 
          sx={{ 
            px:4,
            py: 2, 
            mt: -4,
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
          }}
        >
          <Typography variant="h6" fontWeight="medium">
            Daftar Akun
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <TextField
                placeholder="Cari akun..."
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ width: 250 }}
                InputProps={{
                  startAdornment: (
                    <Search sx={{ color: 'action.active', mr: 1 }} />
                  ),
                }}
              />
            </Box>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<FaUserPlus />}
              onClick={() => setShowModal(true)}
            >
              Tambah Akun
            </Button>
          </Box>
        </Box>

        <Box sx={{ overflowX: 'auto' }}>
          {loading && accounts.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Foto Profil
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alamat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nomor Telepon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-4 text-center text-sm text-gray-500">
                      {searchQuery ? 'Tidak ada akun yang sesuai dengan pencarian' : 'Belum ada akun terdaftar'}
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((account, index) => {
                    const roleColor = getRoleColor(account.role);
                    
                    return (
                      <tr key={account.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {account.isActive ? (
                              <StyledBadge
                                overlap="circular"
                                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                variant="dot"
                              >
                                <Avatar 
                                  alt={account.name} 
                                  src={account.profile_photo ? `${process.env.REACT_APP_API_URL}/${account.profile_photo}` : undefined}
                                >
                                  {!account.profile_photo && <Person />}
                                </Avatar>
                              </StyledBadge>
                            ) : (
                              <Avatar 
                                alt={account.name} 
                                src={account.profile_photo ? `${process.env.REACT_APP_API_URL}/${account.profile_photo}` : undefined}
                              >
                                {!account.profile_photo && <Person />}
                              </Avatar>
                            )}
                          </Box>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {account.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {account.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {account.gender || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {account.address || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {account.phone ? (
                            <Tooltip title="Buka WhatsApp">
                              <a
                                href={`https://wa.me/${account.phone.replace(/^0/, '62').replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline flex items-center gap-1"
                              >
                                {account.phone}
                                <WhatsApp fontSize="small" color="success" />
                              </a>
                            </Tooltip>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {account.total_order || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Chip 
                            label={account.role || 'user'} 
                            size="small"
                            sx={{ 
                              bgcolor: roleColor.bg,
                              color: roleColor.text,
                              fontWeight: 'medium'
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title={account.isActive ? "Nonaktifkan" : "Aktifkan"}>
                              <Button
                                variant="outlined"
                                size="small"
                                color={account.isActive ? "error" : "success"}
                                onClick={() => handleStatusChange(account.id, account.isActive)}
                                sx={{ minWidth: 'unset', px: 1 }}
                              >
                                {account.isActive ? "Nonaktifkan" : "Aktifkan"}
                              </Button>
                            </Tooltip>
                            
                            <Tooltip title="Hapus">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteAccount(account.id)}
                              >
                                <FaTrash size={16} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </Box>
        
        {/* Footer dengan informasi jumlah data */}
        <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)', display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Total: {filteredAccounts.length} akun
          </Typography>
          
          {searchQuery && (
            <Typography variant="body2" color="text.secondary">
              Hasil pencarian untuk: "{searchQuery}"
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Modal Tambah Akun */}
      <Dialog 
        open={showModal} 
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Tambah Akun Baru</Typography>
          <IconButton 
            onClick={() => {
              setShowModal(false);
              resetForm();
            }}
            size="small"
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Box component="form" onSubmit={handleAddAccount} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={photoPreview}
                  sx={{ width: 100, height: 100 }}
                >
                  {!photoPreview && <Person sx={{ width: 60, height: 60 }} />}
                </Avatar>
                <input
                  accept="image/*"
                  type="file"
                  id="upload-photo"
                  hidden
                  onChange={handlePhotoChange}
                />
                <label htmlFor="upload-photo">
                  <Button
                    variant="contained"
                    component="span"
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      minWidth: 'unset',
                      width: 32,
                      height: 32,
                      borderRadius: '50%'
                    }}
                  >
                    +
                  </Button>
                </label>
              </Box>
            </Box>
            
            <TextField
              label="Nama Pengguna"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!formErrors.name}
              helperText={formErrors.name}
            />
            
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                label="Gender"
              >
                <MenuItem value="">-</MenuItem>
                <MenuItem value="male">Laki-laki</MenuItem>
                <MenuItem value="female">Perempuan</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Alamat"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
            />
            
            <TextField
              label="Nomor Telepon"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!formErrors.phone}
              helperText={formErrors.phone}
            />
            
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                label="Role"
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="owner">Owner</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!formErrors.password}
              helperText={formErrors.password}
            />
            
            <TextField
              label="Konfirmasi Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button 
            variant="outlined" 
            onClick={() => {
              setShowModal(false);
              resetForm();
            }}
          >
            Batal
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAddAccount}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Simpan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AkunTerdaftar;