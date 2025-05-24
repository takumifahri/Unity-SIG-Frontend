import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Typography,
  Card,
  CardContent,
  Box,
  Container,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Chip,
  Rating,
  TextField,
  Collapse
} from "@mui/material"
import axios from "axios"
// Add this import at the top of your file with other imports
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import IconButton from "@mui/material/IconButton"
// First, add these imports at the top of your file
import LocationOnIcon from "@mui/icons-material/LocationOn"
import LocalShippingIcon from "@mui/icons-material/LocalShipping"
import Timeline from "@mui/lab/Timeline"
import TimelineItem from "@mui/lab/TimelineItem"
import TimelineSeparator from "@mui/lab/TimelineSeparator"
import TimelineConnector from "@mui/lab/TimelineConnector"
import TimelineContent from "@mui/lab/TimelineContent"
import TimelineDot from "@mui/lab/TimelineDot"
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent"
import { usePemesanan } from "../context/PemesananContext"
import Swal from "sweetalert2"
import ZoomInIcon from "@mui/icons-material/ZoomIn"
import DownloadIcon from "@mui/icons-material/Download"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import CloseIcon from "@mui/icons-material/Close"
import DeliveryTrackingMap from "../components/DeliveryTrackingMap"
import OrderDetailsSkeleton from "../components/OrderDetailSkeleton"
import RateReviewIcon from "@mui/icons-material/RateReview"
import UploadIcon from "@mui/icons-material/Upload"
import { AddPhotoAlternate } from "@mui/icons-material"
import { ExpandMore, ExpandLess } from "@mui/icons-material"

