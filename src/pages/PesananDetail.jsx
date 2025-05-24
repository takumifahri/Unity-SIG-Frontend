"use client"

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
} from "@mui/material"
import axios from "axios"
// Add this import at the top of your file with other imports
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import IconButton from "@mui/material/IconButton"
import Timeline from "@mui/lab/Timeline"
import TimelineItem from "@mui/lab/TimelineItem"
import TimelineSeparator from "@mui/lab/TimelineSeparator"
import TimelineConnector from "@mui/lab/TimelineConnector"
import TimelineContent from "@mui/lab/TimelineContent"
import TimelineDot from "@mui/lab/TimelineDot"
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent"
import { usePemesanan } from "../context/PemesananContext"
import Swal from "sweetalert2"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import CloseIcon from "@mui/icons-material/Close"
import OrderDetailsSkeleton from "../components/OrderDetailSkeleton"
import RateReviewIcon from "@mui/icons-material/RateReview"
import { AddPhotoAlternate } from "@mui/icons-material"

const CustomOrderDetail = () => {
  const { orderUniqueId } = useParams() // Get custom_order_unique_id from URL
  const navigate = useNavigate()
  const { getCustomOrderById, loading, error, adminVerifyPayment, sendToDelivery, recievedUser, completeOrder } =
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

  // Get user role from localStorage or context
  const getUserRole = () => {
    try {
      const userData = localStorage.getItem("user")
      if (userData) {
        const user = JSON.parse(userData)
        return user.role
      }
      return null
    } catch (error) {
      console.error("Error getting user role:", error)
      return null
    }
  }

  const userRole = getUserRole()
  const isAdmin = userRole === "admin"

  // Status mapping for timeline
  const statusMapping = {
    pending: {
      title: "Menunggu Konfirmasi",
      description: "Menunggu konfirmasi dari admin",
    },
    approved: {
      title: "Disetujui",
      description: "Pesanan custom telah disetujui",
    },
    rejected: {
      title: "Ditolak",
      description: "Pesanan custom ditolak",
    },
    cancelled: {
      title: "Dibatalkan",
      description: "Pesanan custom dibatalkan",
    },
    in_progress: {
      title: "Sedang Dikerjakan",
      description: "Pesanan sedang dalam proses pembuatan",
    },
    completed: {
      title: "Selesai",
      description: "Pesanan custom telah selesai",
    },
  }

  // Fetch order details when component mounts
  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        console.log("Fetching custom order with ID:", orderUniqueId)
        const data = await getCustomOrderById(orderUniqueId)
        console.log("Custom order details:", data)
        setOrderDetail(data.data)
        setMainImage(0) // Reset main image when loading new order
      } catch (err) {
        console.error("Failed to fetch custom order details:", err)
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

  // Function to get product images array from gambar_referensi
  const getProductImages = () => {
    if (!orderDetail || !orderDetail.gambar_referensi) return []

    try {
      // Parse the JSON string to get array of image paths
      const images = JSON.parse(orderDetail.gambar_referensi)
      return Array.isArray(images) ? images : []
    } catch (error) {
      console.error("Error parsing gambar_referensi:", error)
      return []
    }
  }

  // Get the main image URL
  const getMainImageUrl = () => {
    const images = getProductImages()
    if (images.length === 0) return "/placeholder.svg?height=400&width=400"

    const index = mainImage < images.length ? mainImage : 0
    return `${process.env.REACT_APP_API_URL}/${images[index]}`
  }

  // Function to handle status changes (Admin only)
  const handleStatusChange = async (newStatus) => {
    if (!isAdmin) {
      Swal.fire("Error", "Anda tidak memiliki akses untuk mengubah status pesanan", "error")
      return
    }

    try {
      let confirmText = ""
      let successText = ""

      switch (newStatus) {
        case "approved":
          confirmText = "Apakah Anda yakin ingin menyetujui pesanan custom ini?"
          successText = "Pesanan berhasil disetujui"
          break
        case "rejected":
          confirmText = "Apakah Anda yakin ingin menolak pesanan custom ini?"
          successText = "Pesanan berhasil ditolak"
          break
        case "cancelled":
          confirmText = "Apakah Anda yakin ingin membatalkan pesanan custom ini?"
          successText = "Pesanan berhasil dibatalkan"
          break
        case "in_progress":
          confirmText = "Apakah Anda yakin ingin memulai pengerjaan pesanan ini?"
          successText = "Pesanan berhasil dimulai"
          break
        case "completed":
          confirmText = "Apakah Anda yakin ingin menyelesaikan pesanan ini?"
          successText = "Pesanan berhasil diselesaikan"
          break
        default:
          Swal.fire("Error", "Status tidak valid", "error")
          return
      }

      const result = await Swal.fire({
        title: "Konfirmasi",
        text: confirmText,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, Lanjutkan",
        cancelButtonText: "Batal",
        confirmButtonColor: "#a97142",
      })

      if (result.isConfirmed) {
        let response

        switch (newStatus) {
          case "approved":
            response = await axios.put(
              `${process.env.REACT_APP_API_URL}/api/custom-orders/${orderDetail.id}/approve`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              },
            )
            break
          case "rejected":
            // Get rejection reason
            const { value: reason } = await Swal.fire({
              title: "Alasan Penolakan",
              input: "textarea",
              inputLabel: "Masukkan alasan penolakan",
              inputPlaceholder: "Jelaskan mengapa pesanan ini ditolak...",
              inputValidator: (value) => {
                if (!value) {
                  return "Alasan penolakan harus diisi!"
                }
              },
              showCancelButton: true,
              confirmButtonText: "Tolak Pesanan",
              cancelButtonText: "Batal",
              confirmButtonColor: "#C62828",
            })

            if (!reason) return

            response = await axios.put(
              `${process.env.REACT_APP_API_URL}/api/custom-orders/${orderDetail.id}/reject`,
              { alasan_diTolak: reason },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              },
            )
            break
          case "cancelled":
            // Get cancellation reason
            const { value: cancelReason } = await Swal.fire({
              title: "Alasan Pembatalan",
              input: "textarea",
              inputLabel: "Masukkan alasan pembatalan",
              inputPlaceholder: "Jelaskan mengapa pesanan ini dibatalkan...",
              inputValidator: (value) => {
                if (!value) {
                  return "Alasan pembatalan harus diisi!"
                }
              },
              showCancelButton: true,
              confirmButtonText: "Batalkan Pesanan",
              cancelButtonText: "Batal",
              confirmButtonColor: "#FF9800",
            })

            if (!cancelReason) return

            response = await axios.put(
              `${process.env.REACT_APP_API_URL}/api/custom-orders/${orderDetail.id}/cancel`,
              { alasan_dibatalkan: cancelReason },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              },
            )
            break
          case "in_progress":
            response = await axios.put(
              `${process.env.REACT_APP_API_URL}/api/custom-orders/${orderDetail.id}/start-progress`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              },
            )
            break
          case "completed":
            response = await axios.put(
              `${process.env.REACT_APP_API_URL}/api/custom-orders/${orderDetail.id}/complete`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              },
            )
            break
        }

        Swal.fire("Sukses", successText, "success")
        // Refresh order data
        const updatedData = await getCustomOrderById(orderUniqueId)
        setOrderDetail(updatedData.data)
      }
    } catch (err) {
      console.error("Error updating order status:", err)
      Swal.fire("Error", err.response?.data?.message || "Gagal mengubah status pesanan", "error")
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    return amount ? `Rp ${Number.parseInt(amount).toLocaleString("id-ID")}` : "Harga Pending"
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
      case "pending":
        return { bg: "#FFF9C4", text: "#F57F17" }
      case "approved":
        return { bg: "#C8E6C9", text: "#2E7D32" }
      case "rejected":
        return { bg: "#FFCDD2", text: "#C62828" }
      case "cancelled":
        return { bg: "#FFE0B2", text: "#FF9800" }
      case "in_progress":
        return { bg: "#E1BEE7", text: "#6A1B9A" }
      case "completed":
        return { bg: "#D9B99B", text: "#75584A" }
      case "belum_bayar":
        return { bg: "#FFF9C4", text: "#F57F17" }
      case "sudah_bayar":
        return { bg: "#C8E6C9", text: "#2E7D32" }
      default:
        return { bg: "#ECEFF1", text: "#546E7A" }
    }
  }

  // Generate order timeline steps
  const generateOrderTimelineSteps = () => {
    const steps = []
    const statuses = ["pending", "approved", "in_progress", "completed"]

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
    const files = Array.from(e.target.files).filter((file) => file.type.startsWith("image/"))

    if (files.length === 0) return

    if (reviewImages.length + files.length > 5) {
      Swal.fire("Error", "Maksimal 5 gambar yang dapat diunggah", "error")
      return
    }

    // Preview images
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))

    // Combine existing and new images
    setReviewImages((prev) => [...prev, ...newImages])
    setReviewData((prev) => ({
      ...prev,
      gambar_produk: [...prev.gambar_produk, ...files],
    }))
  }

  useEffect(() => {
    // Clean up object URLs when component unmounts
    return () => {
      reviewImages.forEach((image) => {
        if (image.preview) URL.revokeObjectURL(image.preview)
      })
    }
  }, [reviewImages])

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
            "Content-Type": "multipart/form-data",
          },
        },
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
        const updatedData = await getCustomOrderById(orderUniqueId)
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

    // Admin-only actions
    if (isAdmin) {
      switch (orderDetail.status) {
        case "pending":
          return (
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", width: "100%", flexWrap: "wrap" }}>
              <Button
                variant="contained"
                onClick={() => handleStatusChange("approved")}
                sx={{
                  bgcolor: "#2E7D32",
                  "&:hover": { bgcolor: "#1B5E20" },
                  mb: 2,
                  flex: { xs: "1 1 100%", sm: "0 1 auto" },
                  minWidth: "200px",
                }}
              >
                Setujui Pesanan
              </Button>
              <Button
                variant="contained"
                onClick={() => handleStatusChange("rejected")}
                sx={{
                  bgcolor: "#C62828",
                  "&:hover": { bgcolor: "#B71C1C" },
                  mb: 2,
                  flex: { xs: "1 1 100%", sm: "0 1 auto" },
                  minWidth: "200px",
                }}
              >
                Tolak Pesanan
              </Button>
              <Button
                variant="contained"
                onClick={() => handleStatusChange("cancelled")}
                sx={{
                  bgcolor: "#FF9800",
                  "&:hover": { bgcolor: "#F57C00" },
                  mb: 2,
                  flex: { xs: "1 1 100%", sm: "0 1 auto" },
                  minWidth: "200px",
                }}
              >
                Batalkan Pesanan
              </Button>
            </Box>
          )

        case "approved":
          return (
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", width: "100%", flexWrap: "wrap" }}>
              <Button
                variant="contained"
                onClick={() => handleStatusChange("in_progress")}
                sx={{
                  bgcolor: "#6A1B9A",
                  "&:hover": { bgcolor: "#4A148C" },
                  mb: 2,
                  flex: { xs: "1 1 100%", sm: "0 1 auto" },
                  minWidth: "200px",
                }}
              >
                Mulai Pengerjaan
              </Button>
              <Button
                variant="contained"
                onClick={() => handleStatusChange("cancelled")}
                sx={{
                  bgcolor: "#FF9800",
                  "&:hover": { bgcolor: "#F57C00" },
                  mb: 2,
                  flex: { xs: "1 1 100%", sm: "0 1 auto" },
                  minWidth: "200px",
                }}
              >
                Batalkan Pesanan
              </Button>
            </Box>
          )

        case "in_progress":
          return (
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", width: "100%", flexWrap: "wrap" }}>
              <Button
                variant="contained"
                onClick={() => handleStatusChange("completed")}
                sx={{
                  bgcolor: "#2E7D32",
                  "&:hover": { bgcolor: "#1B5E20" },
                  mb: 2,
                  flex: { xs: "1 1 100%", sm: "0 1 auto" },
                  minWidth: "200px",
                }}
              >
                Finalisasi Pesanan
              </Button>
              <Button
                variant="contained"
                onClick={() => handleStatusChange("cancelled")}
                sx={{
                  bgcolor: "#FF9800",
                  "&:hover": { bgcolor: "#F57C00" },
                  mb: 2,
                  flex: { xs: "1 1 100%", sm: "0 1 auto" },
                  minWidth: "200px",
                }}
              >
                Batalkan Pesanan
              </Button>
            </Box>
          )

        case "completed":
          return (
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Chip
                label="Pesanan Telah Selesai"
                sx={{
                  bgcolor: "#D9B99B",
                  color: "#75584A",
                  fontWeight: 600,
                  fontSize: "1rem",
                  py: 2,
                  px: 3,
                }}
              />
            </Box>
          )

        case "rejected":
        case "cancelled":
          return (
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Chip
                label={orderDetail.status === "rejected" ? "Pesanan Ditolak" : "Pesanan Dibatalkan"}
                sx={{
                  bgcolor: orderDetail.status === "rejected" ? "#FFCDD2" : "#FFE0B2",
                  color: orderDetail.status === "rejected" ? "#C62828" : "#FF9800",
                  fontWeight: 600,
                  fontSize: "1rem",
                  py: 2,
                  px: 3,
                }}
              />
            </Box>
          )

        default:
          return null
      }
    }

    // Customer actions (non-admin users)
    switch (orderDetail.status) {
      case "completed":
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
                    fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
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
                      md: "0 8px 16px rgba(0,0,0,0.08)",
                    },
                    backgroundColor: "#fff",
                    mt: 2,
                    mb: 4,
                  }}
                >
                  {/* Header */}
                  <Box
                    sx={{
                      bgcolor: "#D9B99B",
                      p: { xs: 1.5, sm: 2, md: 2.5 },
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" },
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
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "center", sm: "flex-start" },
                        gap: { xs: 1.5, sm: 2 },
                        p: { xs: 1.5, sm: 2 },
                        mb: 3,
                        bgcolor: "#f9f4ef",
                        borderRadius: { xs: "6px", sm: "8px" },
                        textAlign: { xs: "center", sm: "left" },
                      }}
                    >
                      <Box
                        component="img"
                        src={getMainImageUrl()}
                        alt="Custom Order"
                        sx={{
                          width: { xs: 110, sm: 80, md: 100 },
                          height: { xs: 110, sm: 80, md: 100 },
                          borderRadius: { xs: "6px", sm: "8px" },
                          objectFit: "cover",
                          border: "1px solid #eee",
                        }}
                        onError={(e) => {
                          e.target.src = "/placeholder.svg?height=100&width=100"
                        }}
                      />
                      <Box sx={{ width: { xs: "100%", sm: "calc(100% - 100px)" } }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: "#75584A",
                            fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                            lineHeight: 1.3,
                          }}
                        >
                          Pesanan Custom - {orderDetail?.jenis_baju}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: { xs: 0.5, sm: 1 } }}>
                          {orderDetail?.colors?.map((color) => color.color_name).join(", ")} • Sumber:{" "}
                          {orderDetail?.sumber_kain}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: "#D9B99B",
                            mt: 0.5,
                            fontSize: { xs: "0.85rem", md: "0.95rem" },
                          }}
                        >
                          {formatCurrency(orderDetail?.total_harga)}
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
                          fontSize: { xs: "0.95rem", sm: "1rem", md: "1.1rem" },
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
                          fontSize: { xs: "0.95rem", sm: "1rem", md: "1.1rem" },
                        }}
                      >
                        Ulasan Anda
                      </Typography>
                      <TextField
                        name="ulasan"
                        value={reviewData.ulasan}
                        onChange={handleReviewChange}
                        placeholder={
                          window.innerWidth < 600
                            ? "Bagaimana pengalaman Anda dengan produk ini?"
                            : "Bagaimana pengalaman Anda dengan produk custom ini? Apakah kualitasnya sesuai harapan?"
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
                              borderWidth: { xs: "1px", sm: "2px" },
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
                          gap: 1,
                        }}
                      >
                        <AddPhotoAlternate fontSize="small" /> Foto Produk (Opsional)
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          gap: { xs: 1, sm: 1.5, md: 2 },
                          flexWrap: "wrap",
                          justifyContent: { xs: "center", sm: "flex-start" },
                        }}
                      >
                        {/* Upload Box */}
                        <Box
                          sx={{
                            width: "100%",
                            height: { xs: 90, sm: 100, md: 120 },
                            border: "2px dashed #D9B99B",
                            borderRadius: { xs: "6px", sm: "8px" },
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "0.2s",
                            "&:hover": {
                              backgroundColor: "rgba(217, 185, 155, 0.05)",
                            },
                          }}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          onClick={() => document.getElementById("review-image-upload").click()}
                        >
                          <AddPhotoAlternate
                            sx={{
                              color: "#D9B99B",
                              fontSize: { xs: 24, sm: 28, md: 36 },
                              mb: 0.5,
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              textAlign: "center",
                              color: "#75584A",
                              fontSize: { xs: "0.65rem", sm: "0.7rem", md: "0.75rem" },
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
                              boxShadow: { xs: "0 1px 3px rgba(0,0,0,0.08)", sm: "0 2px 4px rgba(0,0,0,0.08)" },
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
                              <CloseIcon
                                fontSize="small"
                                sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem", md: "1rem" } }}
                              />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: { xs: "center", sm: "flex-end" },
                        flexDirection: { xs: "column", sm: "row" },
                        gap: { xs: 1.5, sm: 2 },
                        mt: { xs: 3, sm: 4 },
                        pt: { xs: 2, sm: 3 },
                        borderTop: "1px solid #f0e6d9",
                      }}
                    >
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
                          fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
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
                          fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                        }}
                        startIcon={
                          isSubmittingReview ? null : <RateReviewIcon sx={{ fontSize: { xs: "1rem", md: "1.2rem" } }} />
                        }
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
        // For non-completed orders, customers just see status info
        return (
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Chip
              label={`Status: ${orderDetail.status?.replace(/_/g, " ") || "Pending"}`}
              sx={{
                bgcolor: getStatusColor(orderDetail.status).bg,
                color: getStatusColor(orderDetail.status).text,
                fontWeight: 600,
                fontSize: "1rem",
                py: 2,
                px: 3,
              }}
            />
          </Box>
        )
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

  const downloadImage = async (imageUrl, imageName = "gambar-referensi") => {
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
            <Typography>Custom order not found</Typography>
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
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))

    if (files.length === 0) {
      Swal.fire("Error", "Hanya file gambar yang dapat diunggah", "error")
      return
    }

    if (reviewImages.length + files.length > 5) {
      Swal.fire("Error", "Maksimal 5 gambar yang dapat diunggah", "error")
      return
    }

    // Create preview for each file
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))

    // Combine existing and new images
    setReviewImages((prev) => [...prev, ...newImages])
    setReviewData((prev) => ({
      ...prev,
      gambar_produk: [...prev.gambar_produk, ...files],
    }))
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
                Detail Pesanan Custom
              </Typography>

              <Typography variant="body1" sx={{ color: "#75584A", mb: 2 }}>
                ID Pesanan: {orderDetail.custom_order_unique_id}
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
                Detail Produk Custom
              </Button>
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
                    alt="Custom Order Reference"
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
                      e.target.src = "/placeholder.svg?height=400&width=400"
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
                          alt={`Referensi ${index + 1}`}
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
                            e.target.src = "/placeholder.svg?height=70&width=70"
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
                              Detail Pesanan Custom
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500, width: "40%" }}>Jenis Baju</TableCell>
                          <TableCell>{orderDetail.jenis_baju || "-"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Warna</TableCell>
                          <TableCell>
                            {orderDetail.colors?.map((color) => color.color_name).join(", ") || "-"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Sumber Kain</TableCell>
                          <TableCell>{orderDetail.sumber_kain || "-"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Detail Bahan</TableCell>
                          <TableCell>{orderDetail.detail_bahan && orderDetail.detail_bahan !== "null" ? orderDetail.detail_bahan : "-"}</TableCell>
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
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Status Pembayaran</TableCell>
                          <TableCell>
                            <Chip
                              label={orderDetail.status_pembayaran?.replace(/_/g, " ") || "Belum Bayar"}
                              size="small"
                              sx={{
                                bgcolor: getStatusColor(orderDetail.status_pembayaran).bg,
                                color: getStatusColor(orderDetail.status_pembayaran).text,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                        {orderDetail.estimasi_waktu && (
                          <TableRow>
                            <TableCell sx={{ fontWeight: 500 }}>Estimasi Waktu</TableCell>
                            <TableCell>{orderDetail.estimasi_waktu}</TableCell>
                          </TableRow>
                        )}
                        {orderDetail.alasan_diTolak && (
                          <TableRow>
                            <TableCell sx={{ fontWeight: 500 }}>Alasan Ditolak</TableCell>
                            <TableCell sx={{ color: "#C62828" }}>{orderDetail.alasan_diTolak}</TableCell>
                          </TableRow>
                        )}
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
                      <TableCell sx={{ fontWeight: 500, width: "40%" }}>Status Pembayaran</TableCell>
                      <TableCell>
                        <Chip
                          label={orderDetail.status_pembayaran?.replace(/_/g, " ") || "Belum Bayar"}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(orderDetail.status_pembayaran).bg,
                            color: getStatusColor(orderDetail.status_pembayaran).text,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500 }}>Total Harga</TableCell>
                      <TableCell>{formatCurrency(orderDetail.total_harga)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500 }}>Tanggal Dibuat</TableCell>
                      <TableCell>{formatDate(orderDetail.created_at)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500 }}>Terakhir Diupdate</TableCell>
                      <TableCell>{formatDate(orderDetail.updated_at)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {currentTab === "product" && (
            <Box sx={{ marginBottom: 4 }}>
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
                    alt="Custom Order Reference"
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
                      e.target.src = "/placeholder.svg?height=400&width=400"
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
                          alt={`Referensi ${index + 1}`}
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
                            e.target.src = "/placeholder.svg?height=70&width=70"
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
                    Pesanan Custom - {orderDetail.jenis_baju}
                  </Typography>

                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {orderDetail.catatan || "Tidak ada deskripsi khusus"}
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
                              Spesifikasi Produk Custom
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500, width: "40%" }}>Jenis Baju</TableCell>
                          <TableCell>{orderDetail.jenis_baju || "-"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Warna</TableCell>
                          <TableCell>
                            {orderDetail.colors?.map((color) => color.color_name).join(", ") || "-"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Sumber Kain</TableCell>
                          <TableCell>{orderDetail.sumber_kain || "-"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Detail Bahan</TableCell>
                          <TableCell>{orderDetail.detail_bahan && orderDetail.detail_bahan !== "null" ? orderDetail.detail_bahan : "-"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Total Harga</TableCell>
                          <TableCell>{formatCurrency(orderDetail.total_harga)}</TableCell>
                        </TableRow>
                        {orderDetail.estimasi_waktu && (
                          <TableRow>
                            <TableCell sx={{ fontWeight: 500 }}>Estimasi Waktu</TableCell>
                            <TableCell>{orderDetail.estimasi_waktu}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
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
                      {orderDetail.status !== "pending" && <TimelineConnector sx={{ backgroundColor: "#1565c0" }} />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body1" fontWeight="medium">
                        Pesanan Custom Dibuat
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pesanan custom telah dibuat dan menunggu konfirmasi
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}

                {/* Order Approved */}
                {["approved", "in_progress", "completed"].includes(orderDetail.status) && (
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
                      {["in_progress", "completed"].includes(orderDetail.status) && (
                        <TimelineConnector sx={{ backgroundColor: "#6a1b9a" }} />
                      )}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body1" fontWeight="medium">
                        Pesanan Disetujui
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pesanan custom telah disetujui dan akan segera dikerjakan
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}

                {/* Order In Progress */}
                {["in_progress", "completed"].includes(orderDetail.status) && (
                  <TimelineItem>
                    <TimelineOppositeContent sx={{ flex: 0.2 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(orderDetail.start_date || orderDetail.updated_at)}
                      </Typography>
                      <Typography variant="caption">
                        {orderDetail.start_date
                          ? new Date(orderDetail.start_date).toLocaleTimeString("id-ID", {
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
                      {orderDetail.status === "completed" && <TimelineConnector sx={{ backgroundColor: "#4527a0" }} />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body1" fontWeight="medium">
                        Sedang Dikerjakan
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pesanan custom sedang dalam proses pembuatan
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}

                {/* Order Completed */}
                {orderDetail.status === "completed" && (
                  <TimelineItem>
                    <TimelineOppositeContent sx={{ flex: 0.2 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(orderDetail.end_date || orderDetail.updated_at)}
                      </Typography>
                      <Typography variant="caption">
                        {orderDetail.end_date
                          ? new Date(orderDetail.end_date).toLocaleTimeString("id-ID", {
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
                      <TimelineDot sx={{ backgroundColor: "#4527a0" }} />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body1" fontWeight="medium">
                        Pesanan Selesai
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pesanan custom telah selesai dikerjakan
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}

                {/* Order Rejected */}
                {orderDetail.status === "rejected" && (
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
                      <TimelineDot sx={{ backgroundColor: "#c62828" }} />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body1" fontWeight="medium">
                        Pesanan Ditolak
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pesanan custom ditolak
                      </Typography>
                      {orderDetail.alasan_diTolak && (
                        <Typography variant="body2" sx={{ color: "#c62828", mt: 1 }}>
                          Alasan: {orderDetail.alasan_diTolak}
                        </Typography>
                      )}
                    </TimelineContent>
                  </TimelineItem>
                )}

                {/* Order Cancelled */}
                {orderDetail.status === "cancelled" && (
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
                      <TimelineDot sx={{ backgroundColor: "#ff9800" }} />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body1" fontWeight="medium">
                        Pesanan Dibatalkan
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pesanan custom dibatalkan
                      </Typography>
                      {orderDetail.alasan_dibatalkan && (
                        <Typography variant="body2" sx={{ color: "#ff9800", mt: 1 }}>
                          Alasan: {orderDetail.alasan_dibatalkan}
                        </Typography>
                      )}
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
                    <TableCell>{orderDetail.user?.name || orderDetail.nama_lengkap || "-"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500 }}>Email</TableCell>
                    <TableCell>{orderDetail.user?.email || orderDetail.email || "-"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500 }}>Telepon</TableCell>
                    <TableCell>{orderDetail.user?.phone || orderDetail.no_telp || "-"}</TableCell>
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

      {/* Image Dialog */}
      <Dialog
        open={openImageDialog}
        onClose={handleCloseImageDialog}
        maxWidth="lg"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            boxShadow: "none",
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: "relative", textAlign: "center" }}>
          <IconButton
            onClick={handleCloseImageDialog}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              color: "white",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.7)",
              },
              zIndex: 1,
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box
            component="img"
            src={dialogImageUrl}
            alt="Full size image"
            sx={{
              maxWidth: "100%",
              maxHeight: "90vh",
              objectFit: "contain",
            }}
            onError={(e) => {
              e.target.src = "/placeholder.svg?height=400&width=400"
            }}
          />
        </DialogContent>
      </Dialog>
    </Container>
  )
}

export default CustomOrderDetail

