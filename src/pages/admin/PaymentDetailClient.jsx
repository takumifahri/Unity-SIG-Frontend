import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { Alert, Snackbar, CircularProgress } from "@mui/material"

const PaymentDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [payment, setPayment] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [snackbar, setSnackbar] = useState({
      open: false,
      message: "",
      severity: "success"
    })

    useEffect(() => {
        fetchPaymentDetail()
    }, [id])

    const fetchPaymentDetail = async () => {
        try {
          setLoading(true)
          setError(null)

          // Fetch the transaction detail from API
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/transaction/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          })

          console.log("Payment Detail response:", response.data)
          
          if (response.data.success || response.data.status) {
            setPayment(response.data.data)
          } else {
            setError(response.data.message || "Failed to fetch payment details")
          }
        } catch (error) {
          console.error("Error fetching payment detail:", error)
          setError("An error occurred while fetching payment details")
        } finally {
          setLoading(false)
        }
    }

    const formatCurrency = (amount) => {
        return amount ? `Rp ${Number(amount).toLocaleString('id-ID')}` : "Rp 0"
    }

    const handleStatusChange = async (newStatus) => {
        try {
          setLoading(true)
          
          // Call API to update status
          const response = await axios.post(
              `${process.env.REACT_APP_API_URL}/api/order/admin/verif/${payment.id}`,
              { status: newStatus === "Diproses" ? "approve" : "reject" },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
          )
      
          console.log("Status update response:", response.data)
          
          if (response.data.success) {
            // Refresh data
            await fetchPaymentDetail()
            
            // Show success message
            setSnackbar({
              open: true,
              message: `Payment status updated to ${newStatus.replace(/_/g, " ")}`,
              severity: "success"
            })
          } else {
            setSnackbar({
              open: true,
              message: response.data.message || "Failed to update payment status",
              severity: "error"
            })
          }
        } catch (error) {
          console.error("Error updating payment status:", error)
          setSnackbar({
            open: true,
            message: "An error occurred while updating the payment status",
            severity: "error"
          })
        } finally {
          setLoading(false)
        }
    }

    const handleCloseSnackbar = () => {
      setSnackbar({...snackbar, open: false})
    }

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

    const getCustomerInfo = () => {
      if (!payment) return {};
      
      // First check if payment has a direct user property
      if (payment.user) {
        return payment.user;
      }
      
      // Then check if order has user
      if (payment.order?.user) {
        return payment.order.user;
      }
      
      // Finally check if payment has custom_order with customer info
      if (payment.order?.custom_order) {
        return {
          name: payment.order.custom_order.nama_lengkap,
          email: payment.order.custom_order.email,
          phone: payment.order.custom_order.no_telp
        };
      }
      
      return {};
    }
    
    const getOrderInfo = () => {
      if (!payment) return null;
      return payment.order || null;
    }

    const getProductInfo = () => {
      const order = getOrderInfo();
      
      if (!order) return { name: "N/A", material: "", type: "N/A" };
      
      // Check if it's a catalog order
      if (order.catalog) {
        return {
          name: order.catalog.nama_katalog || "Catalog Product",
          material: order.catalog.bahan || "",
          type: "Catalog",
          description: order.catalog.deskripsi || "",
          price: order.catalog.price,
          image: order.catalog.gambar,
          sizes: [],
          colors: []
        };
      }
      
      // Check if it's a custom order
      if (order.custom_order) {
        let images = [];
        try {
          if (order.custom_order.gambar_referensi) {
            images = JSON.parse(order.custom_order.gambar_referensi);
          }
        } catch (e) {
          console.error("Error parsing reference images:", e);
        }
        
        return {
          name: order.custom_order.jenis_baju || "Custom Order",
          material: order.custom_order.detail_bahan || "",
          type: "Custom",
          description: order.custom_order.catatan || "",
          price: order.total_harga,
          image: images.length > 0 ? images[0] : null,
          images: images,
          colors: order.custom_order.colors || [],
          sumberKain: order.custom_order.sumber_kain,
          estimasiWaktu: order.custom_order.estimasi_waktu
        };
      }
      
      return { name: "N/A", material: "", type: "N/A" };
    }

    const getTotalQuantity = (colors) => {
      if (!colors || !Array.isArray(colors)) return 0;
      
      let total = 0;
      colors.forEach(color => {
        if (color.sizes && Array.isArray(color.sizes)) {
          color.sizes.forEach(size => {
            total += (size.jumlah || 0);
          });
        }
      });
      
      return total;
    };
    
    // Format custom order colors and sizes for display
    const formatColorSizes = (colors) => {
      if (!colors || !Array.isArray(colors)) return [];
      
      return colors.map(color => {
        const sizes = color.sizes || [];
        return {
          name: color.color_name,
          sizes: sizes.map(s => `${s.size} (${s.jumlah})`)
        };
      });
    };

    if (loading) {
        return (
        <div className="flex justify-center items-center h-64">
            <CircularProgress size={60} thickness={4} style={{ color: "#6B4A3D" }} />
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
              onClick={() => navigate("/admin/pembayaran")}
            >
              Back to Payments
            </button>
        </div>
        )
    }
    
    const customer = getCustomerInfo();
    const order = getOrderInfo();
    const product = getProductInfo();
    const colorSizes = formatColorSizes(product.colors);
    const status = order?.status || payment.status || "pending";
    const orderUniqueId = order?.order_unique_id || payment.transaction_unique_id || `Payment #${payment.id}`;
    const notes = order?.catatan || order?.custom_order?.catatan || "";
    const totalQuantity = getTotalQuantity(product.colors);
    const paymentMethod = payment.payment_method || "BCA";
    const amount = payment.amount || order?.total_harga || 0;
    const buktiTransfer = payment.bukti_transfer || order?.bukti_pembayaran || "";
    const tujuanTransfer = payment.tujuan_transfer || "Bank BCA: 2670342134 a.n. Andi Setiawan";

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
            <span className={`px-3 py-1 rounded-full text-sm bg-${getStatusBadgeColor(status)}-100 text-${getStatusBadgeColor(status)}-800`}>
              {status.replace(/_/g, " ")}
            </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Order Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium">{orderUniqueId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span>{new Date(payment.created_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs bg-${getStatusBadgeColor(status)}-100 text-${getStatusBadgeColor(status)}-800`}>
                    {status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Type:</span>
                  <span>{product.type}</span>
                </div>
                {product.estimasiWaktu && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimasi Waktu:</span>
                    <span>{product.estimasiWaktu}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Customer Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span>{customer.name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span>{customer.email || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span>{customer.phone || customer.telepon || "N/A"}</span>
                </div>
              </div>
            </div>
        </div>

        <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Product Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start flex-wrap md:flex-nowrap">
                <div className="w-full md:w-20 h-20 bg-gray-200 rounded-md overflow-hidden mb-4 md:mb-0 md:mr-4">
                  {product.image && (
                    <img
                      src={`${process.env.REACT_APP_API_URL}/${product.image}`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg?height=80&width=80"
                      }}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{product.name}</h4>
                  {product.material && (
                    <p className="text-sm text-gray-600">Material: {product.material}</p>
                  )}
                  {product.sumberKain && (
                    <p className="text-sm text-gray-600">Sumber Kain: {product.sumberKain}</p>
                  )}
                  
                  {colorSizes.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium">Warna & Ukuran:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                        {colorSizes.map((color, idx) => (
                          <div key={idx} className="bg-gray-100 p-2 rounded">
                            <p className="font-medium text-sm">{color.name}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {color.sizes.map((size, i) => (
                                <span key={i} className="text-xs px-2 py-1 bg-white rounded">
                                  {size}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-right mt-4 md:mt-0 w-full md:w-auto">
                  <div className="text-gray-600 text-sm">
                    Total Items: {totalQuantity}
                  </div>
                  <div className="font-medium">{formatCurrency(amount)}</div>
                </div>
              </div>
              {notes && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                  <p className="text-sm font-medium text-yellow-800">Notes:</p>
                  <p className="text-sm">{notes}</p>
                </div>
              )}
            </div>
        </div>

        {product.images && product.images.length > 1 && (
          <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Reference Images</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {product.images.map((image, idx) => (
                    <div key={idx} className="h-[50] bg-gray-200 rounded overflow-hidden">
                      <img 
                        src={`${process.env.REACT_APP_API_URL}/${image}`}
                        alt={`Reference ${idx+1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg?height=160&width=120"
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
          </div>
        )}

        <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Payment Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Payment Method</p>
                  <p className="font-medium">{paymentMethod}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Payment Date</p>
                  <p>{new Date(payment.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Amount</p>
                  <p className="font-medium text-lg">{formatCurrency(amount)}</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm font-medium text-blue-800">Transfer Details:</p>
                <p className="text-sm">{tujuanTransfer}</p>
              </div>
            </div>
        </div>

        <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Payment Proof</h3>
            <div className="bg-gray-50 p-4 rounded-lg flex justify-center">
              {buktiTransfer ? (
                <div className="max-w-md">
                  <img
                    src={`${process.env.REACT_APP_API_URL}/${buktiTransfer}`}
                    alt="Payment Proof"
                    className="max-h-96 rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=400&width=300"
                    }}
                  />
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>No payment proof uploaded yet</p>
                </div>
              )}
            </div>
        </div>

        {(status === "Menunggu_Konfirmasi" || status === "pending") && (
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

export default PaymentDetail