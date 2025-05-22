import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from 'sweetalert2-react-content';
import DateRangePickerModal from "../components/DateRangePicker";
const PengajuanPemesanan = () => {
  // Tooltip styles
  const tooltipStyle = {
    position: "relative",
    display: "inline-block",
  };

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
  };

  const showTooltip = (e) => {
    const tooltip = e.currentTarget.querySelector(".tooltip-text");
    if (tooltip) tooltip.style.visibility = "visible";
    if (tooltip) tooltip.style.opacity = "1";
  };

  const hideTooltip = (e) => {
    const tooltip = e.currentTarget.querySelector(".tooltip-text");
    if (tooltip) tooltip.style.visibility = "hidden";
    if (tooltip) tooltip.style.opacity = "0";
  };

  // Local state
  const [customOrders, setCustomOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [sortOption, setSortOption] = useState("newest");
  const navigate = useNavigate();

  // Load custom orders on mount
  useEffect(() => {
    fetchCustomOrders();
  }, []);

  // Fetch custom orders from API
  const fetchCustomOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/order/custom`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Custom orders data:", response.data);
      
      // Check for the correct data structure based on API response
      if (response.data && response.data.data && response.data.data.custom_orders) {
        setCustomOrders(response.data.data.custom_orders);
      } else {
        setCustomOrders([]);
      }
      setError(null);
    } catch (error) {
      console.error("Error fetching custom orders:", error);
      setError(
        error.response?.data?.message || "Failed to fetch custom order data"
      );
      setCustomOrders([]);
    } finally {
      setLoading(false);
    }
  };

  
  // Handle approve/accept custom order
  const handleAcceptOrder = async (id) => {
    try {
      Swal.fire({
        title: "Konfirmasi",
        text: "Apakah Anda yakin ingin menyetujui pengajuan pemesanan ini?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, Setujui",
        cancelButtonText: "Batal",
        confirmButtonColor: "#a97142",
      }).then(async (result) => {
        if (result.isConfirmed) {
          // Show loading state
          Swal.fire({
            title: "Processing",
            text: "Menyetujui pengajuan...",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          // Call API to approve custom order
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/api/order/custom/accept/propose`,
            { custom_order_id: id },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          console.log("API response:", response.data);

          if (response.data && response.data.status) {
            // Success notification
            Swal.fire({
              title: "Berhasil!",
              text: "Pengajuan pemesanan berhasil disetujui. Lanjutkan negosiasi dengan pelanggan.",
              icon: "success",
              confirmButtonColor: "#a97142",
              confirmButtonText: "Lanjutkan Negosiasi",
            }).then((result) => {
              if (result.isConfirmed) {
                // Find the order details to get customer phone
                const order = customOrders.find(order => order.id === id);
                if (order && order.no_telp) {
                  const phoneNumber = order.no_telp.startsWith('+62') 
                    ? order.no_telp.substring(1) 
                    : order.no_telp.startsWith('0') 
                      ? '62' + order.no_telp.substring(1) 
                      : order.no_telp;
                    
                  // Open WhatsApp with predefined text
                  const message = `Halo ${order.nama_lengkap || "Pelanggan"},\n\nTerima kasih telah mengajukan pemesanan khusus di JR Konveksi. Kami telah menyetujui pengajuan Anda untuk pembuatan ${order.jenis_baju} dengan jumlah ${order.jumlah} pcs.\n\nUntuk melanjutkan proses pemesanan, kami perlu mendiskusikan mengenai harga dan detail lainnya. Mohon konfirmasi ketersediaan Anda untuk diskusi lebih lanjut.\n\nTerima kasih.`;
                  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, '_blank');
                } else {
                  Swal.fire("Perhatian", "Nomor telepon pelanggan tidak tersedia", "warning");
                }
              }
              // Refresh data regardless
              fetchCustomOrders();
            });
          } else {
            throw new Error(response.data.message || "Failed to approve order");
          }
        }
      });
    } catch (error) {
      console.error("Error approving custom order:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Gagal menyetujui pengajuan pemesanan",
        "error"
      );
    }
  };


  // Add new function to handle finishing negotiation and creating order
  // Create a ReactSwal instance
  const ReactSwal = withReactContent(Swal);

  // Add new function to handle finishing negotiation and creating order
  const handleFinalizeNegotiation = async (id) => {
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
          '<label for="total-harga" class="block text-sm font-medium text-gray-700 mb-1">Total Harga</label>' +
          '<input id="price-raw" type="hidden" value="0">' +
          '<input id="price-display" type="text" class="w-full p-2 border border-gray-300 rounded" placeholder="Masukkan total harga">' +
          '</div>' +
          '<div class="mb-3">' +
          '<label for="detail-bahan" class="block text-sm font-medium text-gray-700 mb-1">Detail Bahan (opsional)</label>' +
          '<textarea id="detail-bahan" class="w-full p-2 border border-gray-300 rounded" placeholder="Masukkan detail bahan"></textarea>' +
          '</div>' +
          '<div class="mb-3">' +
          '<label for="payment-method" class="block text-sm font-medium text-gray-700 mb-1">Metode Pembayaran</label>' +
          '<select id="payment-method" class="w-full p-2 border border-gray-300 rounded">' +
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
          
          // Auto-focus the price input on mobile
          if (window.innerWidth < 768) {
            // Delay focus to avoid iOS keyboard issues
            setTimeout(() => {
              priceDisplay.focus();
            }, 400);
          }
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
          
          return {
            total_harga: parseInt(totalHarga),
            detail_bahan: detailBahan,
            payment_method: paymentMethod
          };
        }
      });
      
      if (!priceAndMaterialData) return; // User cancelled
      
      // Step 2: Open second modal with React DateRangePicker
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
      const formValues = {
        ...priceAndMaterialData,
        start_date: dateRangeData.startDate,
        end_date: dateRangeData.endDate
      };
      
      // Show loading state
      Swal.fire({
        title: "Processing",
        text: "Memfinalisasi pemesanan...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Call API to finalize order
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/order/custom/finalize/${id}`,
        formValues,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data && response.data.status) {
        // Success notification
        Swal.fire({
          title: "Berhasil!",
          text: "Pesanan berhasil difinalisasi dan siap untuk pembayaran.",
          icon: "success",
          confirmButtonColor: "#a97142",
        });

        // Refresh data
        fetchCustomOrders();
      } else {
        throw new Error(response.data.message || "Failed to finalize order");
      }
    } catch (error) {
      console.error("Error finalizing order:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Gagal memfinalisasi pemesanan",
        "error"
      );
    }
  };

  // Helper function to generate calendar HTML
  function generateCalendarHTML(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Get first day of month and set to beginning of week
    const firstDay = new Date(start.getFullYear(), start.getMonth(), 1);
    const startDay = new Date(firstDay);
    startDay.setDate(startDay.getDate() - startDay.getDay()); // Previous Sunday
    
    // Get last day of month containing the end date
    const lastDay = new Date(end.getFullYear(), end.getMonth() + 1, 0);
    const endDay = new Date(lastDay);
    const daysToAdd = 6 - endDay.getDay();
    endDay.setDate(endDay.getDate() + daysToAdd); // Next Saturday
    
    // Generate days of week header
    const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    let html = '';
    
    // Add days of week header
    daysOfWeek.forEach(day => {
      html += `<div class="text-xs font-medium text-gray-500 py-1">${day}</div>`;
    });
    
    // Calculate today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Generate calendar cells
    const currentDate = new Date(startDay);
    while (currentDate <= endDay) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const isToday = currentDate.getTime() === today.getTime();
      const isPastDate = currentDate < today;
      const isStartDate = dateStr === startDate;
      const isEndDate = dateStr === endDate;
      const isInRange = currentDate > new Date(startDate) && currentDate < new Date(endDate);
      const isCurrentMonth = 
        currentDate.getMonth() === start.getMonth() || 
        (currentDate > start && currentDate < end) || 
        currentDate.getMonth() === end.getMonth();
      
      // Determine classes
      let cellClasses = 'calendar-day text-center py-1 text-sm cursor-pointer relative';
      
      if (isPastDate) {
        cellClasses += ' text-gray-300 disabled';
      } else if (!isCurrentMonth) {
        cellClasses += ' text-gray-400';
      }
      
      if (isToday) {
        cellClasses += ' font-bold';
      }
      
      if (isStartDate) {
        cellClasses += ' bg-brown-500 text-white rounded-l-md';
      } else if (isEndDate) {
        cellClasses += ' bg-brown-500 text-white rounded-r-md';
      } else if (isInRange) {
        cellClasses += ' bg-brown-100 in-range';
      }
      
      html += `<div class="${cellClasses}" data-date="${dateStr}">${currentDate.getDate()}</div>`;
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return html;
  }

  // Add function to cancel order after negotiation
  const handleCancelOrder = async (id) => {
    try {
      const { value: cancelReason } = await Swal.fire({
        title: "Alasan Pembatalan",
        input: "textarea",
        inputPlaceholder: "Masukkan alasan pembatalan...",
        inputAttributes: {  
          "aria-label": "Masukkan alasan pembatalan",
        },
        showCancelButton: true,
        confirmButtonText: "Batalkan Pesanan",
        cancelButtonText: "Kembali",
        confirmButtonColor: "#dc3545",
        inputValidator: (value) => {
          if (!value) {
            return "Anda harus memberikan alasan pembatalan!";
          }
        },
      });
  
      if (cancelReason) {
        // Show loading state
        Swal.fire({
          title: "Processing",
          text: "Membatalkan pesanan...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
  
        // Call API to cancel custom order
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/custom-orders/cancel-propose`,
          { 
            custom_order_id: id, 
            alasan_diTolak: cancelReason 
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
  
        if (response.data && response.data.status) {
          // Success notification
          Swal.fire(
            "Berhasil!",
            "Pesanan berhasil dibatalkan.",
            "success"
          );
  
          // Refresh data
          fetchCustomOrders();
        } else {
          throw new Error(response.data.message || "Failed to cancel order");
        }
      }
    } catch (error) {
      console.error("Error canceling order:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Gagal membatalkan pesanan",
        "error"
      );
    }
  };
  // Handle reject custom order
  const handleRejectOrder = async (id) => {
    try {
      const { value: rejectReason } = await Swal.fire({
        title: "Alasan Penolakan",
        input: "textarea",
        inputPlaceholder: "Masukkan alasan penolakan...",
        inputAttributes: {
          "aria-label": "Masukkan alasan penolakan",
        },
        showCancelButton: true,
        confirmButtonText: "Tolak Pengajuan",
        cancelButtonText: "Batal",
        confirmButtonColor: "#dc3545",
        inputValidator: (value) => {
          if (!value) {
            return "Anda harus memberikan alasan penolakan!";
          }
        },
      });

      if (rejectReason) {
        // Show loading state
        Swal.fire({
          title: "Processing",
          text: "Menolak pengajuan...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        // Call API to reject custom order
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/custom-orders/reject-response`,
          { 
            custom_order_id: id, 
            alasan_diTolak: rejectReason 
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data && response.data.status) {
          // Success notification
          Swal.fire(
            "Berhasil!",
            "Pengajuan pemesanan berhasil ditolak.",
            "success"
          );

          // Refresh data
          fetchCustomOrders();
        } else {
          throw new Error(response.data.message || "Failed to reject order");
        }
      }
    } catch (error) {
      console.error("Error rejecting custom order:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Gagal menolak pengajuan pemesanan",
        "error"
      );
    }
  };

  // Handle viewing order details
  const handleViewDetail = (id) => {
    navigate(`/admin/custom-orders/${id}`);
  };

  // Sort orders based on selected option
  const sortOrders = (orders) => {
    if (!orders || orders.length === 0) return [];

    switch (sortOption) {
      case "newest":
        return [...orders].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
      case "oldest":
        return [...orders].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
      case "highest_quantity":
        return [...orders].sort((a, b) => parseInt(b.jumlah) - parseInt(a.jumlah));
      case "lowest_quantity":
        return [...orders].sort((a, b) => parseInt(a.jumlah) - parseInt(b.jumlah));
      default:
        return orders;
    }
  };

  // Filter and sort orders
  const filteredOrders = sortOrders(
    customOrders.filter((order) => {
      const matchSearch =
        searchTerm === "" ||
        (order.nama_lengkap &&
          order.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.jenis_baju &&
          order.jenis_baju.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.email &&
          order.email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus =
        statusFilter === "" ||
        (order.status &&
          order.status.toLowerCase() === statusFilter.toLowerCase());

      const matchDate =
        dateFilter === "" ||
        (order.created_at &&
          new Date(order.created_at).toISOString().slice(0, 10) === dateFilter);

      return matchSearch && matchStatus && matchDate;
    })
  );

  // Improved pagination calculations
  useEffect(() => {
    const total = Math.ceil(filteredOrders.length / entriesPerPage);
    setTotalPages(total > 0 ? total : 1);
    // Don't always reset to first page when filter changes
    if (currentPage > total) {
      setCurrentPage(1);
    }
  }, [filteredOrders.length, entriesPerPage]);

  // Paginated data calculation
  const paginatedData = filteredOrders.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  // Handle page change with validation
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Check if mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Helper functions for UI display
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "yellow-50";
      case "disetujui":
        return "green-50";
      case "ditolak":
        return "red-50";
      case "selesai":
        return "purple-50";
      default:
        return "gray-50";
    }
  };

  const getStatusTextColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "yellow-800";
      case "disetujui":
        return "green-800";
      case "ditolak":
        return "red-800";
      case "selesai":
        return "purple-800";
      default:
        return "gray-800";
    }
  };

  // Format sumber kain display
  const formatSumberKain = (sumberKain) => {
    if (!sumberKain) return "-";
    return sumberKain === "sendiri"
      ? "Disediakan Sendiri"
      : "Disediakan Konveksi";
  };

  // Render action buttons based on status
  // Modify the renderActionButtons function to include new options
  const renderActionButtons = (order) => {
    if (order.status === "pending") {
      return (
        <>
          <div
            className="action-button"
            style={tooltipStyle}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onClick={() => handleAcceptOrder(order.id)}
          >
            <button className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <span className="tooltip-text" style={tooltipTextStyle}>
              Setujui
            </span>
          </div>

          <div
            className="action-button"
            style={tooltipStyle}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onClick={() => handleRejectOrder(order.id)}
          >
            <button className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <span className="tooltip-text" style={tooltipTextStyle}>
              Tolak
            </span>
          </div>

          <div
            className="action-button"
            style={tooltipStyle}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onClick={() => handleViewDetail(order.id)}
          >
            <button className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
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
      );
    } else if (order.status === "disetujui") {
      return (
        <>
          <div
            className="action-button"
            style={tooltipStyle}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onClick={() => {
              const phoneNumber = order.no_telp?.startsWith('+62') 
                ? order.no_telp.substring(1) 
                : order.no_telp?.startsWith('0') 
                  ? '62' + order.no_telp.substring(1) 
                  : order.no_telp;
              
              if (phoneNumber) {
                const message = `Halo ${order.nama_lengkap || "Pelanggan"},\n\nMelanjutkan diskusi tentang pesanan khusus Anda di JR Konveksi.`;
                const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
              } else {
                Swal.fire("Perhatian", "Nomor telepon pelanggan tidak tersedia", "warning");
              }
            }}
          >
            <button className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </button>
            <span className="tooltip-text" style={tooltipTextStyle}>
              Chat WhatsApp
            </span>
          </div>

          <div
            className="action-button"
            style={tooltipStyle}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onClick={() => handleFinalizeNegotiation(order.id)}
          >
            <button className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <span className="tooltip-text" style={tooltipTextStyle}>
              Finalisasi Pemesanan
            </span>
          </div>

          <div
            className="action-button"
            style={tooltipStyle}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onClick={() => handleCancelOrder(order.id)}
          >
            <button className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <span className="tooltip-text" style={tooltipTextStyle}>
              Batalkan Pesanan
            </span>
          </div>

          <div
            className="action-button"
            style={tooltipStyle}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onClick={() => handleViewDetail(order.id)}
          >
            <button className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
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
      );
    } else {
      return (
        <div
          className="action-button"
          style={tooltipStyle}
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
          onClick={() => handleViewDetail(order.id)}
        >
          <button className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
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
      );
    }
  };

  
  // Render pagination with improved UI
  const renderPagination = () => {
    // Don't show pagination if there's no data or only 1 page
    if (totalPages <= 1) {
      return null;
    }

    // Calculate range of pages to show
    const pagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + pagesToShow - 1);

    // Adjust if we're near the end
    if (endPage - startPage + 1 < pagesToShow) {
      startPage = Math.max(1, endPage - pagesToShow + 1);
    }

    // Generate array of page numbers
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
        <div className="text-sm text-center sm:text-left">
          Showing{" "}
          {filteredOrders.length > 0
            ? (currentPage - 1) * entriesPerPage + 1
            : 0}{" "}
          to {Math.min(currentPage * entriesPerPage, filteredOrders.length)} of{" "}
          {filteredOrders.length} entries
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
              className={`px-3 py-1 ${
                currentPage === page ? "bg-brown-600 text-white" : "border"
              } rounded`}
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
    );
  };

  // Skeleton loading for table rows
  const renderTableSkeletonRows = () => {
    return Array(entriesPerPage)
      .fill(0)
      .map((_, index) => (
        <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
          </td>
          <td className="px-6 py-4">
            <div className="flex gap-2">
              <div className="h-9 w-9 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-9 w-9 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-9 w-9 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </td>
        </tr>
      ));
  };

  // Skeleton loading for mobile cards
  const renderMobileCardSkeletons = () => {
    return Array(entriesPerPage)
      .fill(0)
      .map((_, index) => (
        <div
          key={index}
          className="bg-white border rounded-lg shadow-sm p-4 mb-4"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-2/3">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
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
            <div className="col-span-2">
              <div className="h-4 bg-gray-200 rounded w-full mb-1 animate-pulse"></div>
              <div className="h-28 bg-gray-200 rounded w-full animate-pulse"></div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <div className="h-9 w-9 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-9 w-9 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-9 w-9 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      ));
  };

  // Parse JSON gambar_referensi
  const parseGambarReferensi = (gambar) => {
    try {
      if (!gambar) return [];
      
      if (typeof gambar === 'string') {
        return JSON.parse(gambar);
      }
      
      return Array.isArray(gambar) ? gambar : [];
    } catch (error) {
      console.error("Error parsing gambar referensi:", error);
      return [];
    }
  };

  // Check if there's an error
  if (error && !loading) {
    return (
      <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
        <div className="bg-red-50 p-4 rounded-md text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchCustomOrders}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold">Pengajuan Pemesanan Khusus</h2>
        <button
          className="px-4 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700 w-full sm:w-auto"
          onClick={fetchCustomOrders}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin h-4 w-4 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Memuat...
            </span>
          ) : (
            "Refresh Data"
          )}
        </button>
      </div>

      {/* Filter dan Search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
            <option value="pending">Pending</option>
            <option value="disetujui">Disetujui</option>
            <option value="ditolak">Ditolak</option>
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
            placeholder="Search nama, jenis baju, dll..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-1"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-md font-medium text-gray-500 uppercase tracking-wider">
                  No.
                </th>
                <th className="px-6 py-3 text-center text-md font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-center text-md font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 text-center text-md font-medium text-gray-500 uppercase tracking-wider">
                  Kontak
                </th>
                <th className="px-6 py-3 text-center text-md font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-center text-md font-medium text-gray-500 uppercase tracking-wider">
                  Jenis Pakaian
                </th>
                <th className="px-6 py-3 text-center text-md font-medium text-gray-500 uppercase tracking-wider">
                  Ukuran
                </th>
                <th className="px-6 py-3 text-center text-md font-medium text-gray-500 uppercase tracking-wider">
                  Sumber Bahan
                </th>
                <th className="px-6 py-3 text-center text-md font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-center text-md font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-md font-medium text-gray-500 uppercase tracking-wider">
                  Gambar Referensi
                </th>
                <th className="px-6 py-3 text-center text-md font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                renderTableSkeletonRows()
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="11"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Tidak ada data pengajuan pemesanan yang sesuai.
                  </td>
                </tr>
              ) : (
                paginatedData.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(currentPage - 1) * entriesPerPage + paginatedData.indexOf(order) + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div>
                        <p>{order.nama_lengkap || "-"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <a 
                        href={`tel:${order.no_telp}`} 
                        className="text-blue-600 hover:underline"
                      >
                        {order.no_telp || "-"}
                      </a>
                      {order.no_telp && (
                        <a
                          href={`https://wa.me/${order.no_telp.startsWith('+62') 
                            ? order.no_telp.substring(1) 
                            : order.no_telp.startsWith('0') 
                              ? '62' + order.no_telp.substring(1) 
                              : order.no_telp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 inline-block"
                        >
                          <span className="bg-green-500 text-white p-1 rounded-full inline-block">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className="h-3 w-3" 
                              viewBox="0 0 24 24" 
                              fill="currentColor"
                            >
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                            </svg>
                          </span>
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.email || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.jenis_baju || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.ukuran || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatSumberKain(order.sumber_kain)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.jumlah || 0} pcs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs bg-${getStatusBadgeColor(
                          order.status
                        )} text-${getStatusTextColor(order.status)}`}
                      >
                        {order.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        try {
                          // Parse the JSON string to get an array of image paths
                          const images = parseGambarReferensi(order.gambar_referensi);
                          
                          if (images.length > 0) {
                            return (
                              <div className="flex flex-row gap-1">
                                {/* Show only the first image */}
                                <img
                                  src={`${process.env.REACT_APP_API_URL}/${images[0]}`}
                                  alt="Referensi 1"
                                  className="h-10 w-auto object-cover rounded"
                                  onError={(e) => {
                                    e.target.src = `${process.env.PUBLIC_URL}/images/default-product.jpg`;
                                    e.target.onerror = null;
                                  }}
                                />
                                {/* If there are additional images, show the +N indicator */}
                                {images.length > 1 && (
                                  <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-600">
                                    +{images.length - 1}
                                  </div>
                                )}
                              </div>
                            );
                          } else {
                            return <span className="text-gray-400">-</span>;
                          }
                        } catch (error) {
                          console.error("Error parsing image references:", error);
                          return <span className="text-gray-400">Error</span>;
                        }
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {renderActionButtons(order)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {loading ? (
            renderMobileCardSkeletons()
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
          <p className="text-gray-500">
            Tidak ada data pengajuan pemesanan yang sesuai.
          </p>
            </div>
          ) : (
            paginatedData.map((order) => (
          <div key={order.id} className="bg-white border rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
            <p className="text-xs text-gray-500">#{order.id}</p>
            <p className="text-sm text-gray-500">
              {order.created_at
                ? new Date(order.created_at).toLocaleDateString()
                : "-"}
            </p>
            <h3 className="font-medium">{order.nama_lengkap || "-"}</h3>
              </div>
              <span
            className={`px-2 py-1 rounded-full text-xs bg-${getStatusBadgeColor(
              order.status
            )} text-${getStatusTextColor(order.status)}`}
              >
            {order.status || "Pending"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div>
            <p className="text-gray-500">Jenis Pakaian</p>
            <p>{order.jenis_baju || "-"}</p>
              </div>
              <div>
            <p className="text-gray-500">Ukuran</p>
            <p>{order.ukuran || "-"}</p>
              </div>
              <div>
            <p className="text-gray-500">Jumlah</p>
            <p>{order.jumlah || 0} pcs</p>
              </div>
              <div>
            <p className="text-gray-500">Sumber Bahan</p>
            <p>{formatSumberKain(order.sumber_kain)}</p>
              </div>
              <div className="col-span-2">
            <p className="text-gray-500">Kontak</p>
            <p>Email: {order.email || "-"}</p>
            <p>Telp: {order.no_telp || "-"}</p>
              </div>
              {order.detail_bahan && (
            <div className="col-span-2">
              <p className="text-gray-500">Detail Bahan</p>
              <p>{order.detail_bahan}</p>
            </div>
              )}
              {order.catatan && (
            <div className="col-span-2">
              <p className="text-gray-500">Catatan</p>
              <p>{order.catatan}</p>
            </div>
              )}
              <div className="col-span-2">
            <p className="text-gray-500">Referensi Gambar</p>
            <div className="mt-1">
              {(() => {
                try {
              // Parse the JSON string to get an array of image paths
              const images = parseGambarReferensi(order.gambar_referensi);
              
              if (images.length > 0) {
                return (
                  <div className="flex flex-row gap-1">
                {/* Show only the first image */}
                <img
                  src={`${process.env.REACT_APP_API_URL}/${images[0]}`}
                  alt="Referensi 1"
                  className="h-20 w-auto object-cover rounded"
                  onError={(e) => {
                    e.target.src = `${process.env.PUBLIC_URL}/images/default-product.jpg`;
                    e.target.onerror = null;
                  }}
                />
                {/* If there are additional images, show the +N indicator */}
                {images.length > 1 && (
                  <div className="h-20 w-20 bg-gray-200 rounded flex items-center justify-center text-sm text-gray-600">
                    +{images.length - 1}
                  </div>
                )}
                  </div>
                );
              } else {
                return <span className="text-gray-400">-</span>;
              }
                } catch (error) {
              console.error("Error parsing image references:", error);
              return <span className="text-gray-400">Error</span>;
                }
              })()}
            </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {renderActionButtons(order)}
            </div>
          </div>
            ))
          )}
        </div>

        {/* Pagination */}
      {!loading && filteredOrders.length > 0 && renderPagination()}

      {/* Refresh Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={fetchCustomOrders}
          className="px-4 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700 flex items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
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
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
  );
};

export default PengajuanPemesanan;