import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import IconButton from "@mui/material/IconButton"
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
import { useAuth } from "../context/AuthContext"
import withReactContent from "sweetalert2-react-content"
import DateRangePickerModal from "../components/DateRangePicker"
const PesananCustom = () => {
  const { orderUniqueId } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const {
    loading: pemesananLoading,
    error: pemesananError,
    adminVerifyPayment,
    sendToDelivery,
    recievedUSer,
    completeOrder,
  } = usePemesanan()

  // Add these API functions after the existing usePemesanan destructuring
  const acceptProposal = async (customOrderId) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/order/custom/accept/propose`,
        { custom_order_id: customOrderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )
      return response.data
    } catch (error) {
      console.error("Error accepting proposal:", error)
      throw error
    }
  }

  const rejectProposal = async (customOrderId, rejectData) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/order/custom/reject/propose`,
        {
          custom_order_id: customOrderId,
          alasan_diTolak: rejectData.alasan_diTolak,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )
      return response.data
    } catch (error) {
      console.error("Error rejecting proposal:", error)
      throw error
    }
  }

  const finalizeOrder = async (customOrderId, finalizeData) => {
    try {
      // Make sure we have all required fields from backend validation
      const payload = {
        detail_bahan: finalizeData.detail_bahan || '',
        total_harga: parseInt(finalizeData.total_harga),
        start_date: finalizeData.start_date,
        end_date: finalizeData.end_date,
        payment_method: finalizeData.payment_method
      };
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/order/custom/finalize/${customOrderId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (response.data && response.data.status) {
        return response.data;
      } else {
        throw new Error(response.data?.message || "Failed to finalize order");
      }
    } catch (error) {
      console.error("Error finalizing order:", error);
      throw error;
    }
  };

  const [orderDetail, setOrderDetail] = useState(null)
  const [currentTab, setCurrentTab] = useState("details")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mainImageIndex, setMainImageIndex] = useState(0)
  const [referenceImages, setReferenceImages] = useState([])
  const ReactSwal = withReactContent(Swal);

  // Status mapping for timeline
  const statusMapping = {
    pending: {
      title: "Menunggu Persetujuan",
      description: "Menunggu persetujuan dari admin",
    },
    disetujui: {
      title: "Disetujui",
      description: "Proposal telah disetujui, menunggu finalisasi",
    },
    ditolak: {
      title: "Ditolak",
      description: "Proposal ditolak oleh admin",
    },
    proses: {
      title: "Diproses",
      description: "Pesanan sedang diproses",
    },
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
        setLoading(true)
        console.log("Fetching custom order with ID:", orderUniqueId)

        // Gunakan endpoint API untuk order custom
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/order/custom/show/${orderUniqueId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        console.log("Custom order details response:", response)

        if (response.data && response.data.message === "Data retrieved successfully") {
          setOrderDetail(response.data.data)

          // Parse and set reference images
          if (response.data.data?.gambar_referensi) {
            try {
              // Handle the image parsing properly
              let parsedImages

              if (typeof response.data.data.gambar_referensi === "string") {
                parsedImages = JSON.parse(response.data.data.gambar_referensi)
              } else if (Array.isArray(response.data.data.gambar_referensi)) {
                parsedImages = response.data.data.gambar_referensi
              } else {
                parsedImages = [response.data.data.gambar_referensi]
              }

              // Ensure we have an array of images
              setReferenceImages(Array.isArray(parsedImages) ? parsedImages : [parsedImages])
              console.log("Parsed reference images:", parsedImages)
            } catch (err) {
              console.error("Error parsing reference images:", err)
              setReferenceImages([])
            }
          }

          setError(null)
        } else {
          throw new Error(response.data?.message || "Gagal mendapatkan data pesanan")
        }
      } catch (err) {
        console.error("Failed to fetch custom order details:", err)
        setError(err.response?.data?.message || "Terjadi kesalahan saat mengambil data pesanan kustom")
      } finally {
        setLoading(false)
      }
    }

    if (orderUniqueId && token) {
      fetchOrderDetail()
    }
  }, [orderUniqueId, token])
  const cancelOrder = async (customOrderId, cancelData) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/order/custom/cancel/propose`,
        cancelData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error canceling order:", error);
      throw error;
    }
  };
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
            case "disetujui":
              response = await acceptProposal(orderDetail.id)
              break

            case "ditolak":
              const { value: rejectData } = await Swal.fire({
                title: "Tolak Proposal",
                html: `
                  <div class="mb-3">
                    <label class="block text-left text-sm font-medium mb-1">Alasan Penolakan <span class="text-red-500">*</span></label>
                    <textarea id="alasan_diTolak" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Masukkan alasan penolakan..." rows="4" required></textarea>
                  </div>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: "Tolak Proposal",
                cancelButtonText: "Batal",
                confirmButtonColor: "#d32f2f",
                preConfirm: () => {
                  const alasanDiTolak = document.getElementById("alasan_diTolak").value
                  if (!alasanDiTolak.trim()) {
                    Swal.showValidationMessage("Alasan penolakan wajib diisi")
                    return false
                  }
                  return {
                    alasan_diTolak: alasanDiTolak.trim(),
                  }
                },
              })

              if (rejectData) {
                response = await rejectProposal(orderDetail.id, rejectData)
              } else {
                return
              }
              break
              // First, add these imports at the top of your file

            // Then update the proses case in handleStatusChange function
            case "proses":
              try {
                // Function to format number with thousand separator
                const formatNumberWithSeparator = (value) => {
                  return "Rp " + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                };
              
                // Step 1: First modal for price and material details
                const { value: priceAndMaterialData } = await Swal.fire({
                  title: 'Finalisasi Pemesanan',
                  html:
                    '<div class="mb-3">' +
                    '<label for="total-harga" class="block text-sm font-medium text-gray-700 mb-1">Total Harga <span class="text-red-500">*</span></label>' +
                    '<input id="price-raw" type="hidden" value="0">' +
                    '<input id="price-display" type="text" class="w-full p-2 border border-gray-300 rounded" placeholder="Masukkan total harga">' +
                    '</div>' +
                    '<div class="mb-3">' +
                    '<label for="detail-bahan" class="block text-sm font-medium text-gray-700 mb-1">Detail Bahan (opsional)</label>' +
                    '<textarea id="detail-bahan" class="w-full p-2 border border-gray-300 rounded" placeholder="Masukkan detail bahan"></textarea>' +
                    '</div>' +
                    '<div class="mb-3">' +
                    '<label for="payment-method" class="block text-sm font-medium text-gray-700 mb-1">Metode Pembayaran <span class="text-red-500">*</span></label>' +
                    '<select id="payment-method" class="w-full p-2 border border-gray-300 rounded">' +
                    '<option value="">Pilih Metode Pembayaran</option>' +
                    '<option value="BCA">BCA</option>' +
                    '<option value="E-Wallet_Dana">E-Wallet Dana</option>' +
                    '<option value="Cash">Cash</option>' +
                    '</select>' +
                    '</div>',
                  focusConfirm: false,
                  showCancelButton: true,
                  confirmButtonText: 'Lanjutkan ke Pilih Tanggal',
                  cancelButtonText: 'Batal',
                  confirmButtonColor: '#a97142',
                  customClass: {
                    container: 'swal2-responsive-container',
                    popup: 'swal2-responsive-popup',
                    content: 'swal2-responsive-content',
                    input: 'swal2-responsive-input',
                    actions: 'swal2-responsive-actions',
                    confirmButton: 'swal2-responsive-confirm-button',
                    cancelButton: 'swal2-responsive-cancel-button'
                  },
                  didOpen: () => {
                    // Add responsive styles
                    const styleElement = document.createElement('style');
                    styleElement.innerHTML = `
                      @media (max-width: 500px) {
                        .swal2-responsive-popup {
                          width: 90% !important;
                          font-size: 14px !important;
                        }
                        .swal2-responsive-content input, 
                        .swal2-responsive-content textarea,
                        .swal2-responsive-content select {
                          font-size: 14px !important;
                        }
                        .swal2-responsive-actions {
                          flex-direction: column-reverse;
                          gap: 8px;
                        }
                        .swal2-responsive-confirm-button, 
                        .swal2-responsive-cancel-button {
                          margin: 0 !important;
                          width: 100% !important;
                        }
                      }
                    `;
                    document.head.appendChild(styleElement);

                    const priceRaw = document.getElementById('price-raw');
                    const priceDisplay = document.getElementById('price-display');
                    
                    // Initialize with empty field instead of zero
                    priceDisplay.value = ""; 
                    priceRaw.value = "0";
                    
                    // Handle input changes for price
                    priceDisplay.addEventListener('input', (e) => {
                      // Remove non-numeric characters
                      let value = e.target.value.replace(/[^\d]/g, '');
                      
                      // Store raw value
                      priceRaw.value = value || '0';
                      
                      // Format for display if there's a value
                      if (value) {
                        e.target.value = formatNumberWithSeparator(value);
                      } else {
                        e.target.value = ""; // Show empty field instead of Rp 0
                      }
                    });
                    
                    // Handle focus to select all text
                    priceDisplay.addEventListener('focus', (e) => {
                      e.target.select();
                    });
                  },
                  preConfirm: () => {
                    const totalHarga = document.getElementById('price-raw').value;
                    const detailBahan = document.getElementById('detail-bahan').value;
                    const paymentMethod = document.getElementById('payment-method').value;
                    
                    // Validate total harga
                    if (!totalHarga || totalHarga === '0') {
                      Swal.showValidationMessage('Total harga harus diisi');
                      return false;
                    }
                    
                    if (isNaN(totalHarga) || parseInt(totalHarga) <= 0) {
                      Swal.showValidationMessage('Total harga harus berupa angka positif');
                      return false;
                    }
                    
                    if (!paymentMethod) {
                      Swal.showValidationMessage('Metode pembayaran harus dipilih');
                      return false;
                    }
                    
                    return {
                      total_harga: parseInt(totalHarga),
                      detail_bahan: detailBahan,
                      payment_method: paymentMethod
                    };
                  }
                });
                
                if (!priceAndMaterialData) return; // User cancelled
                
                // Step 2: Use ReactSwal with DateRangePickerModal component
                let dateRangeData = null;
                
                await ReactSwal.fire({
                  title: 'Pilih Periode Produksi',
                  html: <DateRangePickerModal onSelect={(data) => { dateRangeData = data; ReactSwal.close(); }} />,
                  showConfirmButton: false,
                  showCancelButton: true,
                  cancelButtonText: 'Kembali',
                  cancelButtonColor: '#718096',
                  width: 'auto',
                  customClass: {
                    container: 'swal2-responsive-container',
                    popup: 'swal2-date-picker-popup',
                    content: 'swal2-responsive-content',
                    actions: 'swal2-responsive-actions',
                    cancelButton: 'swal2-responsive-cancel-button'
                  },
                  didOpen: () => {
                    // Add responsive styles specific for date picker
                    const styleElement = document.createElement('style');
                    styleElement.innerHTML = `
                      @media (max-width: 500px) {
                        .swal2-date-picker-popup {
                          width: 95% !important;
                          padding: 0.5rem !important;
                          margin: 0.5rem auto !important;
                        }
                        .swal2-responsive-actions {
                          margin-top: 0.5rem !important;
                        }
                        .swal2-responsive-cancel-button {
                          margin: 0 !important;
                          width: 100% !important;
                        }
                      }
                    `;
                    document.head.appendChild(styleElement);
                    
                    // Hide the confirm button since we're using our own in the React component
                    document.querySelector('.swal2-confirm').style.display = 'none';
                    
                    // Make cancel button full width on mobile
                    if (window.innerWidth < 768) {
                      const cancelBtn = document.querySelector('.swal2-cancel');
                      if (cancelBtn) {
                        cancelBtn.style.width = '100%';
                        cancelBtn.style.margin = '0';
                      }
                    }
                  }
                });
                
                if (!dateRangeData) return; // User cancelled
                
                // Combine the data from both modals
                const finalizeData = {
                  ...priceAndMaterialData,
                  start_date: dateRangeData.startDate,
                  end_date: dateRangeData.endDate
                };
                
                // Show loading state
                Swal.fire({
                  title: "Memproses...",
                  text: "Sedang memfinalisasi pesanan",
                  allowOutsideClick: false,
                  didOpen: () => {
                    Swal.showLoading();
                  }
                });

                // Call API to finalize order
                response = await finalizeOrder(orderDetail.id, finalizeData);
                
                Swal.fire({
                  title: "Berhasil!",
                  text: "Pesanan berhasil difinalisasi dan siap untuk pembayaran.",
                  icon: "success",
                  confirmButtonColor: "#a97142"
                });
                
              } catch (error) {
                console.error("Error finalizing order:", error);
                Swal.fire({
                  title: "Error",
                  text: error.response?.data?.message || "Gagal memfinalisasi pesanan",
                  icon: "error",
                  confirmButtonColor: "#d32f2f"
                });
              }
              break;
              case "cancel":
                const { value: cancelData } = await Swal.fire({
                  title: "Batalkan Pesanan",
                  html: `
                    <div class="mb-3">
                      <label class="block text-left text-sm font-medium mb-1">Alasan Pembatalan <span class="text-red-500">*</span></label>
                      <textarea id="alasan_diTolak" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Masukkan alasan pembatalan..." rows="4" required></textarea>
                    </div>
                  `,
                  focusConfirm: false,
                  showCancelButton: true,
                  confirmButtonText: "Batalkan Pesanan",
                  cancelButtonText: "Kembali",
                  confirmButtonColor: "#d32f2f",
                  preConfirm: () => {
                    const alasanPembatalan = document.getElementById("alasan_diTolak").value;
                    if (!alasanPembatalan.trim()) {
                      Swal.showValidationMessage("Alasan pembatalan wajib diisi");
                      return false;
                    }
                    return {
                      alasan_diTolak: alasanPembatalan.trim(),
                    };
                  },
                });

                if (cancelData) {
                  response = await cancelOrder(orderDetail.id, cancelData);
                } else {
                  return;
                }
                break;
            case "Diproses":
              response = await adminVerifyPayment(orderDetail.id, "approve")
              break

            case "Sedang_Dikirim":
              const { value: deliveryData } = await Swal.fire({
                title: "Konfirmasi Pengiriman",
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
                confirmButtonText: "Kirim",
                cancelButtonText: "Batal",
                confirmButtonColor: "#a97142",
                preConfirm: () => {
                  const typePengantaran = document.getElementById("type_pengantaran").value
                  if (!typePengantaran) {
                    Swal.showValidationMessage("Metode pengiriman wajib dipilih")
                    return false
                  }
                  return {
                    status: "Sedang_Dikirim",
                    type_pengantaran: typePengantaran,
                    notes: document.getElementById("notes").value || "",
                  }
                },
              })

              if (deliveryData) {
                response = await sendToDelivery(orderDetail.id, {
                  status: deliveryData.status,
                  type_pengantaran: deliveryData.type_pengantaran,
                  notes: deliveryData.notes,
                })
              } else {
                return
              }
              break

            case "Sudah_Terkirim":
              const { value: receiptData } = await Swal.fire({
                title: "Konfirmasi Penerimaan Barang",
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
                  const fileInput = document.getElementById("receipt_image")
                  const preview = document.getElementById("image-preview")
                  const previewContainer = document.getElementById("preview-container")

                  fileInput.addEventListener("change", (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const reader = new FileReader()
                      reader.onload = (e) => {
                        preview.src = e.target.result
                        previewContainer.classList.remove("hidden")
                      }
                      reader.readAsDataURL(e.target.files[0])
                    }
                  })
                },
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: "Konfirmasi Penerimaan",
                cancelButtonText: "Batal",
                confirmButtonColor: "#a97142",
                preConfirm: () => {
                  const receiverName = document.getElementById("receiver_name").value
                  const imageFile = document.getElementById("receipt_image").files[0]

                  if (!receiverName) {
                    Swal.showValidationMessage("Nama penerima wajib diisi")
                    return false
                  }

                  if (!imageFile) {
                    Swal.showValidationMessage("Foto bukti penerimaan wajib diupload")
                    return false
                  }

                  return {
                    receiver_name: receiverName,
                    image: imageFile,
                    description: document.getElementById("description").value || "",
                    notes: document.getElementById("notes").value || "",
                  }
                },
              })

              if (receiptData) {
                const formData = new FormData()
                formData.append("image", receiptData.image)
                formData.append("receiver_name", receiptData.receiver_name)
                formData.append("description", receiptData.description)
                formData.append("notes", receiptData.notes)

                Swal.fire({
                  title: "Memproses...",
                  text: "Sedang mengirim data penerimaan",
                  allowOutsideClick: false,
                  didOpen: () => {
                    Swal.showLoading()
                  },
                })

                try {
                  response = await recievedUSer(orderDetail.id, formData)
                  Swal.fire("Sukses", "Konfirmasi penerimaan barang berhasil", "success")
                } catch (error) {
                  console.error("Error confirming receipt:", error)
                  Swal.fire("Error", error.response?.data?.message || "Gagal mengkonfirmasi penerimaan barang", "error")
                }
              } else {
                return
              }
              break

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
            const refreshResponse = await axios.get(
              `${process.env.REACT_APP_API_URL}/api/order/custom/show/${orderUniqueId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            )

            if (refreshResponse.data && refreshResponse.data.message === "Data retrieved successfully") {
              setOrderDetail(refreshResponse.data.data)
            }
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
    return amount ? `Rp ${Number.parseInt(amount).toLocaleString("id-ID")}` : "Pending"
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
        return { bg: "#FFF3E0", text: "#E65100" }
      case "disetujui":
        return { bg: "#E8F5E8", text: "#2E7D32" }
      case "ditolak":
        return { bg: "#FFEBEE", text: "#C62828" }
      case "proses":
        return { bg: "#E3F2FD", text: "#1565C0" }
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

  // Render action button based on status
  const renderActionButton = () => {
    if (!orderDetail) return null

    switch (orderDetail.status) {
      case "pending":
        return (
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              onClick={() => handleStatusChange("disetujui")}
              sx={{
                bgcolor: "#2E7D32",
                "&:hover": { bgcolor: "#1B5E20" },
              }}
            >
              Setujui Proposal
            </Button>
            <Button
              variant="contained"
              onClick={() => handleStatusChange("ditolak")}
              sx={{
                bgcolor: "#d32f2f",
                "&:hover": { bgcolor: "#b71c1c" },
              }}
            >
              Tolak Proposal
            </Button>
          </Box>
        )

      case "disetujui":
         // Format phone number for WhatsApp
        const formatPhoneForWhatsApp = () => {
          let phone = orderDetail?.no_telp || orderDetail.user?.phone || "";
          // Remove non-digit characters
          phone = phone.replace(/\D/g, "");
          // Ensure it starts with country code (62 for Indonesia)
          if (phone.startsWith("0")) {
            phone = "62" + phone.substring(1);
          } else if (!phone.startsWith("62")) {
            phone = "62" + phone;
          }
          return phone;
        };
      
        const waMessage = encodeURIComponent(`Halo ${orderDetail?.nama_lengkap || orderDetail.user?.name || ""}! Saya ingin berdiskusi mengenai pesanan kustom Anda dengan ID: ${orderDetail.order_unique_id || orderDetail.custom_order_unique_id || `#CST${orderDetail.id}`}`);
        
        return (
          <Box sx={{ display: "flex", flexDirection: {xs: "column", sm: "row"}, gap: 2, mb: 2, justifyContent: "center" }}>
            <Button
              variant="contained"
              onClick={() => handleStatusChange("proses")}
              sx={{
                bgcolor: "#1565C0",
                "&:hover": { bgcolor: "#0D47A1" },
              }}
            >
              Finalisasi Pesanan
            </Button>
            
            <Button
              variant="contained"
              component="a"
              href={`https://wa.me/${formatPhoneForWhatsApp()}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                bgcolor: "#25D366",
                "&:hover": { bgcolor: "#128C7E" },
              }}
            >
              Negosiasi via WhatsApp
            </Button>
            
            <Button
              variant="contained"
              onClick={() => handleStatusChange("cancel")}
              sx={{
                bgcolor: "#d32f2f",
                "&:hover": { bgcolor: "#b71c1c" },
              }}
            >
              Batalkan Pesanan
            </Button>
          </Box>
        );
      case "Menunggu_Konfirmasi":
        return (
          <Button
            variant="contained"
            onClick={() => handleStatusChange("Diproses")}
            sx={{
              bgcolor: "#2E7D32",
              "&:hover": { bgcolor: "#1B5E20" },
              mb: 2,
            }}
          >
            Terima Pembayaran
          </Button>
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
            }}
          >
            Tandai Selesai
          </Button>
        )

      default:
        return null
    }
  }

  // Helper function untuk mengambil data yang benar dari nested objects
  const getNestedData = (key) => {
    if (!orderDetail) return null

    // Cek di level utama
    if (orderDetail[key] !== undefined && orderDetail[key] !== null) {
      return orderDetail[key]
    }

    // Cek di
    if (orderDetail && orderDetail[key] !== undefined && orderDetail[key] !== null) {
      return orderDetail[key]
    }

    return null
  }

  // Function to handle thumbnail click
  const handleThumbnailClick = (index) => {
    setMainImageIndex(index)
  }

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
    )
  }

  const calculateTotalQuantity = () => {
    if (!orderDetail?.colors || orderDetail.colors.length === 0) return 0

    return orderDetail.colors.reduce((total, color) => {
      if (!color.sizes) return total

      return total + color.sizes.reduce((sum, size) => sum + Number.parseInt(size.jumlah || 0), 0)
    }, 0)
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
    )
  }

  const orderTimelineSteps = generateOrderTimelineSteps()
  const statusColor = getStatusColor(orderDetail.status)

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
                Detail Pesanan Kustom
              </Typography>

              <Typography variant="body1" sx={{ color: "#75584A", mb: 2 }}>
                ID Pesanan:{" "}
                {orderDetail.order_unique_id || orderDetail.custom_order_unique_id || `#CST${orderDetail.id}`}
              </Typography>

            </Box>
          </Box>

          <Divider sx={{ mb: 4, borderColor: "#f0e6d9" }} />

          {/* Navigation tabs */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", borderBottom: "1px solid #f0e6d9", flexWrap: "wrap" }}>
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
                onClick={() => setCurrentTab("customDetails")}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderBottom: currentTab === "customDetails" ? "2px solid #D9B99B" : "none",
                  borderRadius: 0,
                  color: currentTab === "customDetails" ? "#75584A" : "text.secondary",
                  fontWeight: currentTab === "customDetails" ? 600 : 400,
                  "&:hover": { bgcolor: "transparent", color: "#75584A" },
                }}
              >
                Detail Kustom
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
                {/* Product Image or Custom Image */}
                <Box
                  sx={{
                    flex: { xs: "1 1 100%", md: "0 0 40%" },
                    maxWidth: { xs: "100%", md: "40%" },
                  }}
                >
                  {/* Enhanced Image Gallery */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    {/* Main Image Container */}
                    <Box
                      sx={{
                        width: "100%",
                        height: "450px",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                        overflow: "hidden",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#f9f9f9",
                        position: "relative",
                      }}
                    >
                      {referenceImages.length > 0 ? (
                        <Box
                          component="img"
                          src={`${process.env.REACT_APP_API_URL}/${referenceImages[mainImageIndex]}`}
                          alt={`Reference Image ${mainImageIndex + 1}`}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            transition: "all 0.3s ease",
                          }}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/400x500?text=No+Image"
                          }}
                        />
                      ) : (
                        <Box
                          component="img"
                          src="https://via.placeholder.com/400x500?text=No+Image"
                          alt="No Reference Image"
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      )}
                    </Box>

                    {/* Thumbnails Container */}
                    {referenceImages.length > 1 && (
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                          justifyContent: "center",
                        }}
                      >
                        {referenceImages.map((image, index) => (
                          <Box
                            key={index}
                            component="img"
                            src={`${process.env.REACT_APP_API_URL}/${image}`}
                            alt={`Reference ${index + 1}`}
                            sx={{
                              width: "70px",
                              height: "70px",
                              objectFit: "cover",
                              borderRadius: "4px",
                              cursor: "pointer",
                              border: mainImageIndex === index ? "2px solid #D9B99B" : "2px solid transparent",
                              opacity: mainImageIndex === index ? 1 : 0.7,
                              transition: "all 0.2s",
                              "&:hover": {
                                opacity: 1,
                                transform: "scale(1.05)",
                              },
                            }}
                            onClick={() => handleThumbnailClick(index)}
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/70x70?text=No+Image"
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
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
                          <TableCell sx={{ fontWeight: 500, width: "40%" }}>Jenis Pakaian</TableCell>
                          <TableCell>{orderDetail?.jenis_baju || "-"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Bahan</TableCell>
                          <TableCell>{orderDetail?.detail_bahan || "-"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Sumber Kain</TableCell>
                          <TableCell>{orderDetail?.sumber_kain || "-"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Jumlah</TableCell>
                          <TableCell>{calculateTotalQuantity()} pcs</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Warna dan Ukuran</TableCell>
                          <TableCell>
                            <TableContainer sx={{ mt: 1 }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Warna</TableCell>
                                    <TableCell>Ukuran</TableCell>
                                    <TableCell align="right">Jumlah</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {orderDetail?.colors &&
                                    orderDetail.colors.flatMap(
                                      (color, colorIndex) =>
                                        color.sizes &&
                                        color.sizes.map((size, sizeIndex) => (
                                          <TableRow key={`${colorIndex}-${sizeIndex}`}>
                                            <TableCell>{color.color_name}</TableCell>
                                            <TableCell>{size.size}</TableCell>
                                            <TableCell align="right">{size.jumlah} pcs</TableCell>
                                          </TableRow>
                                        )),
                                    )}
                                  <TableRow>
                                    <TableCell colSpan={2} sx={{ fontWeight: 600 }}>
                                      Total
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                                      {calculateTotalQuantity()} pcs
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Catatan</TableCell>
                          <TableCell>{orderDetail.catatan || orderDetail?.catatan || "-"}</TableCell>
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
                      Total Harga: {formatCurrency(orderDetail.total_harga || orderDetail?.total_harga)}
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
                      <TableCell>{formatCurrency(orderDetail.total_harga || orderDetail?.total_harga)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500 }}>Status Pembayaran</TableCell>
                      <TableCell>
                        <Chip
                          label={orderDetail.transaction?.status || orderDetail?.status_pembayaran || "-"}
                          size="small"
                          sx={{
                            bgcolor:
                              orderDetail.transaction?.status === "success" ||
                              orderDetail?.status_pembayaran === "sudah_bayar"
                                ? "#C8E6C9"
                                : "#FFF9C4",
                            color:
                              orderDetail.transaction?.status === "success" ||
                              orderDetail?.status_pembayaran === "sudah_bayar"
                                ? "#2E7D32"
                                : "#F57F17",
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

              {orderDetail.transaction?.bukti_transfer && (
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
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x300?text=No+Image"
                    }}
                  />
                </Box>
              )}
            </Box>
          )}

          {currentTab === "customDetails" && (
            <Box sx={{ marginBottom: 4 }}>
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
                  {/* Enhanced Image Gallery for Custom Details Tab */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    {/* Main Image Container */}
                    <Box
                      sx={{
                        width: "100%",
                        height: "350px",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                        overflow: "hidden",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#f9f9f9",
                      }}
                    >
                      {referenceImages.length > 0 ? (
                        <Box
                          component="img"
                          src={`${process.env.REACT_APP_API_URL}/${referenceImages[mainImageIndex]}`}
                          alt={`Reference Image ${mainImageIndex + 1}`}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            transition: "all 0.3s ease",
                          }}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/350x350?text=No+Image"
                          }}
                        />
                      ) : (
                        <Box
                          component="img"
                          src="https://via.placeholder.com/350x350?text=No+Image"
                          alt="No Reference Image"
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      )}
                    </Box>

                    {/* Thumbnails Container */}
                    {referenceImages.length > 1 && (
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                          justifyContent: "center",
                        }}
                      >
                        {referenceImages.map((image, index) => (
                          <Box
                            key={index}
                            component="img"
                            src={`${process.env.REACT_APP_API_URL}/${image}`}
                            alt={`Reference ${index + 1}`}
                            sx={{
                              width: "70px",
                              height: "70px",
                              objectFit: "cover",
                              borderRadius: "4px",
                              cursor: "pointer",
                              border: mainImageIndex === index ? "2px solid #D9B99B" : "2px solid transparent",
                              opacity: mainImageIndex === index ? 1 : 0.7,
                              transition: "all 0.2s",
                              "&:hover": {
                                opacity: 1,
                                transform: "scale(1.05)",
                              },
                            }}
                            onClick={() => handleThumbnailClick(index)}
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/70x70?text=No+Image"
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Custom Order Details */}
                <Box
                  sx={{
                    flex: { xs: "1 1 100%", md: "0 0 60%" },
                    maxWidth: { xs: "100%", md: "60%" },
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 600, color: "#75584A", mb: 2 }}>
                    {orderDetail?.jenis_baju || "Pesanan Kustom"}
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
                              Spesifikasi Pesanan Kustom
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500, width: "40%" }}>Nama Pemesan</TableCell>
                          <TableCell>{orderDetail?.nama_lengkap || orderDetail.user?.name || "-"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Email</TableCell>
                          <TableCell>{orderDetail?.email || orderDetail.user?.email || "-"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>No. Telp</TableCell>
                          <TableCell>{orderDetail?.no_telp || orderDetail.user?.phone || "-"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Jumlah</TableCell>
                          <TableCell>{calculateTotalQuantity()} pcs</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Warna dan Ukuran</TableCell>
                          <TableCell>
                            <TableContainer sx={{ mt: 1 }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Warna</TableCell>
                                    <TableCell>Ukuran</TableCell>
                                    <TableCell align="right">Jumlah</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {orderDetail?.colors &&
                                    orderDetail.colors.flatMap(
                                      (color, colorIndex) =>
                                        color.sizes &&
                                        color.sizes.map((size, sizeIndex) => (
                                          <TableRow key={`${colorIndex}-${sizeIndex}`}>
                                            <TableCell>{color.color_name}</TableCell>
                                            <TableCell>{size.size}</TableCell>
                                            <TableCell align="right">{size.jumlah} pcs</TableCell>
                                          </TableRow>
                                        )),
                                    )}
                                  <TableRow>
                                    <TableCell colSpan={2} sx={{ fontWeight: 600 }}>
                                      Total
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                                      {calculateTotalQuantity()} pcs
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Jenis Pakaian</TableCell>
                          <TableCell>{orderDetail?.jenis_baju || "-"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Bahan</TableCell>
                          <TableCell>{orderDetail?.detail_bahan || "-"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Estimasi Waktu</TableCell>
                          <TableCell>{orderDetail?.estimasi_waktu || "-"}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 500, color: "#75584A", mb: 2 }}>
                      Catatan Pesanan
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: "8px",
                        backgroundColor: "#f9f4ef",
                        border: "1px solid #D9B99B",
                      }}
                    >
                      <Typography variant="body1">{orderDetail?.catatan || "Tidak ada catatan tambahan"}</Typography>
                    </Paper>
                  </Box>
                </Box>
              </Box>
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
                      <TableCell>{orderDetail.delivery?.type_pengantaran || "-"}</TableCell>
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
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 500, color: "#75584A", mb: 2, display: "flex", alignItems: "center", gap: 1 }}
                  >
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
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x300?text=No+Image"
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

          <Divider sx={{ my: 4, borderColor: "#f0e6d9" }} />

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
                {/* Order Created - Always show this first */}
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
                      <TimelineConnector sx={{ backgroundColor: "#E65100" }} />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body1" fontWeight="medium">
                        Pesanan Dibuat
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pesanan custom telah dibuat
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}

                {/* Pending - Admin Review Stage */}
                {(orderDetail.status === "pending" || 
                  orderDetail.status === "disetujui" || 
                  orderDetail.status === "proses" || 
                  ["Menunggu_Pembayaran", "Menunggu_Konfirmasi", "Diproses", "Sedang_Dikirim", "Sudah_Terkirim", "Selesai"].includes(orderDetail.status)) && (
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
                      <TimelineDot sx={{ backgroundColor: orderDetail.status === "pending" ? "#E65100" : "#9e9e9e" }} />
                      {(orderDetail.status === "disetujui" || 
                        orderDetail.status === "proses" || 
                        ["Menunggu_Pembayaran", "Menunggu_Konfirmasi", "Diproses", "Sedang_Dikirim", "Sudah_Terkirim", "Selesai"].includes(orderDetail.status)) && (
                        <TimelineConnector sx={{ backgroundColor: "#2E7D32" }} />
                      )}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body1" fontWeight="medium">
                        Menunggu Persetujuan
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Menunggu persetujuan dari admin untuk pesanan custom
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}

                {/* Disetujui - Admin Approved */}
                {(orderDetail.status === "disetujui" || 
                  orderDetail.status === "proses" || 
                  ["Menunggu_Pembayaran", "Menunggu_Konfirmasi", "Diproses", "Sedang_Dikirim", "Sudah_Terkirim", "Selesai"].includes(orderDetail.status)) && (
                  <TimelineItem>
                    <TimelineOppositeContent sx={{ flex: 0.2 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(orderDetail.responded_at || orderDetail.updated_at)}
                      </Typography>
                      <Typography variant="caption">
                        {new Date(orderDetail.responded_at || orderDetail.updated_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot sx={{ backgroundColor: orderDetail.status === "disetujui" ? "#2E7D32" : "#9e9e9e" }} />
                      {(orderDetail.status === "proses" || 
                        ["Menunggu_Pembayaran", "Menunggu_Konfirmasi", "Diproses", "Sedang_Dikirim", "Sudah_Terkirim", "Selesai"].includes(orderDetail.status)) && (
                        <TimelineConnector sx={{ backgroundColor: "#1565C0" }} />
                      )}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body1" fontWeight="medium">
                        Proposal Disetujui
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Proposal pesanan custom telah disetujui oleh admin
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}

                {/* Proses - Finalization Stage */}
                {(orderDetail.status === "proses" || 
                  ["Menunggu_Pembayaran", "Menunggu_Konfirmasi", "Diproses", "Sedang_Dikirim", "Sudah_Terkirim", "Selesai"].includes(orderDetail.status)) && (
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
                      <TimelineDot sx={{ backgroundColor: orderDetail.status === "proses" ? "#1565C0" : "#9e9e9e" }} />
                      {["Menunggu_Pembayaran", "Menunggu_Konfirmasi", "Diproses", "Sedang_Dikirim", "Sudah_Terkirim", "Selesai"].includes(orderDetail.status) && (
                        <TimelineConnector sx={{ backgroundColor: "#F57F17" }} />
                      )}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body1" fontWeight="medium">
                        Finalisasi Pesanan
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pesanan sedang dalam tahap finalisasi (penetapan harga, jadwal, dll)
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}

                {/* Payment Required */}
                {["Menunggu_Pembayaran", "Menunggu_Konfirmasi", "Diproses", "Sedang_Dikirim", "Sudah_Terkirim", "Selesai"].includes(orderDetail.status) && (
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
                      <TimelineDot sx={{ backgroundColor: orderDetail.status === "Menunggu_Pembayaran" ? "#F57F17" : "#9e9e9e" }} />
                      {["Menunggu_Konfirmasi", "Diproses", "Sedang_Dikirim", "Sudah_Terkirim", "Selesai"].includes(orderDetail.status) && (
                        <TimelineConnector sx={{ backgroundColor: "#1565c0" }} />
                      )}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body1" fontWeight="medium">
                        Menunggu Pembayaran
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Menunggu pembayaran dari pelanggan
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}

                {/* Payment Received */}
                {["Menunggu_Konfirmasi", "Diproses", "Sedang_Dikirim", "Sudah_Terkirim", "Selesai"].includes(orderDetail.status) && (
                  <TimelineItem>
                    <TimelineOppositeContent sx={{ flex: 0.2 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(orderDetail.transaction?.created_at || orderDetail.updated_at)}
                      </Typography>
                      <Typography variant="caption">
                        {(orderDetail.transaction?.created_at
                          ? new Date(orderDetail.transaction.created_at).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : new Date(orderDetail.updated_at).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                        )}
                      </Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot sx={{ backgroundColor: orderDetail.status === "Menunggu_Konfirmasi" ? "#1565c0" : "#9e9e9e" }} />
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
                      <TimelineDot sx={{ backgroundColor: orderDetail.status === "Diproses" ? "#2e7d32" : "#9e9e9e" }} />
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
                      <TimelineDot sx={{ backgroundColor: orderDetail.status === "Sedang_Dikirim" ? "#6a1b9a" : "#9e9e9e" }} />
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
                      <TimelineDot sx={{ backgroundColor: orderDetail.status === "Sudah_Terkirim" ? "#00838f" : "#9e9e9e" }} />
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
                    <TableCell>{orderDetail?.nama_lengkap || orderDetail.user?.name || "-"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500 }}>Email</TableCell>
                    <TableCell>{orderDetail?.email || orderDetail.user?.email || "-"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500 }}>Telepon</TableCell>
                    <TableCell>{orderDetail?.no_telp || orderDetail.user?.phone || "-"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500 }}>Alamat</TableCell>
                    <TableCell>{orderDetail.user?.address || "-"}</TableCell>
                  </TableRow>
                  {orderDetail.user?.latitude && orderDetail.user?.longitude && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500 }}>Koordinat</TableCell>
                      <TableCell>
                        {orderDetail.user?.latitude || "-"}, {orderDetail.user?.longitude || "-"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}

export default PesananCustom
