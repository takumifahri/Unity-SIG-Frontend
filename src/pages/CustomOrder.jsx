"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"

// MUI Components
import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  InputLabel,
  Select,
  MenuItem,
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
  Chip,
  Divider,
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material"

// MUI Icons
import {
  CloudUpload as CloudUploadIcon,
  Info as InfoIcon,
  ShoppingCart as ShoppingCartIcon,
  Straighten as StraightenIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Image as ImageIcon,
  FileUpload as FileUploadIcon,
  Close as CloseIcon,
} from "@mui/icons-material"

// Dropify-like component
const DropifyUpload = ({ onFileChange, value }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [filePreview, setFilePreview] = useState(null)
  const [fileName, setFileName] = useState("")
  const [fileSize, setFileSize] = useState("")
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      validateAndProcessFile(files[0])
    }
  }

  const handleFileInputChange = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      validateAndProcessFile(files[0])
    }
  }

  const validateAndProcessFile = (file) => {
    // Reset error
    setError("")

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"]
    if (!validTypes.includes(file.type)) {
      setError("Format file tidak valid. Gunakan JPG, PNG, atau GIF.")
      return
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      setError("Ukuran file terlalu besar. Maksimal 5MB.")
      return
    }

    // Process valid file
    const reader = new FileReader()
    reader.onload = (e) => {
      setFilePreview(e.target.result)
    }
    reader.readAsDataURL(file)

    // Set file info
    setFileName(file.name)
    setFileSize(formatFileSize(file.size))

    // Call parent handler
    if (onFileChange) {
      onFileChange(file)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleRemoveFile = () => {
    setFilePreview(null)
    setFileName("")
    setFileSize("")
    setError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (onFileChange) {
      onFileChange(null)
    }
  }

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div
      className={`relative border-2 rounded-lg overflow-hidden transition-all ${
        isDragging ? "border-blue-500 bg-blue-50" : filePreview ? "border-green-500" : "border-dashed border-gray-300"
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Hidden file input */}
      <input type="file" ref={fileInputRef} onChange={handleFileInputChange} accept="image/*" className="hidden" />

      {/* Dropify-like UI */}
      <div className="p-4 md:p-6">
        {filePreview ? (
          // File preview state
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-xs mx-auto mb-4">
              <img
                src={filePreview || "/placeholder.svg"}
                alt="Preview"
                className="max-h-48 max-w-full mx-auto object-contain rounded border p-1"
              />
              <IconButton
                className="absolute -top-3 -right-3 bg-white shadow-md hover:bg-red-50"
                size="small"
                onClick={handleRemoveFile}
                color="error"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
            <div className="text-center mb-2">
              <Typography variant="body2" className="font-medium text-gray-700">
                {fileName}
              </Typography>
              <Typography variant="caption" className="text-gray-500">
                {fileSize}
              </Typography>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              <Button variant="outlined" size="small" onClick={handleBrowseClick} startIcon={<FileUploadIcon />}>
                Ganti File
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={handleRemoveFile}
                startIcon={<DeleteIcon />}
              >
                Hapus
              </Button>
            </div>
          </div>
        ) : (
          // Empty state
          <div className="flex flex-col items-center py-4 md:py-6">
            <div className="mb-4 text-gray-400">
              <ImageIcon style={{ fontSize: isMobile ? 36 : 48 }} />
            </div>
            <Typography variant="body1" className="font-medium text-center mb-2">
              {isMobile ? "Pilih file gambar" : "Seret dan lepas file di sini atau klik untuk memilih"}
            </Typography>
            <Typography variant="caption" className="text-gray-500 text-center mb-4">
              Format yang didukung: JPG, PNG, GIF (Maks. 5MB)
            </Typography>
            <Button variant="contained" color="primary" onClick={handleBrowseClick} startIcon={<CloudUploadIcon />}>
              Pilih File
            </Button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-3 text-center text-red-500 text-sm">
            <Typography variant="caption" color="error">
              {error}
            </Typography>
          </div>
        )}
      </div>
    </div>
  )
}

function CustomOrder() {
  const navigate = useNavigate()
  const { updateCartCount } = useCart()
  const [showSizeChart, setShowSizeChart] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const [orderSummaryPosition, setOrderSummaryPosition] = useState('side')

  const [formData, setFormData] = useState({
    nama: "",
    telepon: "",
    email: "",
    jenisKelamin: "",
    alamat: "",
    kota: "",
    provinsi: "",
    kodePos: "",
    teleponAlternatif: "",
    metodeKontak: "",
    namaOrganisasi: "",
    jenisBaju: "",
    ukuran: "",
    jumlah: "",
    catatan: "",
    sumberKain: "konveksi", // 'konveksi' atau 'sendiri'
    gambarReferensi: null,
    estimasiPengerjaan: null, // default
  })

  // Update layout based on screen size
  useEffect(() => {
    if (isMobile || isTablet) {
      setOrderSummaryPosition('bottom')
    } else {
      setOrderSummaryPosition('side')
    }
  }, [isMobile, isTablet])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleFileChange = (file) => {
    setFormData((prevState) => ({
      ...prevState,
      gambarReferensi: file,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validasi form
    if (
      !formData.nama ||
      !formData.telepon ||
      !formData.email ||
      !formData.jenisBaju ||
      !formData.ukuran ||
      !formData.jumlah
    ) {
      alert("Mohon lengkapi semua field yang wajib diisi")
      return
    }

    try {
      // Buat objek item untuk cart
      const cartItem = {
        id: "CUSTOM-" + Date.now(),
        cartId: `custom-${Date.now()}`,
        productName: `Custom ${formData.jenisBaju}`,
        quantity: Number.parseInt(formData.jumlah),
        size: formData.ukuran,
        price: calculatePrice(formData.jenisBaju, formData.jumlah),
        isCustomOrder: true,
        customDetails: {
          nama: formData.nama,
          telepon: formData.telepon,
          email: formData.email,
          jenisKelamin: formData.jenisKelamin,
          alamat: formData.alamat,
          kota: formData.kota,
          provinsi: formData.provinsi,
          kodePos: formData.kodePos,
          teleponAlternatif: formData.teleponAlternatif,
          metodeKontak: formData.metodeKontak,
          namaOrganisasi: formData.namaOrganisasi,
          sumberKain: formData.sumberKain,
          catatan: formData.catatan,
          estimasiPengerjaan: formData.estimasiPengerjaan,
          tanggalOrder: new Date().toISOString(),
        },
      }

      // Ambil cart yang ada dari localStorage
      const currentCart = JSON.parse(localStorage.getItem("cart")) || []

      // Tambahkan item baru ke cart
      currentCart.push(cartItem)

      // Simpan kembali ke localStorage
      localStorage.setItem("cart", JSON.stringify(currentCart))

      // Update cart count
      updateCartCount()

      // Redirect ke halaman cart
      navigate("/cart")
    } catch (error) {
      console.error("Error saving to cart:", error)
      alert("Terjadi kesalahan saat menyimpan pesanan")
    }
  }

  // Fungsi untuk menghitung harga berdasarkan jenis baju dan jumlah
  const calculatePrice = (jenisBaju, jumlah) => {
    let basePrice
    switch (jenisBaju) {
      case "kemeja":
        basePrice = 150000
        break
      case "kaos":
        basePrice = 100000
        break
      case "jaket":
        basePrice = 200000
        break
      case "celana":
        basePrice = 175000
        break
      default:
        basePrice = 100000
    }

    // Berikan diskon untuk pemesanan dalam jumlah besar
    if (jumlah >= 50) {
      return basePrice * jumlah * 0.8 // Diskon 20%
    } else if (jumlah >= 24) {
      return basePrice * jumlah * 0.9 // Diskon 10%
    }
    return basePrice * jumlah
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate estimated price if enough data is available
  const estimatedPrice =
    formData.jenisBaju && formData.jumlah
      ? formatCurrency(calculatePrice(formData.jenisBaju, Number.parseInt(formData.jumlah) || 0))
      : "-"

  // Order Summary Component
  const OrderSummary = () => (
    <Box className={orderSummaryPosition === 'side' ? "sticky top-8" : ""}>
      <Card elevation={2} className="mb-6 rounded-xl overflow-hidden">
        <CardHeader
          title="Ringkasan Pesanan"
          className="bg-[#7D5A50] text-white py-3"
          titleTypographyProps={{ variant: isMobile ? "subtitle1" : "h6" }}
        />
        <CardContent className="p-3 md:p-4">
          <Box className="flex justify-between py-2">
            <Typography variant="body2" className="text-sm md:text-base">Jenis Baju:</Typography>
            <Typography variant="body2" className="font-medium capitalize text-sm md:text-base">
              {formData.jenisBaju || "-"}
            </Typography>
          </Box>
          <Box className="flex justify-between py-2">
            <Typography variant="body2" className="text-sm md:text-base">Ukuran:</Typography>
            <Typography variant="body2" className="font-medium text-sm md:text-base">
              {formData.ukuran || "-"}
            </Typography>
          </Box>
          <Box className="flex justify-between py-2">
            <Typography variant="body2" className="text-sm md:text-base">Jumlah:</Typography>
            <Typography variant="body2" className="font-medium text-sm md:text-base">
              {formData.jumlah ? `${formData.jumlah} pcs` : "-"}
            </Typography>
          </Box>
          <Box className="flex justify-between py-2">
            <Typography variant="body2" className="text-sm md:text-base">Sumber Kain:</Typography>
            <Typography variant="body2" className="font-medium capitalize text-sm md:text-base">
              {formData.sumberKain === "konveksi" ? "Dari Konveksi" : "Kain Sendiri"}
            </Typography>
          </Box>

          <Divider className="my-3" />

          <Box className="flex justify-between items-center">
            <Typography variant="subtitle2" className="font-medium md:text-base">
              Estimasi Harga:
            </Typography>
            <Typography variant="subtitle1" color="primary" className="font-bold md:text-lg">
              {estimatedPrice}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" className="mt-1 block text-xs md:text-sm">
            *Harga final akan dikonfirmasi setelah detail pesanan lengkap
          </Typography>
        </CardContent>
      </Card>

      <Card elevation={2} className="rounded-xl overflow-hidden">
        <CardContent className="p-3 md:p-4">
          <Box className="flex items-center mb-3">
            <InfoIcon color="primary" className="mr-2" fontSize={isMobile ? "small" : "medium"} />
            <Typography variant={isMobile ? "subtitle1" : "h6"}>Informasi Pesanan</Typography>
          </Box>

          <Box className="mb-3">
            <Box className="flex items-center mb-1">
              <Chip label="1" color="primary" size="small" className="mr-2" />
              <Typography variant="subtitle2" className="font-medium">
                Estimasi Pengerjaan:
              </Typography>
            </Box>
            <Typography variant="body2" className="ml-8 text-sm">
              2-3 minggu setelah konfirmasi pembayaran
            </Typography>
          </Box>

          <Box>
            <Box className="flex items-center mb-1">
              <Chip label="2" color="primary" size="small" className="mr-2" />
              <Typography variant="subtitle2" className="font-medium">
                Ketentuan:
              </Typography>
            </Box>
            <Box className="ml-8">
              <Typography variant="body2" component="div" className="text-sm">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Minimal pemesanan 3 pcs</li>
                  <li>DP 50% dari total harga</li>
                  <li>Revisi desain maksimal 3 kali</li>
                  <li>Harga final akan dikonfirmasi setelah detail pesanan lengkap</li>
                </ul>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )

  return (
    <Container maxWidth={isMobile ? "sm" : "xl"} className="py-6 md:py-10 px-2 md:px-4">
      <Box className="text-center mb-6 md:mb-10">
        <Typography variant={isMobile ? "h5" : "h4"} component="h1" className="font-bold mb-1 md:mb-2">
          Custom Order
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" className="md:text-base">
          Buat pakaian sesuai keinginan Anda
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={orderSummaryPosition === 'side' ? 9 : 12} className="xl:w-[60%] md:w-[100%]">
          <Card elevation={2} className="rounded-xl overflow-hidden w-full" sx={{ width: "100%", maxWidth: "100%" }}>
            <CardContent className="p-3 md:p-6 w-full" sx={{ width: "100%" }}>
              <form onSubmit={handleSubmit}>
                {/* Informasi Pribadi */}
                <Box className="mb-6 md:mb-8" sx={{ width: "100%" }}>
                  <Box className="flex items-center mb-3 md:mb-4">
                    <Chip label="1" color="primary" size="small" className="mr-2 h-6 w-6 rounded-full" />
                    <Typography variant="h6" component="h2" className="text-lg md:text-xl font-semibold">
                      Informasi Pribadi
                    </Typography>
                  </Box>

                  <Grid container spacing={2} className="mb-3 md:mb-4" sx={{ width: "100%" }}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Nama Lengkap"
                        name="nama"
                        value={formData.nama}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        placeholder="Masukkan nama lengkap"
                        className="mb-3 md:mb-4"
                        size={isMobile ? "small" : "medium"}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="No. Telepon"
                        name="telepon"
                        value={formData.telepon}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        placeholder="Contoh: 08123456789"
                        className="mb-3 md:mb-4"
                        size={isMobile ? "small" : "medium"}
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={2} className="mb-3 md:mb-4">
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        placeholder="Contoh: nama@email.com"
                        className="mb-3 md:mb-4"
                        size={isMobile ? "small" : "medium"}
                      />
                    </Grid>
               
                  </Grid>

                  <Typography variant="subtitle1" className="font-medium mb-2 md:mb-3 mt-2 md:mt-4">
                    Alamat Pengiriman
                  </Typography>

                  <TextField
                    fullWidth
                    label="Alamat Lengkap"
                    name="alamat"
                    value={formData.alamat || ""}
                    onChange={handleInputChange}
                    multiline
                    rows={2}
                    variant="outlined"
                    placeholder="Masukkan alamat lengkap (jalan, nomor rumah, RT/RW)"
                    className="mb-3 md:mb-4 w-full"
                    size={isMobile ? "small" : "medium"}
                  />

                  <Grid container spacing={2} className="mb-3 md:mb-4">
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Kota/Kabupaten"
                        name="kota"
                        value={formData.kota || ""}
                        onChange={handleInputChange}
                        variant="outlined"
                        placeholder="Masukkan kota/kabupaten"
                        className="mb-3 md:mb-4"
                        size={isMobile ? "small" : "medium"}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Provinsi"
                        name="provinsi"
                        value={formData.provinsi || ""}
                        onChange={handleInputChange}
                        variant="outlined"
                        placeholder="Masukkan provinsi"
                        className="mb-3 md:mb-4"
                        size={isMobile ? "small" : "medium"}
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={2} className="mb-3 md:mb-4">
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Kode Pos"
                        name="kodePos"
                        value={formData.kodePos || ""}
                        onChange={handleInputChange}
                        variant="outlined"
                        placeholder="Contoh: 12345"
                        className="mb-3 md:mb-4"
                        size={isMobile ? "small" : "medium"}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="No. Telepon Alternatif"
                        name="teleponAlternatif"
                        value={formData.teleponAlternatif || ""}
                        onChange={handleInputChange}
                        variant="outlined"
                        placeholder="Nomor telepon alternatif (opsional)"
                        className="mb-3 md:mb-4"
                        size={isMobile ? "small" : "medium"}
                      />
                    </Grid>
                  </Grid>

                  <Typography variant="subtitle1" className="font-medium mb-2 md:mb-3 mt-2 md:mt-4">
                    Informasi Tambahan
                  </Typography>

                  <Grid container spacing={2} className="mb-3 md:mb-4">
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="outlined" className="mb-3 md:mb-4" size={isMobile ? "small" : "medium"}>
                        <InputLabel id="contact-method-label">Metode Kontak Pilihan</InputLabel>
                        <Select
                          labelId="contact-method-label"
                          name="metodeKontak"
                          value={formData.metodeKontak || ""}
                          onChange={handleInputChange}
                          label="Metode Kontak Pilihan"
                        >
                          <MenuItem value="">Pilih Metode Kontak</MenuItem>
                          <MenuItem value="telepon">Telepon</MenuItem>
                          <MenuItem value="whatsapp">WhatsApp</MenuItem>
                          <MenuItem value="email">Email</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Nama Perusahaan/Organisasi"
                        name="namaOrganisasi"
                        value={formData.namaOrganisasi || ""}
                        onChange={handleInputChange}
                        variant="outlined"
                        placeholder="Jika memesan untuk perusahaan/organisasi (opsional)"
                        className="mb-3 md:mb-4"
                        size={isMobile ? "small" : "medium"}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Detail Pesanan */}
                <Box className="mb-4 md:mb-6">
                  <Box className="flex items-center mb-3 md:mb-4">
                    <Chip label="2" color="primary" size="small" className="mr-2 h-6 w-6 rounded-full" />
                    <Typography variant="h6" component="h2" className="text-lg md:text-xl font-semibold">
                      Detail Pesanan
                    </Typography>
                  </Box>

                  <FormControl fullWidth variant="outlined" className="mb-3 md:mb-4" size={isMobile ? "small" : "medium"}>
                    <InputLabel id="jenis-baju-label">Jenis Baju</InputLabel>
                    <Select
                      labelId="jenis-baju-label"
                      name="jenisBaju"
                      value={formData.jenisBaju}
                      onChange={handleInputChange}
                      label="Jenis Baju"
                      required
                    >
                      <MenuItem value="">Pilih Jenis Baju</MenuItem>
                      <MenuItem value="kemeja">Kemeja</MenuItem>
                      <MenuItem value="kaos">Kaos</MenuItem>
                      <MenuItem value="jaket">Jaket</MenuItem>
                      <MenuItem value="celana">Celana</MenuItem>
                    </Select>
                  </FormControl>

                  <Grid container spacing={2} className="mb-3 md:mb-4">
                    <Grid item xs={12} md={6}>
                      <Box className="mb-3 md:mb-4">
                        <FormControl fullWidth variant="outlined" size={isMobile ? "small" : "medium"}>
                          <InputLabel id="ukuran-label">Ukuran</InputLabel>
                          <Select
                            labelId="ukuran-label"
                            name="ukuran"
                            value={formData.ukuran}
                            onChange={handleInputChange}
                            label="Ukuran"
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
                        <Button
                          variant="text"
                          startIcon={<StraightenIcon />}
                          onClick={() => setShowSizeChart(true)}
                          className="mt-1 md:mt-2"
                          size="small"
                        >
                          Lihat Size Chart
                        </Button>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Jumlah"
                        name="jumlah"
                        type="number"
                        value={formData.jumlah}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        placeholder="Minimal 3 pcs"
                        InputProps={{
                          inputProps: { min: 1 },
                        }}
                        size={isMobile ? "small" : "medium"}
                      />
                      {formData.jumlah >= 24 && formData.jumlah < 50 && (
                        <Chip
                          label="Diskon 10%"
                          color="success"
                          size="small"
                          icon={<CheckCircleIcon />}
                          className="mt-1 md:mt-2"
                        />
                      )}
                      {formData.jumlah >= 50 && (
                        <Chip
                          label="Diskon 20%"
                          color="success"
                          size="small"
                          icon={<CheckCircleIcon />}
                          className="mt-1 md:mt-2"
                        />
                      )}
                    </Grid>
                  </Grid>

                  <Box className="mb-4 md:mb-6">
                    <Typography variant="subtitle1" className="mb-2">
                      Sumber Kain
                    </Typography>
                    <FormControl component="fieldset">
                      <RadioGroup name="sumberKain" value={formData.sumberKain} onChange={handleInputChange} row>
                        <FormControlLabel
                          value="konveksi"
                          control={<Radio color="primary" />}
                          label="Kain dari Konveksi"
                          className="mr-4 md:mr-6 border rounded-lg p-2 hover:bg-gray-50"
                        />
                        <FormControlLabel
                          value="sendiri"
                          control={<Radio color="primary" />}
                          label="Kain Sendiri"
                          className="border rounded-lg p-2 hover:bg-gray-50"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>

                  <Box className="mb-4 md:mb-6">
                    <Typography variant="subtitle1" className="mb-2 md:mb-3">
                      Upload Desain/Referensi
                    </Typography>
                    <DropifyUpload onFileChange={handleFileChange} value={formData.gambarReferensi} />
                  </Box>

                  <TextField
                    fullWidth
                    label="Catatan Tambahan"
                    name="catatan"
                    value={formData.catatan}
                    onChange={handleInputChange}
                    multiline
                    rows={isMobile ? 3 : 4}
                    variant="outlined"
                    placeholder="Tuliskan detail tambahan atau spesifikasi khusus..."
                    className="mb-4 md:mb-6"
                    size={isMobile ? "small" : "medium"}
                  />

                  {/* Mobile Order Summary (shown only on mobile) */}
                  {orderSummaryPosition === 'bottom' && (
                    <Box className="mb-4 md:hidden">
                      <OrderSummary />
                    </Box>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size={isMobile ? "medium" : "large"}
                    fullWidth
                    startIcon={<ShoppingCartIcon />}
                    className="py-2 md:py-3 text-sm md:text-base"
                  >
                    Pesan Sekarang
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Desktop Order Summary (shown only on desktop) */}
        {orderSummaryPosition === 'side' && (
          <Grid item xs={12} lg={3}>
            <OrderSummary />
          </Grid>
        )}
      </Grid>

      {/* Size Chart Dialog */}
      <Dialog 
        open={showSizeChart} 
        onClose={() => setShowSizeChart(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle className="bg-gray-100 flex items-center">
          <StraightenIcon className="mr-2" />
          Size Chart
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer component={Paper} className="mb-4">
            <Table size={isMobile ? "small" : "medium"}>
              <TableHead className="bg-blue-50">
                <TableRow>
                  <TableCell className="font-bold">Ukuran</TableCell>
                  <TableCell className="font-bold">Lebar Dada (cm)</TableCell>
                  <TableCell className="font-bold">Panjang Baju (cm)</TableCell>
                  <TableCell className="font-bold">Panjang Lengan (cm)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">S</TableCell>
                  <TableCell>48</TableCell>
                  <TableCell>65</TableCell>
                  <TableCell>22</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">M</TableCell>
                  <TableCell>50</TableCell>
                  <TableCell>67</TableCell>
                  <TableCell>23</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">L</TableCell>
                  <TableCell>52</TableCell>
                  <TableCell>69</TableCell>
                  <TableCell>24</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">XL</TableCell>
                  <TableCell>54</TableCell>
                  <TableCell>71</TableCell>
                  <TableCell>25</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">XXL</TableCell>
                  <TableCell>56</TableCell>
                  <TableCell>73</TableCell>
                  <TableCell>26</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Box className="text-center">
            <img
              src="/images/size-guide.png"
              alt="Size Guide"
              className="max-h-48 mx-auto"
              onError={(e) => {
                e.target.style.display = "none"
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSizeChart(false)} color="primary">
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default CustomOrder
