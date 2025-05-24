import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  useTheme,
  Tooltip,
  Zoom,
  Fade,
  Snackbar,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
} from "@mui/material"
import {
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  AddAPhoto as AddAPhotoIcon,
  CheckCircle as CheckCircleIcon,
  Image as ImageIcon,
  Save as SaveIcon,
  CloudUpload as CloudUploadIcon,
  Add as AddIcon,
} from "@mui/icons-material"
import { styled } from "@mui/material/styles"
import { usePakaian } from "../context/PakaianContext"
import { useDropzone } from "react-dropzone"
import { NumericFormat } from "react-number-format"
import Swal from "sweetalert2"

// Styled components
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
})

const ImagePreview = styled(Paper)(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: 200,
  marginBottom: theme.spacing(1),
  overflow: "hidden",
  borderRadius: theme.shape.borderRadius,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundSize: "cover",
  backgroundPosition: "center",
  boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 12px 20px rgba(0,0,0,0.15)",
  },
}))

const DeleteButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  color: "#fff",
  "&:hover": {
    backgroundColor: theme.palette.error.main,
  },
  transition: "all 0.2s ease",
}))

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  overflow: "hidden",
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 15px 35px rgba(0,0,0,0.15)",
  },
}))

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  backgroundColor: "#fff",
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
}))

const ColorChip = styled(Chip)(({ bgColor, isSelected, theme }) => ({
  backgroundColor: isSelected ? bgColor : "transparent",
  color: isSelected && ["#000000", "#2E2E2E", "#3E3E3E"].includes(bgColor) ? "#FFFFFF" : "#000000",
  border: `1px solid ${bgColor}`,
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: `${bgColor}90`,
    transform: "translateY(-2px)",
  },
  margin: theme.spacing(0.5),
  boxShadow: isSelected ? "0 4px 8px rgba(0,0,0,0.1)" : "none",
}))

const SizeChip = styled(Chip)(({ theme, isSelected }) => ({
  transition: "all 0.2s ease",
  fontWeight: isSelected ? 600 : 400,
  transform: isSelected ? "scale(1.05)" : "scale(1)",
  margin: theme.spacing(0.5),
  boxShadow: isSelected ? "0 4px 8px rgba(0,0,0,0.1)" : "none",
}))

const DropzoneArea = styled(Box)(({ theme, isDragActive, isDragReject }) => ({
  height: 200,
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1),
  border: "2px dashed",
  borderColor: isDragReject
    ? theme.palette.error.main
    : isDragActive
      ? theme.palette.success.main
      : theme.palette.primary.main,
  backgroundColor: isDragReject
    ? "rgba(244, 67, 54, 0.08)"
    : isDragActive
      ? "rgba(76, 175, 80, 0.08)"
      : "rgba(121, 85, 72, 0.04)",
  borderRadius: theme.shape.borderRadius,
  cursor: "pointer",
  transition: "all 0.3s ease",
  padding: theme.spacing(2),
  "&:hover": {
    backgroundColor: isDragReject
      ? "rgba(244, 67, 54, 0.12)"
      : isDragActive
        ? "rgba(76, 175, 80, 0.12)"
        : "rgba(121, 85, 72, 0.08)",
    borderColor: isDragReject
      ? theme.palette.error.dark
      : isDragActive
        ? theme.palette.success.dark
        : theme.palette.primary.dark,
    transform: "translateY(-5px)",
  },
}))


