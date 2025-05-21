import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

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
      
      if (response.data && response.data.data) {
        setCustomOrders(response.data.data);
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
            `${process.env.REACT_APP_API_URL}/api/custom-orders/accept`,
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
            Swal.fire(
              "Berhasil!",
              "Pengajuan pemesanan berhasil disetujui.",
              "success"
            );

            // Refresh data
            fetchCustomOrders();
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
          `${process.env.REACT_APP_API_URL}/api/custom-orders/reject`,
          { custom_order_id: id, reason: rejectReason },
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
        return [...orders].sort((a, b) => b.jumlah - a.jumlah);
      case "lowest_quantity":
        return [...orders].sort((a, b) => a.jumlah - b.jumlah);
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
        <h2 className="text-2xl font-semibold">Pengajuan Pemesanan</h2>
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
                <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                  Jenis Pakaian
                </th>
                <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                  Ukuran
                </th>
                <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                  Sumber Bahan
                </th>
                <th className="px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
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
              {loading ? (
                renderTableSkeletonRows()
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Tidak ada data pengajuan pemesanan yang sesuai.
                  </td>
                </tr>
              ) : (
                paginatedData.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div>
                        <p>{order.nama_lengkap || "-"}</p>
                        <p className="text-xs text-gray-500">
                          {order.no_telp || "-"}
                        </p>
                      </div>
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
                {order.gambar_referensi && (
                  <div className="col-span-2">
                    <p className="text-gray-500">Referensi Gambar</p>
                    <img
                      src={`${process.env.REACT_APP_API_URL}/${order.gambar_referensi}`}
                      alt="Referensi"
                      className="h-32 w-auto object-cover rounded mt-1"
                    />
                  </div>
                )}
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