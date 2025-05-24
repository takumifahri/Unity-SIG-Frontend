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
} from "@mui/material"
// Add this import at the top of your file with other imports
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
// First, add these imports at the top of your file
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import Timeline from "@mui/lab/Timeline"
import TimelineItem from "@mui/lab/TimelineItem"
import TimelineSeparator from "@mui/lab/TimelineSeparator"
import TimelineConnector from "@mui/lab/TimelineConnector"
import TimelineContent from "@mui/lab/TimelineContent"
import TimelineDot from "@mui/lab/TimelineDot"
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent"
import { usePemesanan } from "../context/PemesananContext"
import Swal from "sweetalert2"
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import DownloadIcon from '@mui/icons-material/Download';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';
import DeliveryTrackingMap from "../components/DeliveryTrackingMap";
import OrderDetailsSkeleton from "../components/OrderDetailSkeleton";
const PesananCatalog = () => {
  const { orderUniqueId } = useParams() // Get order_unique_id from URL
  const navigate = useNavigate()
  const { getOrderByUniqueId, loading, error, adminVerifyPayment, sendToDelivery, recievedUser, completeOrder } = usePemesanan()
  const [orderDetail, setOrderDetail] = useState(null)
  const [currentTab, setCurrentTab] = useState('details')
  const [mainImage, setMainImage] = useState(0) // State for tracking the currently displayed main image index
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [dialogImageUrl, setDialogImageUrl] = useState('');
  // Status mapping for timeline
  const statusMapping = {
    "Menunggu_Pembayaran": {
      title: "Menunggu Pembayaran",
      description: "Menunggu pembayaran dari pelanggan",
    },
    "Menunggu_Konfirmasi": {
      title: "Menunggu Konfirmasi",
      description: "Menunggu konfirmasi pembayaran dari admin",
    },
    "Diproses": {
      title: "Diproses",
      description: "Pesanan sedang diproses oleh tim kami",
    },
    "Sedang_Dikirim": {
      title: "Pengiriman",
      description: "Pesanan sedang dalam proses pengiriman",
    },
    "Sudah_Terkirim": {
      title: "Diterima",
      description: "Pesanan sudah diterima oleh pelanggan",
    },
    "Selesai": {
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
    if (!orderDetail || !orderDetail.catalog) return [];
    
    if (orderDetail.catalog.gambar) {
      if (Array.isArray(orderDetail.catalog.gambar)) {
        return orderDetail.catalog.gambar;
      } else if (typeof orderDetail.catalog.gambar === 'string') {
        return [orderDetail.catalog.gambar];
      }
    }
    return [];
  }

  // Get the main image URL
  const getMainImageUrl = () => {
    const images = getProductImages();
    if (images.length === 0) return "/placeholder.jpg";
    
    const index = mainImage < images.length ? mainImage : 0;
    return `${process.env.REACT_APP_API_URL}/${images[index]}`;
  }

  // Function to handle status changes
  const handleStatusChange = async (newStatus) => {
    try {
      Swal.fire({
        title: 'Konfirmasi',
        text: `Apakah Anda yakin ingin mengubah status pesanan menjadi ${newStatus.replace('_', ' ')}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Ubah Status',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#a97142',
      }).then(async (result) => {
        if (result.isConfirmed) {
          let response;
          
          switch (newStatus) {
            case "Diproses":
              response = await adminVerifyPayment(orderDetail.id, 'approve');
              break;
              
            case "Sedang_Dikirim":
              const { value: deliveryData } = await Swal.fire({
                title: 'Konfirmasi Pengiriman',
                html: `
                  <div class="mb-3">
                    <label class="block text-left text-sm font-medium mb-1">Metode Pengiriman</label>
                    <select id="type_pengantaran" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option value="">Pilih Metode Pengiriman</option>
                      <option value="ekspedisi">Ekspedisi</option>
                      <option value="jrkonveksi">JR Konveksi</option>
                      <option value="gosend">GoSend</option>
                      <option value="grabExpress">Grab Express</option>
                      <option value="pickup">Pickup/Ambil Sendiri</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="block text-left text-sm font-medium mb-1">Catatan (opsional)</label>
                    <textarea id="notes" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Catatan Pengiriman"></textarea>
                  </div>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Kirim',
                cancelButtonText: 'Batal',
                confirmButtonColor: '#a97142',
                preConfirm: () => {
                  const typePengantaran = document.getElementById('type_pengantaran').value;
                  if (!typePengantaran) {
                    Swal.showValidationMessage('Metode pengiriman wajib dipilih');
                    return false;
                  }
                  return {
                    status: "Sedang_Dikirim",
                    type_pengantaran: typePengantaran,
                    notes: document.getElementById('notes').value || ""
                  }
                }
              });
              
              if (deliveryData) {
                Swal.fire({
                  title: 'Memproses...',
                  text: 'Sedang mengirim data pengiriman',
                  allowOutsideClick: false,
                  didOpen: () => {
                    Swal.showLoading();
                  }
                });

                try {
                  // Match the exact parameters required by the backend
                  response = await sendToDelivery(orderDetail.id, {
                    status: "Sedang_Dikirim", // This is required and must be exact
                    type_pengantaran: deliveryData.type_pengantaran // This is required and must match backend validation
                  });
                  
                  // If successful, refresh the order data
                  if (response.success) {
                    Swal.fire({
                      title: 'Sukses',
                      text: 'Pesanan berhasil dikirim',
                      icon: 'success',
                      confirmButtonColor: '#D9B99B'
                    });
                    
                    const updatedData = await getOrderByUniqueId(orderUniqueId);
                    setOrderDetail(updatedData.data);
                  } else {
                    throw new Error(response.message || 'Gagal mengirim pesanan');
                  }
                } catch (error) {
                  console.error('Error sending order:', error);
                  Swal.fire({
                    title: 'Error',
                    text: error.response?.data?.message || error.message || 'Gagal mengirim pesanan',
                    icon: 'error',
                    confirmButtonColor: '#D9B99B'
                  });
                }
              } else {
                return;
              }
              break;
              case "Sudah_Terkirim":
                // ID unik untuk style element agar bisa dihapus nanti
                const styleId = 'swal-wide-style-' + new Date().getTime();
                
                // Tambahkan CSS untuk modal yang lebih lebar dengan ID
                document.head.insertAdjacentHTML(
                  'beforeend',
                  `<style id="${styleId}">
                    .swal-wide {
                      width: 100% !important;
                      max-width: 100% !important;
                      margin-left: auto !important;
                      margin-right: auto !important;
                    }
                    .swal2-popup {
                      position: relative !important;
                      left: 0 !important;
                      transform: none !important;
                    }
                    .swal2-container {
                      justify-content: center !important;
                      align-items: center !important;
                    }
                  </style>`
                );
                
                try {
                  const { value: receiptData } = await Swal.fire({
                    title: 'Konfirmasi Penerimaan Barang',
                    html: `
                      <div class="mb-3">
                        <label class="block text-left text-sm font-medium mb-1">Nama Penerima <span class="text-red-500">*</span></label>
                        <input id="receiver_name" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Masukkan nama penerima" required>
                      </div>
                      <div class="mb-3">
                        <label class="block text-left text-sm font-medium mb-1">Foto Bukti Penerimaan <span class="text-red-500">*</span></label>
                        <label for="receipt_image" class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div id="upload-text" class="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg class="w-8 h-8 mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                            <p class="mb-1 text-sm text-gray-500">Klik untuk upload gambar</p>
                            <p class="text-xs text-gray-500">PNG, JPG atau JPEG</p>
                          </div>
                          <div id="preview-container" class="hidden w-full h-full">
                            <img id="image-preview" class="object-contain w-full h-full rounded" />
                          </div>
                          <input id="receipt_image" type="file" class="hidden" accept="image/*" />
                        </label>
                      </div>
                      <div class="mb-3">
                        <label class="block text-left text-sm font-medium mb-1">Catatan (opsional)</label>
                        <textarea id="notes" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Catatan tambahan"></textarea>
                      </div>
                    `,
                    didOpen: () => {
                      // Preview image upload
                      const fileInput = document.getElementById('receipt_image');
                      const preview = document.getElementById('image-preview');
                      const previewContainer = document.getElementById('preview-container');
                      const uploadText = document.getElementById('upload-text');
                      
                      fileInput.addEventListener('change', (e) => {
                        if (e.target.files && e.target.files[0]) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            preview.src = e.target.result;
                            previewContainer.classList.remove('hidden');
                            uploadText.classList.add('hidden');
                          };
                          reader.readAsDataURL(e.target.files[0]);
                        } else {
                          previewContainer.classList.add('hidden');
                          uploadText.classList.remove('hidden');
                        }
                      });
              
                      // Tambahkan tombol untuk menghapus foto yang dipilih
                      const resetButton = document.createElement('button');
                      resetButton.textContent = 'Hapus Foto';
                      resetButton.className = 'mt-2 px-3 py-1 text-sm text-white bg-gray-500 rounded hover:bg-gray-600 hidden';
                      resetButton.id = 'reset-button';
                      
                      fileInput.parentNode.parentNode.appendChild(resetButton);
                      
                      resetButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        fileInput.value = '';
                        previewContainer.classList.add('hidden');
                        uploadText.classList.remove('hidden');
                        resetButton.classList.add('hidden');
                      });
                      
                      fileInput.addEventListener('change', () => {
                        if (fileInput.files.length > 0) {
                          resetButton.classList.remove('hidden');
                        } else {
                          resetButton.classList.add('hidden');
                        }
                      });
                    },
                    focusConfirm: false,
                    showCancelButton: true,
                    confirmButtonText: 'Konfirmasi Penerimaan',
                    cancelButtonText: 'Batal',
                    confirmButtonColor: '#a97142',
                    customClass: {
                      container: 'swal-wide',
                    },
                    preConfirm: () => {
                      const receiverName = document.getElementById('receiver_name').value;
                      const imageFile = document.getElementById('receipt_image').files[0];
                      
                      if (!receiverName) {
                        Swal.showValidationMessage('Nama penerima wajib diisi');
                        return false;
                      }
                      
                      if (!imageFile) {
                        Swal.showValidationMessage('Foto bukti penerimaan wajib diupload');
                        return false;
                      }
                      
                      return {
                        receiver_name: receiverName,
                        image: imageFile,
                        notes: document.getElementById('notes').value || ""
                      }
                    }
                  });
              
                  // Hapus style setelah dialog ditutup
                  const styleElement = document.getElementById(styleId);
                  if (styleElement) styleElement.remove();
                  
                  if (receiptData) {
                    const formData = new FormData();
                    formData.append('image', receiptData.image);
                    formData.append('receiver_name', receiptData.receiver_name);
                    formData.append('notes', receiptData.notes);
                    
                    Swal.fire({
                      title: 'Memproses...',
                      text: 'Sedang mengirim data penerimaan',
                      allowOutsideClick: false,
                      didOpen: () => {
                        Swal.showLoading();
                      }
                    });
                    
                    try {
                      response = await recievedUser(orderDetail.id, formData);
                      
                      if (response.success) {
                        Swal.fire({
                          title: 'Sukses',
                          text: 'Konfirmasi penerimaan barang berhasil',
                          icon: 'success',
                          confirmButtonColor: '#D9B99B'
                        });
                        
                        // Refresh order data
                        const updatedData = await getOrderByUniqueId(orderUniqueId);
                        setOrderDetail(updatedData.data);
                      } else {
                        throw new Error(response.message || 'Gagal mengkonfirmasi penerimaan barang');
                      }
                    } catch (error) {
                      console.error('Error confirming receipt:', error);
                      Swal.fire({
                        title: 'Error',
                        text: error.response?.data?.message || error.message || 'Gagal mengkonfirmasi penerimaan barang',
                        icon: 'error',
                        confirmButtonColor: '#D9B99B'
                      });
                    }
                  }
                } catch (error) {
                  console.error('Error in receipt confirmation process:', error);
                } finally {
                  // Hapus style jika masih ada (sebagai fallback)
                  const styleElement = document.getElementById(styleId);
                  if (styleElement) styleElement.remove();
                }
                break;
            case "Selesai":
              response = await completeOrder(orderDetail.id);
              break;
              
            default:
              Swal.fire('Error', 'Status tidak valid', 'error');
              return;
          }
          
          if (newStatus !== "Sudah_Terkirim") {
            Swal.fire('Sukses', 'Status pesanan berhasil diubah', 'success');
            // Refresh order data
            const updatedData = await getOrderByUniqueId(orderUniqueId);
            setOrderDetail(updatedData.data);
          }
        }
      });
    } catch (err) {
      console.error('Error updating order status:', err);
      Swal.fire('Error', 'Gagal mengubah status pesanan', 'error');
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return amount ? `Rp ${parseInt(amount).toLocaleString('id-ID')}` : "Rp 0";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "menunggu_pembayaran":
        return { bg: "#FFF9C4", text: "#F57F17" };
      case "menunggu_konfirmasi":
        return { bg: "#BBDEFB", text: "#1565C0" };
      case "diproses":
        return { bg: "#C8E6C9", text: "#2E7D32" };
      case "sedang_dikirim":
        return { bg: "#E1BEE7", text: "#6A1B9A" };
      case "sudah_terkirim":
        return { bg: "#B2EBF2", text: "#00838F" };
      case "selesai":
        return { bg: "#D9B99B", text: "#75584A" };
      default:
        return { bg: "#ECEFF1", text: "#546E7A" };
    }
  };

  // Generate order timeline steps
  const generateOrderTimelineSteps = () => {
    const steps = [];
    const statuses = [
      "Menunggu_Pembayaran", 
      "Menunggu_Konfirmasi", 
      "Diproses", 
      "Sedang_Dikirim", 
      "Sudah_Terkirim", 
      "Selesai"
    ];
    
    if (!orderDetail || !orderDetail.status) return steps;
    
    const currentStatusIndex = statuses.indexOf(orderDetail.status);
    if (currentStatusIndex === -1) return steps;

    for (let i = 0; i <= currentStatusIndex; i++) {
      const status = statuses[i];
      steps.push({
        date: formatDate(orderDetail.created_at),
        time: new Date(orderDetail.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }),
        title: statusMapping[status].title,
        description: statusMapping[status].description,
        active: i === currentStatusIndex,
      });
    }

    return steps;
  };

  // Render action button based on status
  const renderActionButton = () => {
    if (!orderDetail) return null;

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
        );
        
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
        );
        
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
        );
        
      case "Sudah_Terkirim":
        return (
          <Button 
            variant="contained" 
            onClick={() => handleStatusChange("Selesai")}
            sx={{ 
              bgcolor: "#2E7D32", 
              "&:hover": { bgcolor: "#1B5E20" },
              mb: 2,
              width: "100%"
            }}
          >
            Tandai Selesai
          </Button>
        );
        
      default:
        return null;
    }
  };

  
  // Add these functions to your component
  const handleOpenImageDialog = (imageUrl) => {
    // Make sure the URL is valid
    if (!imageUrl) {
      Swal.fire('Error', 'Gambar tidak ditemukan', 'error');
      return;
    }
    
    // Set dialog image URL and open the dialog
    setDialogImageUrl(imageUrl);
    setOpenImageDialog(true);
  };
  
  const handleCloseImageDialog = () => {
    setOpenImageDialog(false);
  };
  
  const downloadImage = async (imageUrl, imageName = 'bukti-pembayaran') => {
    try {
      // Show loading indicator
      Swal.fire({
        title: 'Mengunduh...',
        text: 'Sedang mengunduh gambar',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
  
      // Create a temporary anchor element
      const a = document.createElement('a');
      
      // Open image in new tab, which browser will handle without CORS restrictions
      a.href = imageUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      
      // Click the anchor to open image in new tab
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Close loading dialog
      setTimeout(() => {
        Swal.close();
        
        // Show instructions modal
        Swal.fire({
          title: 'Unduh Gambar',
          html: `
            <p>Gambar telah dibuka di tab baru.</p>
            <p>Untuk mengunduh:</p>
            <ol style="text-align:left; margin-left:20px;">
              <li>Klik kanan pada gambar</li>
              <li>Pilih "Simpan gambar sebagai" atau "Download image"</li>
              <li>Simpan dengan nama yang diinginkan</li>
            </ol>
          `,
          icon: 'info',
          confirmButtonText: 'Mengerti',
          confirmButtonColor: '#D9B99B',
        });
      }, 500);
      
    } catch (error) {
      console.error('Error downloading image:', error);
      Swal.fire('Error', 'Gagal mengunduh gambar. Silakan coba lagi.', 'error');
    }
  };
  if (loading) {
    return (
      <Container maxWidth="2xl" sx={{ padding: 4 }}>
        <OrderDetailsSkeleton />
      </Container>
    );
  }
  const handlePaymentRejection = async () => {
    try {
      const { value: reason } = await Swal.fire({
        title: 'Tolak Pembayaran',
        text: 'Apakah Anda yakin ingin menolak pembayaran ini?',
        icon: 'warning',
        input: 'textarea',
        inputLabel: 'Alasan Penolakan (Opsional)',
        inputPlaceholder: 'Masukkan alasan penolakan pembayaran...',
        showCancelButton: true,
        confirmButtonText: 'Ya, Tolak Pembayaran',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#C62828',
        cancelButtonColor: '#757575',
        inputValidator: (value) => {
          // Optional validation if needed
        }
      });
  
      if (reason !== undefined) {  // User clicked confirm
        Swal.fire({
          title: 'Memproses...',
          text: 'Sedang memproses penolakan pembayaran',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        // Call the adminVerifyPayment function with reject status
        const response = await adminVerifyPayment(orderDetail.id, 'reject', reason);
        
        Swal.fire({
          title: 'Sukses',
          text: 'Pembayaran berhasil ditolak',
          icon: 'success',
          confirmButtonColor: '#D9B99B'
        });
        
        // Refresh order data
        const updatedData = await getOrderByUniqueId(orderUniqueId);
        setOrderDetail(updatedData.data);
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Gagal menolak pembayaran',
        icon: 'error',
        confirmButtonColor: '#D9B99B'
      });
    }
  };
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
    );
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
    );
  }

  const orderTimelineSteps = generateOrderTimelineSteps();
  const statusColor = getStatusColor(orderDetail.status);
  const productImages = getProductImages();

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
                <Box sx={{ position: 'relative', mb: 4 }}>
                    {/* Back button positioned at top left */}
                    <IconButton 
                        aria-label="back"
                        onClick={() => navigate(-1)}
                        sx={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        color: "#75584A",
                        '&:hover': { 
                            backgroundColor: 'rgba(217, 185, 155, 0.1)' 
                        }
                        }}
                    >
                        <ArrowBackIcon />
                    </IconButton>

                    {/* Centered heading */}
                    <Box sx={{ textAlign: 'center' }}>
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
                        
                        <Typography
                        variant="body1"
                        sx={{ color: "#75584A", mb: 2 }}
                        >
                        ID Pesanan: {orderDetail.order_unique_id}
                        </Typography>

                    </Box>
                </Box>

                <Divider sx={{ mb: 4, borderColor: "#f0e6d9" }} />

                {/* Navigation tabs */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: "flex", borderBottom: "1px solid #f0e6d9" }}>
                    <Button 
                        onClick={() => setCurrentTab('details')}
                        sx={{ 
                        px: 3,
                        py: 1.5,
                        borderBottom: currentTab === 'details' ? "2px solid #D9B99B" : "none",
                        borderRadius: 0,
                        color: currentTab === 'details' ? "#75584A" : "text.secondary",
                        fontWeight: currentTab === 'details' ? 600 : 400,
                        "&:hover": { bgcolor: "transparent", color: "#75584A" }
                        }}
                    >
                        Informasi Pesanan
                    </Button>
                    <Button 
                        onClick={() => setCurrentTab('payment')}
                        sx={{ 
                        px: 3,
                        py: 1.5,
                        borderBottom: currentTab === 'payment' ? "2px solid #D9B99B" : "none",
                        borderRadius: 0,
                        color: currentTab === 'payment' ? "#75584A" : "text.secondary",
                        fontWeight: currentTab === 'payment' ? 600 : 400,
                        "&:hover": { bgcolor: "transparent", color: "#75584A" }
                        }}
                    >
                        Informasi Pembayaran
                    </Button>
                    <Button 
                        onClick={() => setCurrentTab('product')}
                        sx={{ 
                        px: 3,
                        py: 1.5,
                        borderBottom: currentTab === 'product' ? "2px solid #D9B99B" : "none",
                        borderRadius: 0,
                        color: currentTab === 'product' ? "#75584A" : "text.secondary",
                        fontWeight: currentTab === 'product' ? 600 : 400,
                        "&:hover": { bgcolor: "transparent", color: "#75584A" }
                        }}
                    >
                        Detail Produk
                    </Button>
                    {["Sedang_Dikirim", "Sudah_Terkirim", "Selesai"].includes(orderDetail.status) && (
                      <Button 
                          onClick={() => setCurrentTab('delivery')}
                          sx={{ 
                          px: 3,
                          py: 1.5,
                          borderBottom: currentTab === 'delivery' ? "2px solid #D9B99B" : "none",
                          borderRadius: 0,
                          color: currentTab === 'delivery' ? "#75584A" : "text.secondary",
                          fontWeight: currentTab === 'delivery' ? 600 : 400,
                          "&:hover": { bgcolor: "transparent", color: "#75584A" },
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5
                          }}
                      >
                          <LocalShippingIcon fontSize="small" />
                          Informasi Pengiriman
                      </Button>
                    )}
                    </Box>
                </Box>

                {/* Content based on selected tab */}
                {currentTab === 'details' && (
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
                                      e.target.src = "/placeholder.jpg";
                                  }}
                              />

                                {/* Image Thumbnails */}
                                {productImages.length > 1 && (
                                    <Box sx={{ 
                                        display: 'flex', 
                                        flexWrap: 'wrap', 
                                        gap: 1,
                                        justifyContent: 'center'
                                    }}>
                                        {productImages.map((image, index) => (
                                            <Box 
                                                key={index}
                                                component="img"
                                                src={`${process.env.REACT_APP_API_URL}/${image}`}
                                                alt={`${orderDetail.catalog.nama_katalog || "Product"} - gambar ${index + 1}`}
                                                sx={{
                                                    width: '70px',
                                                    height: '70px',
                                                    objectFit: 'cover',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    transition: '0.3s',
                                                    border: mainImage === index ? '2px solid #D9B99B' : '2px solid transparent',
                                                    '&:hover': {
                                                        transform: 'scale(1.05)',
                                                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                                    }
                                                }}
                                                onClick={() => handleImageChange(index)}
                                                onError={(e) => {
                                                    e.target.src = "/placeholder.jpg";
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
                                                        label={orderDetail.status?.replace(/_/g, ' ') || "Pending"}
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

                {currentTab === 'payment' && (
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
                                                    bgcolor: orderDetail.transaction?.status === 'success' ? "#C8E6C9" : "#FFF9C4",
                                                    color: orderDetail.transaction?.status === 'success' ? "#2E7D32" : "#F57F17",
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 500 }}>Tanggal Pembayaran</TableCell>
                                        <TableCell>{orderDetail.transaction ? formatDate(orderDetail.transaction.created_at) : "-"}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {orderDetail.transaction.bukti_transfer && (
                          <Box>
                              <Typography variant="h6" sx={{ fontWeight: 500, color: "#75584A", mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span>Bukti Pembayaran</span>
                                  <Box>
                                      <Button 
                                          size="small"
                                          variant="outlined"
                                          startIcon={<DownloadIcon />}
                                          onClick={() => downloadImage(
                                              `${process.env.REACT_APP_API_URL}/${orderDetail.transaction.bukti_transfer}`,
                                              `bukti-pembayaran-${orderDetail.order_unique_id}`
                                          )}
                                          sx={{ 
                                              mr: 1,
                                              color: "#75584A", 
                                              borderColor: "#D9B99B",
                                              "&:hover": {
                                                  borderColor: "#C2A07B",
                                                  bgcolor: "rgba(217, 185, 155, 0.1)",
                                              }
                                          }}
                                      >
                                          Unduh
                                      </Button>
                                      <Button 
                                          size="small"
                                          variant="outlined"
                                          startIcon={<ZoomInIcon />}
                                          onClick={() => handleOpenImageDialog(`${process.env.REACT_APP_API_URL}/${orderDetail.transaction.bukti_transfer}`)}
                                          sx={{ 
                                              color: "#75584A", 
                                              borderColor: "#D9B99B",
                                              "&:hover": {
                                                  borderColor: "#C2A07B",
                                                  bgcolor: "rgba(217, 185, 155, 0.1)",
                                              }
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
                                  onClick={() => handleOpenImageDialog(`${process.env.REACT_APP_API_URL}/${orderDetail.transaction.bukti_transfer}`)}
                              />
                          </Box>
                      )}
                    </Box>
                )}

                {currentTab === 'delivery' && (
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
                                            <Typography variant="h6" sx={{ fontWeight: 500, color: "#75584A", display: "flex", alignItems: "center", gap: 1 }}>
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
                                                label={orderDetail.status.replace(/_/g, ' ')}
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
                            <Typography variant="h6" sx={{ fontWeight: 500, color: "#75584A", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
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
                                  }
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
                              <Typography variant="h6" sx={{ fontWeight: 500, color: "#75584A", mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span>Bukti Penerimaan</span>
                                  <Box>
                                      <Button 
                                          size="small"
                                          variant="outlined"
                                          startIcon={<DownloadIcon />}
                                          onClick={() => downloadImage(
                                              `${process.env.REACT_APP_API_URL}/${orderDetail.delivery_proof.image_path}`,
                                              `bukti-penerimaan-${orderDetail.order_unique_id}`
                                          )}
                                          sx={{ 
                                              mr: 1,
                                              color: "#75584A", 
                                              borderColor: "#D9B99B",
                                              "&:hover": {
                                                  borderColor: "#C2A07B",
                                                  bgcolor: "rgba(217, 185, 155, 0.1)",
                                              }
                                          }}
                                      >
                                          Unduh
                                      </Button>
                                      <Button 
                                          size="small"
                                          variant="outlined"
                                          startIcon={<ZoomInIcon />}
                                          onClick={() => handleOpenImageDialog(`${process.env.REACT_APP_API_URL}/${orderDetail.delivery_proof.image_path}`)}
                                          sx={{ 
                                              color: "#75584A", 
                                              borderColor: "#D9B99B",
                                              "&:hover": {
                                                  borderColor: "#C2A07B",
                                                  bgcolor: "rgba(217, 185, 155, 0.1)",
                                              }
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
                                onClick={() => handleOpenImageDialog(`${process.env.REACT_APP_API_URL}/${orderDetail.delivery_proof.image_path}`)}
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
                
                {currentTab === 'product' && (
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
                                          e.target.src = "/placeholder.jpg";
                                      }}
                                  />

                                  {/* Image Thumbnails */}
                                  {productImages.length > 1 && (
                                      <Box sx={{ 
                                          display: 'flex', 
                                          flexWrap: 'wrap', 
                                          gap: 1,
                                          justifyContent: 'center'
                                      }}>
                                          {productImages.map((image, index) => (
                                              <Box 
                                                  key={index}
                                                  component="img"
                                                  src={`${process.env.REACT_APP_API_URL}/${image}`}
                                                  alt={`${orderDetail.catalog.nama_katalog || "Product"} - gambar ${index + 1}`}
                                                  sx={{
                                                      width: '70px',
                                                      height: '70px',
                                                      objectFit: 'cover',
                                                      borderRadius: '4px',
                                                      cursor: 'pointer',
                                                      transition: '0.3s',
                                                      border: mainImage === index ? '2px solid #D9B99B' : '2px solid transparent',
                                                      '&:hover': {
                                                          transform: 'scale(1.05)',
                                                          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                                      }
                                                  }}
                                                  onClick={() => handleImageChange(index)}
                                                  onError={(e) => {
                                                      e.target.src = "/placeholder.jpg";
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
                                                                    const features = JSON.parse(orderDetail.catalog.feature);
                                                                    return (
                                                                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                                                            {Object.entries(features).map(([feature, value], index) => (
                                                                                <Box component="li" key={index} sx={{ mb: 0.5 }}>
                                                                                    {typeof value === 'boolean' 
                                                                                        ? (value ? '✓ ' : '✕ ') + feature
                                                                                        : `${feature}: ${value}`}
                                                                                </Box>
                                                                            ))}
                                                                        </Box>
                                                                    );
                                                                } catch (e) {
                                                                    console.error("Error parsing features:", e);
                                                                    return orderDetail.catalog.feature;
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
                    <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
                        {renderActionButton()}
                    </Box>
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
                                            {new Date(orderDetail.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>
                                    </TimelineOppositeContent>
                                    <TimelineSeparator>
                                        <TimelineDot sx={{ backgroundColor: "#9e9e9e" }} />
                                        {orderDetail.status !== "Menunggu_Pembayaran" && <TimelineConnector sx={{ backgroundColor: "#1565c0" }} />}
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
                                            {orderDetail.transaction?.created_at ? 
                                                new Date(orderDetail.transaction.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) : ""}
                                        </Typography>
                                    </TimelineOppositeContent>
                                    <TimelineSeparator>
                                        <TimelineDot sx={{ backgroundColor: "#1565c0" }} />
                                        {["Diproses", "Sedang_Dikirim", "Sudah_Terkirim", "Selesai"].includes(orderDetail.status) && 
                                            <TimelineConnector sx={{ backgroundColor: "#2e7d32" }} />}
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
                                            {new Date(orderDetail.updated_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>
                                    </TimelineOppositeContent>
                                    <TimelineSeparator>
                                        <TimelineDot sx={{ backgroundColor: "#2e7d32" }} />
                                        {["Sedang_Dikirim", "Sudah_Terkirim", "Selesai"].includes(orderDetail.status) && 
                                            <TimelineConnector sx={{ backgroundColor: "#6a1b9a" }} />}
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
                                          {orderDetail.delivery_proof?.delivery_date ? 
                                              new Date(orderDetail.delivery_proof.delivery_date).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) :
                                              new Date(orderDetail.updated_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                                      </Typography>
                                  </TimelineOppositeContent>
                                  <TimelineSeparator>
                                      <TimelineDot sx={{ backgroundColor: "#6a1b9a" }} />
                                      {["Sudah_Terkirim", "Selesai"].includes(orderDetail.status) && 
                                          <TimelineConnector sx={{ backgroundColor: "#00838f" }} />}
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
                                          {orderDetail.delivery_proof?.recieve_date ? 
                                              new Date(orderDetail.delivery_proof.recieve_date).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) :
                                              new Date(orderDetail.updated_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
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
                                            {new Date(orderDetail.updated_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
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
                                    <TableCell>{orderDetail.user?.latitude || "-"}, {orderDetail.user?.longitude || "-"}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </CardContent>
        </Card>
        <Dialog
          open={openImageDialog}
          onClose={handleCloseImageDialog}
          maxWidth="2xl"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: 'rgba(255, 255, 255, 0.98)',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }
          }}
          // Perbaikan backdrop untuk menutupi seluruh layar
          BackdropProps={{
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(2px)',
              position: 'fixed !important',
              inset: '0px !important', // Gunakan inset untuk mengatur semua sisi
              width: '100vw !important',
              height: '100vh !important',
              zIndex: (theme) => theme.zIndex.drawer + 1,
              display: 'flex !important',
              alignItems: 'center !important',
              justifyContent: 'center !important',
              margin: '0 !important'
            }
          }}
          // Pengaturan dialog container
          sx={{
            '& .MuiDialog-container': {
              height: '100vh',
              width: '100vw',
              alignItems: 'center',
              justifyContent: 'center'
            },
            '& .MuiDialog-paper': {
              margin: '16px !important', // Tambahkan margin agar tidak terlalu dekat dengan tepi layar
              maxHeight: 'calc(100% - 32px) !important'
            },
            '& .MuiBackdrop-root': {
              position: 'fixed !important'
            }
          }}
        >
          <DialogContent 
            sx={{ 
              p: 0, 
              position: 'relative', 
              height: '80vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header dengan title dan tombol-tombol */}
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                bgcolor: 'rgba(255,255,255,0.95)',
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                zIndex: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <Typography variant="h6" sx={{ color: '#75584A', fontWeight: 500 }}>
                Detail Gambar
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => downloadImage(dialogImageUrl, 'gambar-pesanan')}
                  sx={{ 
                    mr: 2,
                    color: "#75584A", 
                    borderColor: "#D9B99B",
                    "&:hover": {
                      borderColor: "#C2A07B",
                      bgcolor: "rgba(217, 185, 155, 0.1)",
                    }
                  }}
                >
                  Unduh
                </Button>
                
                <IconButton
                  aria-label="close"
                  onClick={handleCloseImageDialog}
                  sx={{
                    color: '#75584A',
                    bgcolor: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    '&:hover': {
                      bgcolor: '#f5f5f5',
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
            
            {/* Container untuk gambar */}
            <Box
              sx={{
                flex: 1,
                width: '100%',
                height: 'calc(100% - 64px)', // Kurangi tinggi header
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'auto',
                padding: '16px'
              }}
            >
              <Box
                component="img"
                src={dialogImageUrl}
                alt="Gambar Detail"
                sx={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: '4px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
              />
            </Box>
          </DialogContent>
        </Dialog>
    </Container>
  );
};

export default PesananCatalog;