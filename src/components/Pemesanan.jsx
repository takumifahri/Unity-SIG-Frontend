"use client"

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
    fetchCustomOrders,
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
  const [loadingData, setLoadingData] = useState(true)
  const [allOrdersData, setAllOrdersData] = useState([]) // Combined data from both endpoints

  // Load orders on mount
  useEffect(() => {
    fetchData()
  }, [])

  // Function to fetch data from both endpoints
  const fetchData = async () => {
    setLoadingData(true)
    try {
      // Fetch both regular orders and custom orders with detailed data
      const [regularOrdersResult, customOrdersResult] = await Promise.all([fetchAllOrders(), fetchCustomOrders()])

      console.log("Data pesanan regular:", pesanan)
      console.log("Data custom orders:", customOrders)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoadingData(false)
    }
  }

  // Combine regular orders and custom orders data
  useEffect(() => {
    if (!loadingData) {
      const combinedData = []
      const processedOrderIds = new Set() // Track processed order IDs to avoid duplicates

      // Add regular catalog orders (only non-custom orders)
      if (pesanan && pesanan.length > 0) {
        pesanan.forEach((order) => {
          // Only add if it's not a custom order (catalog_id should not be null)
          if (order.catalog_id !== null && !processedOrderIds.has(order.order_unique_id)) {
            combinedData.push({
              ...order,
              isCustomOrder: false,
              displayType: "catalog",
            })
            processedOrderIds.add(order.order_unique_id)
          }
        })
      }

      // Add custom orders with enhanced data - Handle the nested structure
      if (
        customOrders &&
        customOrders.custom_orders &&
        customOrders.custom_orders.data &&
        customOrders.custom_orders.data.length > 0
      ) {
        customOrders.custom_orders.data.forEach((customOrder) => {
          // Use custom_order_unique_id and avoid duplicates
          if (!processedOrderIds.has(customOrder.custom_order_unique_id)) {
            // Find the related order from the orders array
            const relatedOrder = customOrder.orders && customOrder.orders.length > 0 ? customOrder.orders[0] : null

            combinedData.push({
              // Use data from related order if available, otherwise from custom order
              id: relatedOrder ? relatedOrder.id : customOrder.id,
              order_unique_id: customOrder.custom_order_unique_id, // Always use custom_order_unique_id for custom orders
              user_id: customOrder.user_id,
              catalog_id: null, // Custom orders don't have catalog_id
              custom_order_id: customOrder.id,
              transaction_id: relatedOrder ? relatedOrder.transaction_id : null,
              total_harga: customOrder.total_harga,
              status: relatedOrder ? relatedOrder.status : customOrder.status,
              created_at: customOrder.created_at,
              updated_at: customOrder.updated_at,

              // Custom order specific data
              custom_order: customOrder,
              user: customOrder.user,

              // Enhanced color and size data from custom order
              colors: customOrder.colors,

              // Additional custom order fields
              jenis_baju: customOrder.jenis_baju,
              detail_bahan: customOrder.detail_bahan,
              sumber_kain: customOrder.sumber_kain,
              catatan: customOrder.catatan,
              gambar_referensi: customOrder.gambar_referensi,

              // Mark as custom order
              isCustomOrder: true,
              displayType: "custom",
            })
            processedOrderIds.add(customOrder.custom_order_unique_id)
          }
        })
      }

      setAllOrdersData(combinedData)
      console.log("Combined orders data:", combinedData)
    }
  }, [pesanan, customOrders, loadingData])

  // Helper function to calculate total quantity for custom orders
  const calculateTotalQuantity = (orderData) => {
    if (!orderData.colors || orderData.colors.length === 0) return 0

    return orderData.colors.reduce((total, color) => {
      if (!color.sizes || !Array.isArray(color.sizes)) return total
      return total + color.sizes.reduce((sum, size) => sum + Number.parseInt(size.jumlah || 0), 0)
    }, 0)
  }

  // Helper functions for size and color display - Enhanced for custom orders
  const getSizeInfo = (orderData) => {
    if (!orderData) return "-"

    // For custom orders, get from colors.sizes array
    if (orderData.isCustomOrder && orderData.colors && orderData.colors.length > 0) {
      const allSizes = []
      orderData.colors.forEach((color) => {
        if (color.sizes && Array.isArray(color.sizes) && color.sizes.length > 0) {
          color.sizes.forEach((size) => {
            allSizes.push(`${size.size} (${size.jumlah})`)
          })
        }
      })
      return allSizes.length > 0 ? allSizes.join(", ") : "-"
    }

    // For regular orders, use existing logic
    if (typeof orderData.size === "string" && isNaN(orderData.size)) {
      return orderData.size
    }

    if (orderData.catalog && orderData.catalog.colors && orderData.catalog.colors.length > 0) {
      for (const color of orderData.catalog.colors) {
        if (color.sizes && color.sizes.id == orderData.size) {
          return color.sizes.size
        }
      }
    }

    return orderData.size || "-"
  }

  const getColorInfo = (orderData) => {
    if (!orderData) return "-"

    // For custom orders, get from colors array
    if (orderData.isCustomOrder && orderData.colors && orderData.colors.length > 0) {
      const colorNames = orderData.colors.map((color) => color.color_name).filter(Boolean)
      return colorNames.length > 0 ? colorNames.join(", ") : "-"
    }

    // For regular orders, use existing logic
    if (typeof orderData.color === "string" && isNaN(orderData.color)) {
      return orderData.color
    }

    if (orderData.catalog && orderData.catalog.colors && orderData.catalog.colors.length > 0) {
      const color = orderData.catalog.colors.find((c) => c.id == orderData.color)
      if (color) {
        return color.color_name
      }
    }

    return orderData.color || "-"
  }

  // Helper function to get quantity - Enhanced for custom orders
  const getQuantityInfo = (orderData) => {
    if (!orderData) return 0

    // For custom orders, calculate total from colors.sizes
    if (orderData.isCustomOrder) {
      return calculateTotalQuantity(orderData)
    }

    // For regular orders
    return orderData.jumlah || 0
  }

  // Helper function to get product name
  const getProductName = (orderData) => {
    if (!orderData) return "-"

    // For custom orders
    if (orderData.isCustomOrder) {
      return orderData.jenis_baju || orderData.custom_order?.jenis_baju || "Custom Order"
    }

    // For regular orders
    return orderData.catalog?.nama_katalog || "-"
  }
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Earth's radius in kilometers
    const R = 6371;
    
    // Convert degrees to radians
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    // Haversine formula calculations
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    
    return distance;
  };
  // Handle detail navigation with order_unique_id
  const handleDetail = (orderData) => {
    if (!orderData) return

    console.log("Order being viewed:", orderData)

    if (!orderData.order_unique_id) {
      console.error("Order ID is missing", orderData)
      return
    }

    // Check if it's a custom order
    if (orderData.isCustomOrder || (orderData.catalog_id === null && orderData.custom_order_id)) {
      // This is a custom order - use custom_order_unique_id
      navigate(`/admin/customOrder/${orderData.order_unique_id}`) // order_unique_id now contains custom_order_unique_id
    } else {
      // This is a catalog order
      navigate(`/admin/CatalogPesan/${orderData.order_unique_id}`)
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
              response = await adminVerifyPayment(id, "approve")
              break

            case "Sedang_Dikirim":
              // Get the order data to access user information
              const orderToShip = allOrdersData.find(order => order.id === id);
              const userLat = orderToShip?.user?.latitude;
              const userLng = orderToShip?.user?.longitude;
              
              // JR Konveksi coordinates
              const jrKonveksiLat = -6.4072857;
              const jrKonveksiLng = 106.7687122;
              
              // Calculate distance if coordinates are available
              let distance = null;
              let isOutOfRange = false;
              let deliveryOptions = '';
              
              if (userLat && userLng) {
                distance = calculateDistance(
                  parseFloat(userLat), 
                  parseFloat(userLng), 
                  jrKonveksiLat, 
                  jrKonveksiLng
                );
                isOutOfRange = distance > 30;
              }
              
              // Prepare delivery options HTML with conditional disabling
              if (isOutOfRange) {
                deliveryOptions = `
                  <div class="mb-1">
                    <p class="text-yellow-600 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" class="inline h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Lokasi pelanggan berjarak ${distance.toFixed(1)} km dari JR Konveksi (melebihi 30 km).
                      <br>Hanya opsi Ekspedisi yang tersedia.
                    </p>
                  </div>
                `;
              }
              
              deliveryOptions += `
                <select id="type_pengantaran" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">Pilih Metode Pengiriman</option>
                  <option value="ekspedisi">Ekspedisi</option>
                  <option value="jrkonveksi" ${isOutOfRange ? 'disabled' : ''}>JR Konveksi</option>
                  <option value="gosend" ${isOutOfRange ? 'disabled' : ''}>GoSend</option>
                  <option value="grabExpress" ${isOutOfRange ? 'disabled' : ''}>Grab Express</option>
                  <option value="pickup" ${isOutOfRange ? 'disabled' : ''}>Pickup/Ambil Sendiri</option>
                </select>
              `;

              const { value: deliveryData } = await Swal.fire({
                title: "Konfirmasi Pengiriman",
                html: `
                  <div class="mb-3">
                    <label class="block text-left text-sm font-medium mb-1">Metode Pengiriman</label>
                    ${deliveryOptions}
                  </div>
                  ${distance !== null ? 
                    `<div class="mb-3 text-sm bg-gray-50 p-2 rounded">
                      <p>Jarak: <strong>${distance.toFixed(1)} km</strong> dari JR Konveksi</p>
                    </div>` : ''
                  }
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
                  const typePengantaran = document.getElementById("type_pengantaran").value;
                  if (!typePengantaran) {
                    Swal.showValidationMessage("Metode pengiriman wajib dipilih");
                    return false;
                  }
                  return {
                    status: "Sedang_Dikirim",
                    type_pengantaran: typePengantaran,
                    notes: document.getElementById("notes").value || "",
                    distance: distance,
                  };
                },
              });

              if (deliveryData) {
                response = await sendToDelivery(id, {
                  status: deliveryData.status,
                  type_pengantaran: deliveryData.type_pengantaran,
                  notes: deliveryData.notes,
                  distance: deliveryData.distance,
                });
              } else {
                return;
              }
              break;
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
                  response = await recievedUser(id, formData)
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
              response = await completeOrder(id)
              break

            default:
              Swal.fire("Error", "Status tidak valid", "error")
              return
          }

          if (newStatus !== "Sudah_Terkirim") {
            Swal.fire("Sukses", "Status pesanan berhasil diubah", "success")
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
          if (a.isCustomOrder && !b.isCustomOrder) return -1
          if (!a.isCustomOrder && b.isCustomOrder) return 1
          return 0
        })
      case "catalog_first":
        return [...orders].sort((a, b) => {
          if (!a.isCustomOrder && b.isCustomOrder) return -1
          if (a.isCustomOrder && !b.isCustomOrder) return 1
          return 0
        })
      case "jenis_pemesanan_asc":
        return [...orders].sort((a, b) => {
          const typeA = a.isCustomOrder ? "Pemesanan Khusus" : "Pemesanan Jadi"
          const typeB = b.isCustomOrder ? "Pemesanan Khusus" : "Pemesanan Jadi"
          return typeA.localeCompare(typeB)
        })
      case "jenis_pemesanan_desc":
        return [...orders].sort((a, b) => {
          const typeA = a.isCustomOrder ? "Pemesanan Khusus" : "Pemesanan Jadi"
          const typeB = b.isCustomOrder ? "Pemesanan Khusus" : "Pemesanan Jadi"
          return typeB.localeCompare(typeA)
        })
      default:
        return orders
    }
  }

  // Filter and sort orders - Updated to use allOrdersData
  const filteredOrders = sortOrders(
    allOrdersData.filter((order) => {
      const matchSearch =
        searchTerm === "" ||
        (getProductName(order) && getProductName(order).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.user?.name && order.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
  const renderActionButtons = (orderData) => {
    switch (orderData.status) {
      case "Menunggu_Konfirmasi":
        return (
          <>
            <div
              className="action-button"
              style={tooltipStyle}
              onMouseEnter={showTooltip}
              onMouseLeave={hideTooltip}
              onClick={() => handleStatusChange(orderData.id, "Diproses")}
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
              onClick={() => handleDetail(orderData)}
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
              onClick={() => handleStatusChange(orderData.id, "Sedang_Dikirim")}
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
              onClick={() => handleDetail(orderData)}
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
              onClick={() => handleStatusChange(orderData.id, "Sudah_Terkirim")}
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
              onClick={() => handleDetail(orderData)}
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
              onClick={() => handleStatusChange(orderData.id, "Selesai")}
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
              onClick={() => handleDetail(orderData)}
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
              onClick={() => handleDetail(orderData)}
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
            onClick={() => handleDetail(orderData)}
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
    if (totalPages <= 1) {
      return null
    }

    const pagesToShow = 5
    let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2))
    const endPage = Math.min(totalPages, startPage + pagesToShow - 1)

    if (endPage - startPage + 1 < pagesToShow) {
      startPage = Math.max(1, endPage - pagesToShow + 1)
    }

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
    return Array(entriesPerPage)
      .fill(0)
      .map((_, index) => (
        <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
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
      ))
  }

  // Skeleton loading for mobile cards
  const renderMobileCardSkeletons = () => {
    return Array(entriesPerPage)
      .fill(0)
      .map((_, index) => (
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
      ))
  }

  // Error state with retry button
  if (error) {
    return (
      <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
        <div className="bg-red-50 p-4 rounded-md text-center">
          <p className="text-red-500">{error}</p>
          <button onClick={fetchData} className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
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
      {isMobile ? (
        // Mobile Card View
        <div className="space-y-4">
          {loadingData ? (
            renderMobileCardSkeletons()
          ) : allOrdersData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Tidak ada data pesanan yang tersedia.</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Tidak ada data pesanan yang sesuai dengan filter.</p>
            </div>
          ) : (
            paginatedData.map((orderData) => (
              <div
                key={`${orderData.displayType}-${orderData.id}`}
                className="bg-white border rounded-lg shadow-sm p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-gray-500">ID: {orderData.order_unique_id || "-"}</p>
                    <p className="text-sm text-gray-500">
                      {orderData.created_at ? new Date(orderData.created_at).toLocaleDateString() : "-"}
                    </p>
                    <h3 className="font-medium">{getProductName(orderData)}</h3>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs bg-${getStatusBadgeColor(orderData.status)} text-${getStatusTextColor(orderData.status)}`}
                  >
                    {orderData.status?.replace(/_/g, " ") || "Pending"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <p className="text-gray-500">Jenis Pemesanan</p>
                    <p>{orderData.isCustomOrder ? "Pemesanan Khusus" : "Pemesanan Jadi"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Customer</p>
                    <p>{orderData.user?.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Warna</p>
                    <p>{getColorInfo(orderData)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Ukuran</p>
                    <p>{getSizeInfo(orderData)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Jumlah</p>
                    <p>{getQuantityInfo(orderData)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Total Harga</p>
                    <p className="font-semibold">{formatCurrency(orderData.total_harga)}</p>
                  </div>
                </div>

                {orderData.isCustomOrder && orderData.gambar_referensi && (
                  <div className="mb-3">
                    <p className="text-gray-500 text-sm mb-1">Referensi Foto</p>
                    <div className="flex items-center gap-2">
                      {(() => {
                        try {
                          const images =
                            typeof orderData.gambar_referensi === "string"
                              ? JSON.parse(orderData.gambar_referensi)
                              : orderData.gambar_referensi
                          const firstImage = Array.isArray(images) ? images[0] : images

                          if (!firstImage) {
                            return (
                              <div className="h-20 w-20 bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-xs text-gray-500">No Image</span>
                              </div>
                            )
                          }

                          return (
                            <img
                              src={`${process.env.REACT_APP_API_URL}/${firstImage}`}
                              alt="Referensi"
                              className="h-20 w-20 object-cover rounded"
                              onError={(e) => {
                                e.target.style.display = "none"
                                e.target.nextSibling.style.display = "flex"
                              }}
                            />
                          )
                        } catch (e) {
                          console.error("Error parsing gambar_referensi:", e)
                          return (
                            <div className="h-20 w-20 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-xs text-gray-500">No Image</span>
                            </div>
                          )
                        }
                      })()}
                      <button
                        onClick={() => handleCustomOrderDetail(orderData.custom_order_id)}
                        className="px-2 py-1 bg-brown-600 text-white text-sm rounded hover:bg-brown-700"
                      >
                        Lihat Detail Custom
                      </button>
                    </div>
                  </div>
                )}

                {orderData.catatan && (
                  <div className="mb-3">
                    <p className="text-gray-500 text-sm">Catatan</p>
                    <p className="text-sm">{orderData.catatan || "-"}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-4">{renderActionButtons(orderData)}</div>
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
                  renderTableSkeletonRows()
                ) : allOrdersData.length === 0 ? (
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
                  paginatedData.map((orderData) => (
                    <tr key={`${orderData.displayType}-${orderData.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {orderData.order_unique_id || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {orderData.created_at ? new Date(orderData.created_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{orderData.user?.name || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {orderData.isCustomOrder ? (
                          orderData.custom_order_id ? (
                            <span
                              className="text-blue-600 cursor-pointer hover:underline"
                              onClick={() => handleCustomOrderDetail(orderData.custom_order_id)}
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
                      <td className="px-6 py-4">{getProductName(orderData)}</td>
                      <td className="px-6 py-4">{getColorInfo(orderData)}</td>
                      <td className="px-6 py-4">{getSizeInfo(orderData)}</td>
                      <td className="px-6 py-4">{getQuantityInfo(orderData)}</td>
                      <td className="px-6 py-4">{formatCurrency(orderData.total_harga)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-sm bg-${getStatusBadgeColor(orderData.status)} text-${getStatusTextColor(orderData.status)}`}
                        >
                          {orderData.status?.replace(/_/g, " ") || "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">{renderActionButtons(orderData)}</div>
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

      {/* Refresh Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700 flex items-center gap-2"
          disabled={loadingData}
        >
          {loadingData ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Memuat...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
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
