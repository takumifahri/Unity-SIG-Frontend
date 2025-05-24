import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaShoppingBag, FaTruck, FaCreditCard, FaCheckCircle, FaArrowLeft, FaArrowRight } from "react-icons/fa"
import axios from "axios"
// Add Material UI imports
import { Snackbar, Alert, LinearProgress, Box } from "@mui/material"

function Checkout() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [subtotal, setSubtotal] = useState(0)
  const [orderNotes, setOrderNotes] = useState("")
  const applicationFee = 2500 // Biaya aplikasi
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [userData, setUserData] = useState(null)
  
  // Add Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // success, error, warning, info
    autoHideDuration: 6000
  })

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    paymentMethod: "transfer",
    bankAccount: "",
    notes: "",
  })
  
  // Extract the first image from a path or array
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.svg?height=80&width=80";
    
    try {
      const imageStr = String(imagePath);
      
      if (imageStr.startsWith("http")) {
        return imageStr;
      }
      
      if (imageStr.includes(",")) {
        const firstImage = imageStr.split(",")[0].trim();
        return `${process.env.REACT_APP_API_URL}/${firstImage}`;
      }
      
      return `${process.env.REACT_APP_API_URL}/${imageStr}`;
    } catch (error) {
      console.error("Error processing image URL:", error);
      return "/placeholder.svg?height=80&width=80";
    }
  };
  
  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  // Show notification
  const showNotification = (message, severity = "success", duration = 6000) => {
    setSnackbar({
      open: true,
      message,
      severity,
      autoHideDuration: duration
    });
  };
  
  // Fetch user data
  const getMe = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setUserData(res.data.user);

      // Pre-fill form with user data
      setFormData(prev => ({
        ...prev,
        fullName: res.data.user.name || "",
        phone: res.data.user.phone || res.data.user.phoneNumber || "",
        address: res.data.user.address || "",
      }));
    } catch (error) {
      console.error("Error fetching user data:", error);
      showNotification("Gagal memuat data pengguna", "error");
    }
  };

  // Load user data on component mount
  useEffect(() => {
    getMe();
  }, []);

  // Load cart items and calculate subtotal
  useEffect(() => {
    try {
      // Try to get checkout items first, then fall back to regular cart
      const checkoutItems = JSON.parse(localStorage.getItem("checkoutItems")) || [];
      const items = checkoutItems.length > 0 ? checkoutItems : JSON.parse(localStorage.getItem("cart")) || [];
      
      setCartItems(items);
      
      // Get any saved order notes
      const notes = localStorage.getItem("orderNotes") || "";
      setOrderNotes(notes);
      
      // Calculate subtotal
      const total = items.reduce((sum, item) => {
        let price = 0;
        if (typeof item.price === "string") {
          price = Number(item.price.replace(/[^\d]/g, "")) || 0;
        } else {
          price = Number(item.price) || 0;
        }
        
        const quantity = Number(item.quantity) || 0;
        return sum + (price * quantity);
      }, 0);
      
      setSubtotal(total);
    } catch (error) {
      console.error("Error loading cart items:", error);
      setCartItems([]);
      setSubtotal(0);
      showNotification("Gagal memuat item keranjang", "error");
    }
  }, []);

  // Calculate total payment
  const calculateTotal = () => {
    return Number(subtotal) + Number(applicationFee);
  };

  // Format price for display
  const formatPrice = (price) => {
    let numericPrice = 0;
    
    if (typeof price === "string") {
      numericPrice = Number(price.replace(/[^\d]/g, "")) || 0;
    } else {
      numericPrice = Number(price) || 0;
    }
    
    return `Rp ${numericPrice.toLocaleString("id-ID")}`;
  };

  // Handle form submission and checkout
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Starting checkout process...");
      
      // Extract order IDs from cart items
      const orderIds = cartItems.map(item => {
        if (item.order?.id) return item.order.id;
        if (item.order_id) return item.order_id;
        if (item.orderId) return item.orderId;
        if (item.id) return item.id;
        return null;
      }).filter(id => id !== null);
      
      if (!orderIds.length) {
        showNotification("Tidak ada ID pesanan valid ditemukan. Silahkan coba lagi atau hubungi dukungan.", "error");
        setIsLoading(false);
        return;
      }
      
      // Prepare checkout data - match exactly what backend expects
      const checkoutData = {
        payment_method: formData.paymentMethod === "transfer" ? "BCA" : "E-Wallet_Dana",
        type: "Pembelian", // Hardcoded as per backend validation
        catatan: formData.notes || "",
        order_ids: orderIds,
      };
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/order/checkout`,
        checkoutData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      if (response.data.success) {
        // Clear checkout data
        localStorage.removeItem("checkoutItems");
        localStorage.removeItem("orderNotes");
        
        // Clear cart if all items were checked out
        const allCartItems = JSON.parse(localStorage.getItem("cart")) || [];
        if (allCartItems.length === cartItems.length) {
          localStorage.removeItem("cart");
        }
        
        // Get the transactions from response
        const { transactions, orders } = response.data.data;
        
        // Check if we have multiple transactions
        if (transactions && transactions.length > 1) {
          // Store transaction data for reference
          localStorage.setItem('pendingTransactions', JSON.stringify(
            transactions.map(tx => ({
              id: tx.id,
              transaction_unique_id: tx.transaction_unique_id,
              order_id: tx.order_id,
              status: tx.status,
              amount: tx.amount,
              payment_method: tx.payment_method
            }))
          ));
          
          showNotification("Beberapa pesanan telah dibuat. Silahkan selesaikan pembayaran untuk setiap pesanan secara terpisah.", "info", 8000);
          
          // Navigate to account transactions page for user to view all transactions
          setTimeout(() => {
            navigate('/akun');
          }, 2000);
          
        } else if (transactions && transactions.length === 1) {
          // Single transaction - navigate directly to payment page
          const transaction = transactions[0];
          showNotification("Checkout berhasil! Mengalihkan ke halaman pembayaran...", "success");
          
          setTimeout(() => {
            navigate(`/payment/${transaction.transaction_unique_id}`);
          }, 1500);
          
        } else {
          // Fallback case
          showNotification("Checkout berhasil! Mengalihkan ke halaman akun...", "success");
          
          setTimeout(() => {
            navigate("/account");
          }, 1500);
        }
      } else {
        showNotification("Checkout gagal: " + (response.data.message || "Terjadi kesalahan"), "error");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      
      let errorMessage = "Terjadi kesalahan saat checkout.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showNotification(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle order completion
  const handleCompleteOrder = () => {
    localStorage.removeItem("checkoutItems");
    localStorage.removeItem("orderNotes");
    
    const allCartItems = JSON.parse(localStorage.getItem("cart")) || [];
    if (allCartItems.length === cartItems.length) {
      localStorage.removeItem("cart");
    }
    
    navigate("/");
  };

  // Render checkout steps indicator
  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-between mb-8 px-4">
        <div className={`flex flex-col items-center ${currentStep >= 1 ? "text-[#6B4A3D]" : "text-gray-400"}`}>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full mb-2 ${currentStep >= 1 ? "bg-amber-950 text-white" : "bg-gray-200 text-gray-500"}`}
          >
            1
          </div>
          <span className="text-sm font-medium">Informasi</span>
        </div>

        <div className={`w-full max-w-[100px] h-0.5 mx-2 ${currentStep >= 2 ? "bg-[#6B4A3D]" : "bg-gray-200"}`}></div>

        <div className={`flex flex-col items-center ${currentStep >= 2 ? "text-[#6B4A3D]" : "text-gray-400"}`}>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full mb-2 ${currentStep >= 2 ? "bg-amber-950 text-white" : "bg-gray-200 text-gray-500"}`}
          >
            2
          </div>
          <span className="text-sm font-medium">Pembayaran</span>
        </div>

        <div className={`w-full max-w-[100px] h-0.5 mx-2 ${currentStep >= 3 ? "bg-amber-950" : "bg-gray-200"}`}></div>

        <div className={`flex flex-col items-center ${currentStep >= 3 ? "text-black" : "text-gray-400"}`}>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full mb-2 ${currentStep >= 3 ? "bg-amber-950 text-white" : "bg-gray-200 text-gray-500"}`}
          >
            3
          </div>
          <span className="text-sm font-medium">Konfirmasi</span>
        </div>
      </div>
    );
  };

  // Render order details
  const renderOrderDetails = () => {
    return (
      <div className="mb-8">
        <h4 className="flex items-center text-lg font-semibold mb-4 text-gray-800">
          <FaShoppingBag className="mr-2 text-black" /> Detail Pesanan
        </h4>
        <div className="max-h-[400px] overflow-y-auto pr-1">
          {cartItems.map((item) => {
            // Calculate price and total
            const itemPrice = typeof item.price === "string" 
              ? Number(item.price.replace(/[^\d]/g, "")) || 0
              : Number(item.price) || 0;
              
            const itemQuantity = Number(item.quantity) || 0;
            const itemTotal = itemPrice * itemQuantity;

            return (
              <div
                key={item.cartId || item.id || Math.random().toString(36).substring(7)}
                className="bg-white rounded-lg shadow-sm mb-3 p-4 transition-transform hover:translate-y-[-2px]"
              >
                <div className="flex flex-wrap items-center">
                  <div className="w-16 h-16 mr-4">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name || "Product"}
                      className="w-full h-full object-cover rounded-md"
                      onError={(e) => {
                        e.target.src = '/placeholder.svg?height=80&width=80';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0 mr-4">
                    <h5 className="font-semibold text-gray-800 mb-1 truncate">
                      {item.name || (item.catalog?.nama_katalog) || "Product"}
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {(item.color || item.colorName) && (
                        <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          Warna: {item.colorName || item.color}
                        </span>
                      )}
                      
                      {(item.size || item.sizeName) && (
                        <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          Ukuran: {item.sizeName || item.size}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-center px-2">
                    <div className="text-gray-600 text-sm">{formatPrice(itemPrice)}</div>
                  </div>
                  <div className="text-center px-2">
                    <div className="font-medium">x{itemQuantity}</div>
                  </div>
                  <div className="text-right ml-auto">
                    <div className="font-semibold text-black">{formatPrice(itemTotal)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {orderNotes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <h5 className="text-sm font-medium text-gray-700 mb-1">Catatan Pesanan:</h5>
            <p className="text-gray-600 text-sm">{orderNotes}</p>
          </div>
        )}
      </div>
    );
  };

  // Render confirmation screen
  const renderConfirmation = () => {
    return (
      <div className="text-center py-10 max-w-2xl mx-auto">
        <div className="mb-6 animate-pulse">
          <FaCheckCircle className="inline-block text-green-500" size={80} />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Pesanan Berhasil!</h2>
        <p className="mb-6 text-gray-600">Terima kasih atas pesanan Anda. Kami akan segera memproses pesanan Anda.</p>
        <div className="bg-gray-50 rounded-lg p-6 mb-6 shadow-sm">
          <h5 className="font-semibold mb-3 text-gray-800">Ringkasan Pesanan</h5>
          <p className="mb-2">
            <span className="font-medium">Nomor Pesanan:</span> ORD-{Date.now().toString().substring(5)}
          </p>
          <p className="mb-2">
            <span className="font-medium">Total Pembayaran:</span> {formatPrice(calculateTotal())}
          </p>
          <p>
            <span className="font-medium">Metode Pembayaran:</span>{" "}
            {formData.paymentMethod === "transfer" ? "Transfer Bank" : "E-Wallet"}
          </p>
        </div>
        <button
          onClick={handleCompleteOrder}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Lanjutkan Belanja
        </button>
      </div>
    );
  };

  if (currentStep === 3) {
    return (
      <div className="container mx-auto px-4 py-8">
        {renderConfirmation()}
        
        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={snackbar.autoHideDuration}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 font-sans text-gray-800">
      <h2 className="text-2xl font-bold text-center mb-6">Checkout</h2>
      {renderStepIndicator()}

      {/* Loading indicator */}
      {isLoading && (
        <Box sx={{ width: '100%', mb: 3 }}>
          <LinearProgress color="primary" />
        </Box>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          {currentStep === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setCurrentStep(2);
              }}
            >
              {/* Informasi Pengiriman */}
              <div className="mb-8">
                <h4 className="flex items-center text-lg font-semibold mb-4 text-gray-800">
                  <FaTruck className="mr-2 text-black" /> Informasi Pengiriman
                </h4>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fullName">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                        No. Telepon
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address">
                      Alamat Lengkap
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      rows="3"
                      value={formData.address}
                      onChange={handleChange}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
                      Catatan Tambahan (Opsional)
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows="2"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Instruksi khusus untuk pengiriman"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    ></textarea>
                  </div>
                </div>
              </div>

              {renderOrderDetails()}

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => navigate("/cart")}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <FaArrowLeft className="mr-2" /> Kembali ke Keranjang
                </button>
                <button
                  type="submit"
                  className="flex items-center px-6 py-2 bg-[#6B4A3D] text-white rounded-md hover:bg-[#8f5f4c] transition-colors"
                >
                  Lanjut ke Pembayaran <FaArrowRight className="ml-2" />
                </button>
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <form onSubmit={handleSubmit}>
              {/* Metode Pembayaran */}
              <div className="mb-8">
                <h4 className="flex items-center text-lg font-semibold mb-4 text-gray-800">
                  <FaCreditCard className="mr-2 text-black" /> Metode Pembayaran
                </h4>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="space-y-4">
                    <div
                      className={`flex p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.paymentMethod === "transfer"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onClick={() => setFormData({ ...formData, paymentMethod: "transfer" })}
                    >
                      <div className="mr-3 mt-1">
                        <input
                          type="radio"
                          id="transfer"
                          name="paymentMethod"
                          value="transfer"
                          checked={formData.paymentMethod === "transfer"}
                          onChange={handleChange}
                          className="h-4 w-4 text-black focus:ring-blue-500 border-gray-300"
                        />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-800 mb-1">Transfer Bank</h5>
                        <p className="text-sm text-gray-600">Transfer ke rekening bank kami</p>
                        {formData.paymentMethod === "transfer" && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="bankAccount">
                              Pilih Bank
                            </label>
                            <select
                              id="bankAccount"
                              name="bankAccount"
                              value={formData.bankAccount}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                              <option value="">Pilih Bank</option>
                              <option value="BCA">BCA - 2670342134 a.n. Andi Setiawan</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className={`flex p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.paymentMethod === "ewallet"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onClick={() => setFormData({ ...formData, paymentMethod: "ewallet" })}
                    >
                      <div className="mr-3 mt-1">
                        <input
                          type="radio"
                          id="ewallet"
                          name="paymentMethod"
                          value="ewallet"
                          checked={formData.paymentMethod === "ewallet"}
                          onChange={handleChange}
                          className="h-4 w-4 text-black focus:ring-blue-500 border-gray-300"
                        />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-800 mb-1">E-Wallet</h5>
                        <p className="text-sm text-gray-600">Bayar dengan e-wallet favorit Anda</p>
                        {formData.paymentMethod === "ewallet" && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ewalletType">
                              Pilih E-Wallet
                            </label>
                            <select
                              id="ewalletType"
                              name="ewalletType"
                              value={formData.ewalletType}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                              <option value="">Pilih E-Wallet</option>
                              <option value="E-Wallet_Dana">DANA (0857-4851-3790 a.n. Andi Setiawan)</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {renderOrderDetails()}

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <FaArrowLeft className="mr-2" /> Kembali
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex items-center px-6 py-2 bg-[#916351] text-white rounded-md hover:bg-[#6B4A3D] transition-colors ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Memproses..." : "Bayar Sekarang"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Ringkasan Pembayaran */}
        <div className="lg:w-1/3">
          <div className="sticky top-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Ringkasan Pembayaran</h4>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal Produk</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Biaya Aplikasi</span>
                  <span>{formatPrice(applicationFee)}</span>
                </div>
              </div>
              <div className="border-t border-gray-200 my-4"></div>
              <div className="flex justify-between font-semibold text-lg text-black">
                <span>Total Pembayaran</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>

              {cartItems.length > 0 && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-3 text-gray-800">Ringkasan Pesanan</h5>
                  <p className="text-sm text-gray-600 mb-2">{cartItems.length} item dalam pesanan</p>
                  <ul className="space-y-2">
                    {cartItems.map((item, index) => {
                      // Calculate price and total
                      const itemPrice = typeof item.price === "string" 
                        ? Number(item.price.replace(/[^\d]/g, "")) || 0
                        : Number(item.price) || 0;
                        
                      const itemQuantity = Number(item.quantity) || 0;
                      const itemTotal = itemPrice * itemQuantity;

                      return (
                        <li key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600 truncate max-w-[70%]">
                            {item.name || (item.catalog?.nama_katalog) || "Product"}
                            {(item.colorName || item.color) ? ` - ${item.colorName || item.color}` : ''}
                            {(item.sizeName || item.size) ? `, ${item.sizeName || item.size}` : ''}
                            {` x${itemQuantity}`}
                          </span>
                          <span className="font-medium">{formatPrice(itemTotal)}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.autoHideDuration}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Checkout;