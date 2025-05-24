import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Container, Row, Col, Button, Tabs, Tab, Badge } from "react-bootstrap"
import { useCart } from "../context/CartContext"
import axios from "axios"
// Import MUI components for better notifications
import { Snackbar, Alert } from "@mui/material"

function ProductDetail() {
  const { productId } = useParams()
  const { updateCartCount } = useCart()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  
  // Changed from single color selection to multiple color selections
  const [selectedColors, setSelectedColors] = useState([])
  const [currentColorId, setCurrentColorId] = useState(null)
  const [currentColorName, setCurrentColorName] = useState("")
  
  const detailsTabRef = useRef(null)
  
  // Replace Toast with MUI Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
    autoHideDuration: 3000
  })
  
  // State untuk galeri gambar
  const [images, setImages] = useState([])
  const [mainImage, setMainImage] = useState("")
  const [activeTab, setActiveTab] = useState("details")
  
  // Multiple sizes selection - now grouped by color
  const [selectedSizes, setSelectedSizes] = useState([])
  const [cartItems, setCartItems] = useState([])
  
  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/catalog/show/${productId}`, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        console.log("Product data:", response.data.data)
        setProduct(response.data.data)
        
        // Proses gambar-gambar dari API
        const productImages = response.data.data.gambar || []
        
        // Set images dan mainImage
        setImages(productImages)
        if (productImages.length > 0) {
          setMainImage(productImages[0])
        }
        
      } catch (error) {
        console.error("Failed to fetch product data:", error)
        showSnackbar("Gagal memuat data produk", "error")
      }
    }

    fetchProduct()
  }, [productId])

  // Handle snackbar
  const showSnackbar = (message, severity = "success", duration = 3000) => {
    setSnackbar({
      open: true,
      message,
      severity,
      autoHideDuration: duration
    })
  }
  
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  if (!product)
    return (
      <Container className="my-5">
        <Row>
          <Col md={6}>
            <div className="placeholder-glow">
              <div className="placeholder" style={{ width: "100%", height: "300px", backgroundColor: "#e0e0e0" }}></div>
              <div className="d-flex gap-2 mt-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="placeholder" style={{ width: "80px", height: "60px", backgroundColor: "#e0e0e0" }}></div>
                ))}
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div className="placeholder-glow">
              <h2 className="placeholder" style={{ width: "50%", height: "2rem", backgroundColor: "#e0e0e0" }}></h2>
              <h4
                className="placeholder mt-3"
                style={{ width: "30%", height: "1.5rem", backgroundColor: "#e0e0e0" }}
              ></h4>
              <div className="mt-4">
                <h5 className="placeholder" style={{ width: "20%", height: "1rem", backgroundColor: "#e0e0e0" }}></h5>
                <div className="d-flex gap-2 mt-2">
                  <div
                    className="placeholder"
                    style={{ width: "50px", height: "30px", backgroundColor: "#e0e0e0" }}
                  ></div>
                  <div
                    className="placeholder"
                    style={{ width: "50px", height: "30px", backgroundColor: "#e0e0e0" }}
                  ></div>
                </div>
              </div>
              <div className="mt-4">
                <h5 className="placeholder" style={{ width: "20%", height: "1rem", backgroundColor: "#e0e0e0" }}></h5>
                <div className="d-flex gap-2 mt-2">
                  <div
                    className="placeholder"
                    style={{ width: "50px", height: "30px", backgroundColor: "#e0e0e0" }}
                  ></div>
                  <div
                    className="placeholder"
                    style={{ width: "50px", height: "30px", backgroundColor: "#e0e0e0" }}
                  ></div>
                </div>
              </div>
              <div className="mt-4">
                <div
                  className="placeholder"
                  style={{ width: "100%", height: "40px", backgroundColor: "#e0e0e0" }}
                ></div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    )

  // Function to handle change main image
  const handleImageClick = (image) => {
    setMainImage(image)
  }

  // Function to handle color selection
  const handleSelectColor = (colorId, colorName) => {
    // Check if color is already in the selected colors
    const colorIndex = selectedColors.findIndex(color => color.id === colorId)
    
    // Set as current color regardless if it's selected or not
    setCurrentColorId(colorId)
    setCurrentColorName(colorName)
    
    // If not already selected, add to selectedColors
    if (colorIndex === -1) {
      setSelectedColors([...selectedColors, { id: colorId, name: colorName }])
    }
  }

  // Function to toggle size selection
  const toggleSize = (size) => {
    // Ensure we have a current color
    if (!currentColorId) {
      showSnackbar("Silahkan pilih warna terlebih dahulu", "warning")
      return
    }
    
    // Create a unique ID for color-size combination
    const sizeItemId = `${currentColorId}-${size.id}`
    
    // Check if this combo is already selected
    const existingItemIndex = cartItems.findIndex(item => 
      item.colorId === currentColorId && item.sizeId === size.id)
    
    if (existingItemIndex >= 0) {
      // Remove the size from cart items
      setCartItems(cartItems.filter((item, idx) => idx !== existingItemIndex))
      
      // Remove from selected sizes
      setSelectedSizes(selectedSizes.filter(s => 
        !(s.colorId === currentColorId && s.id === size.id)))
    } else {
      // Find color name
      const colorName = product.colors.find(c => c.id === currentColorId)?.color_name || currentColorName
      
      // Add new size to cart with quantity 1
      const newItem = {
        id: product.id,
        name: product.nama_katalog,
        price: product.price,
        image: `${process.env.REACT_APP_API_URL}/${images[0]}`,
        sizeId: size.id,
        sizeName: size.size,
        colorId: currentColorId,
        colorName: colorName,
        quantity: 1,
        maxStock: size.stok // Track available stock
      }
      
      setCartItems([...cartItems, newItem])
      
      // Add to selected sizes with color information
      const sizeWithColor = { ...size, colorId: currentColorId }
      setSelectedSizes([...selectedSizes, sizeWithColor])
    }
  }

  // Function to update quantity for a specific size and color combination
  const updateQuantity = (colorId, sizeId, change) => {
    setCartItems(cartItems.map(item => {
      if (item.colorId === colorId && item.sizeId === sizeId) {
        // Get the available stock for this size
        const colorObj = product.colors.find(c => c.id === colorId)
        const sizeObj = colorObj?.sizes?.find(s => s.id === sizeId)
        const maxStock = sizeObj?.stok || 1
        
        // Calculate new quantity within stock limits
        const newQuantity = Math.min(maxStock, Math.max(1, item.quantity + change))
        
        // Show warning if trying to exceed stock
        if (item.quantity + change > maxStock && change > 0) {
          showSnackbar(`Stok hanya tersedia ${maxStock} untuk ukuran ini`, "warning")
        }
        
        return { ...item, quantity: newQuantity }
      }
      return item
    }))
  }

  // Function to add all items to cart
  const addToCart = async () => {
    try {
      // Validate that we have at least one item
      if (cartItems.length === 0) {
        showSnackbar("Silakan pilih warna dan ukuran terlebih dahulu", "warning")
        return
      }

      // Check if user is logged in
      const token = localStorage.getItem("token")

      if (token) {
        // For logged-in users, send to API
        for (const item of cartItems) {
          // Create payload for each item
          const payload = {
            catalog_id: product.id,
            jumlah: item.quantity,
            size: item.sizeId,
            color: item.colorId,
          }

          // Post each cart item to backend
          await axios.post(`${process.env.REACT_APP_API_URL}/api/order/additem`, payload, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
        }

        // Update cart count
        updateCartCount()
        
        // Show success notification
        showSnackbar(`${cartItems.length} item berhasil ditambahkan ke keranjang`, "success")
      } else {
        // For anonymous users, save to localStorage
        const currentCart = JSON.parse(localStorage.getItem("cart")) || []

        // Add each item to localStorage
        let updatedCart = [...currentCart]
        
        cartItems.forEach(cartItem => {
          // Check if this exact item already exists
          const existingItemIndex = updatedCart.findIndex(
            (item) => item.id === cartItem.id && 
                     item.sizeId === cartItem.sizeId && 
                     item.colorId === cartItem.colorId
          )

          if (existingItemIndex !== -1) {
            // Update quantity if item exists, respecting stock limits
            const newQuantity = updatedCart[existingItemIndex].quantity + cartItem.quantity
            const maxStock = cartItem.maxStock
            
            if (newQuantity > maxStock) {
              showSnackbar(`Jumlah melebihi stok tersedia. Menyesuaikan ke ${maxStock}`, "warning")
              updatedCart[existingItemIndex].quantity = maxStock
            } else {
              updatedCart[existingItemIndex].quantity = newQuantity
            }
          } else {
            // Add new item
            updatedCart.push(cartItem)
          }
        })

        // Save updated cart to localStorage
        localStorage.setItem("cart", JSON.stringify(updatedCart))
        
        // Update cart count
        updateCartCount()
        
        // Show success notification
        showSnackbar(`${cartItems.length} item berhasil ditambahkan ke keranjang`, "success")
      }

      // Reset selected sizes and cart items
      setCartItems([])
      setSelectedSizes([])
      setSelectedColors([])
      setCurrentColorId(null)
      setCurrentColorName("")
    } catch (error) {
      console.error("Error adding to cart:", error)
      showSnackbar(error.response?.data?.message || "Gagal menambahkan produk ke keranjang", "error")
    }
  }

  // Function to get the sizes for a selected color
  const getSizesForColor = (colorId) => {
    const colorObj = product.colors.find((color) => color.id === colorId)
    return colorObj ? colorObj.sizes : []
  }

  // Check if a size is selected for current color
  const isSizeSelected = (colorId, sizeId) => {
    return selectedSizes.some(size => size.colorId === colorId && size.id === sizeId)
  }

  // Get quantity for a specific color-size combination
  const getQuantityForSize = (colorId, sizeId) => {
    const item = cartItems.find(item => item.colorId === colorId && item.sizeId === sizeId)
    return item ? item.quantity : 0
  }

  // Get remaining stock for a size after considering our cart quantity
  const getRemainingStock = (colorId, sizeId) => {
    const colorObj = product.colors.find(c => c.id === colorId)
    const sizeObj = colorObj?.sizes?.find(s => s.id === sizeId)
    const maxStock = sizeObj?.stok || 0
    
    const item = cartItems.find(item => item.colorId === colorId && item.sizeId === sizeId)
    const currentQty = item ? item.quantity : 0
    
    return maxStock - currentQty
  }

  // Check if a color is selected
  const isColorSelected = (colorId) => {
    return selectedColors.some(color => color.id === colorId)
  }

  // Count total items selected
  const getTotalSelectedItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  // Get number of items for a color
  const getItemsForColor = (colorId) => {
    return cartItems.filter(item => item.colorId === colorId)
  }

  // Remove a color and all its associated items
  const removeColor = (colorId) => {
    setSelectedColors(selectedColors.filter(color => color.id !== colorId))
    setCartItems(cartItems.filter(item => item.colorId !== colorId))
    setSelectedSizes(selectedSizes.filter(size => size.colorId !== colorId))
    
    // If we're removing current color, set to null
    if (currentColorId === colorId) {
      setCurrentColorId(null)
      setCurrentColorName("")
    }
  }

  return (
    <Container className="my-5 position-relative">
      {/* MUI Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.autoHideDuration}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Row>
        <Col md={6}>
          {/* Main Image */}
          <div className="main-image-container mb-3">
            <img
              src={`${process.env.REACT_APP_API_URL}/${mainImage}`}
              alt={product.nama_katalog}
              className="img-fluid"
              style={{ 
                width: "100%", 
                height: "450px", 
                objectFit: "contain",
                border: "1px solid #dee2e6",
                borderRadius: "8px"
              }}
              onError={(e) => {
                e.target.src = '/placeholder.svg'; // Fallback image
              }}
            />
          </div>
          
          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="thumbnail-gallery d-flex flex-wrap gap-2 justify-content-start">
              {images.map((image, index) => (
                <div 
                  key={index} 
                  onClick={() => handleImageClick(image)}
                  style={{ 
                    width: "80px", 
                    height: "80px", 
                    cursor: "pointer",
                    border: mainImage === image ? "2px solid #000" : "1px solid #dee2e6",
                    borderRadius: "4px",
                    overflow: "hidden"
                  }}
                >
                  <img
                    src={`${process.env.REACT_APP_API_URL}/${image}`}
                    alt={`Thumbnail ${index + 1}`}
                    style={{ 
                      width: "100%", 
                      height: "100%", 
                      objectFit: "cover"
                    }}
                    onError={(e) => {
                      e.target.src = '/placeholder.svg'; // Fallback image
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </Col>
        
        <Col md={6}>
          <small className="text-muted">{product.koleksi}</small>
          <h2>{product.nama_katalog}</h2>
          <h4 className="text-muted mb-4">Rp {new Intl.NumberFormat('id-ID').format(product.price)}</h4>

          <div className="mb-4">
            <h5>Warna <small className="text-muted">(Bisa pilih lebih dari satu)</small></h5>
            <div className="d-flex flex-wrap gap-2">
              {product.colors.map((color) => (
                <Button
                  key={color.id}
                  variant={isColorSelected(color.id) ? "dark" : "outline-dark"}
                  className="color-btn"
                  onClick={() => handleSelectColor(color.id, color.color_name)}
                >
                  {color.color_name} {getItemsForColor(color.id).length > 0 && 
                    <Badge bg="light" text="dark" pill>{getItemsForColor(color.id).length}</Badge>
                  }
                </Button>
              ))}
            </div>
          </div>

          {/* Size selection for current color */}
          {currentColorId && (
            <div className="mb-4">
              <h5>
                Ukuran untuk: {currentColorName}
              </h5>
              <Row className="w-100">
                {getSizesForColor(currentColorId).map((size) => (
                  <Col xs={6} md={4} key={size.id} className="mb-2">
                    <Button
                      variant={isSizeSelected(currentColorId, size.id) ? "dark" : "outline-dark"}
                      className="size-btn w-100"
                      onClick={() => toggleSize(size)}
                      disabled={size.stok <= 0}
                    >
                      {size.size} {size.stok > 0 ? `(${size.stok})` : "(Habis)"}
                    </Button>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {/* Show all selected colors and sizes */}
          {selectedColors.length > 0 && (
            <div className="selected-items mb-4">
              <h5>Item yang dipilih:</h5>
              {selectedColors.map(color => {
                const itemsForThisColor = cartItems.filter(item => item.colorId === color.id)
                
                if (itemsForThisColor.length === 0) return null
                
                return (
                  <div key={color.id} className="mb-3 border p-3 rounded">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0">{color.name}</h6>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => removeColor(color.id)}
                      >
                        Hapus
                      </Button>
                    </div>
                    
                    <ul className="list-group">
                      {itemsForThisColor.map(item => {
                        // Find the size object to access stock information
                        const colorObj = product.colors.find(c => c.id === color.id)
                        const sizeObj = colorObj?.sizes?.find(s => s.id === item.sizeId)
                        const maxStock = sizeObj?.stok || 0
                        
                        return (
                          <li key={`${item.colorId}-${item.sizeId}`} 
                              className="list-group-item d-flex justify-content-between align-items-center">
                            <span>
                              {item.sizeName}
                            </span>
                            <div className="d-flex align-items-center">
                              <Button 
                                variant="outline-dark" 
                                size="sm"
                                onClick={() => updateQuantity(item.colorId, item.sizeId, -1)}
                                className="px-2 py-0"
                                disabled={item.quantity <= 1}
                              >
                                -
                              </Button>
                              <span className="mx-2">{item.quantity}</span>
                              <Button 
                                variant="outline-dark" 
                                size="sm"
                                onClick={() => updateQuantity(item.colorId, item.sizeId, 1)}
                                className="px-2 py-0"
                                disabled={item.quantity >= maxStock}
                              >
                                +
                              </Button>
                              <small className="ms-2 text-muted">(Stok: {maxStock})</small>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}

          {/* If no colors selected yet */}
          {selectedColors.length === 0 && (
            <div className="alert alert-info">
              Silakan pilih warna terlebih dahulu
            </div>
          )}

          <Button
            variant="dark"
            size="lg"
            className="w-100 mb-3"
            onClick={addToCart}
            disabled={cartItems.length === 0}
          >
            Tambah ke Keranjang {cartItems.length > 0 && (
              <Badge bg="light" text="dark" pill>
                {getTotalSelectedItems()} item
              </Badge>
            )}
          </Button>

          <Tabs 
            defaultActiveKey="details" 
            className="mb-3"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            id="product-details-tabs"
          >
            <Tab eventKey="specs" title="Specifications">
              <div className="specs-table my-3">
                <div className="row border-bottom py-2">
                  <div className="col-4 fw-bold">Material</div>
                  <div className="col-8">{product.bahan || 'N/A'}</div>
                </div>
                {product.stok && (
                  <div className="row border-bottom py-2">
                    <div className="col-4 fw-bold">Stock</div>
                    <div className="col-8">{product.stok} pcs</div>
                  </div>
                )}
                {product.details && (
                  <div className="row border-bottom py-2">
                    <div className="col-4 fw-bold">More Info</div>
                    <div className="col-8">
                      <p style={{ 
                        maxHeight: "100px", 
                        overflow: "hidden", 
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical"
                      }}>
                        {product.details}
                      </p>
                      <Button 
                        variant="link" 
                        className="p-0"
                        onClick={() => setActiveTab("details")}
                      >
                        Read more
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Tab>
            <Tab eventKey="details" title="Details" ref={detailsTabRef}>
              <p>{product.details || product.deskripsi}</p>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  )
}

export default ProductDetail