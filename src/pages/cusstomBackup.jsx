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
  FormControlLabel,
  Radio,
  RadioGroup,
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
  AlertTitle
} from "@mui/material"

// Icons
import { CloudUpload, Info, CheckCircle, Close, InsertDriveFile, Delete, Add, Image } from "@mui/icons-material"
import { useAuth } from "../context/AuthContext"

function CustomOrders() {
  const navigate = useNavigate()
  const { updateCartCount } = useCart()
  const { isAuth, token } = useAuth()
  const [users, setUsers] = useState([])
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    no_telp: "",
    email: "",
    jenis_baju: "",
    ukuran: "",
    jumlah: "",
    catatan: "",
    detail_bahan: "",
    sumber_kain: "sendiri",
    gambar_referensi: [],
    estimasi_waktu: null,
  })

  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: "",
    severity: "success",
    title: ""
  })
  const [filePreviewList, setFilePreviewList] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        message = "Ukuran file terlalu besar. Maksimal 2MB."
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validasi form
    const missingFields = []
    if (!formData.nama_lengkap) missingFields.push("Nama Lengkap")
    if (!formData.no_telp) missingFields.push("No. Telepon")
    if (!formData.email) missingFields.push("Email")
    if (!formData.jenis_baju) missingFields.push("Jenis Baju")
    if (!formData.ukuran) missingFields.push("Ukuran")
    if (!formData.jumlah) missingFields.push("Jumlah")

    if (missingFields.length > 0) {
      setSnackbarState({
        open: true,
        message: `Mohon lengkapi field berikut: ${missingFields.join(", ")}`,
        severity: "warning",
        title: "Field Belum Lengkap"
      })
      return
    }

    // Validasi jumlah minimal
    if (parseInt(formData.jumlah) < 3) {
      setSnackbarState({
        open: true,
        message: "Minimal pemesanan adalah 3 pcs",
        severity: "warning",
        title: "Jumlah Tidak Valid"
      })
      return
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
      
      // Append all form fields except gambar_referensi
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'gambar_referensi') {
          formDataToSend.append(key, value)
        }
      })
      
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

                    <Grid container spacing={3} className="mb-4">
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel id="ukuran-label">Ukuran*</InputLabel>
                          <Select
                            labelId="ukuran-label"
                            name="ukuran"
                            value={formData.ukuran}
                            onChange={handleInputChange}
                            label="Ukuran*"
                            required
                          >
                            <MenuItem value="">Pilih Ukuran</MenuItem>
                            <MenuItem value="S">S</MenuItem>
                            <MenuItem value="M">M</MenuItem>
                            <MenuItem value="L">L</MenuItem>
                            <MenuItem value="XL">XL</MenuItem>
                            <MenuItem value="XXL">XXL</MenuItem>
                          </Select>
                        </FormControl>
                        <Box className="mt-2">
                          <Button
                            startIcon={<Info  />}
                            onClick={() => setShowSizeChart(true)}
                            size="small"
                            color="black"
                          >
                            Lihat Size Chart
                          </Button>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Jumlah*"
                          name="jumlah"
                          type="number"
                          value={formData.jumlah}
                          onChange={handleInputChange}
                          required
                          variant="outlined"
                          InputProps={{ inputProps: { min: 3 } }}
                        />
                        <FormHelperText>Minimal pemesanan 3 pcs</FormHelperText>
                      </Grid>
                    </Grid>

                    <FormControl component="fieldset" className="mb-4">
                      <Typography variant="subtitle1" className="mb-2">
                        Sumber Kain
                      </Typography>
                      <RadioGroup row name="sumber_kain" value={formData.sumber_kain} onChange={handleInputChange}>
                        <FormControlLabel value="sendiri" control={<Radio color="black" />} label="Kain Sendiri" />
                      </RadioGroup>
                    </FormControl>

                    {formData.sumber_kain === "konveksi" && (
                      <TextField
                        fullWidth
                        label="Detail Bahan/Kain"
                        name="detail_bahan"
                        value={formData.detail_bahan}
                        onChange={handleInputChange}
                        variant="outlined"
                        placeholder="Contoh: Cotton Combed 30s, Fleece, dll"
                        className="mb-4"
                      />
                    )}

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
                              Format yang diterima: JPG, PNG, GIF (Maks. 2MB/file, maks. 5 gambar)
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
                        <li>
                          <Typography variant="body2">
                            Harga final akan dikonfirmasi setelah detail pesanan lengkap
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
                  <TableRow>
                    <TableCell align="center" className="font-medium">
                      XXL
                    </TableCell>
                    <TableCell align="center">56</TableCell>
                    <TableCell align="center">73</TableCell>
                    <TableCell align="center">26</TableCell>
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