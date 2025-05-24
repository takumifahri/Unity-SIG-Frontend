import { useEffect, useState } from "react"
import { usePakaian } from "../context/PakaianContext"
import { useBahan } from "../context/BahanContext"
import { usePemesanan } from "../context/PemesananContext"
import TambahPesananModal from "./TambahPesananModal"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"

const Pemesanan = () => {
  // Tooltip styles
  const tooltipStyle = {
    position: "relative",
    display: "inline-block",
  }

  const tooltipTextStyle = {
    visibility: "hidden",
    width: "auto",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    color: "#fff",
    textAlign: "center",
    borderRadius: "6px",
    padding: "5px 10px",
    position: "absolute",
    zIndex: 1,
    bottom: "125%",
    left: "50%",
    transform: "translateX(-50%)",
    opacity: 0,
    transition: "opacity 0.3s",
    whiteSpace: "nowrap",
    fontSize: "12px",
  }

  const showTooltip = (e) => {
    const tooltip = e.currentTarget.querySelector(".tooltip-text")
    if (tooltip) tooltip.style.visibility = "visible"
    if (tooltip) tooltip.style.opacity = "1"
  }

  const hideTooltip = (e) => {
    const tooltip = e.currentTarget.querySelector(".tooltip-text")
    if (tooltip) tooltip.style.visibility = "hidden"
    if (tooltip) tooltip.style.opacity = "0"
  }

  // Context hooks
  const { pakaianList } = usePakaian()
  const { bahanList } = useBahan()
  const {
    pesanan,
    customOrders,
    loading,
    error,
    fetchAllOrders,
    fetchAllCustomAndOrders,
    adminVerifyPayment,
    sendToDelivery,
    recievedUser,
    completeOrder,
  } = usePemesanan()

  // Local state
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate()
  const [sortOption, setSortOption] = useState("newest")
  const [loadingData, setLoadingData] = useState(true) // New loading state for data

  // Load orders on mount
  useEffect(() => {
    fetchData()
  }, [])

  // Function to fetch data with loading state
  const fetchData = async () => {
    setLoadingData(true)
    try {
      await fetchAllOrders()
      console.log("Data pesanan:", pesanan)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoadingData(false)
    }
  }

  // Helper functions for size and color display
  const getSizeInfo = (pesanan) => {
    if (!pesanan) return "-"

    if (typeof pesanan.size === "string" && isNaN(pesanan.size)) {
      return pesanan.size
    }

    if (pesanan.catalog && pesanan.catalog.colors && pesanan.catalog.colors.length > 0) {
      for (const color of pesanan.catalog.colors) {
        if (color.sizes && color.sizes.id == pesanan.size) {
          return color.sizes.size
        }
      }
    }

    return pesanan.size || "-"
  }

  const getColorInfo = (pesanan) => {
    if (!pesanan) return "-"

    if (typeof pesanan.color === "string" && isNaN(pesanan.color)) {
      return pesanan.color
    }

    if (pesanan.catalog && pesanan.catalog.colors && pesanan.catalog.colors.length > 0) {
      const color = pesanan.catalog.colors.find((c) => c.id == pesanan.color)
      if (color) {
        return color.color_name
      }
    }

    return pesanan.color || "-"
  }

  // Handle detail navigation with order_unique_id
  const handleDetail = (pesanan) => {
    if (!pesanan) return

    // Debug - add this line
    console.log("Order being viewed:", pesanan)

    if (!pesanan.order_unique_id) {
      console.error("Order ID is missing", pesanan)
      return
    }

    // Check order type based on catalog_id
    if (pesanan.catalog_id === null && pesanan.custom_order_id) {
      // This is a custom order
      navigate(`/admin/customOrder/${pesanan.order_unique_id}`)
    } else {
      // This is a catalog order
      navigate(`/admin/CatalogPesan/${pesanan.order_unique_id}`)
    }
  }

  // Custom order detail navigation
  const handleCustomOrderDetail = (customOrderId) => {
    if (!customOrderId) return
    navigate(`/custom-order/${customOrderId}`)
  }

  // Handle adding a new order
  const handleAddPesanan = (newPesanan) => {
    setIsModalOpen(false)
    fetchData()
  }

  // Handle status change
  const handleStatusChange = async (id, newStatus) => {
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
            case "Diproses":
              // Verify payment - untuk Menunggu_Konfirmasi → Diproses
              response = await adminVerifyPayment(id, "approve")
              break

            case "Sedang_Dikirim":
              // Modal untuk memilih metode pengiriman
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
                // Kirim parameter yang sesuai ke API
                response = await sendToDelivery(id, {
                  status: deliveryData.status,
                  type_pengantaran: deliveryData.type_pengantaran,
                })

                // Log catatan jika ada (opsional)
                if (deliveryData.notes) {
                  console.log(`Catatan pengiriman untuk order ${id}: ${deliveryData.notes}`)
                }
              } else {
                return
              }
              break

            case "Sudah_Terkirim":
              // Form untuk konfirmasi penerimaan barang
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
                  // Preview gambar yang diupload
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
                // Buat FormData untuk upload image
                const formData = new FormData()
                formData.append("image", receiptData.image)
                formData.append("receiver_name", receiptData.receiver_name)
                formData.append("description", receiptData.description)
                formData.append("notes", receiptData.notes)

                // Panggil API untuk konfirmasi penerimaan
                Swal.fire({
                  title: "Memproses...",
                  text: "Sedang mengirim data penerimaan",
                  allowOutsideClick: false,
                  didOpen: () => {
                    Swal.showLoading()
                  },
                })

                try {
                  // Use the context function instead of direct axios call
                  response = await recievedUser(id, formData)

                  Swal.fire("Sukses", "Konfirmasi penerimaan barang berhasil", "success")
                  // No need to refresh orders again as it's already done in recievedUser
                } catch (error) {
                  console.error("Error confirming receipt:", error)
                  Swal.fire("Error", error.response?.data?.message || "Gagal mengkonfirmasi penerimaan barang", "error")
                }
              } else {
                return
              }
              break

            case "Selesai":
              response = await completeOrder(id)
              break

            default:
              Swal.fire("Error", "Status tidak valid", "error")
              return
          }

          if (newStatus !== "Sudah_Terkirim") {
            // Already handled success message for receipt confirmation
            Swal.fire("Sukses", "Status pesanan berhasil diubah", "success")
            // Refresh order data
            fetchData()
          }
        }
      })
    } catch (err) {
      console.error("Error updating order status:", err)
      Swal.fire("Error", "Gagal mengubah status pesanan", "error")
    }
  }

  // Sort orders based on selected option
  const sortOrders = (orders) => {
    if (!orders || orders.length === 0) return []

    switch (sortOption) {
      case "newest":
        return [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      case "oldest":
        return [...orders].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      case "highest_price":
        return [...orders].sort((a, b) => Number.parseFloat(b.total_harga || 0) - Number.parseFloat(a.total_harga || 0))
      case "lowest_price":
        return [...orders].sort((a, b) => Number.parseFloat(a.total_harga || 0) - Number.parseFloat(b.total_harga || 0))
      case "custom_first":
        return [...orders].sort((a, b) => {
          if (a.custom_order_id && !b.custom_order_id) return -1
          if (!a.custom_order_id && b.custom_order_id) return 1
          return 0
        })
      case "catalog_first":
        return [...orders].sort((a, b) => {
          if (a.catalog_id && !b.catalog_id) return -1
          if (!a.catalog_id && b.catalog_id) return 1
          return 0
        })
      case "jenis_pemesanan_asc":
        return [...orders].sort((a, b) => {
          const typeA = a.catalog_id === null ? "Pemesanan Khusus" : "Pemesanan Jadi"
          const typeB = b.catalog_id === null ? "Pemesanan Khusus" : "Pemesanan Jadi"
          return typeA.localeCompare(typeB)
        })
      case "jenis_pemesanan_desc":
        return [...orders].sort((a, b) => {
          const typeA = a.catalog_id === null ? "Pemesanan Khusus" : "Pemesanan Jadi"
          const typeB = b.catalog_id === null ? "Pemesanan Khusus" : "Pemesanan Jadi"
          return typeB.localeCompare(typeA)
        })
      default:
        return orders
    }
  }

  // Filter and sort orders
  const filteredOrders = sortOrders(
    pesanan.filter((order) => {
      const matchSearch =
        searchTerm === "" ||
        (order.catalog?.nama_katalog && order.catalog.nama_katalog.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.user?.name && order.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.custom_order?.jenis_baju &&
          order.custom_order.jenis_baju.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.order_unique_id && order.order_unique_id.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchStatus =
        statusFilter === "" || (order.status && order.status.toLowerCase() === statusFilter.toLowerCase())

      const matchDate =
        dateFilter === "" || (order.created_at && new Date(order.created_at).toISOString().slice(0, 10) === dateFilter)

      return matchSearch && matchStatus && matchDate
    }),
  )

  // Improved pagination calculations
  useEffect(() => {
    const total = Math.ceil(filteredOrders.length / entriesPerPage)
    setTotalPages(total > 0 ? total : 1)
    // Don't always reset to first page when filter changes
    if (currentPage > total) {
      setCurrentPage(1)
    }
  }, [filteredOrders.length, entriesPerPage])

  // Paginated data calculation
  const paginatedData = filteredOrders.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage)

  // Handle page change with validation
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  // Check if mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  // Helper functions for UI display
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "menunggu_pembayaran":
        return "yellow-50"
      case "menunggu_konfirmasi":
        return "blue-50"
      case "diproses":
        return "green-50"
      case "sedang_dikirim":
        return "purple-50"
      case "sudah_terkirim":
        return "teal-50"
      case "sudah_diterima":
        return "indigo-50"
      case "selesai":
        return "purple-50"
      default:
        return "gray-50"
    }
  }

  const getStatusTextColor = (status) => {
    switch (status?.toLowerCase()) {
      case "menunggu_pembayaran":
        return "yellow-800"
      case "menunggu_konfirmasi":
        return "blue-800"
      case "diproses":
        return "green-800"
      case "sedang_dikirim":
        return "purple-800"
      case "sudah_terkirim":
        return "teal-800"
      case "sudah_diterima":
        return "indigo-800"
      case "selesai":
        return "purple-800"
      default:
        return "gray-800"
    }
  }

  const formatCurrency = (amount) => {
    return amount ? `Rp ${Number.parseInt(amount).toLocaleString()}` : "Rp 0"
  }

  // Render action buttons based on status
  const renderActionButtons = (pesanan) => {
    switch (pesanan.status) {
      case "Menunggu_Konfirmasi":
        return (
          <>
            <div
              className="action-button"
              style={tooltipStyle}
              onMouseEnter={showTooltip}
              onMouseLeave={hideTooltip}
              onClick={() => handleStatusChange(pesanan.id, "Diproses")}
            >
              <button className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <span className="tooltip-text" style={tooltipTextStyle}>
                Terima Pembayaran
              </span>
            </div>

            <div
              className="action-button"
              style={tooltipStyle}
              onMouseEnter={showTooltip}
              onMouseLeave={hideTooltip}
              onClick={() => handleDetail(pesanan)}
            >
              <button className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <span className="tooltip-text" style={tooltipTextStyle}>
                Detail
              </span>
            </div>
          </>
        )

      case "Diproses":
        return (
          <>
            <div
              className="action-button"
              style={tooltipStyle}
              onMouseEnter={showTooltip}
              onMouseLeave={hideTooltip}
              onClick={() => handleStatusChange(pesanan.id, "Sedang_Dikirim")}
            >
              <button className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-2a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                </svg>
              </button>
              <span className="tooltip-text" style={tooltipTextStyle}>
                Kirim Pesanan
              </span>
            </div>

            <div
              className="action-button"
              style={tooltipStyle}
              onMouseEnter={showTooltip}
              onMouseLeave={hideTooltip}
              onClick={() => handleDetail(pesanan)}
            >
              <button className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <span className="tooltip-text" style={tooltipTextStyle}>
                Detail
              </span>
            </div>
          </>
        )

      case "Sedang_Dikirim":
        return (
          <>
            <div
              className="action-button"
              style={tooltipStyle}
              onMouseEnter={showTooltip}
              onMouseLeave={hideTooltip}
              onClick={() => handleStatusChange(pesanan.id, "Sudah_Terkirim")}
            >
              <button className="p-2 bg-teal-500 text-white rounded-full hover:bg-teal-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              </button>
              <span className="tooltip-text" style={tooltipTextStyle}>
                Konfirmasi Penerimaan
              </span>
            </div>

            <div
              className="action-button"
              style={tooltipStyle}
              onMouseEnter={showTooltip}
              onMouseLeave={hideTooltip}
              onClick={() => handleDetail(pesanan)}
            >
              <button className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <span className="tooltip-text" style={tooltipTextStyle}>
                Detail
              </span>
            </div>
          </>
        )

      case "Sudah_Terkirim":
        return (
          <>
            <div
              className="action-button"
              style={tooltipStyle}
              onMouseEnter={showTooltip}
              onMouseLeave={hideTooltip}
              onClick={() => handleStatusChange(pesanan.id, "Selesai")}
            >
              <button className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <span className="tooltip-text" style={tooltipTextStyle}>
                Tandai Selesai
              </span>
            </div>

            <div
              className="action-button"
              style={tooltipStyle}
              onMouseEnter={showTooltip}
              onMouseLeave={hideTooltip}
              onClick={() => handleDetail(pesanan)}
            >
              <button className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <span className="tooltip-text" style={tooltipTextStyle}>
                Detail
              </span>
            </div>
          </>
        )

      case "Selesai":
        return (
          <>
            <div
              className="action-button"
              style={tooltipStyle}
              onMouseEnter={showTooltip}
              onMouseLeave={hideTooltip}
              onClick={() => handleDetail(pesanan)}
            >
              <button className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <span className="tooltip-text" style={tooltipTextStyle}>
                Detail
              </span>
            </div>
          </>
        )

      default:
        return (
          <div
            className="action-button"
            style={tooltipStyle}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onClick={() => handleDetail(pesanan)}
          >
            <button className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <span className="tooltip-text" style={tooltipTextStyle}>
              Detail
            </span>
          </div>
        )
    }
  }

  // Render pagination with improved UI
  const renderPagination = () => {
    // Don't show pagination if there's no data or only 1 page
    if (totalPages <= 1) {
      return null
    }

    // Calculate range of pages to show
    const pagesToShow = 5
    let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2))
    const endPage = Math.min(totalPages, startPage + pagesToShow - 1)

    // Adjust if we're near the end
    if (endPage - startPage + 1 < pagesToShow) {
      startPage = Math.max(1, endPage - pagesToShow + 1)
    }

    // Generate array of page numbers
    const pages = []
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
        <div className="text-sm text-center sm:text-left">
          Showing {filteredOrders.length > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0} to{" "}
          {Math.min(currentPage * entriesPerPage, filteredOrders.length)} of {filteredOrders.length} entries
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            First
          </button>

          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 ${currentPage === page ? "bg-brown-600 text-white" : "border"} rounded`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>

          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Last
          </button>
        </div>
      </div>
    )
  }

  // Skeleton loading for table rows
  const renderTableSkeletonRows = () => {
    return Array(entriesPerPage).fill(0).map((_, index) => (
      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-36 animate-pulse"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-10 animate-pulse"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
        </td>
        <td className="px-6 py-4">
          <div className="flex gap-2">
            <div className="h-9 w-9 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-9 w-9 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </td>
      </tr>
    ));
  };

  // Skeleton loading for mobile cards
  const renderMobileCardSkeletons = () => {
    return Array(entriesPerPage).fill(0).map((_, index) => (
      <div key={index} className="bg-white border rounded-lg shadow-sm p-4 mb-4">
        <div className="flex justify-between items-start mb-3">
          <div className="w-2/3">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
            <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div>
            <div className="h-4 bg-gray-200 rounded w-28 mb-1 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-16 mb-1 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-12 mb-1 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-14 mb-1 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-16 mb-1 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
          </div>
          <div className="col-span-2">
            <div className="h-4 bg-gray-200 rounded w-20 mb-1 animate-pulse"></div>
            <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <div className="h-9 w-9 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-9 w-9 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>
    ));
  };

  // Error state with retry button
  if (error) {
    return (
      <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
        <div className="bg-red-50 p-4 rounded-md text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchData}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  // Main render
  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold">Pemesanan</h2>
        <button
          className="px-4 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700 w-full sm:w-auto"
          onClick={() => setIsModalOpen(true)}
        >
          Tambah Pesanan
        </button>
      </div>

      {/* Modal */}
      <TambahPesananModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddPesanan} />

      {/* Filter dan Search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <span>Show</span>
          <select
            value={entriesPerPage}
            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>entries</span>
        </div>

        <div>
          <select
            className="w-full border border-gray-300 rounded px-3 py-1"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Status</option>
            <option value="menunggu_pembayaran">Menunggu Pembayaran</option>
            <option value="menunggu_konfirmasi">Menunggu Konfirmasi</option>
            <option value="diproses">Diproses</option>
            <option value="sedang_dikirim">Sedang Dikirim</option>
            <option value="sudah_terkirim">Sudah Terkirim</option>
            <option value="selesai">Selesai</option>
          </select>
        </div>

        <div>
          <select
            className="w-full border border-gray-300 rounded px-3 py-1"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="highest_price">Harga Tertinggi</option>
            <option value="lowest_price">Harga Terendah</option>
            <option value="jenis_pemesanan_asc">Jenis Pemesanan (A-Z)</option>
            <option value="jenis_pemesanan_desc">Jenis Pemesanan (Z-A)</option>
            <option value="custom_first">Custom Order Dulu</option>
            <option value="catalog_first">Catalog Order Dulu</option>
          </select>
        </div>

        <div>
          <input
            type="date"
            className="w-full border border-gray-300 rounded px-3 py-1"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-1"
          />
        </div>
      </div>

      {/* Data content with improved loading states */}
      {error ? (
        <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
          <div className="bg-red-50 p-4 rounded-md text-center">
            <p className="text-red-500">{error}</p>
            <button
              onClick={fetchData}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      ) : (
        <>
          {isMobile ? (
            // Mobile Card View
            <div className="space-y-4">
              {loadingData ? (
                // Mobile card skeleton
                renderMobileCardSkeletons()
              ) : pesanan.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Tidak ada data pesanan yang tersedia.</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Tidak ada data pesanan yang sesuai dengan filter.</p>
                </div>
              ) : (
                // Actual mobile cards
                paginatedData.map((pesanan) => (
                  <div key={pesanan.id} className="bg-white border rounded-lg shadow-sm p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                    <p className="text-xs text-gray-500">ID: {pesanan.order_unique_id || "-"}</p>
                    <p className="text-sm text-gray-500">
                      {pesanan.created_at ? new Date(pesanan.created_at).toLocaleDateString() : "-"}
                    </p>
                    <h3 className="font-medium">
                      {pesanan.custom_order?.jenis_baju || pesanan.catalog?.nama_katalog || "-"}
                    </h3>
                    </div>
                    <span
                        className={`px-2 py-1 rounded-full text-xs bg-${getStatusBadgeColor(pesanan.status)} text-${getStatusTextColor(pesanan.status)}`}
                      >
                        {pesanan.status?.replace(/_/g, " ") || "Pending"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <p className="text-gray-500">Jenis Pemesanan</p>
                        <p>{pesanan.catalog_id === null ? "Pemesanan Khusus" : "Pemesanan Jadi"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Customer</p>
                        <p>{pesanan.user?.name || "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Warna</p>
                        <p>{getColorInfo(pesanan)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Ukuran</p>
                        <p>{getSizeInfo(pesanan)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Jumlah</p>
                        <p>{pesanan.jumlah || 0}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500">Total Harga</p>
                        <p className="font-semibold">{formatCurrency(pesanan.total_harga)}</p>
                      </div>
                    </div>

                    {pesanan.custom_order?.gambar_referensi && (
                      <div className="mb-3">
                        <p className="text-gray-500 text-sm mb-1">Referensi Foto</p>
                        <div className="flex items-center gap-2">
                          <img
                            src={`${process.env.REACT_APP_API_URL}/${pesanan.custom_order?.gambar_referensi}`}
                            alt="Referensi"
                            className="h-20 w-20 object-cover rounded"
                          />
                          <button
                            onClick={() => handleCustomOrderDetail(pesanan.custom_order_id)}
                            className="px-2 py-1 bg-brown-600 text-white text-sm rounded hover:bg-brown-700"
                          >
                            Lihat Detail Custom
                          </button>
                        </div>
                      </div>
                    )}

                    {pesanan.catatan && (
                      <div className="mb-3">
                        <p className="text-gray-500 text-sm">Catatan</p>
                        <p className="text-sm">{pesanan.catatan || "-"}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mt-4">{renderActionButtons(pesanan)}</div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // Desktop Table View
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                        Jenis Pemesanan
                      </th>
                      <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                        Jenis Pakaian
                      </th>
                      <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                        Warna
                      </th>
                      <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                        Ukuran
                      </th>
                      <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                        Jumlah
                      </th>
                      <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                        Total Harga
                      </th>
                      <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loadingData ? (
                      // Table row skeletons
                      renderTableSkeletonRows()
                    ) : pesanan.length === 0 ? (
                      <tr>
                        <td colSpan="11" className="px-6 py-4 text-center text-gray-500">
                          Tidak ada data pesanan yang tersedia.
                        </td>
                      </tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="11" className="px-6 py-4 text-center text-gray-500">
                          Tidak ada data pesanan yang sesuai dengan filter.
                        </td>
                      </tr>
                    ) : (
                      // Actual table rows
                      paginatedData.map((pesanan) => (
                        <tr key={pesanan.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {pesanan.order_unique_id || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {pesanan.created_at ? new Date(pesanan.created_at).toLocaleDateString() : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {pesanan.user?.name || pesanan.customer_name || pesanan.nama_customer || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {pesanan.catalog_id === null ? (
                              pesanan.custom_order_id ? (
                                <span
                                  className="text-blue-600 cursor-pointer hover:underline"
                                  onClick={() => handleCustomOrderDetail(pesanan.custom_order_id)}
                                >
                                  Pemesanan Khusus
                                </span>
                              ) : (
                                "Pemesanan Khusus"
                              )
                            ) : (
                              "Pemesanan Jadi"
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {pesanan.custom_order?.jenis_baju || pesanan.catalog?.nama_katalog || "-"}
                          </td>
                          <td className="px-6 py-4">{getColorInfo(pesanan)}</td>
                          <td className="px-6 py-4">{getSizeInfo(pesanan)}</td>
                          <td className="px-6 py-4">{pesanan.jumlah || 0}</td>
                          <td className="px-6 py-4">{formatCurrency(pesanan.total_harga)}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-sm bg-${getStatusBadgeColor(pesanan.status)} text-${getStatusTextColor(pesanan.status)}`}
                            >
                              {pesanan.status?.replace(/_/g, " ") || "Pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">{renderActionButtons(pesanan)}</div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination - Only show when not loading and has data */}
          {!loadingData && filteredOrders.length > 0 && renderPagination()}
        </>
      )}

      {/* Refresh Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700 flex items-center gap-2"
          disabled={loadingData}
        >
          {loadingData ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Memuat...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh Data</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default Pemesanan