"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
} from "@mui/material"
import { Check } from "lucide-react"
import Link from "next/link"

const BestSellerSection = () => {
  // States
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  })

  // Fetch best sellers
  useEffect(() => {
    fetchBestSellers()
  }, [])

  const fetchBestSellers = async () => {
    try {
      setLoading(true)

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/catalog/bestSeller`, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = response.data.data

      if (data && data.length > 0) {
        setProducts(data)
        showNotification("Data Best Seller berhasil dimuat", "success")
      } else {
        setProducts([])
        showNotification("Tidak ada produk best seller saat ini", "info")
      }
    } catch (error) {
      console.error("Error fetching best sellers:", error)
      showNotification("Gagal memuat data Best Seller", "error")
    } finally {
      setLoading(false)
    }
  }

  // Helper functions
  const showNotification = (message, severity) => {
    setNotification({
      open: true,
      message,
      severity,
    })
  }

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    })
  }

  const handleQuickView = (product) => {
    setSelectedProduct(product)
    setQuickViewOpen(true)
  }

  const handleCloseQuickView = () => {
    setQuickViewOpen(false)
  }

  // Parse JSON safely
  const safelyParseJSON = (jsonString, defaultValue = []) => {
    try {
      return JSON.parse(jsonString) || defaultValue
    } catch (error) {
      return defaultValue
    }
  }

  // Render functions
  const renderSkeletons = () => (
    <Grid container spacing={3}>
      {[1, 2, 3, 4].map((_, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card sx={{ height: "100%" }}>
            <Box
              sx={{
                paddingTop: "120%",
                position: "relative",
                backgroundColor: "#e0e0e0",
              }}
            />
            <CardContent>
              <Box
                sx={{
                  width: "70%",
                  height: 20,
                  backgroundColor: "#e0e0e0",
                  mx: "auto",
                  mb: 1,
                }}
              />
              <Box
                sx={{
                  width: "50%",
                  height: 15,
                  backgroundColor: "#e0e0e0",
                  mx: "auto",
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )

  const renderEmptyState = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "40vh",
        textAlign: "center",
        p: 3,
      }}
    >
      <img src="/placeholder.svg?height=180&width=180" alt="No Products" style={{ marginBottom: 24 }} />
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Tidak Ada Produk Best Seller
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Saat ini belum ada produk best seller yang tersedia.
      </Typography>
    </Box>
  )

  const renderProductCard = (product) => (
    <Grid item xs={12} sm={6} md={3} key={product.id}>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "transform 0.3s, box-shadow 0.3s",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: 6,
            "& .product-actions": {
              opacity: 1,
            },
          },
        }}
      >
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            height="280"
            image={`${process.env.REACT_APP_API_URL}/${product.gambar}`}
            alt={product.nama_katalog}
            sx={{ objectFit: "cover" }}
            onError={(e) => {
              e.target.src = "/placeholder.svg?height=280&width=210"
            }}
          />
          <Box
            className="product-actions"
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: "rgba(255, 255, 255, 0.9)",
              p: 1,
              display: "flex",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity 0.3s",
            }}
          >
            <Button
              component={Link}
              href={`/product/${product.id}`}
              variant="outlined"
              size="small"
              sx={{
                mr: 1,
                color: "#6D4C3D",
                borderColor: "#6D4C3D",
                "&:hover": {
                  borderColor: "#8B5A2B",
                  backgroundColor: "rgba(109, 76, 61, 0.04)",
                },
              }}
            >
              View All
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleQuickView(product)}
              sx={{
                color: "#6D4C3D",
                borderColor: "#6D4C3D",
                "&:hover": {
                  borderColor: "#8B5A2B",
                  backgroundColor: "rgba(109, 76, 61, 0.04)",
                },
              }}
            >
              Quick View
            </Button>
          </Box>
        </Box>
        <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
          <Typography variant="h6" component="h3" gutterBottom>
            {product.nama_katalog}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              overflow: "hidden",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              mb: 1,
            }}
          >
            {product.deskripsi}
          </Typography>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
            {`Rp ${Number.parseInt(product.price).toLocaleString()}`}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  )

  const renderQuickViewDialog = () => (
    <Dialog open={quickViewOpen} onClose={handleCloseQuickView} maxWidth="md" fullWidth>
      {selectedProduct && (
        <>
          <DialogTitle
            sx={{
              borderBottom: "1px solid #e0e0e0",
              fontWeight: "bold",
            }}
          >
            {selectedProduct.nama_katalog}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <img
                  src={`${process.env.REACT_APP_API_URL}/${selectedProduct.gambar}`}
                  alt={selectedProduct.nama_katalog}
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=400&width=300"
                  }}
                />
                <Typography
                  variant="h6"
                  align="center"
                  sx={{
                    mt: 2,
                    color: "#6D4C3D",
                    fontWeight: "bold",
                  }}
                >
                  {`Rp ${Number.parseInt(selectedProduct.price).toLocaleString()}`}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  {selectedProduct.nama_katalog}
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedProduct.detail || selectedProduct.deskripsi}
                </Typography>

                {selectedProduct.feature && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: "#6D4C3D" }}>
                      Features:
                    </Typography>
                    <List dense disablePadding>
                      {safelyParseJSON(selectedProduct.feature).map((feature, index) => (
                        <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <Check size={18} color="#4CAF50" />
                          </ListItemIcon>
                          <ListItemText primary={feature} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: "#6D4C3D" }}>
                      Available Colors:
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {selectedProduct.colors.map((color, index) => (
                        <Chip key={index} label={color.color_name} size="small" sx={{ mb: 1 }} />
                      ))}
                    </Box>
                  </Box>
                )}

                {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: "#6D4C3D" }}>
                      Available Sizes:
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {selectedProduct.sizes.map((size, index) => (
                        <Chip key={index} label={size} size="small" variant="outlined" sx={{ mb: 1 }} />
                      ))}
                    </Box>
                  </Box>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseQuickView} sx={{ color: "#6D4C3D" }}>
              Close
            </Button>
            <Button
              component={Link}
              href={`/product/${selectedProduct.id}`}
              variant="contained"
              sx={{
                bgcolor: "#6D4C3D",
                "&:hover": {
                  bgcolor: "#8B5A2B",
                },
              }}
            >
              View Full Details
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )

  return (
    <Box sx={{ py: 5, px: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Typography
        variant="h4"
        component="h2"
        align="center"
        gutterBottom
        sx={{
          color: "#D2B48C",
          mb: 4,
          fontSize: { xs: "1.75rem", md: "2.125rem" },
        }}
      >
        Best Seller!
      </Typography>

      <Divider sx={{ mb: 4 }} />

      {/* Content */}
      {loading ? (
        renderSkeletons()
      ) : products.length > 0 ? (
        <Grid container spacing={3}>
          {products.map((product) => renderProductCard(product))}
        </Grid>
      ) : (
        renderEmptyState()
      )}

      {/* Quick View Dialog */}
      {renderQuickViewDialog()}

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default BestSellerSection
