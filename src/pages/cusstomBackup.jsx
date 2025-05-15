"use client"

import { useState, useEffect } from "react"
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
} from "@mui/material"

// Icons
import { CloudUpload, Info, CheckCircle, Close, InsertDriveFile, Delete } from "@mui/icons-material"
import { useAuth } from "../context/AuthContext"

function CustomOrders() {
  const navigate = useNavigate()
  const { updateCartCount } = useCart()
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
    sumber_kain: "sendiri",
    gambar_referensi: null,
    estimasiPengerjaan: "2 minggu",
  })

  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: "",
    severity: "success",
  })
  const [filePreview, setFilePreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Ambil data pengguna yang sudah login
  const getMe = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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
    }
  }

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
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setFormData((prevState) => ({
          ...prevState,
          gambar_referensi: file,
        }))
        setFilePreview(URL.createObjectURL(file))
      }
    },
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0]?.errors[0]
      let message = "File tidak valid"

      if (error?.code === "file-too-large") {
        message = "Ukuran file terlalu besar. Maksimal 5MB."
      }

      setSnackbarState({
        open: true,
        message,
        severity: "error",
      })
    },
  })

  const removeFile = () => {
    setFormData((prevState) => ({
      ...prevState,
      gambar_referensi: null,
    }))
    if (filePreview) {
      URL.revokeObjectURL(filePreview)
      setFilePreview(null)
    }
  }

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
      })
      return
    }

    setIsSubmitting(true)

    // Periksa apakah pengguna sudah login
    if (!localStorage.getItem("token")) {
      setSnackbarState({
        open: true,
        message: "Silakan login terlebih dahulu untuk membuat pesanan.",
        severity: "warning",
      });

      // Arahkan ke halaman login setelah 2 detik
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }
    try {
      const formDataToSend = new FormData()
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key])
      })
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/order/custom/propose`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.status === 201) {
        setSnackbarState({
          open: true,
          message: "Pesanan berhasil dibuat!",
          severity: "success",
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
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    getMe()
  }, [])

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
                          InputProps={{ inputProps: { min: 1 } }}
                        />
                        <FormHelperText>Minimal pemesanan 3 pcs</FormHelperText>
                      </Grid>
                    </Grid>

                    <FormControl component="fieldset" className="mb-6">
                      <Typography variant="subtitle1" className="mb-2">
                        Sumber Kain
                      </Typography>
                      <RadioGroup row name="sumber_kain" value={formData.sumber_kain} onChange={handleInputChange}>
          
                        <FormControlLabel value="sendiri" control={<Radio color="black" />} label="Kain Sendiri" />
                      </RadioGroup>
                    </FormControl>

                    <Box className="mb-6">
                      <Typography variant="subtitle1" className="mb-2">
                        Upload Desain/Referensi
                      </Typography>

                      <Box
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-all duration-300 ${
                          filePreview
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                        }`}
                      >
                        <input {...getInputProps()} />

                        {filePreview ? (
                          <Box>
                            <Box className="flex justify-between items-center mb-2">
                              <Box className="flex items-center">
                                <InsertDriveFile className="text-blue-600 mr-2" />
                                <Typography className="truncate max-w-xs">{formData.gambar_referensi.name}</Typography>
                              </Box>
                              <Button
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeFile()
                                }}
                                startIcon={<Delete />}
                              >
                                Hapus
                              </Button>
                            </Box>
                            <Box className="max-h-48 overflow-hidden">
                              <img
                                src={filePreview || "/placeholder.svg"}
                                alt="Preview"
                                className="max-w-full max-h-40 mx-auto object-contain rounded"
                              />
                            </Box>
                          </Box>
                        ) : (
                          <Box>
                            <CloudUpload className="text-black text-4xl mb-2" />
                            <Typography variant="body1" className="mb-1">
                              Drag & drop file di sini atau klik untuk memilih
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Format yang diterima: JPG, PNG (Max. 5MB)
                            </Typography>
                          </Box>
                        )}
                      </Box>
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
                avatar={<Info style={{backgroundColor: ""}} />}
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
