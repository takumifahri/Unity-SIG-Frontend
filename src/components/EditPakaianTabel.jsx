import { useState, useEffect, useRef, forwardRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { NumericFormat } from 'react-number-format';

// Material UI imports
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid, 
  FormControl, InputLabel, Select, MenuItem, Paper, Divider,
  IconButton, Chip, CircularProgress, Alert, InputAdornment,
  ToggleButton, ToggleButtonGroup, Tooltip, Snackbar
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';

// Material UI icons
import {
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon, 
    CloudUpload as UploadIcon,
    Delete as DeleteIcon,
    AddCircle as AddCircleIcon,
    RemoveCircle as RemoveCircleIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    Warning as WarningIcon
  } from '@mui/icons-material';

// Komponen Alert untuk Snackbar
const SnackbarAlert = forwardRef(function SnackbarAlert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Component Skeleton untuk loading state
const EditSkeleton = () => {
  return (
    <Card sx={{ p: { xs: 2, md: 3 }, boxShadow: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'grey.200', mr: 2 }} />
        <Box sx={{ height: 24, width: 180, bgcolor: 'grey.200', borderRadius: 1 }} />
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          {[1, 2, 3, 4].map((index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Box sx={{ height: 16, width: 80, bgcolor: 'grey.200', borderRadius: 1, mb: 1 }} />
              <Box sx={{ height: 40, width: '100%', bgcolor: 'grey.200', borderRadius: 1 }} />
            </Box>
          ))}
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ height: 16, width: 80, bgcolor: 'grey.200', borderRadius: 1, mb: 1 }} />
            <Box sx={{ height: 120, width: '100%', bgcolor: 'grey.200', borderRadius: 1 }} />
          </Box>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ height: 16, width: 80, bgcolor: 'grey.200', borderRadius: 1, mb: 1 }} />
            <Box sx={{ height: 40, width: '100%', bgcolor: 'grey.200', borderRadius: 1 }} />
          </Box>
          <Box>
            <Box sx={{ height: 16, width: 80, bgcolor: 'grey.200', borderRadius: 1, mb: 1 }} />
            <Box sx={{ display: 'flex', height: 40 }}>
              <Box sx={{ flexGrow: 1, bgcolor: 'grey.200', borderRadius: 1, mr: 1 }} />
              <Box sx={{ width: 90, bgcolor: 'grey.200', borderRadius: 1 }} />
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mb: 4 }}>
        <Box sx={{ height: 20, width: 120, bgcolor: 'grey.200', borderRadius: 1, mb: 2 }} />
        {[1, 2].map((i) => (
          <Paper key={i} variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ height: 16, width: 100, bgcolor: 'grey.200', borderRadius: 1 }} />
              <Box sx={{ height: 32, width: 32, bgcolor: 'grey.200', borderRadius: '50%' }} />
            </Box>
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map((j) => (
                <Grid item xs={6} sm={3} key={j}>
                  <Box sx={{ height: 40, bgcolor: 'grey.200', borderRadius: 1 }} />
                </Grid>
              ))}
            </Grid>
          </Paper>
        ))}
      </Box>

      <Box sx={{ mb: 4 }}>
        <Box sx={{ height: 16, width: 100, bgcolor: 'grey.200', borderRadius: 1, mb: 2 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={6} sm={3} key={i}>
              <Box sx={{ height: 140, bgcolor: 'grey.200', borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box sx={{ height: 40, width: { xs: '100%', sm: 120 }, bgcolor: 'grey.200', borderRadius: 1 }} />
        <Box sx={{ height: 40, width: { xs: '100%', sm: 120 }, bgcolor: 'grey.200', borderRadius: 1 }} />
      </Box>
    </Card>
  );
};

// Komponen untuk NumericFormat custom
const NumericFormatCustom = forwardRef(function NumericFormatCustom(
  props,
  ref,
) {
  const { onChange, ...other } = props;

  return (
    <NumericFormat
      {...other}
      getInputRef={ref}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        });
      }}
      thousandSeparator="."
      decimalSeparator=","
      valueIsNumericString
      prefix="Rp "
    />
  );
});

