"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import Dropzone from "react-dropzone"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"

// MUI Components
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Snackbar,
  Typography,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
} from "@mui/material"

// MUI Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import InfoIcon from "@mui/icons-material/Info"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import UploadFileIcon from "@mui/icons-material/UploadFile"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"

function PaymentPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [paymentProof, setPaymentProof] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  })

  useEffect(() => {
    fetchTransactionDetails()
  }, [id])

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/order/show/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      console.log("order details response:", response.data)
      setTransaction(response.data.data)
    } catch (error) {
      console.error("Error fetching transaction details:", error)
      setError("An error occurred while fetching transaction details")
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    // Handle different price formats
    let numericPrice = 0

    if (typeof price === "string") {
      // Remove non-numeric characters if price is a string (like "Rp 150.000")
      numericPrice = Number.parseFloat(price.replace(/[^\d]/g, "")) || 0
    } else {
      numericPrice = Number.parseFloat(price) || 0
    }

    return `Rp ${numericPrice.toLocaleString("id-ID")}`
  }

  const handleDrop = (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      // Check if file is an image
      if (!file.type.match("image.*")) {
        setSnackbar({
          open: true,
          message: "Please upload an image file",
          severity: "error",
        })
        return
      }

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: "File size should not exceed 2MB",
          severity: "error",
        })
        return
      }

      setPaymentProof(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadProof = async (e) => {
    e.preventDefault()

    if (!paymentProof) {
      setSnackbar({
        open: true,
        message: "Please upload payment proof first",
        severity: "warning",
      })
      return
    }

    try {
      setUploading(true)

      const formData = new FormData()
      formData.append("transaction_id", transaction.transaction_id)
      formData.append("bukti_pembayaran", paymentProof)

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/order/checkout/buktibayar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        },
      )

      if (response.data.success) {
        setUploadSuccess(true)
        setSnackbar({
          open: true,
          message: "Payment proof uploaded successfully",
          severity: "success",
        })
        // Refresh transaction data
        fetchTransactionDetails()
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || "Failed to upload payment proof",
          severity: "error",
        })
      }
    } catch (error) {
      console.error("Error uploading payment proof:", error)
      setSnackbar({
        open: true,
        message: "An error occurred while uploading payment proof",
        severity: "error",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return
    }
    setSnackbar({ ...snackbar, open: false })
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setSnackbar({
      open: true,
      message: "Account number copied to clipboard",
      severity: "success",
    })
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress color="primary" size={60} thickness={4} />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 3 }}>
          Loading payment details...
        </Typography>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Alert severity="error" sx={{ maxWidth: 500, mx: "auto", mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/orders")}
          sx={{
            bgcolor: "#6B4A3D",
            "&:hover": { bgcolor: "#8f5f4c" },
          }}
        >
          View My Orders
        </Button>
      </Container>
    )
  }

  if (!transaction) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Alert severity="warning" sx={{ maxWidth: 500, mx: "auto", mb: 3 }}>
          <AlertTitle>No Data</AlertTitle>
          No transaction data found
        </Alert>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/orders")}
          sx={{
            bgcolor: "#6B4A3D",
            "&:hover": { bgcolor: "#8f5f4c" },
          }}
        >
          View My Orders
        </Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box maxWidth="md" mx="auto">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/orders")}
            sx={{ color: "text.secondary" }}
          >
            Back to Orders
          </Button>

          <Box
            display="flex"
            alignItems="center"
            bgcolor="orange.50"
            color="orange.700"
            px={1.5}
            py={0.5}
            borderRadius="24px"
          >
            <InfoIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2" fontWeight="medium">
              {transaction.status === "Menunggu_Konfirmasi" ? "Payment Pending" : transaction.status.replace(/_/g, " ")}
            </Typography>
          </Box>
        </Box>

        {/* Order Details Card */}
        <Card variant="outlined" sx={{ mb: 3, overflow: "hidden" }}>
          <CardHeader
            title="Order Details"
            sx={{
              bgcolor: "#6B4A3D",
              color: "white",
              py: 2,
            }}

          />

          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3} mb={3} justifyContent="space-between" >
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Order Information
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Order ID:{" "}
                  <Box component="span" fontWeight="medium">
                    #{transaction.order_unique_id}
                  </Box>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date:{" "}
                  <Box component="span" fontWeight="medium">
                    {new Date(transaction.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </Box>
                </Typography>
                <Box mt={1}>
                  <Typography
                    variant="caption"
                    component="span"
                    sx={{
                      bgcolor: "yellow.100",
                      color: "yellow.800",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      display: "inline-block",
                    }}
                  >
                    {transaction.status.replace(/_/g, " ")}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6} sx={{ textAlign: { md: "right" } }}>
                <Typography variant="h6" gutterBottom>
                  Total Payment
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="#6B4A3D">
                  {formatPrice(transaction.total_harga)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Payment Method:{" "}
                  <Box component="span" fontWeight="medium">
                    {transaction.transaction && transaction.transaction.payment_method
                      ? transaction.transaction.payment_method
                      : "Bank Transfer"}
                  </Box>
                </Typography>
              </Grid>
            </Grid>

            {/* Payment Instructions */}
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Payment Information
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "grey.50" }}>
              {transaction.transaction && transaction.transaction.payment_method === "BCA" ? (
                <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
                  <Grid item xs={12} sm={4} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Bank
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      BCA
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      Account Number
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body1" fontWeight="medium" mr={1}>
                        2670342134
                      </Typography>
                      <Button
                        variant="text"
                        size="small"
                        startIcon={<ContentCopyIcon fontSize="small" />}
                        onClick={() => copyToClipboard("2670342134")}
                        sx={{ color: "primary.main", p: 0, minWidth: "auto" }}
                      >
                        Copy
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Account Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      Andi Setiawan
                    </Typography>
                  </Grid>
                </Grid>
              ) : (
                <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
                  <Grid item xs={12} sm={4} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Bank Transfer
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      BCA
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      Account Number
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body1" fontWeight="medium" mr={1}>
                        2670342134
                      </Typography>
                      <Button
                        variant="text"
                        size="small"
                        startIcon={<ContentCopyIcon fontSize="small" />}
                        onClick={() => copyToClipboard("2670342134")}
                        sx={{ color: "primary.main", p: 0, minWidth: "auto" }}
                      >
                        Copy
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Account Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      Andi Setiawan
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </Paper>

            <Alert severity="info" sx={{ mb: 3 }}>
              Please transfer the exact amount to make verification easier.
            </Alert>

            {/* Order Items */}
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>

            <Box sx={{ maxHeight: 300, overflow: "auto", pr: 1, mb: 3 }}>
              <Box display="flex" pb={2} borderBottom={1} borderColor="divider">
                <Box width={64} height={64} mr={2} flexShrink={0}>
                  <img
                    src={(() => {
                      // Handle custom order images
                      if (transaction.custom_order && transaction.custom_order.gambar_referensi) {
                        try {
                          const images = JSON.parse(transaction.custom_order.gambar_referensi);
                          if (Array.isArray(images) && images.length > 0) {
                            return `${process.env.REACT_APP_API_URL}/${images[0]}`;
                          }
                        } catch (e) {
                          console.error("Error parsing custom order images:", e);
                          // If parsing fails, try to use the string directly
                          return transaction.custom_order.gambar_referensi.startsWith('http')
                            ? transaction.custom_order.gambar_referensi
                            : `${process.env.REACT_APP_API_URL}/${transaction.custom_order.gambar_referensi}`;
                        }
                      }
                      
                      // Handle catalog images
                      if (transaction.catalog && transaction.catalog.gambar) {
                        if (Array.isArray(transaction.catalog.gambar) && transaction.catalog.gambar.length > 0) {
                          return `${process.env.REACT_APP_API_URL}/${transaction.catalog.gambar[0]}`;
                        } else if (typeof transaction.catalog.gambar === 'string') {
                          return transaction.catalog.gambar.startsWith('http')
                            ? transaction.catalog.gambar
                            : `${process.env.REACT_APP_API_URL}/${transaction.catalog.gambar}`;
                        }
                      }
                      
                      // Fallback to placeholder
                      return "/placeholder.svg?height=80&width=80";
                    })()}
                    alt={transaction.custom_order 
                      ? transaction.custom_order.jenis_baju 
                      : transaction.catalog 
                        ? transaction.catalog.nama_katalog 
                        : "Product"}
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px" }}
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=80&width=80";
                    }}
                  />
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {transaction.custom_order 
                      ? transaction.custom_order.jenis_baju 
                      : transaction.catalog 
                        ? transaction.catalog.nama_katalog 
                        : "Product"}
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} mt={0.5}>
                    {/* For custom orders - show material */}
                    {transaction.custom_order && transaction.custom_order.detail_bahan && (
                      <Typography variant="caption" sx={{ bgcolor: "grey.100", px: 1, py: 0.5, borderRadius: 1 }}>
                        Material: {transaction.custom_order.detail_bahan}
                      </Typography>
                    )}
                    
                    {/* For catalog orders - show color and size */}
                    {transaction.color && typeof transaction.color === "object" && (
                      <Typography variant="caption" sx={{ bgcolor: "grey.100", px: 1, py: 0.5, borderRadius: 1 }}>
                        Color: {transaction.color.color_name || "N/A"}
                      </Typography>
                    )}
                    {transaction.size && typeof transaction.size === "object" && (
                      <Typography variant="caption" sx={{ bgcolor: "grey.100", px: 1, py: 0.5, borderRadius: 1 }}>
                        Size: {transaction.size.size || "N/A"}
                      </Typography>
                    )}
                    
                    {/* For custom orders with source of fabric */}
                    {transaction.custom_order && transaction.custom_order.sumber_kain && (
                      <Typography variant="caption" sx={{ bgcolor: "grey.100", px: 1, py: 0.5, borderRadius: 1 }}>
                        Sumber Kain: {transaction.custom_order.sumber_kain}
                      </Typography>
                    )}
                    
                    {/* Quantity */}
                    <Typography variant="caption" sx={{ bgcolor: "grey.100", px: 1, py: 0.5, borderRadius: 1 }}>
                      Quantity: {transaction.jumlah || 
                        (transaction.custom_order && transaction.custom_order.sizes ? 
                          transaction.custom_order.sizes.reduce((total, size) => total + size.jumlah, 0) : 1)}
                    </Typography>
                  </Box>
                </Box>
                <Box textAlign="right">
                  <Typography variant="body2" color="text.secondary">
                    {formatPrice(transaction.custom_order ? 
                      transaction.custom_order.total_harga / transaction.jumlah || transaction.custom_order.total_harga : 
                      transaction.catalog ? transaction.catalog.price : 0)} 
                    x {transaction.jumlah || 1}
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatPrice(transaction.total_harga)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Subtotal
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatPrice(transaction.total_harga - 2500)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Application Fee
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatPrice(2500)}
                </Typography>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="subtitle1" fontWeight="bold">
                  Total
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {formatPrice(transaction.total_harga)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Payment Proof Upload */}
        {(() => {
          // Get the payment status - check multiple locations where it might exist
          const paymentStatus = 
            (transaction.transaction && transaction.transaction.status) || 
            transaction.status_pembayaran || 
            transaction.status;
          
          // Check if the status is a success status (using various possible success status values)
          const isSuccessStatus = ['success', 'diproses', 'approve', 'selesai', 'completed'].some(
            term => paymentStatus?.toLowerCase().includes(term)
          );
          
          // Check if the status is expired
          const isExpiredStatus = ['expired', 'kadaluarsa'].some(
            term => paymentStatus?.toLowerCase().includes(term)
          );

          // Case 1: Payment approved/success - Just show the uploaded proof (no re-upload)
          if (isSuccessStatus) {
            return (
              <Card variant="outlined" sx={{ mb: 3, p: 3 }}>
                <Box textAlign="center">
                  <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Payment Verified
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Your payment has been verified and your order is being processed.
                  </Typography>

                  {/* Display the uploaded payment proof */}
                  {(transaction.bukti_pembayaran || 
                    (transaction.transaction && transaction.transaction.bukti_transfer)) && (
                    <Box mt={3} maxWidth={300} mx="auto">
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Payment proof:
                      </Typography>
                      <img
                        src={`${process.env.REACT_APP_API_URL}/${transaction.bukti_pembayaran || transaction.transaction.bukti_transfer}`}
                        alt="Payment Proof"
                        style={{
                          maxHeight: "256px",
                          maxWidth: "100%",
                          borderRadius: "8px",
                          border: "1px solid #e0e0e0",
                        }}
                        onError={(e) => {
                          e.target.src = "/placeholder.svg?height=256&width=200";
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Card>
            );
          }
          
          // Case 2: Payment expired - Show expired message (no re-upload)
          else if (isExpiredStatus) {
            return (
              <Card variant="outlined" sx={{ mb: 3, overflow: "hidden" }}>
                <CardHeader
                  title="Payment Expired"
                  sx={{
                    bgcolor: "#9e9e9e", // Grey color for expired
                    color: "white",
                    py: 2,
                  }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    <AlertTitle>Payment Time Expired</AlertTitle>
                    <Typography variant="body2">
                      The payment window for this order has expired. Please contact customer service if you still want to proceed with this order.
                    </Typography>
                  </Alert>

                  <Box textAlign="center" mt={3}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => window.location.href = "/contact"}
                      sx={{
                        bgcolor: "#6B4A3D",
                        "&:hover": { bgcolor: "#8f5f4c" },
                      }}
                    >
                      Contact Customer Service
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            );
          }
          
          // Case 3: All other statuses (including rejected, pending, etc.) - Allow payment upload or re-upload
          else {
            // Get appropriate title and message based on status
            let cardTitle = "Upload Payment Proof";
            let headerColor = "#6B4A3D";
            let infoMessage = "Please upload your payment proof to complete your order. We accept bank transfer receipts, screenshots, or photos of your payment.";
            
            const isRejected = ['failure', 'canceled', 'rejected', 'ditolak'].some(
              term => paymentStatus?.toLowerCase().includes(term)
            );
            
            if (isRejected) {
              cardTitle = "Payment Proof Rejected";
              headerColor = "#d32f2f";
              infoMessage = "Please upload a new payment proof to continue with your order.";
            }
            
            // Check if a proof has already been uploaded but is awaiting verification
            const hasUploadedProof = transaction.bukti_pembayaran || 
              (transaction.transaction && transaction.transaction.bukti_transfer) ||
              uploadSuccess;
              
            return (
              <Card variant="outlined" sx={{ mb: 3, overflow: "hidden" }}>
                <CardHeader
                  title={hasUploadedProof && !isRejected ? "Payment Proof Awaiting Verification" : cardTitle}
                  sx={{
                    bgcolor: hasUploadedProof && !isRejected ? "#1976d2" : headerColor,
                    color: "white",
                    py: 2,
                  }}
                />

                <CardContent sx={{ p: 3 }}>
                  {/* Show rejection message if payment was rejected */}
                  {isRejected && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      <AlertTitle>Payment Proof Rejected</AlertTitle>
                      <Typography variant="body2">
                        Your payment proof was rejected. Reason: 
                        {transaction.alasan_ditolak || transaction.custom_order?.alasan_diTolak || "Invalid or unclear payment proof"}
                      </Typography>
                    </Alert>
                  )}

                  {/* Show previously uploaded proof if any */}
                  {hasUploadedProof && (
                    <Box mt={2} mb={3} textAlign="center">
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        {isRejected ? "Previously uploaded payment proof:" : "Uploaded payment proof:"}
                      </Typography>
                      <img
                        src={`${process.env.REACT_APP_API_URL}/${transaction.bukti_pembayaran || transaction.transaction.bukti_transfer}`}
                        alt={isRejected ? "Rejected Payment Proof" : "Payment Proof"}
                        style={{
                          maxHeight: "200px",
                          maxWidth: "100%",
                          borderRadius: "8px",
                          border: "1px solid #e0e0e0",
                          opacity: isRejected ? "0.7" : "1"
                        }}
                        onError={(e) => {
                          e.target.src = "/placeholder.svg?height=200&width=150";
                        }}
                      />
                    </Box>
                  )}

                  {/* Show info message */}
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    {hasUploadedProof && !isRejected 
                      ? "Your payment proof has been uploaded and is awaiting verification. We will process it shortly." 
                      : infoMessage}
                  </Typography>

                  {/* Always show upload form for non-success, non-expired statuses */}
                  {(!hasUploadedProof || isRejected || paymentStatus === "pending") && (
                    <form onSubmit={handleUploadProof}>
                      <Box mb={3}>
                        <Dropzone onDrop={handleDrop} accept={{ "image/*": [] }} maxSize={2097152}>
                          {({ getRootProps, getInputProps }) => (
                            <Box
                              {...getRootProps()}
                              sx={{
                                border: "2px dashed",
                                borderColor: previewImage ? "success.200" : "grey.300",
                                borderRadius: 1,
                                p: 3,
                                textAlign: "center",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                bgcolor: previewImage ? "success.50" : "transparent",
                                "&:hover": {
                                  borderColor: previewImage ? "success.300" : "#6B4A3D",
                                  bgcolor: previewImage ? "success.50" : "grey.50",
                                },
                              }}
                            >
                              <input {...getInputProps()} />

                              {previewImage ? (
                                <Box>
                                  <img
                                    src={previewImage || "/placeholder.svg"}
                                    alt="Payment proof preview"
                                    style={{
                                      maxHeight: "256px",
                                      margin: "0 auto 16px",
                                      borderRadius: "8px",
                                    }}
                                  />
                                  <Typography variant="body2" color="text.secondary">
                                    Click or drag to replace the image
                                  </Typography>
                                </Box>
                              ) : (
                                <Box>
                                  <UploadFileIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
                                  <Typography variant="body1" color="text.secondary">
                                    Click or drag and drop to upload {isRejected ? "new " : ""}payment proof
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" mt={0.5}>
                                    JPG, PNG (Max 2MB)
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          )}
                        </Dropzone>
                      </Box>

                      {!isRejected && (
                        <Alert severity="warning" sx={{ mb: 3 }}>
                          <AlertTitle>Important</AlertTitle>
                          <Typography variant="body2">Make sure your payment proof clearly shows:</Typography>
                          <List dense disablePadding>
                            <ListItem sx={{ py: 0 }}>
                              <ListItemText primary="Transaction date and time" />
                            </ListItem>
                            <ListItem sx={{ py: 0 }}>
                              <ListItemText primary="Amount paid" />
                            </ListItem>
                            <ListItem sx={{ py: 0 }}>
                              <ListItemText primary="Recipient account/number" />
                            </ListItem>
                            <ListItem sx={{ py: 0 }}>
                              <ListItemText primary="Transaction status (successful)" />
                            </ListItem>
                          </List>
                        </Alert>
                      )}

                      <Button
                        type="submit"
                        variant="contained"
                        disabled={!paymentProof || uploading}
                        fullWidth
                        size="large"
                        startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadFileIcon />}
                        sx={{
                          py: 1.5,
                          bgcolor: "#6B4A3D",
                          "&:hover": { bgcolor: "#8f5f4c" },
                          opacity: !paymentProof || uploading ? 0.7 : 1,
                        }}
                      >
                        {uploading ? "Uploading..." : isRejected ? "Upload New Payment Proof" : "Upload Payment Proof"}
                      </Button>
                    </form>
                  )}

                  {/* If proof is uploaded but not rejected, show option to upload new one */}
                  {hasUploadedProof && !isRejected && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setPreviewImage(null);
                        setPaymentProof(null);
                        setUploadSuccess(false);
                      }}
                      sx={{ mt: 2 }}
                      startIcon={<UploadFileIcon />}
                    >
                      Upload New Payment Proof
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          }
        })()}

        {/* Tracking Map Section */}
        {transaction.delivery_location && (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardHeader
              title="Tracking Paket"
              sx={{
                bgcolor: "#6B4A3D",
                color: "white",
                py: 2,
              }}
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Lokasi paket Anda saat ini:
              </Typography>
              <div style={{ height: 300, width: "100%", borderRadius: 8, overflow: "hidden" }}>
                <MapContainer
                  center={[
                    transaction.delivery_location.latitude,
                    transaction.delivery_location.longitude,
                  ]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker
                    position={[
                      transaction.delivery_location.latitude,
                      transaction.delivery_location.longitude,
                    ]}
                  >
                    <Popup>
                      Paket sedang {transaction.delivery_location.status || "dikirim"}.
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tombol View All Orders */}
        <Box textAlign="center">
          <Button variant="outlined" onClick={() => navigate("/orders")} sx={{ px: 3, py: 1 }}>
            View All Orders
          </Button>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default PaymentPage
