import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import axios from "axios"
import { useDropzone } from "react-dropzone"

// Material UI Components
import {
  Container,
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Divider,
  FormHelperText,
  IconButton,
  Chip,
  Stack,
  AlertTitle,
  Checkbox,
  FormControlLabel
} from "@mui/material"

// Icons
import { CloudUpload, Info, CheckCircle, Close, InsertDriveFile, Delete, Add, Image, AddCircle } from "@mui/icons-material"
import { useAuth } from "../context/AuthContext"
import { InfoIcon } from "lucide-react"

function CustomOrders() {
  const navigate = useNavigate()
  const { updateCartCount } = useCart()
  const { isAuth, token } = useAuth()
  const [users, setUsers] = useState([])
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [showFabricTerms, setShowFabricTerms] = useState(false) // Don't show terms modal on mount
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    no_telp: "",
    email: "",
    jenis_baju: "",
    catatan: "",
    sumber_kain: "sendiri", // Default value is always "sendiri" now
    gambar_referensi: [],
    estimasi_waktu: null,
    detail_bahan: null,
    colors: [
      {
        color_name: "",
        sizes: [
          {
            size: "",
            jumlah: 1
          }
        ]
      }
    ]
  })

  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: "",
    severity: "success",
    title: ""
  })
  const [filePreviewList, setFilePreviewList] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle terms agreement
  const handleAgreeTerms = () => {
    setTermsAgreed(true)
    setShowFabricTerms(false)
  }

  // Calculate total quantity from all colors and sizes
  const calculateTotalQuantity = useCallback(() => {
    return formData.colors.reduce((total, color) => {
      return total + color.sizes.reduce((sizeTotal, size) => {
        return sizeTotal + (parseInt(size.jumlah) || 0);
      }, 0);
    }, 0);
  }, [formData.colors]);

  // Ambil data pengguna yang sudah login
  const getMe = useCallback(async () => {
    try {
      if (!isAuth() || !token) return;
      
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
        },
      })
      setUsers(res.data.user)
      setFormData((prevState) => ({
        ...prevState,
        nama_lengkap: res.data.user.name || "",
        no_telp: res.data.user.phone || "",
        email: res.data.user.email || "",
      }))
    } catch (error) {
      console.error("Error fetching user data:", error)
      setSnackbarState({
        open: true,
        message: "Gagal mengambil data pengguna",
        severity: "error",
        title: "Error"
      })
    }
  }, [isAuth, token])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  // Handle color input change
  const handleColorChange = (index, field, value) => {
    const updatedColors = [...formData.colors];
    updatedColors[index][field] = value;
    setFormData(prevState => ({
      ...prevState,
      colors: updatedColors
    }));
  };

  // Handle size input change
  const handleSizeChange = (colorIndex, sizeIndex, field, value) => {
    const updatedColors = [...formData.colors];
    updatedColors[colorIndex].sizes[sizeIndex][field] = value;
    setFormData(prevState => ({
      ...prevState,
      colors: updatedColors
    }));
  };

  // Add new color
  const addColor = () => {
    setFormData(prevState => ({
      ...prevState,
      colors: [
        ...prevState.colors,
        {
          color_name: "",
          sizes: [
            {
              size: "",
              jumlah: 1
            }
          ]
        }
      ]
    }));
  };

  // Remove color
  const removeColor = (colorIndex) => {
    if (formData.colors.length > 1) {
      const updatedColors = [...formData.colors];
      updatedColors.splice(colorIndex, 1);
      setFormData(prevState => ({
        ...prevState,
        colors: updatedColors
      }));
    } else {
      setSnackbarState({
        open: true,
        message: "Minimal harus ada satu warna",
        severity: "warning",
        title: "Peringatan"
      });
    }
  };

  // Add new size to a color
  const addSize = (colorIndex) => {
    const updatedColors = [...formData.colors];
    updatedColors[colorIndex].sizes.push({
      size: "",
      jumlah: 1
    });
    
    setFormData(prevState => ({
      ...prevState,
      colors: updatedColors
    }));
  };

  // Remove size from a color
  const removeSize = (colorIndex, sizeIndex) => {
    if (formData.colors[colorIndex].sizes.length > 1) {
      const updatedColors = [...formData.colors];
      updatedColors[colorIndex].sizes.splice(sizeIndex, 1);
      
      setFormData(prevState => ({
        ...prevState,
        colors: updatedColors
      }));
    } else {
      setSnackbarState({
        open: true,
        message: "Minimal harus ada satu ukuran untuk setiap warna",
        severity: "warning",
        title: "Peringatan"
      });
    }
  };

  // Dropzone configuration
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB (increased from 2MB)
    maxFiles: 5,
    multiple: true,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        // Check if adding these files would exceed the limit
        if (formData.gambar_referensi.length + acceptedFiles.length > 5) {
          setSnackbarState({
            open: true,
            message: "Maksimal 5 gambar dapat diunggah.",
            severity: "warning",
            title: "Batas Gambar"
          })
          return;
        }
        
        // Add new files to the existing ones
        const newFiles = [...formData.gambar_referensi, ...acceptedFiles];
        setFormData((prevState) => ({
          ...prevState,
          gambar_referensi: newFiles,
        }))
        
        // Create preview URLs for the files
        const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
        setFilePreviewList(prev => [...prev, ...newPreviews]);
      }
    },
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0]?.errors[0]
      let message = "File tidak valid"

      if (error?.code === "file-too-large") {
        message = "Ukuran file terlalu besar. Maksimal 5MB."
      } else if (error?.code === "too-many-files") {
        message = "Terlalu banyak file. Maksimal 5 gambar."
      }

      setSnackbarState({
        open: true,
        message,
        severity: "error",
        title: "Error Upload"
      })
    },
  })

  const removeFile = (index) => {
    // Remove file from formData
    const newFiles = [...formData.gambar_referensi];
    newFiles.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      gambar_referensi: newFiles
    }));
    
    // Revoke and remove preview URL
    if (filePreviewList[index]) {
      URL.revokeObjectURL(filePreviewList[index]);
      const newPreviews = [...filePreviewList];
      newPreviews.splice(index, 1);
      setFilePreviewList(newPreviews);
    }
  }

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      filePreviewList.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const validateForm = () => {
    // Check if user has agreed to the terms
    if (!termsAgreed) {
      setShowFabricTerms(true);
      return false;
    }

    // Basic fields validation
    const missingFields = []
    if (!formData.nama_lengkap) missingFields.push("Nama Lengkap")
    if (!formData.no_telp) missingFields.push("No. Telepon")
    if (!formData.email) missingFields.push("Email")
    if (!formData.jenis_baju) missingFields.push("Jenis Baju")

    if (missingFields.length > 0) {
      setSnackbarState({
        open: true,
        message: `Mohon lengkapi field berikut: ${missingFields.join(", ")}`,
        severity: "warning",
        title: "Field Belum Lengkap"
      })
      return false;
    }

    // Validate colors and sizes
    let isValid = true;
    let hasEmptyFields = false;
    
    formData.colors.forEach((color, colorIndex) => {
      if (!color.color_name.trim()) {
        hasEmptyFields = true;
      }
      
      color.sizes.forEach((sizeItem, sizeIndex) => {
        if (!sizeItem.size) {
          hasEmptyFields = true;
        }
        
        if (!sizeItem.jumlah || parseInt(sizeItem.jumlah) < 1) {
          hasEmptyFields = true;
        }
      });
    });
    
    if (hasEmptyFields) {
      setSnackbarState({
        open: true,
        message: "Pastikan semua warna dan ukuran terisi dengan benar",
        severity: "warning",
        title: "Data Belum Lengkap"
      });
      isValid = false;
    }

    // Validate total quantity
    const totalQty = calculateTotalQuantity();
    if (totalQty < 3) {
      setSnackbarState({
        open: true,
        message: "Total pemesanan minimal 3 pcs",
        severity: "warning",
        title: "Jumlah Tidak Valid"
      });
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true)

    // Periksa apakah pengguna sudah login
    if (!isAuth() || !token) {
      setSnackbarState({
        open: true,
        message: "Silakan login terlebih dahulu untuk membuat pesanan.",
        severity: "warning",
        title: "Login Diperlukan"
      });

      // Arahkan ke halaman login setelah 2 detik
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }
    
    try {
      const formDataToSend = new FormData()
      
      // Append all form fields except gambar_referensi and colors
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'gambar_referensi' && key !== 'colors') {
          formDataToSend.append(key, value)
        }
      })
      
      // Fix for colors - make sure it's sent as an array
      // Instead of JSON.stringify, add each color as an array element
      formData.colors.forEach((color, colorIndex) => {
        // Add color name
        formDataToSend.append(`colors[${colorIndex}][color_name]`, color.color_name);
        
        // Add sizes for this color
        color.sizes.forEach((size, sizeIndex) => {
          formDataToSend.append(`colors[${colorIndex}][sizes][${sizeIndex}][size]`, size.size);
          formDataToSend.append(`colors[${colorIndex}][sizes][${sizeIndex}][jumlah]`, size.jumlah);
        });
      });
      
      // Append gambar_referensi as array
      formData.gambar_referensi.forEach((file, index) => {
        formDataToSend.append(`gambar_referensi[${index}]`, file);
      });
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/order/custom/propose`, 
        formDataToSend, 
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
          },
        }
      )

      if (response.status === 201) {
        setSnackbarState({
          open: true,
          message: "Pesanan berhasil dibuat! Anda akan diarahkan ke halaman akun.",
          severity: "success",
          title: "Berhasil"
        })

        // Delay redirect untuk menampilkan Snackbar
        setTimeout(() => {
          navigate("/akun")
        }, 2000)
      }
    } catch (error) {
      console.error("Error submitting order:", error)
      setSnackbarState({
        open: true,
        message: error.response?.data?.message || "Terjadi kesalahan saat membuat pesanan",
        severity: "error",
        title: "Gagal"
      })
    } finally {
      setIsSubmitting(false)
    }
}

  useEffect(() => {
    getMe()
  }, [getMe])

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      {/* Fabric Source Terms Modal */}
      <Dialog 
        open={showFabricTerms} 
        onClose={() => {}} // Empty function to prevent closing by clicking outside
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="bg-[#6D4C3D] text-white flex justify-between items-center">
          <Typography variant="h6">Ketentuan Bahan/Kain Pesanan Custom</Typography>
        </DialogTitle>
        <DialogContent className="mt-4">
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" className="font-bold mb-2">
              Penting! Harap dibaca dengan seksama
            </Typography>
            
            <Typography variant="body1" className="mb-3">
              Untuk pesanan custom, terdapat ketentuan penting yang perlu Anda ketahui:
            </Typography>
            
            <Box sx={{ mb: 3, p: 2, bgcolor: '#fff8e1', borderRadius: 1 }}>
              <Typography variant="body1" className="mb-2 font-medium flex gap-3">
                <InfoIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#f57c00' }} />
                Ketentuan Sumber Bahan/Kain:
              </Typography>
              
              <Typography variant="body2" className="mb-2">
                1. <strong>Penyediaan Kain oleh Pelanggan:</strong> Untuk semua pesanan custom, <u>bahan/kain harus disediakan oleh pelanggan</u> (pemesan).
              </Typography>
              
              <Typography variant="body2" className="mb-2">
                2. <strong>Keterbatasan Layanan:</strong> Konveksi kami saat ini tidak menyediakan layanan pengadaan kain untuk pesanan custom.
              </Typography>
              
              <Typography variant="body2" className="mb-2">
                3. <strong>Tanggung Jawab:</strong> Pelanggan bertanggung jawab penuh atas kualitas dan kuantitas kain yang diberikan.
              </Typography>
            </Box>
            
            <Typography variant="body2" className="mb-3">
              Dengan menekan tombol "Saya Mengerti & Setuju" di bawah ini, Anda menyatakan telah membaca dan menyetujui ketentuan di atas serta bersedia menyediakan bahan/kain sendiri untuk pesanan custom Anda.
            </Typography>
            
            <FormControlLabel
              control={
                <Checkbox 
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  color="'#fff8e1'"
                />
              }
              label="Saya telah membaca dan menyetujui ketentuan di atas"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            variant="contained" 
            disabled={!termsAgreed}
            onClick={handleAgreeTerms}
            style={{backgroundColor: "#6D4C3D", color: "white"}}
            fullWidth
          >
            Saya Mengerti & Setuju
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarState.open}
        autoHideDuration={6000}
        onClose={() => setSnackbarState({ ...snackbarState, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarState({ ...snackbarState, open: false })}
          severity={snackbarState.severity}
          sx={{ width: "100%" }}
        >
          {snackbarState.title && <AlertTitle>{snackbarState.title}</AlertTitle>}
          {snackbarState.message}
        </Alert>
      </Snackbar>

      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" className="text-center font-bold mb-8">
          Custom Order
        </Typography>

        <Box className="flex flex-col md:flex-row gap-4">
          <Box className="flex-1">
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit}>
                  {/* Informasi Pribadi */}
                  <Box className="mb-6">
                    <Box className="flex items-center mb-4">
                      <Box className="w-7 h-7 rounded-full bg-[#6D4C3D] text-white flex items-center justify-center mr-2 text-sm">
                        1
                      </Box>
                      <Typography variant="h6" component="h2" className="font-medium">
                        Informasi Pribadi
                      </Typography>
                    </Box>

                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Nama Lengkap*"
                          name="nama_lengkap"
                          value={users?.name || formData.nama_lengkap}
                          onChange={handleInputChange}
                          required
                          disabled={users?.name}
                          variant="outlined"
                          className="mb-4"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="No. Telepon*"
                          name="no_telp"
                          value={users?.phone || formData.no_telp}
                          onChange={handleInputChange}
                          required
                          disabled={users?.phone}
                          variant="outlined"
                          className="mb-4"
                        />
                      </Grid>
                    </Grid>

                    <TextField
                      fullWidth
                      label="Email*"
                      name="email"
                      type="email"
                      value={users?.email || formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={users?.email}
                      variant="outlined"
                      className="mb-2"
                    />
                  </Box>

                  <Divider className="my-6" />

                  {/* Detail Pesanan */}
                  <Box className="mb-6">
                    <Box className="flex items-center mb-4">
                      <Box className="w-7 h-7 rounded-full bg-[#6D4C3D] text-white flex items-center justify-center mr-2 text-sm">
                        2
                      </Box>
                      <Typography variant="h6" component="h2" className="font-medium">
                        Detail Pesanan
                      </Typography>
                    </Box>

                    <FormControl fullWidth variant="outlined" className="mb-4">
                      <InputLabel id="jenis-baju-label">Jenis Baju*</InputLabel>
                      <Select
                        labelId="jenis-baju-label"
                        name="jenis_baju"
                        value={formData.jenis_baju}
                        onChange={handleInputChange}
                        label="Jenis Baju*"
                        required
                      >
                        <MenuItem value="">Pilih Jenis Baju</MenuItem>
                        <MenuItem value="kemeja">Kemeja</MenuItem>
                        <MenuItem value="kaos">Kaos</MenuItem>
                        <MenuItem value="jaket">Jaket</MenuItem>
                        <MenuItem value="celana">Celana</MenuItem>
                      </Select>
                    </FormControl>

                    {/* Info box about fabric source */}
                    <Box 
                      sx={{ 
                        p: 2, 
                        mb: 3, 
                        bgcolor: '#f8f9fa', 
                        border: '1px solid #e9ecef',
                        borderRadius: 1
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Info color="primary" sx={{ mr: 1, mt: 0.5 }} />
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                            Informasi Bahan/Kain
                          </Typography>
                          <Typography variant="body2">
                            Untuk pesanan custom, bahan/kain harus disediakan oleh pelanggan (pemesan).
                            Detail bahan akan dibahas dalam fase negosiasi dengan tim kami.
                          </Typography>
                          <Button 
                            variant="text" 
                            size="small" 
                            color="primary" 
                            onClick={() => setShowFabricTerms(true)}
                            sx={{ mt: 1, p: 0 }}
                          >
                            Lihat Ketentuan
                          </Button>
                        </Box>
                      </Box>
                    </Box>

                    {/* Warna dan Ukuran */}
                    <Box className="mb-6">
                      <Typography variant="subtitle1" className="mb-3 mt-4 font-medium" gutterBottom>
                        Warna dan Ukuran
                      </Typography>
                      <FormHelperText className="mb-3">
                        Total pesanan minimal 3 pcs. Total saat ini: {calculateTotalQuantity()} pcs
                      </FormHelperText>
                      
                      {formData.colors.map((color, colorIndex) => (
                        <Card key={colorIndex} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle2">Warna {colorIndex + 1}</Typography>
                            {colorIndex > 0 && (
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => removeColor(colorIndex)}
                              >
                                <Delete />
                              </IconButton>
                            )}
                          </Box>
                          
                          <TextField
                            fullWidth
                            label="Nama Warna*"
                            value={color.color_name}
                            onChange={(e) => handleColorChange(colorIndex, 'color_name', e.target.value)}
                            variant="outlined"
                            placeholder="Contoh: Merah, Navy, Putih"
                            sx={{ mb: 2 }}
                            required
                          />
                          
                          {/* Size Selection for this color */}
                          <Typography variant="body2" gutterBottom sx={{ mt: 2, mb: 1 }}>
                            Ukuran & Jumlah
                          </Typography>
                          
                          <Box sx={{ mb: 2 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Info />}
                              onClick={() => setShowSizeChart(true)}
                              sx={{ mb: 2 }}
                            >
                              Lihat Size Chart
                            </Button>
                          </Box>
                          
                          {color.sizes.map((sizeItem, sizeIndex) => (
                            <Box 
                              key={sizeIndex} 
                              sx={{ 
                                display: 'flex', 
                                gap: 2, 
                                mb: 2, 
                                alignItems: 'center',
                                flexWrap: 'wrap'
                              }}
                            >
                              <FormControl sx={{ minWidth: 120, flexGrow: 1 }}>
                                <InputLabel id={`size-label-${colorIndex}-${sizeIndex}`}>Ukuran*</InputLabel>
                                <Select
                                  labelId={`size-label-${colorIndex}-${sizeIndex}`}
                                  value={sizeItem.size}
                                  onChange={(e) => handleSizeChange(colorIndex, sizeIndex, 'size', e.target.value)}
                                  label="Ukuran*"
                                  required
                                >
                                  <MenuItem value="">Pilih</MenuItem>
                                  <MenuItem value="S">S</MenuItem>
                                  <MenuItem value="M">M</MenuItem>
                                  <MenuItem value="L">L</MenuItem>
                                  <MenuItem value="XL">XL</MenuItem>
                                </Select>
                              </FormControl>
                              
                              <TextField
                                label="Jumlah*"
                                type="number"
                                value={sizeItem.jumlah}
                                onChange={(e) => handleSizeChange(colorIndex, sizeIndex, 'jumlah', e.target.value)}
                                InputProps={{ inputProps: { min: 1 } }}
                                sx={{ flexGrow: 1 }}
                                required
                              />
                              
                              {sizeIndex > 0 && (
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => removeSize(colorIndex, sizeIndex)}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          ))}
                          
                          <Button
                            startIcon={<Add />}
                            onClick={() => addSize(colorIndex)}
                            size="small"
                            variant="outlined"
                            sx={{ mt: 1 }}
                          >
                            Tambah Ukuran
                          </Button>
                        </Card>
                      ))}
                      
                      {/* Enhanced Add Color Button */}
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Button
                          startIcon={<AddCircle />}
                          onClick={addColor}
                          variant="contained"
                          size="large"
                          color="primary"
                          sx={{ 
                            borderRadius: '28px',
                            backgroundColor: '#6D4C3D',
                            '&:hover': {
                              backgroundColor: '#5A3D31'
                            },
                            px: 4,
                            py: 1
                          }}
                        >
                          Tambah Warna Baru
                        </Button>
                      </Box>
                    </Box>

                    <Box className="mb-6">
                      <Typography variant="subtitle1" className="mb-2">
                        Upload Desain/Referensi ({formData.gambar_referensi.length}/5)
                      </Typography>

                      {/* Image preview grid */}
                      {filePreviewList.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Grid container spacing={2}>
                            {filePreviewList.map((preview, index) => (
                              <Grid item xs={6} md={4} key={index}>
                                <Card sx={{ position: 'relative' }}>
                                  <IconButton
                                    size="small"
                                    sx={{
                                      position: 'absolute',
                                      top: 4,
                                      right: 4,
                                      bgcolor: 'rgba(0,0,0,0.5)',
                                      color: 'white',
                                      '&:hover': { bgcolor: 'rgba(255,0,0,0.7)' }
                                    }}
                                    onClick={() => removeFile(index)}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                    <Box sx={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        style={{
                                          maxWidth: '100%',
                                          maxHeight: '140px',
                                          objectFit: 'contain'
                                        }}
                                      />
                                    </Box>
                                    <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'center', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                      {formData.gambar_referensi[index]?.name || `Image ${index + 1}`}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}

                            {formData.gambar_referensi.length < 5 && (
                              <Grid item xs={6} md={4}>
                                <Card 
                                  sx={{ 
                                    height: '100%', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    border: '2px dashed #ccc',
                                    backgroundColor: 'rgba(0,0,0,0.02)',
                                    cursor: 'pointer'
                                  }}
                                  {...getRootProps()}
                                >
                                  <input {...getInputProps()} />
                                  <CardContent sx={{ textAlign: 'center' }}>
                                    <Add sx={{ fontSize: 40, color: '#999', mb: 1 }} />
                                    <Typography variant="body2" color="textSecondary">
                                      Tambah Gambar
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                            )}
                          </Grid>
                        </Box>
                      )}

                      {/* Dropzone area (only shown when no images are uploaded) */}
                      {filePreviewList.length === 0 && (
                        <Box
                          {...getRootProps()}
                          className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-all duration-300 hover:border-blue-500 hover:bg-blue-50"
                        >
                          <input {...getInputProps()} />
                          <Box>
                            <CloudUpload className="text-black text-4xl mb-2" />
                            <Typography variant="body1" className="mb-1">
                              Drag & drop file di sini atau klik untuk memilih
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Format yang diterima: JPG, PNG, GIF (Maks. 5MB/file, maks. 5 gambar)
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>

                    <TextField
                      fullWidth
                      label="Catatan Tambahan"
                      name="catatan"
                      value={formData.catatan}
                      onChange={handleInputChange}
                      multiline
                      rows={4}
                      variant="outlined"
                      placeholder="Tuliskan detail tambahan atau spesifikasi khusus..."
                      className="mb-6"
                    />
                  </Box>

                  <Box className="mt-8">
                    <Button
                      type="submit"
                      variant="contained"
                      style={{ backgroundColor: "#6D4C3D" }}
                      fullWidth
                      size="large"
                      disabled={isSubmitting}
                      className="py-3"
                      onClick={(e) => {
                        // First check if terms have been agreed to, if not show modal
                        if (!termsAgreed) {
                          e.preventDefault();
                          setShowFabricTerms(true);
                          return;
                        }
                        // Otherwise let the form submission proceed
                      }}
                    >
                      {isSubmitting ? (
                        <Box className="flex items-center">
                          <CircularProgress size={20} color="inherit" className="mr-2" />
                          Memproses...
                        </Box>
                      ) : (
                        "Pesan Sekarang"
                      )}
                    </Button>
                  </Box>
                </form>
              </CardContent>
            </Card>
          </Box>
          <Box className="w-full md:w-1/3">
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader
                title="Informasi Pesanan"
                titleTypographyProps={{ variant: "h6" }}
                avatar={<Info />}
                className="bg-[#6D4C3D] text-white"
              />
              <CardContent className="p-6">
                <Box className="mb-4">
                  <Box className="flex items-start mb-2">
                    <CheckCircle className="text-green-600 mr-2 mt-0.5" fontSize="small" />
                    <Box>
                      <Typography variant="subtitle1" className="font-medium">
                        Estimasi Pengerjaan:
                      </Typography>
                      <Typography variant="body2" className="ml-6">
                        2-3 minggu setelah konfirmasi pembayaran
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box className="mb-4">
                  <Box className="flex items-start mb-2">
                    <CheckCircle className="text-green-600 mr-2 mt-0.5" fontSize="small" />
                    <Box>
                      <Typography variant="subtitle1" className="font-medium">
                        Ketentuan:
                      </Typography>
                      <ul className="list-disc ml-10 mt-1">
                        <li className="mb-1">
                          <Typography variant="body2">Minimal pemesanan 3 pcs</Typography>
                        </li>
                        <li className="mb-1">
                          <Typography variant="body2">DP 50% dari total harga</Typography>
                        </li>
                        <li className="mb-1">
                          <Typography variant="body2">Revisi desain maksimal 3 kali</Typography>
                        </li>
                        <li className="mb-1">
                          <Typography variant="body2">
                            Harga final akan dikonfirmasi setelah detail pesanan lengkap
                          </Typography>
                        </li>
                        <li>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            Bahan/kain harus disediakan oleh pelanggan
                          </Typography>
                        </li>
                      </ul>
                    </Box>
                  </Box>
                </Box>

                <Box className="bg-[#F8EEE3] border border-blue-200 rounded-md p-4 mt-6">
                  <Box className="flex">
                    <Info className="text-[#6D4C3D] mr-2" />
                    <Box>
                      <Typography variant="subtitle2" className="font-medium">
                        Butuh bantuan?
                      </Typography>
                      <Typography variant="body2" className="mt-1">
                        Hubungi customer service kami di 0812-3456-7890 atau email ke info@example.com
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Size Chart Dialog */}
        <Dialog open={showSizeChart} onClose={() => setShowSizeChart(false)} maxWidth="md" fullWidth>
          <DialogTitle className="bg-gray-100 flex justify-between items-center">
            <Typography variant="h6">Size Chart</Typography>
            <Button onClick={() => setShowSizeChart(false)} color="inherit" size="small">
              <Close />
            </Button>
          </DialogTitle>
          <DialogContent className="mt-4">
            <TableContainer component={Paper} className="mb-4">
              <Table>
                <TableHead className="bg-gray-100">
                  <TableRow>
                    <TableCell align="center" className="font-medium">
                      Ukuran
                    </TableCell>
                    <TableCell align="center" className="font-medium">
                      Lebar Dada (cm)
                    </TableCell>
                    <TableCell align="center" className="font-medium">
                      Panjang Baju (cm)
                    </TableCell>
                    <TableCell align="center" className="font-medium">
                      Panjang Lengan (cm)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell align="center" className="font-medium">
                      S
                    </TableCell>
                    <TableCell align="center">48</TableCell>
                    <TableCell align="center">65</TableCell>
                    <TableCell align="center">22</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="center" className="font-medium">
                      M
                    </TableCell>
                    <TableCell align="center">50</TableCell>
                    <TableCell align="center">67</TableCell>
                    <TableCell align="center">23</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="center" className="font-medium">
                      L
                    </TableCell>
                    <TableCell align="center">52</TableCell>
                    <TableCell align="center">69</TableCell>
                    <TableCell align="center">24</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="center" className="font-medium">
                      XL
                    </TableCell>
                    <TableCell align="center">54</TableCell>
                    <TableCell align="center">71</TableCell>
                    <TableCell align="center">25</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Box className="text-gray-600 text-sm">
              <Typography variant="body2">* Ukuran dapat bervariasi 1-2 cm karena proses produksi</Typography>
              <Typography variant="body2">
                * Jika Anda ragu dengan ukuran, kami sarankan untuk memilih ukuran yang lebih besar
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSizeChart(false)} color="primary">
              Tutup
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  )
}

export default CustomOrders