const OrderDetail = () => {
  const { orderUniqueId } = useParams() // Get order_unique_id from URL
  const navigate = useNavigate()
  const { getOrderByUniqueId, loading, error, adminVerifyPayment, sendToDelivery, recievedUser, completeOrder } =
    usePemesanan()
  const [orderDetail, setOrderDetail] = useState(null)
  const [currentTab, setCurrentTab] = useState("details")
  const [mainImage, setMainImage] = useState(0) // State for tracking the currently displayed main image index
  const [openImageDialog, setOpenImageDialog] = useState(false)
  const [dialogImageUrl, setDialogImageUrl] = useState("")
  const [openReviewDialog, setOpenReviewDialog] = useState(false)
  const [reviewData, setReviewData] = useState({
    ratings: 5,
    ulasan: "",
    gambar_produk: [],
  })
  const [reviewImages, setReviewImages] = useState([])
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  // Status mapping for timeline
  const statusMapping = {
    Menunggu_Pembayaran: {
      title: "Menunggu Pembayaran",
      description: "Menunggu pembayaran dari pelanggan",
    },
    Menunggu_Konfirmasi: {
      title: "Menunggu Konfirmasi",
      description: "Menunggu konfirmasi pembayaran dari admin",
    },
    Diproses: {
      title: "Diproses",
      description: "Pesanan sedang diproses oleh tim kami",
    },
    Sedang_Dikirim: {
      title: "Pengiriman",
      description: "Pesanan sedang dalam proses pengiriman",
    },
    Sudah_Terkirim: {
      title: "Diterima",
      description: "Pesanan sudah diterima oleh pelanggan",
    },
    Selesai: {
      title: "Selesai",
      description: "Pesanan telah selesai",
    },
  }

  // Fetch order details when component mounts
  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        console.log("Fetching order with ID:", orderUniqueId)
        const data = await getOrderByUniqueId(orderUniqueId)
        console.log("Order details:", data)
        setOrderDetail(data.data)
        setMainImage(0) // Reset main image when loading new order
      } catch (err) {
        console.error("Failed to fetch order details:", err)
      }
    }

    if (orderUniqueId) {
      fetchOrderDetail()
    }
  }, [orderUniqueId])

  // Helper function to change the main image
  const handleImageChange = (index) => {
    setMainImage(index)
  }

  // Function to get product images array
  const getProductImages = () => {
    if (!orderDetail || !orderDetail.catalog) return []

    if (orderDetail.catalog.gambar) {
      if (Array.isArray(orderDetail.catalog.gambar)) {
        return orderDetail.catalog.gambar
      } else if (typeof orderDetail.catalog.gambar === "string") {
        return [orderDetail.catalog.gambar]
      }
    }
    return []
  }

  // Get the main image URL
  const getMainImageUrl = () => {
    const images = getProductImages()
    if (images.length === 0) return "/placeholder.jpg"

    const index = mainImage < images.length ? mainImage : 0
    return `${process.env.REACT_APP_API_URL}/${images[index]}`
  }

  // Function to handle status changes
  const handleStatusChange = async (newStatus) => {
    try {
      Swal.fire({
        title: "Konfirmasi",
        text: `Apakah Anda yakin ingin mengubah status pesanan menjadi ${newStatus.replace("_", " ")}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, Ubah Status",
        cancelButtonText: "Batal",
        confirmButtonColor: "#a97142",
      }).then(async (result) => {
        if (result.isConfirmed) {
          let response

          switch (newStatus) {
            case "Selesai":
              response = await completeOrder(orderDetail.id)
              break

            default:
              Swal.fire("Error", "Status tidak valid", "error")
              return
          }

          if (newStatus !== "Sudah_Terkirim") {
            Swal.fire("Sukses", "Status pesanan berhasil diubah", "success")
            // Refresh order data
            const updatedData = await getOrderByUniqueId(orderUniqueId)
            setOrderDetail(updatedData.data)
          }
        }
      })
    } catch (err) {
      console.error("Error updating order status:", err)
      Swal.fire("Error", "Gagal mengubah status pesanan", "error")
    }
  }

 
  // Format currency
  const formatCurrency = (amount) => {
    return amount ? `Rp ${Number.parseInt(amount).toLocaleString("id-ID")}` : "Rp 0"
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleDateString("id-ID", options)
  }

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "menunggu_pembayaran":
        return { bg: "#FFF9C4", text: "#F57F17" }
      case "menunggu_konfirmasi":
        return { bg: "#BBDEFB", text: "#1565C0" }
      case "diproses":
        return { bg: "#C8E6C9", text: "#2E7D32" }
      case "sedang_dikirim":
        return { bg: "#E1BEE7", text: "#6A1B9A" }
      case "sudah_terkirim":
        return { bg: "#B2EBF2", text: "#00838F" }
      case "selesai":
        return { bg: "#D9B99B", text: "#75584A" }
      default:
        return { bg: "#ECEFF1", text: "#546E7A" }
    }
  }

  // Generate order timeline steps
  const generateOrderTimelineSteps = () => {
    const steps = []
    const statuses = [
      "Menunggu_Pembayaran",
      "Menunggu_Konfirmasi",
      "Diproses",
      "Sedang_Dikirim",
      "Sudah_Terkirim",
      "Selesai",
    ]

    if (!orderDetail || !orderDetail.status) return steps

    const currentStatusIndex = statuses.indexOf(orderDetail.status)
    if (currentStatusIndex === -1) return steps

    for (let i = 0; i <= currentStatusIndex; i++) {
      const status = statuses[i]
      steps.push({
        date: formatDate(orderDetail.created_at),
        time: new Date(orderDetail.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        title: statusMapping[status].title,
        description: statusMapping[status].description,
        active: i === currentStatusIndex,
      })
    }

    return steps
  }
  // Replace the existing handleOpenReviewDialog function
  const handleOpenReviewDialog = () => {
    setReviewData({
      ratings: 5,
      ulasan: "",
      gambar_produk: [],
    })
    setReviewImages([])
    setOpenReviewDialog(!openReviewDialog) // Toggle instead of setting to true
  }

  // Replace the existing handleCloseReviewDialog function
  const handleCloseReviewDialog = () => {
    setOpenReviewDialog(false)
  }
  const handleReviewChange = (e) => {
    const { name, value } = e.target
    setReviewData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleRatingChange = (event, newValue) => {
    setReviewData((prev) => ({
      ...prev,
      ratings: newValue,
    }))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length === 0) return;
    
    if (reviewImages.length + files.length > 5) {
      Swal.fire("Error", "Maksimal 5 gambar yang dapat diunggah", "error");
      return;
    }
  
    // Preview images
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
  
    // Combine existing and new images
    setReviewImages(prev => [...prev, ...newImages]);
    setReviewData((prev) => ({
      ...prev,
      gambar_produk: [...prev.gambar_produk, ...files],
    }));
  }
  useEffect(() => {
    // Clean up object URLs when component unmounts
    return () => {
      reviewImages.forEach(image => {
        if (image.preview) URL.revokeObjectURL(image.preview);
      });
    };
  }, [reviewImages]);
  const removeImage = (index) => {
    const updatedImages = [...reviewImages]
    URL.revokeObjectURL(updatedImages[index].preview) // Clean up object URL
    updatedImages.splice(index, 1)
    setReviewImages(updatedImages)
  
    const updatedFiles = [...reviewData.gambar_produk]
    updatedFiles.splice(index, 1)
    setReviewData((prev) => ({
      ...prev,
      gambar_produk: updatedFiles,
    }))
  }

  const submitReview = async () => {
    if (!reviewData.ulasan.trim()) {
      Swal.fire("Error", "Ulasan tidak boleh kosong", "error")
      return
    }
  
    try {
      setIsSubmittingReview(true)
  
      const formData = new FormData()
      formData.append("ratings", reviewData.ratings)
      formData.append("ulasan", reviewData.ulasan)
  
      if (reviewData.gambar_produk.length > 0) {
        reviewData.gambar_produk.forEach((file) => {
          formData.append("gambar_produk[]", file)
        })
      }
  
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/reviews/addReviews/${orderDetail.id}`, 
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )
  
      const result = response.data
  
      if (result.status) {
        Swal.fire({
          title: "Sukses",
          text: "Ulasan berhasil ditambahkan",
          icon: "success",
          confirmButtonColor: "#D9B99B",
        })
        handleCloseReviewDialog()
  
        // Refresh order data to update isReviewed status
        const updatedData = await getOrderByUniqueId(orderUniqueId)
        setOrderDetail(updatedData.data)
      } else {
        throw new Error(result.message || "Gagal menambahkan ulasan")
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || error.message || "Gagal menambahkan ulasan",
        icon: "error",
        confirmButtonColor: "#D9B99B",
      })
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const renderActionButton = () => {
    if (!orderDetail) return null

    switch (orderDetail.status) {
      case "Menunggu_Konfirmasi":
        return (
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", width: "100%" }}>
            <Button
              variant="contained"
              onClick={() => handleStatusChange("Diproses")}
              sx={{
                bgcolor: "#2E7D32",
                "&:hover": { bgcolor: "#1B5E20" },
                mb: 2,
                flex: 1,
                maxWidth: "250px",
              }}
            >
              Terima Pembayaran
            </Button>
            <Button
              variant="contained"
              onClick={() => handlePaymentRejection()}
              sx={{
                bgcolor: "#C62828",
                "&:hover": { bgcolor: "#B71C1C" },
                mb: 2,
                flex: 1,
                maxWidth: "250px",
              }}
            >
              Tolak Pembayaran
            </Button>
          </Box>
        )

      case "Diproses":
        return (
          <Button
            variant="contained"
            onClick={() => handleStatusChange("Sedang_Dikirim")}
            sx={{
              bgcolor: "#6A1B9A",
              "&:hover": { bgcolor: "#4A148C" },
              mb: 2,
              width: "100%",
              mx: "auto",
            }}
          >
            Kirim Pesanan
          </Button>
        )

      case "Sedang_Dikirim":
        return (
          <Button
            variant="contained"
            onClick={() => handleStatusChange("Sudah_Terkirim")}
            sx={{
              bgcolor: "#00838F",
              "&:hover": { bgcolor: "#006064" },
              mb: 2,
              width: "100%",
              mx: "auto",
            }}
          >
            Konfirmasi Penerimaan
          </Button>
        )

      case "Sudah_Terkirim":
        return (
          <Button
            variant="contained"
            onClick={() => handleStatusChange("Selesai")}
            sx={{
              bgcolor: "#2E7D32",
              "&:hover": { bgcolor: "#1B5E20" },
              mb: 2,
              width: "100%",
            }}
          >
            Tandai Selesai
          </Button>
        )

        case "Selesai":
          // Add review button for completed orders that haven't been reviewed yet
          if (!orderDetail.isReviewed) {
            return (
              <Box sx={{ width: "100%" }}>
                {!openReviewDialog ? (
                  <Button
                    variant="contained"
                    startIcon={<RateReviewIcon />}
                    onClick={handleOpenReviewDialog}
                    sx={{
                      bgcolor: "#D9B99B",
                      "&:hover": { bgcolor: "#C2A07B" },
                      mb: 2,
                      width: "100%",
                      fontWeight: 600,
                      py: { xs: 1.5, sm: 1.8, md: 2 },
                      fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" }
                    }}
                  >
                    Beri Ulasan Produk
                  </Button>
                ) : (
                  <Box 
                    sx={{ 
                      width: "100%",
                      border: { xs: "1px solid #D9B99B", sm: "2px solid #D9B99B" },
                      borderRadius: { xs: "10px", sm: "12px", md: "16px" },
                      overflow: "hidden",
                      boxShadow: { 
                        xs: "0 4px 8px rgba(0,0,0,0.08)",
                        sm: "0 6px 12px rgba(0,0,0,0.08)",
                        md: "0 8px 16px rgba(0,0,0,0.08)"
                      },
                      backgroundColor: "#fff",
                      mt: 2,
                      mb: 4,
                    }}
                  >
                    {/* Header */}
                    <Box sx={{ 
                      bgcolor: "#D9B99B", 
                      p: { xs: 1.5, sm: 2, md: 2.5 }, 
                      display: "flex", 
                      justifyContent: "space-between",
                      alignItems: "center" 
                    }}>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          color: "#fff", 
                          fontWeight: 600,
                          fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" }
                        }}
                      >
                        Berikan Ulasan Anda
                      </Typography>
                      <IconButton 
                        onClick={handleCloseReviewDialog}
                        sx={{ color: "#fff" }}
                        size={window.innerWidth < 600 ? "small" : "medium"}
                      >
                        <CloseIcon sx={{ fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.5rem" } }} />
                      </IconButton>
                    </Box>

                    {/* Content */}
                    <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                      {/* Product Info */}
                      <Box sx={{ 
                        display: "flex", 
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "center", sm: "flex-start" }, 
                        gap: { xs: 1.5, sm: 2 }, 
                        p: { xs: 1.5, sm: 2 }, 
                        mb: 3,
                        bgcolor: "#f9f4ef", 
                        borderRadius: { xs: "6px", sm: "8px" },
                        textAlign: { xs: "center", sm: "left" }
                      }}>
                        <Box
                          component="img"
                          src={getMainImageUrl()}
                          alt={orderDetail?.catalog?.nama_katalog || "Product Image"}
                          sx={{
                            width: { xs: 110, sm: 80, md: 100 },
                            height: { xs: 110, sm: 80, md: 100 },
                            borderRadius: { xs: "6px", sm: "8px" },
                            objectFit: "cover",
                            border: "1px solid #eee"
                          }}
                          onError={(e) => {
                            e.target.src = "/placeholder.jpg"
                          }}
                        />
                        <Box sx={{ width: { xs: "100%", sm: "calc(100% - 100px)" } }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600, 
                              color: "#75584A",
                              fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                              lineHeight: 1.3
                            }}
                          >
                            {orderDetail?.catalog?.nama_katalog}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ mt: { xs: 0.5, sm: 1 } }}
                          >
                            {orderDetail?.color?.color_name} • {orderDetail?.size?.size} • {orderDetail?.jumlah || 1} pcs
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 600, 
                              color: "#D9B99B", 
                              mt: 0.5,
                              fontSize: { xs: "0.85rem", md: "0.95rem" }
                            }}
                          >
                            {formatCurrency(orderDetail?.catalog?.price)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {/* Rating */}
                      <Box sx={{ mb: 3, textAlign: "center" }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            mb: 1, 
                            fontWeight: 600, 
                            color: "#75584A",
                            fontSize: { xs: "0.95rem", sm: "1rem", md: "1.1rem" } 
                          }}
                        >
                          Berikan Penilaian
                        </Typography>
                        <Rating
                          name="ratings"
                          value={reviewData.ratings}
                          onChange={handleRatingChange}
                          size={window.innerWidth < 600 ? "medium" : "large"}
                          sx={{
                            fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.5rem" },
                            "& .MuiRating-iconFilled": { color: "#D9B99B" },
                            "& .MuiRating-iconHover": { color: "#C2A07B" },
                          }}
                        />
                      </Box>
                      
                      {/* Review Text */}
                      <Box sx={{ mb: 3 }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            mb: 1, 
                            fontWeight: 600, 
                            color: "#75584A",
                            fontSize: { xs: "0.95rem", sm: "1rem", md: "1.1rem" } 
                          }}
                        >
                          Ulasan Anda
                        </Typography>
                        <TextField
                          name="ulasan"
                          value={reviewData.ulasan}
                          onChange={handleReviewChange}
                          placeholder={window.innerWidth < 600 ? 
                            "Bagaimana pengalaman Anda dengan produk ini?" : 
                            "Bagaimana pengalaman Anda dengan produk ini? Apakah kualitasnya sesuai harapan?"
                          }
                          multiline
                          rows={window.innerWidth < 600 ? 3 : window.innerWidth < 960 ? 3 : 4}
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: { xs: "6px", sm: "8px" },
                              fontSize: { xs: "0.9rem", sm: "1rem" },
                              "&.Mui-focused fieldset": {
                                borderColor: "#D9B99B",
                                borderWidth: { xs: "1px", sm: "2px" }
                              },
                            },
                          }}
                        />
                      </Box>
                      
                      {/* Image Upload */}
                      <Box sx={{ mb: 3 }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            mb: { xs: 1, sm: 1.5 }, 
                            fontWeight: 600, 
                            color: "#75584A",
                            fontSize: { xs: "0.95rem", sm: "1rem", md: "1.1rem" },
                            display: "flex",
                            alignItems: "center",
                            gap: 1
                          }}
                        >
                          <AddPhotoAlternate fontSize="small" /> Foto Produk (Opsional)
                        </Typography>
                        
                        <Box 
                          sx={{ 
                            display: "flex", 
                            gap: { xs: 1, sm: 1.5, md: 2 },
                            flexWrap: "wrap",
                            justifyContent: { xs: "center", sm: "flex-start" }
                          }}
                        >
                          {/* Upload Box */}
                          <Box
                            sx={{
                              width: "100%",
                              height: { xs: 90, sm: 100, md: 120 },
                              border: '2px dashed #D9B99B',
                              borderRadius: { xs: "6px", sm: "8px" },
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: '0.2s',
                              '&:hover': {
                                backgroundColor: 'rgba(217, 185, 155, 0.05)',
                              },
                            }}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('review-image-upload').click()}
                          >
                            <AddPhotoAlternate sx={{ 
                              color: '#D9B99B', 
                              fontSize: { xs: 24, sm: 28, md: 36 }, 
                              mb: 0.5 
                            }} />
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                textAlign: 'center', 
                                color: '#75584A',
                                fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' }
                              }}
                            >
                              {reviewImages.length}/5 foto
                            </Typography>
                            <input
                              type="file"
                              id="review-image-upload"
                              hidden
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                            />
                          </Box>
                          
                          {/* Image Previews */}
                          {reviewImages.map((img, index) => (
                            <Box
                              key={index}
                              sx={{
                                position: "relative",
                                width: { xs: 90, sm: 100, md: 120 },
                                height: { xs: 90, sm: 100, md: 120 },
                                borderRadius: { xs: "6px", sm: "8px" },
                                overflow: "hidden",
                                border: "1px solid #eee",
                                boxShadow: { xs: "0 1px 3px rgba(0,0,0,0.08)", sm: "0 2px 4px rgba(0,0,0,0.08)" }
                              }}
                            >
                              <Box
                                component="img"
                                src={img.preview}
                                alt={`Preview ${index}`}
                                sx={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => removeImage(index)}
                                sx={{
                                  position: "absolute",
                                  top: 4,
                                  right: 4,
                                  bgcolor: "rgba(255,255,255,0.9)",
                                  width: { xs: 22, sm: 24, md: 28 },
                                  height: { xs: 22, sm: 24, md: 28 },
                                  padding: { xs: 0.2, sm: 0.3, md: 0.4 },
                                  "&:hover": { bgcolor: "white" },
                                }}
                              >
                                <CloseIcon fontSize="small" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem', md: '1rem' } }} />
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                      
                      {/* Actions */}
                      <Box sx={{ 
                        display: "flex", 
                        justifyContent: { xs: "center", sm: "flex-end" },
                        flexDirection: { xs: "column", sm: "row" },
                        gap: { xs: 1.5, sm: 2 },
                        mt: { xs: 3, sm: 4 },
                        pt: { xs: 2, sm: 3 },
                        borderTop: "1px solid #f0e6d9"
                      }}>
                        <Button
                          variant="outlined"
                          onClick={handleCloseReviewDialog}
                          fullWidth={window.innerWidth < 600}
                          sx={{
                            color: "#75584A",
                            borderColor: "#D9B99B",
                            "&:hover": {
                              borderColor: "#C2A07B",
                              bgcolor: "rgba(217, 185, 155, 0.05)",
                            },
                            py: { xs: 1, sm: 1.2 },
                            px: { xs: 2, sm: 3 },
                            order: { xs: 2, sm: 1 },
                            fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" }
                          }}
                        >
                          Batalkan
                        </Button>
                        <Button
                          variant="contained"
                          onClick={submitReview}
                          disabled={isSubmittingReview}
                          fullWidth={window.innerWidth < 600}
                          sx={{
                            bgcolor: "#D9B99B",
                            "&:hover": { bgcolor: "#C2A07B" },
                            py: { xs: 1, sm: 1.2 },
                            px: { xs: 2, sm: 3, md: 4 },
                            order: { xs: 1, sm: 2 },
                            fontWeight: 600,
                            fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" }
                          }}
                          startIcon={isSubmittingReview ? null : <RateReviewIcon sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }} />}
                        >
                          {isSubmittingReview ? "Mengirim..." : "Kirim Ulasan"}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            )
          }
          return null
      default:
        return null
    }
  }

  // Add these functions to your component
  const handleOpenImageDialog = (imageUrl) => {
    // Make sure the URL is valid
    if (!imageUrl) {
      Swal.fire("Error", "Gambar tidak ditemukan", "error")
      return
    }

    // Set dialog image URL and open the dialog
    setDialogImageUrl(imageUrl)
    setOpenImageDialog(true)
  }

  const handleCloseImageDialog = () => {
    setOpenImageDialog(false)
  }

  const downloadImage = async (imageUrl, imageName = "bukti-pembayaran") => {
    try {
      // Show loading indicator
      Swal.fire({
        title: "Mengunduh...",
        text: "Sedang mengunduh gambar",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      // Create a temporary anchor element
      const a = document.createElement("a")

      // Open image in new tab, which browser will handle without CORS restrictions
      a.href = imageUrl
      a.target = "_blank"
      a.rel = "noopener noreferrer"

      // Click the anchor to open image in new tab
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      // Close loading dialog
      setTimeout(() => {
        Swal.close()

        // Show instructions modal
        Swal.fire({
          title: "Unduh Gambar",
          html: `
            <p>Gambar telah dibuka di tab baru.</p>
            <p>Untuk mengunduh:</p>
            <ol style="text-align:left; margin-left:20px;">
              <li>Klik kanan pada gambar</li>
              <li>Pilih "Simpan gambar sebagai" atau "Download image"</li>
              <li>Simpan dengan nama yang diinginkan</li>
            </ol>
          `,
          icon: "info",
          confirmButtonText: "Mengerti",
          confirmButtonColor: "#D9B99B",
        })
      }, 500)
    } catch (error) {
      console.error("Error downloading image:", error)
      Swal.fire("Error", "Gagal mengunduh gambar. Silakan coba lagi.", "error")
    }
  }
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ padding: 4 }}>
        <OrderDetailsSkeleton />
      </Container>
    )
  }
  const handlePaymentRejection = async () => {
    try {
      const { value: reason } = await Swal.fire({
        title: "Tolak Pembayaran",
        text: "Apakah Anda yakin ingin menolak pembayaran ini?",
        icon: "warning",
        input: "textarea",
        inputLabel: "Alasan Penolakan (Opsional)",
        inputPlaceholder: "Masukkan alasan penolakan pembayaran...",
        showCancelButton: true,
        confirmButtonText: "Ya, Tolak Pembayaran",
        cancelButtonText: "Batal",
        confirmButtonColor: "#C62828",
        cancelButtonColor: "#757575",
        inputValidator: (value) => {
          // Optional validation if needed
        },
      })

      if (reason !== undefined) {
        // User clicked confirm
        Swal.fire({
          title: "Memproses...",
          text: "Sedang memproses penolakan pembayaran",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading()
          },
        })

        // Call the adminVerifyPayment function with reject status
        const response = await adminVerifyPayment(orderDetail.id, "reject", reason)

        Swal.fire({
          title: "Sukses",
          text: "Pembayaran berhasil ditolak",
          icon: "success",
          confirmButtonColor: "#D9B99B",
        })

        // Refresh order data
        const updatedData = await getOrderByUniqueId(orderUniqueId)
        setOrderDetail(updatedData.data)
      }
    } catch (error) {
      console.error("Error rejecting payment:", error)
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Gagal menolak pembayaran",
        icon: "error",
        confirmButtonColor: "#D9B99B",
      })
    }
  }
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ padding: 4 }}>
        <Card
          sx={{
            maxWidth: 900,
            margin: "0 auto",
            border: "1px solid #D9B99B",
            borderRadius: "12px",
            padding: 4,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography color="error">{error}</Typography>
            <Button
              variant="contained"
              onClick={() => navigate(-1)}
              sx={{ mt: 2, bgcolor: "#D9B99B", "&:hover": { bgcolor: "#C2A07B" } }}
            >
              Kembali
            </Button>
          </Box>
        </Card>
      </Container>
    )
  }

  if (!error && !orderDetail) {
    return (
      <Container maxWidth="lg" sx={{ padding: 4 }}>
        <Card
          sx={{
            maxWidth: 900,
            margin: "0 auto",
            border: "1px solid #D9B99B",
            borderRadius: "12px",
            padding: 4,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography>Order not found</Typography>
            <Button
              variant="contained"
              onClick={() => navigate(-1)}
              sx={{ mt: 2, bgcolor: "#D9B99B", "&:hover": { bgcolor: "#C2A07B" } }}
            >
              Kembali
            </Button>
          </Box>
        </Card>
      </Container>
    )
  }

  const orderTimelineSteps = generateOrderTimelineSteps()
  const statusColor = getStatusColor(orderDetail.status)
  const productImages = getProductImages()
  // Add this new function after handleImageUpload
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  }

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length === 0) {
      Swal.fire("Error", "Hanya file gambar yang dapat diunggah", "error");
      return;
    }
    
    if (reviewImages.length + files.length > 5) {
      Swal.fire("Error", "Maksimal 5 gambar yang dapat diunggah", "error");
      return;
    }

    // Create preview for each file
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    // Combine existing and new images
    setReviewImages(prev => [...prev, ...newImages]);
    setReviewData((prev) => ({
      ...prev,
      gambar_produk: [...prev.gambar_produk, ...files],
    }));
  }
  return (
    <Container maxWidth="xl" sx={{ padding: 4 }}>
      <Card
        sx={{
          margin: "0 auto",
          border: "1px solid #D9B99B",
          borderRadius: "12px",
          padding: 4,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent>
          {/* Header */}
          <Box sx={{ position: "relative", mb: 4 }}>
            {/* Back button positioned at top left */}
            <IconButton
              aria-label="back"
              onClick={() => navigate(-1)}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                color: "#75584A",
                "&:hover": {
                  backgroundColor: "rgba(217, 185, 155, 0.1)",
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>

            {/* Centered heading */}
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  color: "#D9B99B",
                  marginBottom: 2,
                  fontWeight: 600,
                }}
              >
                Detail Pesanan
              </Typography>

              <Typography variant="body1" sx={{ color: "#75584A", mb: 2 }}>
                ID Pesanan: {orderDetail.order_unique_id}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 4, borderColor: "#f0e6d9" }} />

          {/* Navigation tabs */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", borderBottom: "1px solid #f0e6d9" }}>
              <Button
                onClick={() => setCurrentTab("details")}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderBottom: currentTab === "details" ? "2px solid #D9B99B" : "none",
                  borderRadius: 0,
                  color: currentTab === "details" ? "#75584A" : "text.secondary",
                  fontWeight: currentTab === "details" ? 600 : 400,
                  "&:hover": { bgcolor: "transparent", color: "#75584A" },
                }}
              >
                Informasi Pesanan
              </Button>
              <Button
                onClick={() => setCurrentTab("payment")}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderBottom: currentTab === "payment" ? "2px solid #D9B99B" : "none",
                  borderRadius: 0,
                  color: currentTab === "payment" ? "#75584A" : "text.secondary",
                  fontWeight: currentTab === "payment" ? 600 : 400,
                  "&:hover": { bgcolor: "transparent", color: "#75584A" },
                }}
              >
                Informasi Pembayaran
              </Button>
              <Button
                onClick={() => setCurrentTab("product")}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderBottom: currentTab === "product" ? "2px solid #D9B99B" : "none",
                  borderRadius: 0,
                  color: currentTab === "product" ? "#75584A" : "text.secondary",
                  fontWeight: currentTab === "product" ? 600 : 400,
                  "&:hover": { bgcolor: "transparent", color: "#75584A" },
                }}
              >
                Detail Produk
              </Button>
              {["Sedang_Dikirim", "Sudah_Terkirim", "Selesai"].includes(orderDetail.status) && (
                <Button
                  onClick={() => setCurrentTab("delivery")}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderBottom: currentTab === "delivery" ? "2px solid #D9B99B" : "none",
                    borderRadius: 0,
                    color: currentTab === "delivery" ? "#75584A" : "text.secondary",
                    fontWeight: currentTab === "delivery" ? 600 : 400,
                    "&:hover": { bgcolor: "transparent", color: "#75584A" },
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <LocalShippingIcon fontSize="small" />
                  Informasi Pengiriman
                </Button>
              )}
            </Box>
          </Box>

          {/* Content based on selected tab */}
          {currentTab === "details" && (
            <Box sx={{ marginBottom: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 4,
                  alignItems: "flex-start",
                }}
              >
                {/* Product Image and Gallery */}
                <Box
                  sx={{
                    flex: { xs: "1 1 100%", md: "0 0 40%" },
                    maxWidth: { xs: "100%", md: "40%" },
                  }}
                >
                  {/* Main Image */}
                  <Box
                    component="img"
                    src={getMainImageUrl()}
                    alt={orderDetail.catalog?.nama_katalog || "Product Image"}
                    sx={{
                      width: "100%",
                      height: "400px",
                      borderRadius: "8px",
                      objectFit: "contain",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      marginBottom: 2,
                      cursor: "pointer",
                    }}
                    onClick={() => handleOpenImageDialog(getMainImageUrl())}
                    onError={(e) => {
                      e.target.src = "/placeholder.jpg"
                    }}
                  />

                  {/* Image Thumbnails */}
                  {productImages.length > 1 && (
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,
                        justifyContent: "center",
                      }}
                    >
                      {productImages.map((image, index) => (
                        <Box
                          key={index}
                          component="img"
                          src={`${process.env.REACT_APP_API_URL}/${image}`}
                          alt={`${orderDetail.catalog.nama_katalog || "Product"} - gambar ${index + 1}`}
                          sx={{
                            width: "70px",
                            height: "70px",
                            objectFit: "cover",
                            borderRadius: "4px",
                            cursor: "pointer",
                            transition: "0.3s",
                            border: mainImage === index ? "2px solid #D9B99B" : "2px solid transparent",
                            "&:hover": {
                              transform: "scale(1.05)",
                              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                            },
                          }}
                          onClick={() => handleImageChange(index)}
                          onError={(e) => {
                            e.target.src = "/placeholder.jpg"
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Order Details Table */}
                <Box
                  sx={{
                    flex: { xs: "1 1 100%", md: "0 0 60%" },
                    maxWidth: { xs: "100%", md: "60%" },
                  }}
                >
                  <TableContainer
                    component={Paper}
                    sx={{
                      mb: 2,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      border: "1px solid #f0f0f0",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <Table>
                      <TableHead sx={{ backgroundColor: "#f9f4ef" }}>
                        <TableRow>
                          <TableCell colSpan={2}>
                            <Typography variant="h6" sx={{ fontWeight: 500, color: "#75584A" }}>
                              Detail Pesanan
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500, width: "40%" }}>Nama Produk</TableCell>
                          <TableCell>{orderDetail.catalog?.nama_katalog || "-"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Warna</TableCell>
                          <TableCell>{orderDetail.color?.color_name || "-"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Ukuran</TableCell>
                          <TableCell>{orderDetail.size?.size || "-"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Jumlah</TableCell>
                          <TableCell>{orderDetail.jumlah || "-"} pcs</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Catatan</TableCell>
                          <TableCell>{orderDetail.catatan || "-"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Tanggal Pesanan</TableCell>
                          <TableCell>{formatDate(orderDetail.created_at)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Status</TableCell>
                          <TableCell>
                            <Chip
                              label={orderDetail.status?.replace(/_/g, " ") || "Pending"}
                              size="small"
                              sx={{
                                bgcolor: statusColor.bg,
                                color: statusColor.text,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: "8px",
                      backgroundColor: "#f9f4ef",
                      border: "1px solid #D9B99B",
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 500, color: "#75584A" }}>
                      Total Harga: {formatCurrency(orderDetail.total_harga)}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            </Box>
          )}

          {currentTab === "payment" && (
            <Box sx={{ marginBottom: 4 }}>
              <TableContainer
                component={Paper}
                sx={{
                  mb: 2,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  border: "1px solid #f0f0f0",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <Table>
                  <TableHead sx={{ backgroundColor: "#f9f4ef" }}>
                    <TableRow>
                      <TableCell colSpan={2}>
                        <Typography variant="h6" sx={{ fontWeight: 500, color: "#75584A" }}>
                          Informasi Pembayaran
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500, width: "40%" }}>ID Transaksi</TableCell>
                      <TableCell>{orderDetail.transaction?.transaction_unique_id || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500 }}>Metode Pembayaran</TableCell>
                      <TableCell>{orderDetail.transaction?.payment_method || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500 }}>Tujuan Transfer</TableCell>
                      <TableCell>{orderDetail.transaction?.tujuan_transfer || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500 }}>Total</TableCell>
                      <TableCell>{formatCurrency(orderDetail.total_harga)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500 }}>Status Pembayaran</TableCell>
                      <TableCell>
                        <Chip
                          label={orderDetail.transaction?.status || "-"}
                          size="small"
                          sx={{
                            bgcolor: orderDetail.transaction?.status === "success" ? "#C8E6C9" : "#FFF9C4",
                            color: orderDetail.transaction?.status === "success" ? "#2E7D32" : "#F57F17",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500 }}>Tanggal Pembayaran</TableCell>
                      <TableCell>
                        {orderDetail.transaction ? formatDate(orderDetail.transaction.created_at) : "-"}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {orderDetail.transaction.bukti_transfer && (
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 500,
                      color: "#75584A",
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Bukti Pembayaran</span>
                    <Box>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() =>
                          downloadImage(
                            `${process.env.REACT_APP_API_URL}/${orderDetail.transaction.bukti_transfer}`,
                            `bukti-pembayaran-${orderDetail.order_unique_id}`,
                          )
                        }
                        sx={{
                          mr: 1,
                          color: "#75584A",
                          borderColor: "#D9B99B",
                          "&:hover": {
                            borderColor: "#C2A07B",
                            bgcolor: "rgba(217, 185, 155, 0.1)",
                          },
                        }}
                      >
                        Unduh
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ZoomInIcon />}
                        onClick={() =>
                          handleOpenImageDialog(
                            `${process.env.REACT_APP_API_URL}/${orderDetail.transaction.bukti_transfer}`,
                          )
                        }
                        sx={{
                          color: "#75584A",
                          borderColor: "#D9B99B",
                          "&:hover": {
                            borderColor: "#C2A07B",
                            bgcolor: "rgba(217, 185, 155, 0.1)",
                          },
                        }}
                      >
                        Lihat
                      </Button>
                    </Box>
                  </Typography>
                  <Box
                    component="img"
                    src={`${process.env.REACT_APP_API_URL}/${orderDetail.transaction.bukti_transfer}`}
                    alt="Bukti Pembayaran"
                    sx={{
                      maxWidth: "100%",
                      height: "300px",
                      borderRadius: "8px",
                      objectFit: "contain",
                      display: "block",
                      margin: "0 auto",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      handleOpenImageDialog(
                        `${process.env.REACT_APP_API_URL}/${orderDetail.transaction.bukti_transfer}`,
                      )
                    }
                  />
                </Box>
              )}
            </Box>
          )}

          {currentTab === "delivery" && (
            <Box sx={{ marginBottom: 4 }}>
              <TableContainer
                component={Paper}
                sx={{
                  mb: 4,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  border: "1px solid #f0f0f0",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <Table>
                  <TableHead sx={{ backgroundColor: "#f9f4ef" }}>
                    <TableRow>
                      <TableCell colSpan={2}>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 500, color: "#75584A", display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <LocalShippingIcon /> Informasi Pengiriman
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500, width: "40%" }}>Metode Pengiriman</TableCell>
                      <TableCell>{orderDetail.delivery_proof?.type_pengantaran || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500 }}>Status</TableCell>
                      <TableCell>
                        <Chip
                          label={orderDetail.status.replace(/_/g, " ")}
                          size="small"
                          sx={{
                            bgcolor: statusColor.bg,
                            color: statusColor.text,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                    {orderDetail.delivery_proof?.receiver_name && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 500 }}>Diterima Oleh</TableCell>
                        <TableCell>{orderDetail.delivery_proof.receiver_name}</TableCell>
                      </TableRow>
                    )}
                    {orderDetail.delivery_proof?.notes && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 500 }}>Catatan</TableCell>
                        <TableCell>{orderDetail.delivery_proof.notes}</TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500 }}>Alamat Pengiriman</TableCell>
                      <TableCell>{orderDetail.user?.address || "-"}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Map Section */}
              {orderDetail.user?.latitude && orderDetail.user?.longitude && (
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 500, color: "#75584A", mb: 2, display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <LocationOnIcon /> Peta Pengiriman
                  </Typography>

                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: "8px",
                      border: "1px solid #D9B99B",
                      overflow: "hidden",
                      height: 400,
                      position: "relative",
                    }}
                  >
                    <DeliveryTrackingMap
                      userCoords={[orderDetail.user.latitude, orderDetail.user.longitude]}
                      orderStatus={orderDetail.status}
                    />
                  </Paper>

                  <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                    <Button
                      variant="outlined"
                      href={`https://www.google.com/maps/dir/?api=1&destination=${orderDetail.user.latitude},${orderDetail.user.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: "#75584A",
                        borderColor: "#D9B99B",
                        "&:hover": {
                          borderColor: "#C2A07B",
                          bgcolor: "rgba(217, 185, 155, 0.1)",
                        },
                      }}
                      startIcon={<LocationOnIcon />}
                    >
                      Buka di Google Maps
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Receipt Image (if available) */}
              {orderDetail.delivery_proof?.image_path && (
                <Box sx={{ mt: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 500,
                      color: "#75584A",
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Bukti Penerimaan</span>
                    <Box>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() =>
                          downloadImage(
                            `${process.env.REACT_APP_API_URL}/${orderDetail.delivery_proof.image_path}`,
                            `bukti-penerimaan-${orderDetail.order_unique_id}`,
                          )
                        }
                        sx={{
                          mr: 1,
                          color: "#75584A",
                          borderColor: "#D9B99B",
                          "&:hover": {
                            borderColor: "#C2A07B",
                            bgcolor: "rgba(217, 185, 155, 0.1)",
                          },
                        }}
                      >
                        Unduh
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ZoomInIcon />}
                        onClick={() =>
                          handleOpenImageDialog(
                            `${process.env.REACT_APP_API_URL}/${orderDetail.delivery_proof.image_path}`,
                          )
                        }
                        sx={{
                          color: "#75584A",
                          borderColor: "#D9B99B",
                          "&:hover": {
                            borderColor: "#C2A07B",
                            bgcolor: "rgba(217, 185, 155, 0.1)",
                          },
                        }}
                      >
                        Lihat
                      </Button>
                    </Box>
                  </Typography>
                  <Box
                    component="img"
                    src={`${process.env.REACT_APP_API_URL}/${orderDetail.delivery_proof.image_path}`}
                    alt="Bukti Penerimaan"
                    sx={{
                      maxWidth: "100%",
                      height: "300px",
                      borderRadius: "8px",
                      objectFit: "contain",
                      display: "block",
                      margin: "0 auto",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      handleOpenImageDialog(`${process.env.REACT_APP_API_URL}/${orderDetail.delivery_proof.image_path}`)
                    }
                  />
                  {orderDetail.delivery_proof?.description && (
                    <Typography variant="body2" sx={{ mt: 2, textAlign: "center", color: "text.secondary" }}>
                      {orderDetail.delivery_proof.description}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}

          {currentTab === "product" && (
            <Box sx={{ marginBottom: 4 }}>
              {orderDetail.catalog ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 4,
                    alignItems: "flex-start",
                  }}
                >
                  {/* Product Image with Gallery */}
                  <Box
                    sx={{
                      flex: { xs: "1 1 100%", md: "0 0 40%" },
                      maxWidth: { xs: "100%", md: "40%" },
                    }}
                  >
                    {/* Main Image */}
                    <Box
                      component="img"
                      src={getMainImageUrl()}
                      alt={orderDetail.catalog?.nama_katalog || "Product Image"}
                      sx={{
                        width: "100%",
                        height: "400px",
                        borderRadius: "8px",
                        objectFit: "contain",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                        marginBottom: 2,
                        cursor: "pointer",
                      }}
                      onClick={() => handleOpenImageDialog(getMainImageUrl())}
                      onError={(e) => {
                        e.target.src = "/placeholder.jpg"
                      }}
                    />

                    {/* Image Thumbnails */}
                    {productImages.length > 1 && (
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                          justifyContent: "center",
                        }}
                      >
                        {productImages.map((image, index) => (
                          <Box
                            key={index}
                            component="img"
                            src={`${process.env.REACT_APP_API_URL}/${image}`}
                            alt={`${orderDetail.catalog.nama_katalog || "Product"} - gambar ${index + 1}`}
                            sx={{
                              width: "70px",
                              height: "70px",
                              objectFit: "cover",
                              borderRadius: "4px",
                              cursor: "pointer",
                              transition: "0.3s",
                              border: mainImage === index ? "2px solid #D9B99B" : "2px solid transparent",
                              "&:hover": {
                                transform: "scale(1.05)",
                                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                              },
                            }}
                            onClick={() => handleImageChange(index)}
                            onError={(e) => {
                              e.target.src = "/placeholder.jpg"
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>

                  {/* Product Details */}
                  <Box
                    sx={{
                      flex: { xs: "1 1 100%", md: "0 0 60%" },
                      maxWidth: { xs: "100%", md: "60%" },
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 600, color: "#75584A", mb: 2 }}>
                      {orderDetail.catalog.nama_katalog}
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {orderDetail.catalog.deskripsi}
                    </Typography>

                    <TableContainer
                      component={Paper}
                      sx={{
                        mb: 2,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        border: "1px solid #f0f0f0",
                        borderRadius: "8px",
                        overflow: "hidden",
                      }}
                    >
                      <Table>
                        <TableHead sx={{ backgroundColor: "#f9f4ef" }}>
                          <TableRow>
                            <TableCell colSpan={2}>
                              <Typography variant="h6" sx={{ fontWeight: 500, color: "#75584A" }}>
                                Spesifikasi Produk
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 500, width: "40%" }}>Bahan</TableCell>
                            <TableCell>{orderDetail.catalog.bahan || "-"}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 500 }}>Harga Satuan</TableCell>
                            <TableCell>{formatCurrency(orderDetail.catalog.price)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 500 }}>Detail</TableCell>
                            <TableCell>{orderDetail.catalog.details || "-"}</TableCell>
                          </TableRow>
                          {orderDetail.catalog.feature && (
                            <TableRow>
                              <TableCell sx={{ fontWeight: 500 }}>Fitur</TableCell>
                              <TableCell>
                                {(() => {
                                  try {
                                    const features = JSON.parse(orderDetail.catalog.feature)
                                    return (
                                      <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                        {Object.entries(features).map(([feature, value], index) => (
                                          <Box component="li" key={index} sx={{ mb: 0.5 }}>
                                            {typeof value === "boolean"
                                              ? (value ? "✓ " : "✕ ") + feature
                                              : `${feature}: ${value}`}
                                          </Box>
                                        ))}
                                      </Box>
                                    )
                                  } catch (e) {
                                    console.error("Error parsing features:", e)
                                    return orderDetail.catalog.feature
                                  }
                                })()}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body1" sx={{ textAlign: "center", py: 3 }}>
                  Data produk tidak tersedia
                </Typography>
              )}
            </Box>
          )}

          {/* Action button remains centered */}
          <Divider sx={{ my: 4, borderColor: "#f0e6d9" }} />

          {/* Action Button moved here, above Status section */}
          {renderActionButton() && (
            <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>{renderActionButton()}</Box>
          )}

          <Box>
            <Typography variant="h6" component="h2" sx={{ marginBottom: 3, fontWeight: 500, color: "#75584A" }}>
              Status Pesanan
            </Typography>

            <Paper
              elevation={0}
              sx={{
                border: "1px solid #D9B99B",
                borderRadius: "8px",
                padding: 3,
                backgroundColor: "#f9f4ef",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <Timeline position="right">
                {/* Order Created */}
                {orderDetail.created_at && (
                  <TimelineItem>
                    <TimelineOppositeContent sx={{ flex: 0.2 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(orderDetail.created_at)}
                      </Typography>
                      <Typography variant="caption">
                        {new Date(orderDetail.created_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot sx={{ backgroundColor: "#9e9e9e" }} />
                      {orderDetail.status !== "Menunggu_Pembayaran" && (
                        <TimelineConnector sx={{ backgroundColor: "#1565c0" }} />
                      )}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body1" fontWeight="medium">
                        Pesanan Dibuat
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pesanan telah dibuat
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}

                {/* Payment Received */}
                {orderDetail.status !== "Menunggu_Pembayaran" && (
                  <TimelineItem>
                    <TimelineOppositeContent sx={{ flex: 0.2 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(orderDetail.transaction?.created_at)}
                      </Typography>
                      <Typography variant="caption">
                        {orderDetail.transaction?.created_at
                          ? new Date(orderDetail.transaction.created_at).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot sx={{ backgroundColor: "#1565c0" }} />
                      {["Diproses", "Sedang_Dikirim", "Sudah_Terkirim", "Selesai"].includes(orderDetail.status) && (
                        <TimelineConnector sx={{ backgroundColor: "#2e7d32" }} />
                      )}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body1" fontWeight="medium">
                        Pembayaran Diterima
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pembayaran telah diterima
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}

                {/* Order Processed */}
                {["Diproses", "Sedang_Dikirim", "Sudah_Terkirim", "Selesai"].includes(orderDetail.status) && (
                  <TimelineItem>
                    <TimelineOppositeContent sx={{ flex: 0.2 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(orderDetail.updated_at)}
                      </Typography>
                      <Typography variant="caption">
                        {new Date(orderDetail.updated_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot sx={{ backgroundColor: "#2e7d32" }} />
                      {["Sedang_Dikirim", "Sudah_Terkirim", "Selesai"].includes(orderDetail.status) && (
                        <TimelineConnector sx={{ backgroundColor: "#6a1b9a" }} />
                      )}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body1" fontWeight="medium">
                        Pesanan Diproses
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pesanan sedang diproses oleh tim kami
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}

                {/* Order Shipped */}
                {["Sedang_Dikirim", "Sudah_Terkirim", "Selesai"].includes(orderDetail.status) && (
                  <TimelineItem>
                    <TimelineOppositeContent sx={{ flex: 0.2 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(orderDetail.delivery_proof?.delivery_date || orderDetail.updated_at)}
                      </Typography>
                      <Typography variant="caption">
                        {orderDetail.delivery_proof?.delivery_date
                          ? new Date(orderDetail.delivery_proof.delivery_date).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : new Date(orderDetail.updated_at).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                      </Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot sx={{ backgroundColor: "#6a1b9a" }} />
                      {["Sudah_Terkirim", "Selesai"].includes(orderDetail.status) && (
                        <TimelineConnector sx={{ backgroundColor: "#00838f" }} />
                      )}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body1" fontWeight="medium">
                        Pesanan Dikirim
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pesanan dalam perjalanan ke alamat tujuan
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}

                {/* Order Received */}
                {["Sudah_Terkirim", "Selesai"].includes(orderDetail.status) && (
                  <TimelineItem>
                    <TimelineOppositeContent sx={{ flex: 0.2 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(orderDetail.delivery_proof?.recieve_date || orderDetail.updated_at)}
                      </Typography>
                      <Typography variant="caption">
                        {orderDetail.delivery_proof?.recieve_date
                          ? new Date(orderDetail.delivery_proof.recieve_date).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : new Date(orderDetail.updated_at).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                      </Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot sx={{ backgroundColor: "#00838f" }} />
                      {orderDetail.status === "Selesai" && <TimelineConnector sx={{ backgroundColor: "#4527a0" }} />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body1" fontWeight="medium">
                        Pesanan Diterima
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pesanan telah diterima oleh pelanggan
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}

                {/* Order Completed */}
                {orderDetail.status === "Selesai" && (
                  <TimelineItem>
                    <TimelineOppositeContent sx={{ flex: 0.2 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(orderDetail.updated_at)}
                      </Typography>
                      <Typography variant="caption">
                        {new Date(orderDetail.updated_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot sx={{ backgroundColor: "#4527a0" }} />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body1" fontWeight="medium">
                        Pesanan Selesai
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Transaksi telah selesai
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}
              </Timeline>
            </Paper>
          </Box>

          {/* Customer Information */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" component="h2" sx={{ marginBottom: 3, fontWeight: 500, color: "#75584A" }}>
              Informasi Pelanggan
            </Typography>

            <TableContainer
              component={Paper}
              sx={{
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                border: "1px solid #f0f0f0",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500, width: "40%" }}>Nama</TableCell>
                    <TableCell>{orderDetail.user?.name || "-"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500 }}>Email</TableCell>
                    <TableCell>{orderDetail.user?.email || "-"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500 }}>Telepon</TableCell>
                    <TableCell>{orderDetail.user?.phone || "-"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500 }}>Alamat</TableCell>
                    <TableCell>{orderDetail.user?.address || "-"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500 }}>Koordinat</TableCell>
                    <TableCell>
                      {orderDetail.user?.latitude || "-"}, {orderDetail.user?.longitude || "-"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </CardContent>
      </Card>
      {/* Review Dialog */}
      
    </Container>
  )
}

export default OrderDetail
