"use client"

import axios from "axios"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

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

    const formatCurrency = (amount) => {
        return amount ? `Rp ${amount.toLocaleString()}` : "Rp 0"
    }

    const handleDetail = (id) => {
        // Navigate to payment detail page
        navigate(`/admin/pembayaran/${id}`)
    }

    const handleStatusChange = async (id, newStatus) => {
        try {
        // Call API to update status
        await axios.post(
            `${process.env.REACT_APP_API_URL}/api/order/admin/verif/${id}`,
            { status: newStatus === "Diproses" ? "approve" : "reject" },
            {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            }
        );
    
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

    const getStatusBadgeColor = (status) => {
        switch (status) {
        case "Menunggu_Konfirmasi":
            return "blue-50" // Light blue background
        case "Diproses":
            return "green-50" // Light green background
        case "Ditolak":
            return "red-50" // Light red background
        case "Selesai":
            return "purple-50" // Light purple background
        default:
            return "gray-50" // Light gray background
        }
    }

    const getStatusTextColor = (status) => {
        switch (status) {
        case "Menunggu_Konfirmasi":
            return "blue-600" // Blue text
        case "Diproses":
            return "green-600" // Green text
        case "Ditolak":
            return "red-600" // Red text
        case "Selesai":
            return "purple-600" // Purple text
        default:
            return "gray-600" // Gray text
        }
    }

    // Calculate pagination - ensure payments is an array before calling slice
    const indexOfLastPayment = currentPage * entriesPerPage
    const indexOfFirstPayment = indexOfLastPayment - entriesPerPage
    const currentPayments = Array.isArray(payments) ? payments.slice(indexOfFirstPayment, indexOfLastPayment) : []
    const totalPages = Math.ceil((Array.isArray(payments) ? payments.length : 0) / entriesPerPage)

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber)

    // Get the first order from the orders array
    const getFirstOrder = (payment) => {
        if (payment.orders && Array.isArray(payment.orders) && payment.orders.length > 0) {
        return payment.orders[0]
        }
        return null
    }

    // Get customer name from order or custom order
    const getCustomerName = (payment) => {
        const order = getFirstOrder(payment)

        if (order && order.user && order.user.name) {
        return order.user.name
        }

        if (order && order.custom_order && order.custom_order.nama_lengkap) {
        return order.custom_order.nama_lengkap
        }

        return "N/A"
    }

    // Get product name from catalog or custom order
    const getProductName = (payment) => {
        const order = getFirstOrder(payment)

        if (!order) return "N/A"

        if (order.catalog && order.catalog.nama_katalog) {
        return order.catalog.nama_katalog
        }

        if (order.type === "Pemesanan" && order.custom_order) {
        return order.custom_order.jenis_baju || "Custom Order"
        }

        return "N/A"
    }

    // Get product material
    const getProductMaterial = (payment) => {
        const order = getFirstOrder(payment)

        if (!order) return ""

        if (order.catalog && order.catalog.bahan) {
        return order.catalog.bahan
        }

        if (order.custom_order && order.custom_order.detail_bahan) {
        return order.custom_order.detail_bahan
        }

        return ""
    }

    // Get order size
    const getOrderSize = (payment) => {
        const order = getFirstOrder(payment)

        if (!order) return "N/A"

        // Handle size as an object
        if (order.size) {
        if (typeof order.size === "object" && order.size !== null) {
            return order.size.size || "N/A"
        }
        return typeof order.size === "string" ? order.size : "N/A"
        }

        if (order.custom_order && order.custom_order.ukuran) {
        return order.custom_order.ukuran
        }

        return "N/A"
    }

    // Update the getOrderColor function to handle color as an object
    const getOrderColor = (payment) => {
        const order = getFirstOrder(payment)

        if (!order) return "N/A"

        // Handle color as an object
        if (order.color) {
        if (typeof order.color === "object" && order.color !== null) {
            return order.color.color_name || "N/A"
        }
        return typeof order.color === "string" ? order.color : "N/A"
        }

        return "N/A"
    }

    // Get order quantity
    const getOrderQuantity = (payment) => {
        const order = getFirstOrder(payment)

        if (!order) return 1

        if (order.jumlah) {
        return order.jumlah
        }

        if (order.custom_order && order.custom_order.jumlah) {
        return order.custom_order.jumlah
        }

        return 1
    }

    // Get order status
    const getOrderStatus = (payment) => {
        const order = getFirstOrder(payment)

        if (order && order.status) {
        return order.status
        }

        return payment.status || "pending"
    }

    // Get total price
    const getTotalPrice = (payment) => {
        if (payment.amount) {
        return payment.amount
        }

        const order = getFirstOrder(payment)

        if (order && order.total_harga) {
        return order.total_harga
        }

        if (order && order.custom_order && order.custom_order.total_harga) {
        return order.custom_order.total_harga
        }

        return 0
    }

    // Get order ID
    const getOrderId = (payment) => {
        const order = getFirstOrder(payment)

        if (!order) return `Payment #${payment.id}`

        if (order.order_unique_id && order.order_unique_id !== "") {
        return order.order_unique_id
        }

        return `Order #${order.id}`
    }

    if (loading && (!Array.isArray(payments) || payments.length === 0)) {
        return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brown-600"></div>
        </div>
        )
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
                    Ukuran/Warna
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
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
                {!Array.isArray(currentPayments) || currentPayments.length === 0 ? (
                <tr>
                    <td colSpan="10" className="px-4 py-4 text-center text-gray-500">
                    No payment data found
                    </td>
                </tr>
                ) : (
                currentPayments.map((payment) => (
                    <tr key={payment.id}>
                    <td className="px-4 py-4 whitespace-nowrap font-medium text-sm">{getOrderId(payment)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{getCustomerName(payment)}</td>
                    <td className="px-4 py-4 text-sm">
                        <div>
                        <p className="font-medium">{getProductName(payment)}</p>
                        <p className="text-xs text-gray-500">{getProductMaterial(payment)}</p>
                        </div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                        <div>
                        <p>Size: {getOrderSize(payment)}</p>
                        <p>Color: {getOrderColor(payment)}</p>
                        </div>
                    </td>
                    <td className="px-4 py-4 text-center text-sm">{getOrderQuantity(payment)}</td>
                    <td className="px-4 py-4 text-sm">{payment.payment_method || "BCA"}</td>
                    <td className="px-4 py-4 font-medium text-sm">{formatCurrency(getTotalPrice(payment))}</td>
                    <td className="px-4 py-4 text-sm">
                        <span
                        className={`px-2 py-1 rounded-full text-xs bg-${getStatusBadgeColor(getOrderStatus(payment))}`}
                        >
                        {getOrderStatus(payment).replace(/_/g, " ")}
                        </span>
                    </td>
                    <td className="px-4 py-4 text-sm">
                        <div className="flex flex-col sm:flex-row gap-2">
                        {getOrderStatus(payment) === "Menunggu_Konfirmasi" && (
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
                            <button
                                onClick={() => handleDetail(payment.id)}
                                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                            >
                                Detail
                            </button>
                            </>
                        )}
                        {getOrderStatus(payment) !== "Menunggu_Konfirmasi" && (
                            <button
                            onClick={() => handleDetail(payment.id)}
                            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                            >
                            Detail
                            </button>
                        )}
                        </div>
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>

        {/* Card view for small screens */}
        <div className="md:hidden space-y-4">
            {!Array.isArray(currentPayments) || currentPayments.length === 0 ? (
            <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">No payment data found</div>
            ) : (
            currentPayments.map((payment) => (
                <div key={payment.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b">
                    <div className="flex justify-between items-start">
                    <div>
                        <p className="font-medium text-sm">{getOrderId(payment)}</p>
                        <p className="text-xs text-gray-500">
                        {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : "-"}
                        </p>
                    </div>
                    <span
                        className={`px-2 py-1 rounded-full text-xs bg-${getStatusBadgeColor(
                        getOrderStatus(payment),
                        )} text-${getStatusTextColor(getOrderStatus(payment))}`}
                    >
                        {getOrderStatus(payment).replace(/_/g, " ")}
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
                    <span className="text-sm font-medium">{getProductName(payment)}</span>
                    </div>

                    <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Size/Color:</span>
                    <span className="text-sm">
                        {getOrderSize(payment)} / {getOrderColor(payment)}
                    </span>
                    </div>

                    <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Quantity:</span>
                    <span className="text-sm">{getOrderQuantity(payment)}</span>
                    </div>

                    <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Payment Method:</span>
                    <span className="text-sm">{payment.payment_method || "BCA"}</span>
                    </div>

                    <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Total:</span>
                    <span className="text-sm font-medium">{formatCurrency(getTotalPrice(payment))}</span>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 flex flex-wrap gap-2">
                    {getOrderStatus(payment) === "Menunggu_Konfirmasi" && (
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
                        <button
                        onClick={() => handleDetail(payment.id)}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                        Detail
                        </button>
                    </>
                    )}
                    {getOrderStatus(payment) !== "Menunggu_Konfirmasi" && (
                    <button
                        onClick={() => handleDetail(payment.id)}
                        className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                        Detail
                    </button>
                    )}
                </div>
                </div>
            ))
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
                disabled={currentPage === 1}
            >
                Previous
            </button>
            {/* Show limited page numbers on mobile */}
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
                >
                    {number + 1}
                </button>
                ))}
            <button
                className="px-3 py-1 border rounded disabled:opacity-50 text-sm"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next
            </button>
            </div>
        </div>
        </div>
    )
}

export default PaymentAdmin