export default function EditPakaianTable() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState({
    nama_katalog: '',
    price: '',
    stok: '',
    deskripsi: '',
    bahan: '',
    details: '',
    gambar: [],
    colors: []
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Reference for file input
  const fileInputRef = useRef(null);
  
  // Images state
  const [previewImages, setPreviewImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // Categories for dropdown
  const categories = [
    { id: 1, name: 'Kemeja' },
    { id: 2, name: 'Kaos' },
    { id: 3, name: 'Jaket' },
    { id: 4, name: 'Celana' }
  ];

  // Available color names
  const availableColors = [
    "Merah", "Biru", "Hijau", "Hitam", "Putih", "Kuning", 
    "Ungu", "Oranye", "Abu-abu", "Coklat", "Navy", "Pink",
    "Marun", "Cream", "Silver", "Gold"
  ];

  // Color to hex mapping
  const colorToHex = {
    "Merah": "#FF0000",
    "Biru": "#0000FF",
    "Hijau": "#008000",
    "Hitam": "#000000",
    "Putih": "#FFFFFF",
    "Kuning": "#FFFF00",
    "Ungu": "#800080",
    "Oranye": "#FFA500",
    "Abu-abu": "#808080",
    "Coklat": "#A52A2A",
    "Navy": "#000080",
    "Pink": "#FFC0CB",
    "Marun": "#800000",
    "Cream": "#FFFDD0",
    "Silver": "#C0C0C0",
    "Gold": "#FFD700"
  };

  // Available sizes
  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/catalog/show/${id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`
            }
          }
        );

        console.log('Product data from API:', response.data);
        const productData = response.data.data;
        
        // Process images
        let images = [];
        try {
          // Handle the case where gambar is already an array
          if (Array.isArray(productData.gambar)) {
            images = productData.gambar;
          } else if (typeof productData.gambar === 'string') {
            try {
              // Try parsing as JSON
              const parsedImages = JSON.parse(productData.gambar);
              images = Array.isArray(parsedImages) ? parsedImages : [parsedImages];
            } catch (e) {
              // Not JSON, treat as single image path
              images = [productData.gambar];
            }
          } else if (productData.gambar) {
            images = [productData.gambar];
          }
        } catch (err) {
          console.error('Error processing images:', err);
          images = [];
        }

        // Process colors and sizes from API data
        const processedColors = productData.colors || [];
        
        setProduct({
          ...productData,
          gambar: images,
          colors: processedColors
        });

        // Set preview images
        setPreviewImages(
          images.map(img => ({
            url: `${process.env.REACT_APP_API_URL}/${img}`,
            path: img
          }))
        );

        // Show success snackbar
        setSnackbar({
          open: true,
          message: 'Data produk berhasil dimuat',
          severity: 'success'
        });

      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message || 'Failed to fetch product data');
        
        // Show error snackbar
        setSnackbar({
          open: true,
          message: 'Gagal memuat data produk',
          severity: 'error'
        });
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load product data'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Proses khusus untuk field price
    setProduct(prevProduct => ({
      ...prevProduct,
      [name]: value
    }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Create preview for new images
    const newImagePreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      file
    }));

    setNewImages([...newImages, ...files]);
    setPreviewImages([...previewImages, ...newImagePreviews]);
    
    // Tampilkan pesan gambar berhasil ditambahkan
    setSnackbar({
      open: true,
      message: `${files.length} gambar berhasil ditambahkan`,
      severity: 'success'
    });
  };

  // Remove image from preview
  const handleRemoveImage = (index) => {
    // Check if it's an existing image or a new one
    const updatedPreviews = [...previewImages];
    const removedImage = updatedPreviews[index];

    // If it has a path property, it's an existing image
    if (removedImage.path) {
      setImagesToDelete([...imagesToDelete, removedImage.path]);
    } else if (removedImage.file) {
      // If it's a new image, remove it from newImages array
      const updatedNewImages = newImages.filter(file => 
        file !== removedImage.file
      );
      setNewImages(updatedNewImages);
    }

    // Remove from preview
    updatedPreviews.splice(index, 1);
    setPreviewImages(updatedPreviews);
    
    // Tampilkan pesan gambar berhasil dihapus
    setSnackbar({
      open: true,
      message: 'Gambar berhasil dihapus',
      severity: 'info'
    });
  };

  // Add a new color
  const handleAddColor = () => {
    const updatedProduct = { ...product };
    const newColor = {
      id: `temp_${Date.now()}`, // Temporary ID for new colors
      catalog_id: product.id,
      color_name: availableColors[0],
      is_new: true,
      sizes: []
    };
    
    updatedProduct.colors.push(newColor);
    setProduct(updatedProduct);
    
    // Tampilkan snackbar
    setSnackbar({
      open: true,
      message: `Warna ${availableColors[0]} berhasil ditambahkan`,
      severity: 'success'
    });
  };

  // Remove a color
  const handleRemoveColor = (index) => {
    const updatedProduct = { ...product };
    const colorName = updatedProduct.colors[index].color_name;
    updatedProduct.colors.splice(index, 1);
    setProduct(updatedProduct);
    
    // Tampilkan snackbar
    setSnackbar({
      open: true,
      message: `Warna ${colorName} berhasil dihapus`,
      severity: 'info'
    });
  };

  // Update color data
  const handleColorChange = (index, value) => {
    const updatedProduct = { ...product };
    const oldColor = updatedProduct.colors[index].color_name;
    updatedProduct.colors[index].color_name = value;
    setProduct(updatedProduct);
    
    // Tampilkan snackbar
    setSnackbar({
      open: true,
      message: `Warna diubah dari ${oldColor} ke ${value}`,
      severity: 'info'
    });
  };

  // Add a size to a color
  const handleAddSize = (colorIndex) => {
    const updatedProduct = { ...product };
    const color = updatedProduct.colors[colorIndex];
    
    // In this structure, sizes could be an object or an array
    let sizes = [];
    if (color.sizes) {
      // If it's an object with fields like "id", "size", etc.
      if (typeof color.sizes === 'object' && !Array.isArray(color.sizes)) {
        sizes = [color.sizes];
      } 
      // If it's already an array
      else if (Array.isArray(color.sizes)) {
        sizes = [...color.sizes];
      }
    }
    
    // Find a size that doesn't exist yet for this color
    const existingSizes = sizes.map(s => s.size);
    const availableSize = availableSizes.find(s => !existingSizes.includes(s));
    
    if (availableSize) {
      const newSize = {
        id: `temp_${Date.now()}`, // Temporary ID for new sizes
        catalog_id: product.id,
        catalog_colors_id: color.id,
        size: availableSize,
        stok: 0,
        is_new: true
      };
      
      // Update the colors and sizes structure
      if (Array.isArray(updatedProduct.colors[colorIndex].sizes)) {
        updatedProduct.colors[colorIndex].sizes.push(newSize);
      } else {
        // If sizes was an object or null/undefined, convert to array
        updatedProduct.colors[colorIndex].sizes = [
          ...(updatedProduct.colors[colorIndex].sizes ? [updatedProduct.colors[colorIndex].sizes] : []),
          newSize
        ];
      }
      
      setProduct(updatedProduct);
      
      // Tampilkan snackbar
      setSnackbar({
        open: true,
        message: `Ukuran ${availableSize} ditambahkan untuk warna ${color.color_name}`,
        severity: 'success'
      });
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Info',
        text: 'Semua ukuran sudah ditambahkan untuk warna ini.'
      });
      
      // Tampilkan snackbar
      setSnackbar({
        open: true,
        message: 'Semua ukuran sudah ditambahkan untuk warna ini',
        severity: 'warning'
      });
    }
  };

  // Remove a size from a color
  const handleRemoveSize = (colorIndex, sizeIndex) => {
    const updatedProduct = { ...product };
    const color = updatedProduct.colors[colorIndex];
    
    // Get size name for notification
    let sizeName = '';
    if (typeof color.sizes === 'object' && !Array.isArray(color.sizes) && sizeIndex === 0) {
      sizeName = color.sizes.size;
    } else if (Array.isArray(color.sizes)) {
      sizeName = color.sizes[sizeIndex].size;
    }
    
    // Handle the case where sizes might be an object or array
    if (typeof color.sizes === 'object' && !Array.isArray(color.sizes) && sizeIndex === 0) {
      // If it's a single object and we're removing the only size
      updatedProduct.colors[colorIndex].sizes = [];
    } else if (Array.isArray(color.sizes)) {
      // If it's an array, remove the specific index
      updatedProduct.colors[colorIndex].sizes.splice(sizeIndex, 1);
    }
    
    setProduct(updatedProduct);
    
    // Tampilkan snackbar
    setSnackbar({
      open: true,
      message: `Ukuran ${sizeName} dihapus dari warna ${color.color_name}`,
      severity: 'info'
    });
  };

  // Update size data
  const handleSizeChange = (colorIndex, sizeIndex, field, value) => {
    const updatedProduct = { ...product };
    const color = updatedProduct.colors[colorIndex];
    
    // Get size name for notification
    let sizeName = '';
    if (typeof color.sizes === 'object' && !Array.isArray(color.sizes) && sizeIndex === 0) {
      sizeName = color.sizes.size;
    } else if (Array.isArray(color.sizes)) {
      sizeName = color.sizes[sizeIndex].size;
    }
    
    // Handle the case where sizes might be an object or array
    if (typeof color.sizes === 'object' && !Array.isArray(color.sizes) && sizeIndex === 0) {
      // If it's a single object
      updatedProduct.colors[colorIndex].sizes[field] = value;
    } else if (Array.isArray(color.sizes)) {
      // If it's an array
      updatedProduct.colors[colorIndex].sizes[sizeIndex][field] = value;
    }
    
    setProduct(updatedProduct);
    
    // Tampilkan snackbar untuk perubahan stok yang signifikan (lebih dari 10)
    if (field === 'stok' && value >= 10) {
      setSnackbar({
        open: true,
        message: `Stok ukuran ${sizeName} (${color.color_name}) diubah menjadi ${value}`,
        severity: 'info'
      });
    }
  };

  // Normalize sizes before displaying
  const getNormalizedSizes = (color) => {
    if (!color.sizes) return [];
    
    if (typeof color.sizes === 'object' && !Array.isArray(color.sizes)) {
      // Single size object
      return [color.sizes];
    }
    
    // Already an array
    return color.sizes;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      // Create form data for multipart/form-data (for images)
      const formData = new FormData();
      formData.append('_method', 'PUT'); // Laravel uses this for method spoofing
      formData.append('nama_katalog', product.nama_katalog);
      formData.append('price', product.price);
      formData.append('stok', product.stok);
      formData.append('deskripsi', product.deskripsi);
      formData.append('bahan', product.bahan);
      
      // Add details if available
      if (product.details) {
        formData.append('details', product.details);
      }
      
      // Add new images
      newImages.forEach((file, index) => {
        formData.append(`gambar[${index}]`, file);
      });
      
      // Add images to delete
      imagesToDelete.forEach((path, index) => {
        formData.append(`remove_images[${index}]`, path);
      });
      
      // Include existing images that shouldn't be deleted
      const remainingImages = previewImages
        .filter(img => img.path && !imagesToDelete.includes(img.path))
        .map(img => img.path);
      
      formData.append('keep_images', JSON.stringify(remainingImages));
      
      // Process colors and sizes for API
      const processedColors = product.colors.map(color => {
        const normalizedSizes = getNormalizedSizes(color);
        return {
          ...color,
          sizes: normalizedSizes
        };
      });
      
      // Add colors and sizes data
      formData.append('colors', JSON.stringify(processedColors));
      
      // Send update request
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/catalog/update/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`
          }
        }
      );
      
      // Tampilkan snackbar sukses dengan respons dari server
      setSnackbar({
        open: true,
        message: response.data.message || 'Produk berhasil diperbarui',
        severity: 'success'
      });
      
      // Gunakan SweetAlert untuk konfirmasi yang lebih menonjol
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: response.data.message || 'Produk berhasil diperbarui'
      });
      
      // Tunggu 1.5 detik sebelum navigasi kembali ke halaman katalog
      setTimeout(() => {
        navigate('/admin/catalog');
      }, 1500);
      
    } catch (err) {
      console.error('Error updating product:', err);
      
      const errorMessage = err.response?.data?.message || 
                           err.response?.data?.['detail message'] || 
                           err.message || 
                           'Gagal memperbarui produk';
      
      // Tampilkan snackbar error
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      
      // Gunakan SweetAlert untuk error yang lebih menonjol
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage
      });
    } finally {
      setSubmitting(false);
    }
  };
  // Handle clicking back button
  const handleBack = () => {
    navigate('/admin/catalog');
  };
  
  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({...snackbar, open: false});
  };

  if (loading) {
    return <EditSkeleton />;
  }

  if (error) {
    return (
      <Card sx={{ p: { xs: 2, md: 3 }, boxShadow: 3, borderRadius: 2 }}>
        <Alert 
          severity="error" 
          variant="filled"
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
            >
              Kembali
            </Button>
          }
        >
          <Typography fontWeight="bold" mb={0.5}>Error</Typography>
          <Typography>{error}</Typography>
        </Alert>
      </Card>
    );
  }

  return (
    <>
      <Card component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2, md: 3 }, boxShadow: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton 
            onClick={handleBack}
            sx={{ mr: 2, bgcolor: 'grey.200', '&:hover': { bgcolor: 'grey.300' } }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1" fontWeight="600">
            Edit Produk: {product.nama_katalog}
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Left Column */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Nama Produk"
              fullWidth
              name="nama_katalog"
              value={product.nama_katalog}
              onChange={handleChange}
              placeholder="Masukkan nama produk"
              variant="outlined"
              required
              margin="normal"
            />

            <TextField
              label="Harga"
              fullWidth
              name="price"
              value={product.price}
              onChange={handleChange}
              placeholder="Masukkan harga"
              variant="outlined"
              required
              margin="normal"
              InputProps={{
                inputComponent: NumericFormatCustom,
              }}
              helperText="Format otomatis: Rp 1.000.000"
            />

            <TextField
              label="Stok Total"
              fullWidth
              type="number"
              name="stok"
              value={product.stok}
              onChange={handleChange}
              placeholder="Masukkan jumlah stok"
              variant="outlined"
              required
              margin="normal"
              helperText="Stok total digunakan sebagai stok umum. Stok per warna dan ukuran dikelola di bawah."
            />

           
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Deskripsi"
              fullWidth
              multiline
              rows={4}
              name="deskripsi"
              value={product.deskripsi}
              onChange={handleChange}
              placeholder="Masukkan deskripsi produk"
              variant="outlined"
              required
              margin="normal"
            />

            <TextField
              label="Bahan"
              fullWidth
              name="bahan"
              value={product.bahan}
              onChange={handleChange}
              placeholder="Masukkan bahan produk"
              variant="outlined"
              required
              margin="normal"
            />

            <Box sx={{ mt: 2, mb: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Upload Gambar
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  multiple
                  accept="image/*"
                />
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<UploadIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ flexGrow: 1 }}
                >
                  Pilih Gambar
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Format: JPG, PNG, GIF (Max: 2MB per file)
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Optional Details Section */}
        {product.details && (
          <Box sx={{ mb: 4 }}>
            <TextField
              label="Detail Produk (Opsional)"
              fullWidth
              multiline
              rows={6}
              name="details"
              value={product.details}
              onChange={handleChange}
              placeholder="Masukkan detail produk lebih lengkap"
              variant="outlined"
              margin="normal"
            />
          </Box>
        )}

        {/* Colors and Sizes Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2, 
            pb: 2, 
            borderBottom: 1, 
            borderColor: 'divider' 
          }}>
            <Typography variant="h6">Warna dan Ukuran</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleIcon />}
              onClick={handleAddColor}
              size="small"
            >
              Tambah Warna
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {product.colors.map((color, colorIndex) => (
              <Paper
                key={colorIndex}
                variant="outlined"
                sx={{ p: 2, borderRadius: 2 }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 2, 
                  pb: 1,
                  borderBottom: '1px dashed',
                  borderColor: 'divider'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: colorToHex[color.color_name] || '#999999'
                    }} />
                    <FormControl sx={{ minWidth: 150 }} size="small">
                      <Select
                        value={color.color_name}
                        onChange={(e) => handleColorChange(colorIndex, e.target.value)}
                        displayEmpty
                        variant="outlined"
                      >
                        {availableColors.map(c => (
                          <MenuItem key={c} value={c} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box 
                              component="span" 
                              sx={{ 
                                display: 'inline-block', 
                                width: 16, 
                                height: 16, 
                                borderRadius: '50%', 
                                bgcolor: colorToHex[c] || '#999999',
                                mr: 1,
                                border: '1px solid',
                                borderColor: 'divider'
                              }} 
                            />
                            {c}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Tooltip title="Hapus warna">
                    <IconButton 
                      onClick={() => handleRemoveColor(colorIndex)}
                      color="error"
                      size="small"
                    >
                      <RemoveCircleIcon />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                    Ukuran untuk {color.color_name}
                  </Typography>
                  <Grid container spacing={2}>
                    {getNormalizedSizes(color).map((size, sizeIndex) => (
                      <Grid item xs={6} sm={4} md={3} key={sizeIndex}>
                        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Chip 
                              label={size.size} 
                              size="small" 
                              variant="filled" 
                              color="primary"
                            />
                            <IconButton 
                              onClick={() => handleRemoveSize(colorIndex, sizeIndex)}
                              size="small" 
                              color="error"
                            >
                              <RemoveCircleIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <TextField
                            size="small"
                            type="number"
                            label="Stok"
                            variant="outlined"
                            fullWidth
                            value={size.stok}
                            onChange={(e) => handleSizeChange(colorIndex, sizeIndex, 'stok', parseInt(e.target.value) || 0)}
                            InputProps={{ inputProps: { min: 0 } }}
                          />
                        </Paper>
                      </Grid>
                    ))}
                    <Grid item xs={6} sm={4} md={3}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 1.5, 
                          height: '100%', 
                          borderRadius: 1, 
                          borderStyle: 'dashed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'background.default',
                          cursor: 'pointer',
                          '&:hover': { borderColor: 'primary.main' }
                        }}
                        onClick={() => handleAddSize(colorIndex)}
                      >
                        <Box sx={{ textAlign: 'center' }}>
                          <AddCircleIcon color="primary" sx={{ mb: 0.5 }} />
                          <Typography variant="caption" color="textSecondary" display="block">
                            Tambah Ukuran
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            ))}

            {product.colors.length === 0 && (
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 4, 
                  borderRadius: 2, 
                  borderStyle: 'dashed', 
                  textAlign: 'center',
                  bgcolor: 'background.default'
                }}
              >
                <Typography color="textSecondary" sx={{ mb: 2 }}>
                  Belum ada warna yang ditambahkan.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddCircleIcon />}
                  onClick={handleAddColor}
                >
                  Tambah Warna Pertama
                </Button>
              </Paper>
            )}
          </Box>
        </Box>

        {/* Image Preview Section */}
        {previewImages.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Preview Gambar
            </Typography>
            <Grid container spacing={2}>
              {previewImages.map((image, index) => (
                <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                  <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
                    <Box
                      component="img"
                      src={image.url}
                      alt={`Preview ${index + 1}`}
                      sx={{ 
                        width: '100%', 
                        height: 160, 
                        objectFit: 'cover', 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150?text=Image+Error';
                      }}
                    />
                    <IconButton
                      onClick={() => handleRemoveImage(index)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'error.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'error.dark' },
                        width: 36,
                        height: 36
                      }}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Action Buttons */}
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 2, 
            flexDirection: { xs: 'column', sm: 'row' }, 
            mt: 4,
            pt: 3,
            borderTop: 1,
            borderColor: 'divider'
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            fullWidth={!/sm|md|lg|xl/.test(window.innerWidth)}
            sx={{ minWidth: { sm: 150 } }}
          >
            Kembali
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="success"
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={submitting}
            fullWidth={!/sm|md|lg|xl/.test(window.innerWidth)}
            sx={{ minWidth: { sm: 150 } }}
          >
            {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </Box>
      </Card>

      {/* Snackbar Alert */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
        <SnackbarAlert 
            onClose={handleSnackbarClose} 
            severity={snackbar.severity}
            sx={{ 
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 1
            }}
        >
            {snackbar.severity === 'success' && <CheckCircleIcon fontSize="small" />}
            {snackbar.severity === 'error' && <ErrorIcon fontSize="small" />}
            {snackbar.severity === 'warning' && <WarningIcon fontSize="small" />}
            {snackbar.severity === 'info' && <InfoIcon fontSize="small" />}
            {snackbar.message}
        </SnackbarAlert>
        </Snackbar>
    </>
  );
}