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

const OrderDetail = () => {
  const { orderUniqueId } = useParams() // Get order_unique_id from URL
  const navigate = useNavigate()
  const { getOrderByUniqueId, loading, error, adminVerifyPayment, sendToDelivery, RecievedUser, completeOrder } = usePemesanan()
  const [orderDetail, setOrderDetail] = useState(null)
  const [currentTab, setCurrentTab] = useState('details')

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
      } catch (err) {
        console.error("Failed to fetch order details:", err)
      }
    }

    if (orderUniqueId) {
      fetchOrderDetail()
    }
  }, [orderUniqueId])

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
                response = await sendToDelivery(orderDetail.id, {
                  status: deliveryData.status,
                  type_pengantaran: deliveryData.type_pengantaran
                });
              } else {
                return;
              }
              break;
              
            case "Sudah_Terkirim":
              const { value: receiptData } = await Swal.fire({
                title: 'Konfirmasi Penerimaan Barang',
                html: `
                  <div class="mb-3">
                    <label class="block text-left text-sm font-medium mb-1">Nama Penerima <span class="text-red-500">*</span></label>
                    <input id="receiver_name" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Masukkan nama penerima" required>
                  </div>
                  <div class="mb-3">
                    <label class="block text-left text-sm font-medium mb-1">Foto Bukti Penerimaan <span class="text-red-500">*</span></label>
                    <input type="file" id="receipt_image" class="w-full px-3 py-2 border border-gray-300 rounded-md" accept="image/*" required>
                    <div id="preview-container" class="mt-2 hidden">
                      <img id="image-preview" class="h-32 w-auto object-cover rounded" />
                    </div>
                  </div>
                  <div class="mb-3">
                    <label class="block text-left text-sm font-medium mb-1">Deskripsi (opsional)</label>
                    <textarea id="description" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Deskripsi penerimaan barang"></textarea>
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
                  
                  fileInput.addEventListener('change', (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        preview.src = e.target.result;
                        previewContainer.classList.remove('hidden');
                      };
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  });
                },
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Konfirmasi Penerimaan',
                cancelButtonText: 'Batal',
                confirmButtonColor: '#a97142',
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
                    description: document.getElementById('description').value || "",
                    notes: document.getElementById('notes').value || ""
                  }
                }
              });
              
              if (receiptData) {
                const formData = new FormData();
                formData.append('image', receiptData.image);
                formData.append('receiver_name', receiptData.receiver_name);
                formData.append('description', receiptData.description);
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
                  response = await RecievedUser(orderDetail.id, formData);
                  Swal.fire('Sukses', 'Konfirmasi penerimaan barang berhasil', 'success');
                } catch (error) {
                  console.error('Error confirming receipt:', error);
                  Swal.fire('Error', error.response?.data?.message || 'Gagal mengkonfirmasi penerimaan barang', 'error');
                }
              } else {
                return;
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
          <Button 
            variant="contained" 
            onClick={() => handleStatusChange("Diproses")}
            sx={{ 
              bgcolor: "#2E7D32", 
              "&:hover": { bgcolor: "#1B5E20" },
              mb: 2
            }}
          >
            Terima Pembayaran
          </Button>
        );
        
      case "Diproses":
        return (
          <Button 
            variant="contained" 
            onClick={() => handleStatusChange("Sedang_Dikirim")}
            sx={{ 
              bgcolor: "#6A1B9A", 
              "&:hover": { bgcolor: "#4A148C" },
              mb: 2
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
              mb: 2
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
              mb: 2
            }}
          >
            Tandai Selesai
          </Button>
        );
        
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ padding: 4 }}>
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
            <Typography>Loading order details...</Typography>
          </Box>
        </Card>
      </Container>
    );
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
    );
  }

  if (!orderDetail) {
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

                        {/* Action button remains centered */}
                        {renderActionButton()}
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
                {/* Product Image */}
                <Box
                  sx={{
                    flex: { xs: "1 1 100%", md: "0 0 40%" },
                    maxWidth: { xs: "100%", md: "40%" },
                  }}
                >
                  <Box
                    component="img"
                    src={`${process.env.REACT_APP_API_URL}/${orderDetail.catalog?.gambar || 'placeholder.jpg'}`}
                    alt={orderDetail.catalog?.nama_katalog || "Product Image"}
                    sx={{
                        width: "100%",
                        maxHeight: "550px",
                        borderRadius: "8px",
                        objectFit: "contain",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    }}
                  />
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
                  <Typography variant="h6" sx={{ fontWeight: 500, color: "#75584A", mb: 2 }}>
                    Bukti Pembayaran
                  </Typography>
                  <Box
                    component="img"
                    src={`${process.env.REACT_APP_API_URL}/${orderDetail.transaction.bukti_transfer}`}
                    alt="Bukti Pembayaran"
                    sx={{
                      maxWidth: "100%",
                      maxHeight: "400px",
                      borderRadius: "8px",
                      objectFit: "contain",
                      display: "block",
                      margin: "0 auto",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    }}
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
            <TableCell>{orderDetail.delivery?.type_pengantaran || "-"}</TableCell>
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
          {orderDetail.delivery?.receiver_name && (
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Diterima Oleh</TableCell>
              <TableCell>{orderDetail.delivery.receiver_name}</TableCell>
            </TableRow>
          )}
          {orderDetail.delivery?.notes && (
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Catatan</TableCell>
              <TableCell>{orderDetail.delivery.notes}</TableCell>
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
          <LocationOnIcon /> Lokasi Pengiriman
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
          {/* Create iframe with Google Maps */}
          <Box 
            component="iframe"
            src={`https://maps.google.com/maps?q=${orderDetail.user.latitude},${orderDetail.user.longitude}&z=15&output=embed`}
            sx={{
              border: "none",
              width: "100%",
              height: "100%",
            }}
            title="Lokasi Pengiriman"
            aria-label="Lokasi Pengiriman"
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
    {orderDetail.delivery?.image && (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 500, color: "#75584A", mb: 2 }}>
          Bukti Penerimaan
        </Typography>
        <Box
          component="img"
          src={`${process.env.REACT_APP_API_URL}/${orderDetail.delivery.image}`}
          alt="Bukti Penerimaan"
          sx={{
            maxWidth: "100%",
            maxHeight: "400px",
            borderRadius: "8px",
            objectFit: "contain",
            display: "block",
            margin: "0 auto",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        />
        {orderDetail.delivery?.description && (
          <Typography variant="body2" sx={{ mt: 2, textAlign: "center", color: "text.secondary" }}>
            {orderDetail.delivery.description}
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
                    
                <Box
                    sx={{
                        flex: { xs: "1 1 100%", md: "0 0 35%" },
                        maxWidth: { xs: "100%", md: "35%" },
                    }}
                >
                    <Box
                        component="img"
                        src={`${process.env.REACT_APP_API_URL}/${orderDetail.catalog.gambar}`}
                        alt={orderDetail.catalog.nama_katalog}
                        sx={{
                            width: "100%",
                            maxHeight: "350px",
                            borderRadius: "8px",
                            objectFit: "contain",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                        }}
                    />
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

          <Divider sx={{ my: 4, borderColor: "#f0e6d9" }} />

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
                        {formatDate(orderDetail.updated_at)}
                        </Typography>
                        <Typography variant="caption">
                        {new Date(orderDetail.updated_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
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
                        {formatDate(orderDetail.updated_at)}
                        </Typography>
                        <Typography variant="caption">
                        {new Date(orderDetail.updated_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
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
                    <TableCell sx={{ fontWeight: 500 }}>Alamat</TableCell>
                    <TableCell>{orderDetail.user?.latitude || "-"}, {orderDetail.user?.longitude || "-"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}

export default OrderDetail