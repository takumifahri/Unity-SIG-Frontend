"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Pagination from "@mui/material/Pagination"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"

export default function Catalog() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSort, setSelectedSort] = useState("default")
  const [currentPage, setCurrentPage] = useState(1)

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/catalog`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      setProducts(response.data.data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const itemsPerPage = 8 // Changed to 8 to match the 4x2 grid in the design
  const totalPages = Math.ceil(products.length / itemsPerPage)

  const handlePageChange = (event, page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Get products to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem)

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleSortChange = (e) => {
    const sortValue = e.target.value
    setSelectedSort(sortValue)

    if (sortValue === "termurah") {
      setProducts((prevProducts) => [...prevProducts].sort((a, b) => a.price - b.price))
    } else if (sortValue === "termahal") {
      setProducts((prevProducts) => [...prevProducts].sort((a, b) => b.price - a.price))
    } else {
      fetchProducts() // Re-fetch products to reset sorting
    }
  }

  // Skeleton loader for products
  const renderSkeletons = () => {
    return Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="bg-white overflow-hidden">
        <div className="h-[300px] bg-gray-200 animate-pulse"></div>
        <div className="p-3">
          <div className="h-5 w-[70%] bg-gray-200 animate-pulse my-2"></div>
          <div className="h-4 w-[50%] bg-gray-200 animate-pulse my-2"></div>
        </div>
      </div>
    ))
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <img
          src="https://cdn-icons-png.flaticon.com/512/7486/7486747.png"
          alt="maintenance"
          className="w-32 h-32 mb-4"
        />
        <h1 className="text-2xl font-bold mb-4">Website Sedang Maintenance</h1>
        <p className="text-gray-600">Mohon maaf atas ketidaknyamanannya. Silakan coba lagi nanti.</p>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Heading and Sort */}
      <div className="flex flex-col items-center mb-8 relative">
        <h1 className="text-3xl font-bold mb-6">Pakaian</h1>

        <div className="absolute right-0 top-0">
          <div className="relative">
            <select
              value={selectedSort}
              onChange={handleSortChange}
              className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-4 pr-10 text-sm focus:outline-none"
            >
              <option value="default">Urutkan</option>
              <option value="termurah">Termurah</option>
              <option value="termahal">Termahal</option>
            </select>
            <KeyboardArrowDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{renderSkeletons()}</div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentProducts.map((product) => (
            <Link
              to={`/product/${product.id}`}
              key={product.id}
              className="no-underline text-black hover:shadow-md transition-shadow duration-300"
            >
              <div className="overflow-hidden">
                <img
                  src={`${process.env.REACT_APP_API_URL}/${product.gambar}`}
                  alt={product.nama_katalog}
                  className="w-full h-[300px] object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="p-3">
                  <h2 className="font-medium text-lg mt-2">{product.nama_katalog}</h2>
                  <p className="text-gray-800 font-medium mt-1">Rp{product.price.toLocaleString("id-ID")}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <img
            src="https://cdn-icons-png.flaticon.com/512/7486/7486747.png"
            alt="maintenance"
            className="w-32 h-32 mb-4"
          />
          <h1 className="text-2xl font-bold mb-4">Produk Belum Tersedia</h1>
          <p className="text-gray-600">Produk masih kosong, mohon tunggu sebentar ya.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12 mb-4">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            siblingCount={1}
            boundaryCount={1}
            renderItem={(item) => (
              <div
                className={`mx-1 ${
                  item.selected ? "border-b-2 border-black font-bold" : "text-gray-500 hover:text-black"
                }`}
              >
                {item.page}
              </div>
            )}
            sx={{
              "& .MuiPaginationItem-root": {
                borderRadius: 0,
                margin: "0 4px",
              },
              "& .Mui-selected": {
                backgroundColor: "transparent",
                color: "black",
              },
            }}
          />
        </div>
      )}
    </main>
  )
}