const TambahPakaian = () => {
  const navigate = useNavigate()
  const [formattedPrice, setFormattedPrice] = useState('');
  const theme = useTheme()
  const { addCatalog, editingCatalog, updateCatalog, setEditingCatalog } = usePakaian()
  // Add state for new feature input
  const [newFeature, setNewFeature] = useState("");
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  })

  // Loading state for image processing and form submission
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State untuk data formulir yang disesuaikan dengan backend
  const [formData, setFormData] = useState({
    nama_katalog: "",
    deskripsi: "",
    details: "",
    stok: 0,
    bahan: "",
    price: "",
    feature: JSON.stringify({
      // Default features
      "Bahan Berkualitas": true,
      "Nyaman Dipakai": true,
      "Jahitan Rapi": true
    }),
    colors: [
      {
        color_name: "Hitam",
        sizes: [
          { size: "S", stok: 0 },
          { size: "M", stok: 0 },
          { size: "L", stok: 0 },
          { size: "XL", stok: 0 },
        ]
      }
    ],
    gambar: [], // Untuk penyimpanan file gambar
  })
  // Add state to manage features in a more user-friendly way
  const [features, setFeatures] = useState({
    "Bahan Berkualitas": true,
    "Nyaman Dipakai": true,
    "Jahitan Rapi": true
  });

  // Untuk menyimpan preview gambar
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])

  // Mengisi form dengan data yang akan diedit
  useEffect(() => {
    if (editingCatalog) {
      // Ubah format data untuk sesuai dengan form
      setFormData({
        nama_katalog: editingCatalog.nama_katalog || "",
        deskripsi: editingCatalog.deskripsi || "",
        details: editingCatalog.details || "",
        stok: editingCatalog.stok || 0,
        bahan: editingCatalog.bahan || "",
        price: editingCatalog.price || "",
        feature: typeof editingCatalog.feature === 'string' 
          ? editingCatalog.feature 
          : JSON.stringify(editingCatalog.feature || {}),
        colors: editingCatalog.colors?.length 
          ? editingCatalog.colors 
          : [
              {
                color_name: "Hitam",
                sizes: [
                  { size: "S", stok: 0 },
                  { size: "M", stok: 0 },
                  { size: "L", stok: 0 },
                  { size: "XL", stok: 0 },
                ]
              }
            ],
      })
      
      // Set formatted price when editing
      if (editingCatalog.price) {
        setFormattedPrice(editingCatalog.price.toString());
      }

      // Jika ada gambar yang tersimpan, buat preview
      if (editingCatalog.gambar) {
        const images = Array.isArray(editingCatalog.gambar) 
          ? editingCatalog.gambar 
          : [editingCatalog.gambar];
        
        const previews = images.map(img => 
          typeof img === 'string' && img.startsWith('http') 
            ? img 
            : `${process.env.REACT_APP_API_URL}/${img}`
        );
        
        setImagePreviews(previews);
      }
    }
  }, [editingCatalog])

  useEffect(() => {
    if (editingCatalog) {
      // Parse feature from JSON string if needed
      let featureData = {};
      
      try {
        if (typeof editingCatalog.feature === 'string') {
          featureData = JSON.parse(editingCatalog.feature);
        } else if (typeof editingCatalog.feature === 'object') {
          featureData = editingCatalog.feature;
        }
      } catch (error) {
        console.error("Error parsing feature data:", error);
        featureData = {
          "Bahan Berkualitas": true,
          "Nyaman Dipakai": true,
          "Jahitan Rapi": true
        };
      }
      
      setFeatures(featureData);
    }
  }, [editingCatalog]);
    
  // Add a function to handle feature checkbox changes
  const handleFeatureChange = (featureName) => {
    const updatedFeatures = { ...features };
    updatedFeatures[featureName] = !updatedFeatures[featureName];
    setFeatures(updatedFeatures);
    
    // Update the formData with the JSON string representation
    setFormData(prev => ({
      ...prev,
      feature: JSON.stringify(updatedFeatures)
    }));
  };
  
  // Add a function to add new feature
  const handleAddFeature = () => {
    if (newFeature && !features[newFeature]) {
      const updatedFeatures = { ...features, [newFeature]: true };
      setFeatures(updatedFeatures);
      setFormData(prev => ({
        ...prev,
        feature: JSON.stringify(updatedFeatures)
      }));
      setNewFeature("");
    }
  };

  // Handle perubahan harga dengan pemformatan
  const handlePriceChange = (values) => {
    const { value } = values;
    // Update nilai asli di formData (tanpa pemformatan)
    setFormData((prev) => ({
      ...prev,
      price: value,
    }));
    
    // Simpan nilai terformat untuk tampilan
    setFormattedPrice(value);
  };

  // Opsi warna yang tersedia
  const warnaOptions = [
    { name: "Hitam", code: "#000000" },
    { name: "Putih", code: "#FFFFFF" },
    { name: "Abu-Abu", code: "#808080" },
    { name: "Merah", code: "#D32F2F" },
    { name: "Orange", code: "#FF9800" },
    { name: "Kuning", code: "#FFC107" },
    { name: "Hijau", code: "#4CAF50" },
    { name: "Biru", code: "#2196F3" },
    { name: "Navy", code: "#0D47A1" },
    { name: "Ungu", code: "#9C27B0" },
    { name: "Pink", code: "#E91E63" },
    { name: "Coklat", code: "#795548" },
  ]

  // Ukuran yang tersedia (sesuai dengan validasi backend)
  const ukuranOptions = ["S", "M", "L", "XL"]

  // Handle perubahan input dasar
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle perubahan warna
  const handleColorNameChange = (index, value) => {
    setFormData(prev => {
      const updatedColors = [...prev.colors];
      updatedColors[index] = {
        ...updatedColors[index],
        color_name: value
      };
      return {
        ...prev,
        colors: updatedColors
      };
    });
  };

  // Handle perubahan stok untuk ukuran tertentu
  const handleSizeStockChange = (colorIndex, sizeIndex, value) => {
    setFormData(prev => {
      const updatedColors = [...prev.colors];
      const sizeStok = parseInt(value, 10) || 0;
      updatedColors[colorIndex].sizes[sizeIndex].stok = sizeStok;
      
      // Hitung total stok dari semua warna dan ukuran
      const totalStok = updatedColors.reduce((sum, color) => 
        sum + color.sizes.reduce((sizeSum, size) => sizeSum + (size.stok || 0), 0), 0);
      
      return {
        ...prev,
        colors: updatedColors,
        stok: totalStok
      };
    });
  };

  // Tambahkan warna baru
  const addColor = () => {
    setFormData(prev => ({
      ...prev,
      colors: [
        ...prev.colors,
        {
          color_name: "Hitam",
          sizes: ukuranOptions.map(size => ({ size, stok: 0 }))
        }
      ]
    }));
  };

  // Hapus warna
  const removeColor = (colorIndex) => {
    if (formData.colors.length <= 1) {
      setSnackbar({
        open: true,
        message: "Minimal harus ada satu warna",
        severity: "warning"
      });
      return;
    }

    setFormData(prev => {
      const updatedColors = prev.colors.filter((_, index) => index !== colorIndex);
      return { ...prev, colors: updatedColors };
    });
  };

  // Process files dari dropzone atau file input
  const processFiles = useCallback((files) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);

    // Buat array untuk menyimpan file dan preview
    const newFiles = [...files];
    const promises = Array.from(files).map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises)
      .then((previews) => {
        setImageFiles(prev => [...prev, ...newFiles]);
        setImagePreviews(prev => [...prev, ...previews]);

        setSnackbar({
          open: true,
          message: `${previews.length} foto berhasil ditambahkan`,
          severity: "success",
        });
      })
      .catch((error) => {
        console.error("Error processing files:", error);
        setSnackbar({
          open: true,
          message: "Gagal memproses file gambar",
          severity: "error",
        });
      })
      .finally(() => {
        setIsProcessing(false);
      });
  }, []);

  // Handle perubahan file dari input
  const handleImageChange = (e) => {
    const files = e.target.files;
    processFiles(files);
    e.target.value = ""; // Reset input agar bisa pilih file yang sama lagi
  };

  // Konfigurasi dropzone
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    onDrop: processFiles,
    disabled: isProcessing
  });

  // Hapus gambar dari preview
  const handleRemoveImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));

    setSnackbar({
      open: true,
      message: "Foto telah dihapus",
      severity: "info",
    });
  };

  // Validasi form sebelum submit
  const validateForm = () => {
    if (!formData.nama_katalog) {
      setSnackbar({
        open: true,
        message: "Nama katalog tidak boleh kosong",
        severity: "error"
      });
      return false;
    }
    
    if (!formData.deskripsi) {
      setSnackbar({
        open: true,
        message: "Deskripsi tidak boleh kosong",
        severity: "error"
      });
      return false;
    }
    
    if (!formData.details) {
      setSnackbar({
        open: true,
        message: "Detail produk tidak boleh kosong",
        severity: "error"
      });
      return false;
    }
    
    if (!formData.bahan) {
      setSnackbar({
        open: true,
        message: "Bahan tidak boleh kosong",
        severity: "error"
      });
      return false;
    }
    
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      setSnackbar({
        open: true,
        message: "Harga produk tidak valid",
        severity: "error"
      });
      return false;
    }
    
    // Cek warna dan ukuran
    for (const color of formData.colors) {
      if (!color.color_name) {
        setSnackbar({
          open: true,
          message: "Nama warna tidak boleh kosong",
          severity: "error"
        });
        return false;
      }
      
      // Hitung total stok dalam warna ini
      const colorStok = color.sizes.reduce((sum, size) => sum + (size.stok || 0), 0);
      if (colorStok <= 0) {
        setSnackbar({
          open: true,
          message: `Warna ${color.color_name} harus memiliki stok minimal 1`,
          severity: "error"
        });
        return false;
      }
    }
    
    // Periksa apakah ada gambar yang dipilih
    if (!editingCatalog && imageFiles.length === 0) {
      setSnackbar({
        open: true,
        message: "Harap unggah minimal 1 foto produk",
        severity: "error"
      });
      return false;
    }
    
    return true;
  };

  // Handle submit form
    // Handle submit form
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!validateForm()) return;
      
      setIsSubmitting(true);
      
      try {
        // PENTING: Jangan stringify colors di sini, biarkan sebagai array
        // PakaianContext.jsx yang akan menanganinya
        const catalogDataToSubmit = {
          nama_katalog: formData.nama_katalog,
          deskripsi: formData.deskripsi,
          details: formData.details,
          bahan: formData.bahan,
          price: formData.price,
          stok: formData.stok,
          feature: formData.feature,
          colors: formData.colors, // Kirim sebagai array
          gambar: imageFiles // Kirim file gambar langsung sebagai array
        };
        
        // Debug data sebelum dikirim
        console.log("Data yang akan dikirim:", catalogDataToSubmit);
        console.log("Tipe data colors:", Array.isArray(catalogDataToSubmit.colors) ? "Array" : typeof catalogDataToSubmit.colors);
        
        let result;
        
        if (editingCatalog) {
          result = await updateCatalog(editingCatalog.id, catalogDataToSubmit);
          setEditingCatalog(null);
          setSnackbar({
            open: true,
            message: 'Katalog berhasil diperbarui',
            severity: 'success'
          });
        } else {
          result = await addCatalog(catalogDataToSubmit);
          setSnackbar({
            open: true,
            message: 'Katalog baru berhasil ditambahkan',
            severity: 'success'
          });
        }
        
        // Reset form
        setFormData({
          nama_katalog: "",
          deskripsi: "",
          details: "",
          stok: 0,
          bahan: "",
          price: "",
          feature: JSON.stringify({}),
          colors: [
            {
              color_name: "Hitam",
              sizes: [
                { size: "S", stok: 0 },
                { size: "M", stok: 0 },
                { size: "L", stok: 0 },
                { size: "XL", stok: 0 },
              ]
            }
          ],
        });
        setFormattedPrice('');
        setImageFiles([]);
        setImagePreviews([]);
        
        // Arahkan ke halaman katalog setelah delay singkat
        setTimeout(() => {
          navigate('/admin/pakaian/tabel');
        }, 1500);
        
      } catch (error) {
        console.error("Error submitting form:", error);
        
        // Tampilkan detail error jika ada
        let errorMessage = 'Terjadi kesalahan saat menyimpan katalog';
        
        if (error.response && error.response.data) {
          console.error("Server response:", error.response.data);
          
          if (error.response.data.detail_message) {
            errorMessage += `: ${error.response.data.detail_message}`;
          }
        }
        
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error'
        });
      } finally {
        setIsSubmitting(false);
      }
    };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const isFormValid = 
    formData.nama_katalog && 
    formData.deskripsi && 
    formData.details &&
    formData.bahan && 
    formData.price && 
    formData.colors.length > 0 &&
    formData.stok > 0 &&
    (editingCatalog || imageFiles.length > 0);

  return (
    <Container maxWidth="2xl" sx={{ py: 4 }}>
      {/* Snackbar untuk pesan */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

      <StyledCard elevation={6}>
        <Box
          sx={{
            p: 3,
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" component="h1" fontWeight="bold" >
            {editingCatalog ? "Edit Katalog" : "Tambah Katalog Baru"}
          </Typography>
        </Box>

        <CardContent sx={{ p: 4, maxWidth: "100%" }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              {/* Kolom Kiri - Informasi Dasar */}
              <Grid item xs={12} md={6}>
                <FormSection>
                  <Typography variant="h6" gutterBottom  sx={{ mb: 3, fontWeight: 600 }}>
                    Informasi Dasar
                  </Typography>

                  <TextField
                    fullWidth
                    label="Nama Katalog"
                    name="nama_katalog"
                    value={formData.nama_katalog}
                    onChange={handleInputChange}
                    placeholder="Contoh: Kemeja Formal Slim Fit"
                    variant="outlined"
                    required
                    sx={{ mb: 3 }}
                  />

                  <TextField
                    fullWidth
                    label="Deskripsi"
                    name="deskripsi"
                    value={formData.deskripsi}
                    onChange={handleInputChange}
                    placeholder="Deskripsi singkat produk"
                    multiline
                    rows={3}
                    variant="outlined"
                    required
                    sx={{ mb: 3 }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Detail Produk"
                    name="details"
                    value={formData.details}
                    onChange={handleInputChange}
                    placeholder="Detail lengkap produk, spesifikasi, cara perawatan, dll."
                    multiline
                    rows={5}
                    variant="outlined"
                    required
                    sx={{ mb: 3 }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Bahan"
                    name="bahan"
                    value={formData.bahan}
                    onChange={handleInputChange}
                    placeholder="Contoh: Katun, Poly Cotton, dll."
                    variant="outlined"
                    required
                    sx={{ mb: 3 }}
                  />
                  
                  <NumericFormat
                    customInput={TextField}
                    thousandSeparator="."
                    decimalSeparator=","
                    value={formattedPrice}
                    onValueChange={handlePriceChange}
                    prefix="Rp "
                    fullWidth
                    label="Harga"
                    placeholder="Contoh: 75.000"
                    variant="outlined"
                    required
                    sx={{ mb: 3 }}
                  />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Total Stok: <b>{formData.stok}</b> pcs
                  </Typography>
                </FormSection>
              </Grid>

              {/* Kolom Kanan - Warna dan Ukuran */}
              <Grid item xs={12} md={6}>
                <FormSection>
                  <Typography variant="h6" gutterBottom sx={{ mb: 1, fontWeight: 600 }}>
                    Warna dan Ukuran
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Tambahkan warna dan tentukan stok untuk setiap ukuran
                  </Typography>
                  
                  {formData.colors.map((color, colorIndex) => (
                    <Box 
                      key={colorIndex} 
                      sx={{ 
                        mb: 4, 
                        p: 2, 
                        backgroundColor: 'rgba(0,0,0,0.02)', 
                        borderRadius: 2,
                        border: '1px solid rgba(0,0,0,0.09)'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <FormControl sx={{ width: '70%' }}>
                          <InputLabel id={`color-label-${colorIndex}`}>Warna</InputLabel>
                          <Select
                            labelId={`color-label-${colorIndex}`}
                            value={color.color_name}
                            onChange={(e) => handleColorNameChange(colorIndex, e.target.value)}
                            label="Warna"
                          >
                            {warnaOptions.map(option => (
                              <MenuItem key={option.name} value={option.name}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box 
                                    sx={{ 
                                      width: 16, 
                                      height: 16, 
                                      backgroundColor: option.code, 
                                      mr: 1,
                                      borderRadius: '50%',
                                      border: '1px solid rgba(0,0,0,0.2)'
                                    }} 
                                  />
                                  {option.name}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        
                        {formData.colors.length > 1 && (
                          <Button
                            color="error"
                            variant="outlined"
                            size="small"
                            onClick={() => removeColor(colorIndex)}
                            startIcon={<DeleteIcon />}
                          >
                            Hapus Warna
                          </Button>
                        )}
                      </Box>
                      
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Stok per Ukuran:
                      </Typography>
                      
                      <Grid container spacing={2}>
                        {color.sizes.map((sizeItem, sizeIndex) => (
                          <Grid item xs={6} sm={3} key={sizeIndex}>
                            <Box sx={{ 
                              p: 1.5, 
                              border: '1px solid rgba(0,0,0,0.15)', 
                              borderRadius: 1,
                              backgroundColor: 'white'
                            }}>
                              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                Ukuran {sizeItem.size}
                              </Typography>
                              
                              <TextField
                                fullWidth
                                type="number"
                                size="small"
                                value={sizeItem.stok}
                                onChange={(e) => handleSizeStockChange(colorIndex, sizeIndex, e.target.value)}
                                placeholder="0"
                                variant="outlined"
                                inputProps={{ min: 0 }}
                              />
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ))}
                  
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addColor}
                    sx={{ mt: 1 }}
                  >
                    Tambah Warna
                  </Button>
                </FormSection>
                <FormSection>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                    Fitur Produk
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Tambahkan fitur-fitur utama yang dimiliki produk ini
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {Object.keys(features).map((featureName) => (
                      <Grid item xs={12} sm={6} md={4} key={featureName}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 1.5,
                            border: '1px solid',
                            borderColor: features[featureName] ? 'primary.main' : 'divider',
                            borderRadius: 1,
                            backgroundColor: features[featureName] ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            '&:hover': {
                              borderColor: 'primary.main',
                              backgroundColor: 'rgba(25, 118, 210, 0.04)'
                            }
                          }}
                          onClick={() => handleFeatureChange(featureName)}
                        >
                          <Checkbox
                            checked={features[featureName]}
                            onChange={() => handleFeatureChange(featureName)}
                            color="primary"
                          />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {featureName}
                          </Typography>
                          
                          <IconButton 
                            size="small" 
                            sx={{ ml: 'auto' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              const updatedFeatures = { ...features };
                              delete updatedFeatures[featureName];
                              setFeatures(updatedFeatures);
                              setFormData(prev => ({
                                ...prev,
                                feature: JSON.stringify(updatedFeatures)
                              }));
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <TextField
                      label="Fitur Baru"
                      variant="outlined"
                      size="small"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      sx={{ mr: 1, flexGrow: 1 }}
                    />
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddFeature}
                      disabled={!newFeature || features[newFeature]}
                    >
                      Tambah
                    </Button>
                  </Box>
                </FormSection>
                {/* Upload Gambar */}
                <FormSection>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                    Foto Produk
                  </Typography>

                  {/* Galeri gambar yang diunggah */}
                  <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2}>
                      {imagePreviews.length > 0 ? (
                        imagePreviews.map((img, index) => (
                          <Grid item xs={6} sm={4} md={3} key={index}>
                            <Fade in={true} timeout={300 + index * 100}>
                              <Box>
                                <ImagePreview 
                                  elevation={3} 
                                  sx={{ 
                                    backgroundImage: `url(${img})`,
                                    position: 'relative',
                                    height: 180,
                                    borderRadius: '8px',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      transform: 'scale(1.03)',
                                      boxShadow: '0 10px 20px rgba(0,0,0,0.15)'
                                    }
                                  }}
                                >
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      height: '100%',
                                      background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 50%)',
                                      borderRadius: '8px',
                                      opacity: 0,
                                      transition: 'opacity 0.3s ease',
                                      display: 'flex',
                                      alignItems: 'flex-end',
                                      justifyContent: 'center',
                                      padding: '8px',
                                      '&:hover': {
                                        opacity: 1
                                      }
                                    }}
                                  >
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleRemoveImage(index)}
                                      sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        color: 'error.main',
                                        '&:hover': {
                                          backgroundColor: 'error.main',
                                          color: 'white'
                                        },
                                        transform: 'translateY(-8px)'
                                      }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Box>
                                </ImagePreview>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      backgroundColor: 'primary.main',
                                      color: 'white',
                                      px: 2,
                                      py: 0.5,
                                      borderRadius: '10px',
                                      fontWeight: 500,
                                    }}
                                  >
                                    Foto {index + 1}
                                  </Typography>
                                </Box>
                              </Box>
                            </Fade>
                          </Grid>
                        ))
                      ) : (
                        <Grid item xs={12}>
                          <Box
                            sx={{
                              height: 120,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 2,
                              backgroundColor: 'rgba(0,0,0,0.03)',
                              border: '1px dashed rgba(0,0,0,0.2)',
                              p: 2,
                              mb: 2,
                            }}
                          >
                            <Typography variant="body2" color="text.secondary" align="center">
                              Belum ada foto yang diunggah
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>

                  {/* Bagian unggah gambar baru */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      borderRadius: 2,
                      backgroundColor: 'rgba(245,245,245,0.7)',
                      border: '1px dashed rgba(0,0,0,0.2)'
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom fontWeight={500} color="primary.main">
                      Unggah Foto Baru
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {/* Dropzone */}
                      <Grid item xs={12} sm={8}>
                        <Zoom in={true} timeout={500}>
                          <Box>
                            <DropzoneArea 
                              {...getRootProps()} 
                              isDragActive={isDragActive} 
                              isDragReject={isDragReject}
                              sx={{
                                height: 150,
                                border: '2px dashed',
                                borderColor: isDragReject
                                  ? 'error.main'
                                  : isDragActive
                                    ? 'success.main'
                                    : 'primary.light',
                                borderRadius: '12px',
                                transition: 'all 0.3s ease',
                                boxShadow: isDragActive ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                                backgroundImage: isDragActive ? 
                                  'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(245,245,245,0.9))' 
                                  : 'none'
                              }}
                            >
                              <input {...getInputProps()} />
                              {isProcessing ? (
                                <Box sx={{ textAlign: 'center' }}>
                                  <CircularProgress size={36} color="primary" />
                                  <Typography variant="body2" color="text.secondary" mt={1}>
                                    Memproses...
                                  </Typography>
                                </Box>
                              ) : isDragActive ? (
                                <Box sx={{ textAlign: 'center' }}>
                                  <CloudUploadIcon
                                    sx={{ 
                                      fontSize: 36, 
                                      mb: 1, 
                                      color: isDragReject ? "error.main" : "success.main",
                                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                                    }}
                                  />
                                  <Typography
                                    variant="subtitle2"
                                    fontWeight={500}
                                    color={isDragReject ? "error.main" : "success.main"}
                                  >
                                    {isDragReject ? "Format file tidak didukung" : "Lepaskan file di sini"}
                                  </Typography>
                                </Box>
                              ) : (
                                <Box sx={{ textAlign: 'center' }}>
                                  <AddAPhotoIcon 
                                    sx={{ 
                                      fontSize: 36, 
                                      mb: 1, 
                                      color: "primary.main",
                                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                                    }}
                                  />
                                  <Typography variant="subtitle2" fontWeight={500} color="primary.main">
                                    Seret & lepaskan foto di sini
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                                    atau klik untuk memilih dari perangkat
                                  </Typography>
                                </Box>
                              )}
                            </DropzoneArea>
                          </Box>
                        </Zoom>
                      </Grid>
                      
                      {/* Panel info */}
                      <Grid item xs={12} sm={4}>
                        <Box 
                          sx={{ 
                            height: '100%', 
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                          }}
                        >
                          <Typography variant="subtitle2" fontWeight={500} gutterBottom color="text.secondary">
                            Format yang didukung:
                          </Typography>
                          
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                            {['JPG', 'PNG', 'WEBP'].map((format) => (
                              <Chip
                                key={format}
                                label={format}
                                size="small"
                                sx={{ 
                                  backgroundColor: 'rgba(0,0,0,0.05)',
                                  borderRadius: '4px',
                                  fontWeight: 500,
                                  fontSize: '0.7rem'
                                }}
                              />
                            ))}
                          </Box>
                          
                          <Typography variant="caption" color="text.secondary">
                            <strong>Tip:</strong> Tambahkan beberapa foto dari berbagai sudut untuk menampilkan produk dengan lebih baik
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5 }}>
                            <Button 
                              variant="outlined"
                              component="label"
                              size="small"
                              startIcon={<CloudUploadIcon />}
                              sx={{ fontSize: '0.75rem', textTransform: 'none' }}
                            >
                              Upload Manual
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                hidden
                                onChange={handleImageChange}
                              />
                            </Button>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    {/* Informasi penghitung gambar dan batas */}
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        mt: 2,
                        pt: 2,
                        borderTop: '1px dashed rgba(0,0,0,0.1)'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ImageIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {imagePreviews.length} foto diunggah
                        </Typography>
                      </Box>
                      
                      <Typography 
                        variant="caption" 
                        color={imagePreviews.length > 0 ? "success.main" : "text.secondary"}
                        sx={{ fontWeight: imagePreviews.length > 0 ? 500 : 400 }}
                      >
                        {imagePreviews.length > 0 ? "✓ Minimal 1 foto" : "Minimal 1 foto diperlukan"}
                      </Typography>
                    </Box>
                  </Paper>
                </FormSection>
              </Grid>
            </Grid>

            {/* Tombol */}
            <Box sx={{ mt: 4 }}>
              <Divider sx={{ mb: 4 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/catalog')}
                  startIcon={<ArrowBackIcon />}
                  size="large"
                  sx={{ px: 4, py: 1.5 }}
                >
                  KEMBALI
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!isFormValid || isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
                    "&:hover": {
                      boxShadow: "0 12px 20px rgba(0,0,0,0.4)",
                    },
                  }}
                >
                  {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN KATALOG'}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </StyledCard>
    </Container>
  )
}

export default TambahPakaian