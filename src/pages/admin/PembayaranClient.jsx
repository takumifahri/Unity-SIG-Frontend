import axios from "axios"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { 
  Alert,
  Snackbar 
} from "@mui/material"

const PaymentAdmin = () => {
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [entriesPerPage, setEntriesPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState("")
    const [dateFilter, setDateFilter] = useState("")
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const navigate = useNavigate()
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success", // success, error, warning, info
    });
    
    useEffect(() => {
        fetchPayments()
    }, [statusFilter, dateFilter])

    const fetchPayments = async () => {
        try {
          setLoading(true)

          // Fetch data from API
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/transaction`, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
          })

          console.log("API response:", response.data)

          // Ensure we're setting an array
          const transactionsData = response.data.data || []

          // Check if transactionsData is an array, if not, convert to array or use empty array
          const transactionsArray = Array.isArray(transactionsData)
              ? transactionsData
              : transactionsData
              ? [transactionsData]
              : []

          setPayments(transactionsArray)
        } catch (error) {
          console.error("Error fetching payments:", error)
          setError("An error occurred while fetching payments")
          setPayments([]) // Set to empty array on error
        } finally {
          setLoading(false)
        }
    }

    // Membuat array skeleton untuk loading
    const skeletonRows = Array(5).fill(0); // Tampilkan 5 baris skeleton

    const formatCurrency = (amount) => {
        return amount ? `Rp ${Number(amount).toLocaleString('id-ID')}` : "Rp 0"
    }

    const handleDetail = (id) => {
        // Navigate to payment detail page
        navigate(`/admin/pembayaran/${id}`)
    }

    const handleStatusChange = async (id, newStatus) => {
        try {
          // Call API to update status
          const response = await axios.post(
              `${process.env.REACT_APP_API_URL}/api/order/admin/verif/${id}`,
              { status: newStatus === "Diproses" ? "approve" : "reject" },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
          );
      
          console.log("Status update response:", response.data);
          // Refresh data after update
          fetchPayments();
      
          // Show success message
          setSnackbar({
              open: true,
              message: `Status pembayaran berhasil diubah menjadi "${newStatus}".`,
              severity: "success",
          });
        } catch (error) {
          console.error("Error updating payment status:", error);
      
          // Show error message
          setSnackbar({
              open: true,
              message: "Gagal mengubah status pembayaran.",
              severity: "error",
          });
        }
    };

    const handleCloseSnackbar = () => {
      setSnackbar({
        ...snackbar,
        open: false,
      });
    };

    const getStatusBadgeColor = (status) => {
        switch (status?.toLowerCase()) {
          case "menunggu_konfirmasi":
          case "menunggu konfirmasi":
          case "menunggu_pembayaran": 
          case "menunggu pembayaran":
          case "belum_bayar":
          case "pending":
              return "yellow"
          case "diproses":
          case "proses":
              return "green"
          case "ditolak":
              return "red"
          case "selesai":
              return "purple"
          default:
              return "gray"
        }
    }

    const getStatusTextColor = (status) => {
        switch (status?.toLowerCase()) {
          case "menunggu_konfirmasi":
          case "menunggu konfirmasi": 
          case "menunggu_pembayaran": 
          case "menunggu pembayaran":
          case "belum_bayar":
          case "pending":
              return "yellow-800"
          case "diproses":
          case "proses":
              return "green-800"
          case "ditolak":
              return "red-800"
          case "selesai":
              return "purple-800"
          default:
              return "gray-800"
        }
    }

    // Calculate pagination - ensure payments is an array before calling slice
    const indexOfLastPayment = currentPage * entriesPerPage
    const indexOfFirstPayment = indexOfLastPayment - entriesPerPage
    const currentPayments = Array.isArray(payments) ? payments.slice(indexOfFirstPayment, indexOfLastPayment) : []
    const totalPages = Math.ceil((Array.isArray(payments) ? payments.length : 0) / entriesPerPage)

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber)

    // Get customer information from order data
    const getCustomerInfo = (payment) => {
      // First check if payment has a direct user property
      if (payment.order?.user) {
        return payment.order.user;
      }
      // Then check if payment has orders array
      if (payment.orders && Array.isArray(payment.orders) && payment.orders.length > 0) {
        return payment.orders[0].user || {};
      }
      // Finally check if payment has custom_order with customer info
      if (payment.order?.custom_order) {
        return {
          name: payment.order.custom_order.nama_lengkap,
          email: payment.order.custom_order.email,
          telepon: payment.order.custom_order.no_telp
        };
      }
      return {};
    }

    // Get order information from different structures
    const getOrderInfo = (payment) => {
      // Get direct order if available
      if (payment.order) {
        return payment.order;
      }
      // Otherwise get first order from orders array
      if (payment.orders && Array.isArray(payment.orders) && payment.orders.length > 0) {
        return payment.orders[0];
      }
      return null;
    }

    // Get customer name
    const getCustomerName = (payment) => {
      const customer = getCustomerInfo(payment);
      return customer?.name || customer?.nama_lengkap || "N/A";
    }

    // Get product details
    const getProductInfo = (payment) => {
      const order = getOrderInfo(payment);
      
      if (!order) return { name: "N/A", material: "", type: "N/A" };
      
      // Check if it's a catalog order
      if (order.catalog) {
        return {
          name: order.catalog.nama_katalog || "Catalog Product",
          material: order.catalog.bahan || "",
          type: "Catalog"
        };
      }
      
      // Check if it's a custom order
      if (order.custom_order) {
        return {
          name: order.custom_order.jenis_baju || "Custom Order",
          material: order.custom_order.detail_bahan || "",
          type: "Custom"
        };
      }
      
      return { name: "N/A", material: "", type: "N/A" };
    }

    // Get order status
    const getOrderStatus = (payment) => {
      const order = getOrderInfo(payment);
      
      if (!order) return payment.status || "pending";
      
      if (order.status) {
        return order.status;
      }
      
      if (order.status_pembayaran) {
        return order.status_pembayaran === "belum_bayar" ? "Menunggu_Pembayaran" : order.status_pembayaran;
      }
      
      return payment.status || "pending";
    }

    // Get order ID
    const getOrderId = (payment) => {
      const order = getOrderInfo(payment);
      
      if (!order) return payment.transaction_unique_id || `Payment #${payment.id}`;
      
      return order.order_unique_id || `Order #${order.id}`;
    }

    if (error) {
        return (
          <div className="p-6 bg-red-50 rounded-lg text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              className="mt-4 px-4 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700"
              onClick={fetchPayments}
            >
              Retry
            </button>
          </div>
        )
    }

    return (
        <div className="p-4 md:p-6 bg-white rounded-lg shadow-md">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl md:text-2xl font-semibold">Payment Verification</h2>
            <div className="flex space-x-2 w-full sm:w-auto">
              <button
                className="px-3 py-2 md:px-4 md:py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700 text-sm md:text-base flex-1 sm:flex-none"
                onClick={fetchPayments}
              >
                Refresh
              </button>
              <button
                className="px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm md:text-base flex-1 sm:flex-none md:hidden"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                {isFilterOpen ? "Hide Filters" : "Show Filters"}
              </button>
            </div>
          </div>

          {/* Filter dan Search - Always visible on md screens, toggleable on mobile */}
          <div className={`${isFilterOpen ? "block" : "hidden"} md:block mb-6`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm md:text-base">Show</span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm md:text-base"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm md:text-base">entries</span>
              </div>

              <div>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-1 text-sm md:text-base"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="Menunggu_Konfirmasi">Menunggu Konfirmasi</option>
                  <option value="pending">Pending</option>
                  <option value="Menunggu_Pembayaran">Menunggu Pembayaran</option>
                  <option value="Diproses">Diproses</option>
                  <option value="Ditolak">Ditolak</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>

              <div>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded px-3 py-1 text-sm md:text-base"
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
                  onKeyPress={(e) => e.key === "Enter" && fetchPayments()}
                  className="w-full border border-gray-300 rounded px-3 py-1 text-sm md:text-base"
                />
              </div>
            </div>
          </div>

          {/* Table for medium and large screens */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metode Pembayaran
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Harga
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  // Skeleton rows untuk loading
                  skeletonRows.map((_, index) => (
                    <tr key={`skeleton-${index}`}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-6 bg-gray-200 rounded-full animate-pulse w-24"></div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                          <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : !Array.isArray(currentPayments) || currentPayments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-4 text-center text-gray-500">
                      No payment data found
                    </td>
                  </tr>
                ) : (
                  currentPayments.map((payment) => {
                    const productInfo = getProductInfo(payment);
                    const status = getOrderStatus(payment);
                    
                    return (
                      <tr key={payment.id}>
                        <td className="px-4 py-4 whitespace-nowrap font-medium text-sm">
                          {payment.transaction_unique_id || getOrderId(payment)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{getCustomerName(payment)}</td>
                        <td className="px-4 py-4 text-sm">
                          <div>
                            <p className="font-medium">{productInfo.name}</p>
                            <p className="text-xs text-gray-500">{productInfo.material}</p>
                            <p className="text-xs text-gray-500">{productInfo.type}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm">{payment.payment_method || "BCA"}</td>
                        <td className="px-4 py-4 font-medium text-sm">{formatCurrency(payment.amount)}</td>
                        <td className="px-4 py-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs bg-${getStatusBadgeColor(status)}-100 text-${getStatusTextColor(status)}`}
                          >
                            {status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div className="flex flex-col sm:flex-row gap-2">
                            {(status === "Menunggu_Konfirmasi" || status === "pending") && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(payment.id, "Diproses")}
                                  className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                                >
                                  Terima
                                </button>
                                <button
                                  onClick={() => handleStatusChange(payment.id, "Ditolak")}
                                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                                >
                                  Tolak
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDetail(payment.id)}
                              className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                            >
                              Detail
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Card view for small screens */}
          <div className="md:hidden space-y-4">
            {loading ? (
              // Skeleton cards untuk mobile
              skeletonRows.map((_, index) => (
                <div key={`skeleton-mobile-${index}`} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded-full animate-pulse w-24"></div>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    {[1, 2, 3, 4, 5].map(item => (
                      <div key={`detail-${index}-${item}`} className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-gray-50 flex flex-wrap gap-2">
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-full"></div>
                  </div>
                </div>
              ))
            ) : !Array.isArray(currentPayments) || currentPayments.length === 0 ? (
              <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                No payment data found
              </div>
            ) : (
              currentPayments.map((payment) => {
                const productInfo = getProductInfo(payment);
                const status = getOrderStatus(payment);
                
                return (
                  <div key={payment.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 border-b">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{payment.transaction_unique_id || getOrderId(payment)}</p>
                          <p className="text-xs text-gray-500">
                            {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : "-"}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs bg-${getStatusBadgeColor(status)}-100 text-${getStatusTextColor(status)}`}
                        >
                          {status.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Customer:</span>
                        <span className="text-sm font-medium">{getCustomerName(payment)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Product:</span>
                        <span className="text-sm font-medium">{productInfo.name}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Type:</span>
                        <span className="text-sm">{productInfo.type}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Payment Method:</span>
                        <span className="text-sm">{payment.payment_method || "BCA"}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Total:</span>
                        <span className="text-sm font-medium">{formatCurrency(payment.amount)}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 flex flex-wrap gap-2">
                      {(status === "Menunggu_Konfirmasi" || status === "pending") && (
                        <>
                          <button
                            onClick={() => handleStatusChange(payment.id, "Diproses")}
                            className="flex-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                          >
                            Terima
                          </button>
                          <button
                            onClick={() => handleStatusChange(payment.id, "Ditolak")}
                            className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          >
                            Tolak
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDetail(payment.id)}
                        className={`${(status === "Menunggu_Konfirmasi" || status === "pending") ? "flex-1" : "w-full"} px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm`}
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination - Responsive */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <div className="text-sm text-gray-600 w-full sm:w-auto text-center sm:text-left">
              Showing {indexOfFirstPayment + 1} to{" "}
              {Math.min(indexOfLastPayment, Array.isArray(payments) ? payments.length : 0)} of{" "}
              {Array.isArray(payments) ? payments.length : 0} entries
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                className="px-3 py-1 border rounded disabled:opacity-50 text-sm"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </button>
              
              {[...Array(totalPages).keys()]
                .filter((number) => {
                  // On mobile, show only current page, first, last, and adjacent pages
                  const isMobile = window.innerWidth < 640
                  if (!isMobile) return true
                  return number + 1 === 1 || number + 1 === totalPages || Math.abs(number + 1 - currentPage) <= 1
                })
                .map((number) => (
                  <button
                    key={number + 1}
                    onClick={() => paginate(number + 1)}
                    className={`px-3 py-1 ${
                      currentPage === number + 1 ? "bg-brown-600 text-white" : "border"
                    } rounded text-sm`}
                    disabled={loading}
                  >
                    {number + 1}
                  </button>
                ))}
                
              <button
                className="px-3 py-1 border rounded disabled:opacity-50 text-sm"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
              >
                Next
              </button>
            </div>
          </div>
          
          <Snackbar 
            open={snackbar.open} 
            autoHideDuration={6000} 
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert 
              onClose={handleCloseSnackbar} 
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </div>
    )
}

export default PaymentAdmin