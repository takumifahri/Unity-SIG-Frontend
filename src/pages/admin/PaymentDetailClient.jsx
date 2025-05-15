"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

const PaymentDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [payment, setPayment] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchPaymentDetail()
    }, [id])

    const fetchPaymentDetail = async () => {
        try {
        setLoading(true)

        // In a real implementation, you would fetch from your API
        // For demo purposes, we'll use mock data

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Mock data for the selected payment
        const mockPayment = {
            id: Number.parseInt(id),
            order_unique_id: id,
            user_id: 1,
            user_name: "John Doe",
            email: "john.doe@example.com",
            phone: "+62812345678",
            total_harga: 360000,
            status: "Menunggu_Konfirmasi",
            created_at: "2025-05-15T09:34:31.000000Z",
            updated_at: "2025-05-15T10:04:28.000000Z",
            transaction: {
            id: 4,
            payment_method: "BCA",
            amount: 360000,
            bukti_transfer: "uploads/payment/payment1.jpg",
            created_at: "2025-05-15T10:02:21.000000Z",
            tujuan_transfer: "Bank BCA: 2670342134 a.n. Andi Setiawan",
            },
            catalog: {
            id: 3,
            nama_katalog: "Vest",
            price: 120000,
            bahan: "Kain Sutra",
            deskripsi: "Vest Kerja bagus untuk businessman",
            gambar: "uploads/catalog/1747288921.jpg",
            },
            jumlah: 3,
            size: "L",
            color: "Gray",
            catatan: "Tolong dikirim secepatnya",
        }

        setPayment(mockPayment)
        } catch (error) {
        console.error("Error fetching payment detail:", error)
        setError("An error occurred while fetching payment detail")
        } finally {
        setLoading(false)
        }
    }

    const formatCurrency = (amount) => {
        return amount ? `Rp ${amount.toLocaleString()}` : "Rp 0"
    }

    const handleStatusChange = async (newStatus) => {
        try {
        // In a real implementation, you would call your API
        // For demo purposes, we'll update the state directly

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Update payment status locally
        setPayment({
            ...payment,
            status: newStatus,
            updated_at: new Date().toISOString(),
        })

        // Show success message (in a real app, you might use a toast notification)
        alert(`Payment status updated to ${newStatus}`)
        } catch (error) {
        console.error("Error updating payment status:", error)
        alert("Failed to update payment status")
        }
    }

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

    if (loading) {
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
            onClick={fetchPaymentDetail}
            >
            Retry
            </button>
        </div>
        )
    }

    if (!payment) {
        return (
        <div className="p-6 bg-yellow-50 rounded-lg text-center">
            <p className="text-yellow-600 font-medium">Payment not found</p>
            <button
            className="mt-4 px-4 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700"
            onClick={() => navigate("/payments")}
            >
            Back to Payments
            </button>
        </div>
        )
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
            <button onClick={() => navigate("/admin/pembayaran")} className="p-2 rounded-full hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                />
                </svg>
            </button>
            <h2 className="text-2xl font-semibold">Payment Detail</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm bg-${getStatusBadgeColor(payment.status)}`}>
            {payment.status.replace(/_/g, " ")}
            </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-3">Order Information</h3>
            <div className="space-y-2">
                <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">{payment.order_unique_id}</span>
                </div>
                <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span>{new Date(payment.created_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-0.5 rounded-full text-sm bg-${getStatusBadgeColor(payment.status)}`}>
                    {payment.status.replace(/_/g, " ")}
                </span>
                </div>
            </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-3">Customer Information</h3>
            <div className="space-y-2">
                <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span>{payment.user_name}</span>
                </div>
                <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span>{payment.email}</span>
                </div>
                <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span>{payment.phone}</span>
                </div>
            </div>
            </div>
        </div>

        <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Product Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start">
                <div className="w-20 h-20 bg-gray-200 rounded-md overflow-hidden mr-4">
                <img
                    src={`${process.env.REACT_APP_API_URL}/${payment.catalog.gambar}`}
                    alt={payment.catalog.nama_katalog}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                    e.target.src = "/placeholder.svg?height=80&width=80"
                    }}
                />
                </div>
                <div className="flex-1">
                <h4 className="font-medium">{payment.catalog.nama_katalog}</h4>
                <p className="text-sm text-gray-600">{payment.catalog.deskripsi}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-gray-100 rounded-md text-sm">Size: {payment.size}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded-md text-sm">Color: {payment.color}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded-md text-sm">Material: {payment.catalog.bahan}</span>
                </div>
                </div>
                <div className="text-right">
                <div className="text-gray-600 text-sm">
                    {formatCurrency(payment.catalog.price)} x {payment.jumlah}
                </div>
                <div className="font-medium">{formatCurrency(payment.catalog.price * payment.jumlah)}</div>
                </div>
            </div>
            {payment.catatan && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                <p className="text-sm font-medium text-yellow-800">Notes:</p>
                <p className="text-sm">{payment.catatan}</p>
                </div>
            )}
            </div>
        </div>

        <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Payment Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                <p className="text-gray-600 text-sm">Payment Method</p>
                <p className="font-medium">{payment.transaction.payment_method}</p>
                </div>
                <div>
                <p className="text-gray-600 text-sm">Payment Date</p>
                <p>{new Date(payment.transaction.created_at).toLocaleString()}</p>
                </div>
                <div>
                <p className="text-gray-600 text-sm">Amount</p>
                <p className="font-medium text-lg">{formatCurrency(payment.transaction.amount)}</p>
                </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm font-medium text-blue-800">Transfer Details:</p>
                <p className="text-sm">{payment.transaction.tujuan_transfer}</p>
            </div>
            </div>
        </div>

        <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Payment Proof</h3>
            <div className="bg-gray-50 p-4 rounded-lg flex justify-center">
            <div className="max-w-md">
                <img
                src={`${process.env.REACT_APP_API_URL}/${payment.transaction.bukti_transfer}`}
                alt="Payment Proof"
                className="max-h-96 rounded-lg border border-gray-200"
                onError={(e) => {
                    e.target.src = "/placeholder.svg?height=400&width=300"
                }}
                />
            </div>
            </div>
        </div>

        {payment.status === "Menunggu_Konfirmasi" && (
            <div className="flex justify-end space-x-3 mt-6">
            <button
                onClick={() => handleStatusChange("Ditolak")}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
                Reject Payment
            </button>
            <button
                onClick={() => handleStatusChange("Diproses")}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
                Approve Payment
            </button>
            </div>
        )}
        </div>
    )
}

export default PaymentDetail
