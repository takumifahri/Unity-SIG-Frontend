import axios from "axios"
import { useEffect, useState, useRef, useCallback } from "react"
import { Link } from "react-router-dom"
import Pagination from "@mui/material/Pagination"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import SearchIcon from "@mui/icons-material/Search"

export default function Catalog() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSort, setSelectedSort] = useState("default")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeImages, setActiveImages] = useState({})
  const intervalRef = useRef(null)
  
  // Store parsed images to avoid reprocessing
  const imagesCache = useRef({})

  const fetchProducts = async (search = "") => {
    try {
      setLoading(true)
      const endpoint = search 
        ? `${process.env.REACT_APP_API_URL}/api/catalog?search=${encodeURIComponent(search)}`
        : `${process.env.REACT_APP_API_URL}/api/catalog`
        
      const response = await axios.get(endpoint, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      setProducts(response.data.data)
      
      // Initialize active images
      const newActiveImages = {}
      response.data.data.forEach(product => {
        newActiveImages[product.id] = 0
      })
      setActiveImages(newActiveImages)
      
      // Clear image cache when products change
      imagesCache.current = {}
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Parse product images, handling both string JSON and direct paths
  const getProductImages = useCallback((product) => {
    // Return from cache if available
    if (imagesCache.current[product.id]) {
      return imagesCache.current[product.id]
    }
    
    let images = []
    
    try {
      if (typeof product.gambar === 'string') {
        // Try to parse as JSON
        try {
          const parsedImages = JSON.parse(product.gambar)
          images = Array.isArray(parsedImages) ? parsedImages : [parsedImages]
        } catch (e) {
          // Not JSON, treat as single image path
          images = [product.gambar]
        }
      } else if (Array.isArray(product.gambar)) {
        images = product.gambar
      } else if (product.gambar) {
        images = [product.gambar]
      }
    } catch (error) {
      console.error("Error processing images:", error)
      images = [product.gambar] // Fallback to original
    }
    
    // Cache the result
    imagesCache.current[product.id] = images
    return images
  }, [])

  // Start image rotation
  const startImageRotation = useCallback(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    intervalRef.current = setInterval(() => {
      setActiveImages(prev => {
        const updated = { ...prev }
        
        // Update images for each product
        products.forEach(product => {
          const images = getProductImages(product)
          if (images.length > 1) {
            const current = updated[product.id] || 0
            updated[product.id] = (current + 1) % images.length
          }
        })
        
        return updated
      })
    }, 3000) // Rotate every 3 seconds (changed from 5 seconds for a more dynamic experience)
  }, [products, getProductImages])

  // Handle visibility change to pause rotation when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      } else if (!document.hidden && !intervalRef.current) {
        startImageRotation()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [startImageRotation])

  useEffect(() => {
    fetchProducts()
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (products.length > 0) {
      startImageRotation()
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [products, startImageRotation])

  const itemsPerPage = 5 // Changed from 8 to 5 as requested
  const totalPages = Math.ceil(products.length / itemsPerPage)

  const handlePageChange = (event, page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Get products for current page
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem)

  const handleSortChange = (e) => {
    const sortValue = e.target.value
    setSelectedSort(sortValue)

    if (sortValue === "termurah") {
      setProducts((prevProducts) => [...prevProducts].sort((a, b) => a.price - b.price))
    } else if (sortValue === "termahal") {
      setProducts((prevProducts) => [...prevProducts].sort((a, b) => b.price - a.price))
    } else {
      fetchProducts(searchTerm) // Reset sorting
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchProducts(searchTerm)
    setCurrentPage(1) // Reset to first page on search
  }

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const clearSearch = () => {
    setSearchTerm("")
    fetchProducts("")
  }

  // Skeleton loader for products - updated to show 5 items
  const renderSkeletons = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="bg-white overflow-hidden rounded shadow">
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
      {/* Heading and Filters */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Pakaian</h1>
        
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="w-full md:w-2/3">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                className="w-full border border-gray-300 rounded-md py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                <SearchIcon />
              </button>
            </div>
          </form>
          
          {/* Sort Dropdown */}
          <div className="w-full md:w-1/3">
            <div className="relative">
              <select
                value={selectedSort}
                onChange={handleSortChange}
                className="w-full appearance-none bg-white border border-gray-300 rounded-md py-2 pl-4 pr-10 text-sm focus:outline-none"
              >
                <option value="default">Urutkan</option>
                <option value="termurah">Termurah</option>
                <option value="termahal">Termahal</option>
              </select>
              <KeyboardArrowDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>
        
        {/* Active search term indicator */}
        {searchTerm && (
          <div className="flex items-center mb-4">
            <span className="text-sm text-gray-600 mr-2">
              Hasil pencarian untuk: <span className="font-medium">{searchTerm}</span>
            </span>
            <button 
              onClick={clearSearch}
              className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{renderSkeletons()}</div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentProducts.map((product) => {
            const images = getProductImages(product)
            const activeImageIndex = activeImages[product.id] || 0
            
            return (
              <Link
                to={`/product/${product.id}`}
                key={product.id}
                className="group no-underline text-black hover:shadow-md transition-shadow duration-300 rounded overflow-hidden"
              >
                <div className="overflow-hidden relative">
                  <div className="w-full h-[300px] relative">
                    {images.map((img, index) => (
                      <img
                        key={index}
                        src={`${process.env.REACT_APP_API_URL}/${img}`}
                        alt={`${product.nama_katalog} - gambar ${index + 1}`}
                        className="w-full h-full object-cover absolute top-0 left-0 transition-all duration-1000 group-hover:scale-105"
                        style={{ 
                          opacity: index === activeImageIndex ? 1 : 0,
                          zIndex: index === activeImageIndex ? 1 : 0,
                          transition: "opacity 0.8s ease-in-out" // Smoother transition
                        }}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/300x400?text=Image+Not+Found"
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Enhanced image indicators for multiple images */}
                  {images.length > 1 && (
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center z-10">
                      {images.map((_, idx) => (
                        <span 
                          key={idx}
                          className={`w-2 h-2 rounded-full mx-1 ${
                            idx === activeImageIndex ? 'bg-white' : 'bg-white/50'
                          } transition-all duration-300`}
                          style={{ 
                            transform: idx === activeImageIndex ? 'scale(1.2)' : 'scale(1)',
                            boxShadow: '0 0 3px rgba(0,0,0,0.3)' 
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h2 className="font-medium text-lg mt-2 line-clamp-2">{product.nama_katalog}</h2>
                  <p className="text-gray-800 font-medium mt-1">Rp{product.price.toLocaleString("id-ID")}</p>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <img
            src="https://cdn-icons-png.flaticon.com/512/7486/7486747.png"
            alt="no products"
            className="w-32 h-32 mb-4"
          />
          <h1 className="text-2xl font-bold mb-4">
            {searchTerm ? "Tidak ada hasil pencarian" : "Produk Belum Tersedia"}
          </h1>
          <p className="text-gray-600">
            {searchTerm 
              ? `Tidak ada produk yang cocok dengan "${searchTerm}"`
              : "Produk masih kosong, mohon tunggu sebentar ya."
            }
          </p>
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
            >
              Reset Pencarian
            </button>
          )}
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

      {/* Display showing x to y of z products */}
      {products.length > 0 && (
        <div className="text-center text-sm text-gray-600 mt-4">
          Menampilkan {indexOfFirstItem + 1} sampai {Math.min(indexOfLastItem, products.length)} dari {products.length} produk
        </div>
      )}
    </main>
  )
}