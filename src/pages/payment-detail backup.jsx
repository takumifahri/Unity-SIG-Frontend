"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { FaUpload, FaCheckCircle, FaArrowLeft, FaInfoCircle } from "react-icons/fa"
import axios from "axios"
import Dropzone from "react-dropzone"

function PaymentPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [paymentProof, setPaymentProof] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  useEffect(() => {
    fetchTransactionDetails()
  }, [id])

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/order/show/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      console.log("order details response:", response.data)
      setTransaction(response.data.data)
    } catch (error) {
      console.error("Error fetching transaction details:", error)
      setError("An error occurred while fetching transaction details")
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    // Handle different price formats
    let numericPrice = 0

    if (typeof price === "string") {
      // Remove non-numeric characters if price is a string (like "Rp 150.000")
      numericPrice = Number.parseFloat(price.replace(/[^\d]/g, "")) || 0
    } else {
      numericPrice = Number.parseFloat(price) || 0
    }

    return `Rp ${numericPrice.toLocaleString("id-ID")}`
  }

  const handleDrop = (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      // Check if file is an image
      if (!file.type.match("image.*")) {
        alert("Please upload an image file")
        return
      }

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("File size should not exceed 2MB")
        return
      }

      setPaymentProof(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadProof = async (e) => {
    e.preventDefault()

    if (!paymentProof) {
      alert("Please upload payment proof first")
      return
    }

    try {
      setUploading(true)

      const formData = new FormData()
      formData.append("transaction_id", id)
      formData.append("bukti_pembayaran", paymentProof)

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/transaction/upload-payment-proof`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        },
      )

      if (response.data.success) {
        setUploadSuccess(true)
        // Refresh transaction data
        fetchTransactionDetails()
      } else {
        alert(response.data.message || "Failed to upload payment proof")
      }
    } catch (error) {
      console.error("Error uploading payment proof:", error)
      alert("An error occurred while uploading payment proof")
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6B4A3D] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading payment details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md mx-auto">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <button
          onClick={() => navigate("/orders")}
          className="mt-6 px-4 py-2 bg-[#6B4A3D] text-white rounded-md hover:bg-[#8f5f4c] transition-colors"
        >
          View My Orders
        </button>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative max-w-md mx-auto">
          <strong className="font-bold">No data!</strong>
          <span className="block sm:inline"> No transaction data found</span>
        </div>
        <button
          onClick={() => navigate("/orders")}
          className="mt-6 px-4 py-2 bg-[#6B4A3D] text-white rounded-md hover:bg-[#8f5f4c] transition-colors"
        >
          View My Orders
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Back to Orders
          </button>

          <div className="flex items-center text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
            <FaInfoCircle className="mr-2" />
            <span className="text-sm font-medium">
              {transaction.status === "Menunggu_Konfirmasi" ? "Payment Pending" : transaction.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-[#6B4A3D] text-white p-4">
            <h2 className="text-xl font-bold">Order Details</h2>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Order Information</h3>
                <p className="text-gray-600">
                  Order ID: <span className="font-medium">#{transaction.order_unique_id}</span>
                </p>
                <p className="text-gray-600">
                  Date:{" "}
                  <span className="font-medium">
                    {new Date(transaction.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </p>
                <p className="text-gray-600">
                  Status:{" "}
                  <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium mt-1">
                    {transaction.status.replace(/_/g, " ")}
                  </span>
                </p>
              </div>

              <div className="mt-4 md:mt-0 md:text-right">
                <h3 className="text-lg font-semibold mb-2">Total Payment</h3>
                <p className="text-2xl font-bold text-[#6B4A3D]">{formatPrice(transaction.total_harga)}</p>
                <p className="text-gray-600 text-sm">
                  Payment Method:{" "}
                  <span className="font-medium">
                    {transaction.transaction && transaction.transaction.payment_method
                      ? transaction.transaction.payment_method
                      : "Bank Transfer"}
                  </span>
                </p>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Payment Information</h3>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                {transaction.transaction && transaction.transaction.payment_method === "BCA" ? (
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Bank</p>
                      <p className="font-medium">BCA</p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <p className="text-sm text-gray-600">Account Number</p>
                      <div className="flex items-center">
                        <p className="font-medium mr-2">2670342134</p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText("2670342134")
                            alert("Account number copied!")
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <p className="text-sm text-gray-600">Account Name</p>
                      <p className="font-medium">Andi Setiawan</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Bank Transfer</p>
                      <p className="font-medium">BCA</p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <p className="text-sm text-gray-600">Account Number</p>
                      <div className="flex items-center">
                        <p className="font-medium mr-2">2670342134</p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText("2670342134")
                            alert("Account number copied!")
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <p className="text-sm text-gray-600">Account Name</p>
                      <p className="font-medium">Andi Setiawan</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaInfoCircle className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Please transfer the exact amount to make verification easier.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                <div className="flex items-center border-b border-gray-100 pb-4">
                  <div className="w-16 h-16 mr-4 flex-shrink-0">
                    <img
                      src={
                        transaction.catalog && transaction.catalog.gambar
                          ? transaction.catalog.gambar.startsWith("http")
                            ? transaction.catalog.gambar
                            : `${process.env.REACT_APP_API_URL}/${transaction.catalog.gambar}`
                          : "/placeholder.svg?height=80&width=80"
                      }
                      alt={transaction.catalog ? transaction.catalog.nama_katalog : "Product"}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-800">
                      {transaction.catalog ? transaction.catalog.nama_katalog : "Product"}
                    </h5>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {transaction.color && typeof transaction.color === "object" && (
                        <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          Color: {transaction.color.color_name || "N/A"}
                        </span>
                      )}
                      {transaction.size && typeof transaction.size === "object" && (
                        <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          Size: {transaction.size.size || "N/A"}
                        </span>
                      )}
                      <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        Quantity: {transaction.jumlah}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-600 text-sm">
                      {formatPrice(transaction.catalog ? transaction.catalog.price : 0)} x {transaction.jumlah}
                    </div>
                    <div className="font-medium">
                      {formatPrice((transaction.catalog ? transaction.catalog.price : 0) * transaction.jumlah)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(transaction.total_harga - 2500)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Application Fee</span>
                  <span>{formatPrice(2500)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatPrice(transaction.total_harga)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Proof Upload */}
        {transaction.bukti_pembayaran ||
        (transaction.transaction && transaction.transaction.bukti_transfer) ||
        uploadSuccess ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="text-center">
              <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Payment Proof Uploaded</h3>
              <p className="text-gray-600 mb-4">
                Your payment proof has been uploaded successfully. We will verify your payment shortly.
              </p>

              {transaction.transaction && transaction.transaction.bukti_transfer && (
                <div className="mt-4 max-w-sm mx-auto">
                  <p className="text-sm text-gray-600 mb-2">Uploaded payment proof:</p>
                  <img
                    src={`${process.env.REACT_APP_API_URL}/${transaction.transaction.bukti_transfer}`}
                    alt="Payment Proof"
                    className="rounded-lg border border-gray-200 max-h-64 mx-auto"
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="bg-[#6B4A3D] text-white p-4">
              <h2 className="text-xl font-bold">Upload Payment Proof</h2>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Please upload your payment proof to complete your order. We accept bank transfer receipts, screenshots,
                or photos of your payment.
              </p>

              <form onSubmit={handleUploadProof}>
                <div className="mb-6">
                  <Dropzone onDrop={handleDrop} accept={{ "image/*": [] }} maxSize={2097152}>
                    {({ getRootProps, getInputProps }) => (
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                          previewImage
                            ? "border-green-300 bg-green-50"
                            : "border-gray-300 hover:border-[#6B4A3D] hover:bg-gray-50"
                        }`}
                      >
                        <input {...getInputProps()} />

                        {previewImage ? (
                          <div>
                            <img
                              src={previewImage || "/placeholder.svg"}
                              alt="Payment proof preview"
                              className="max-h-64 mx-auto rounded-lg mb-4"
                            />
                            <p className="text-sm text-gray-600">Click or drag to replace the image</p>
                          </div>
                        ) : (
                          <div>
                            <FaUpload className="text-gray-400 text-3xl mx-auto mb-2" />
                            <p className="text-gray-600">Click or drag and drop to upload payment proof</p>
                            <p className="text-sm text-gray-500 mt-1">JPG, PNG (Max 2MB)</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Dropzone>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaInfoCircle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">Make sure your payment proof clearly shows:</p>
                      <ul className="list-disc pl-5 mt-1 text-sm text-yellow-700">
                        <li>Transaction date and time</li>
                        <li>Amount paid</li>
                        <li>Recipient account/number</li>
                        <li>Transaction status (successful)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!paymentProof || uploading}
                  className={`w-full py-3 bg-[#6B4A3D] text-white rounded-md hover:bg-[#8f5f4c] transition-colors flex items-center justify-center ${
                    !paymentProof || uploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FaUpload className="mr-2" /> Upload Payment Proof
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => navigate("/orders")}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            View All Orders
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage