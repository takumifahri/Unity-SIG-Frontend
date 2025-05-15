"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Container, Row, Col, Button, Tabs, Tab, Toast } from "react-bootstrap"
import { useCart } from "../context/CartContext"
import axios from "axios"

function ProductDetail() {
  const { productId } = useParams()
  const { updateCartCount } = useCart()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [selectedSizeId, setSelectedSizeId] = useState(null)
  const [selectedSizeName, setSelectedSizeName] = useState("")
  const [selectedColorId, setSelectedColorId] = useState(null)
  const [selectedColorName, setSelectedColorName] = useState("")
  const [showToast, setShowToast] = useState(false)
  const [selectedQuantity, setSelectedQuantity] = useState(1)

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
      } catch (error) {
        console.error("Failed to fetch product data:", error)
      }
    }

    fetchProduct()
  }, [productId])

  if (!product)
    return (
      <Container className="my-5">
        <Row>
          <Col md={6}>
            <div className="placeholder-glow">
              <div className="placeholder" style={{ width: "100%", height: "300px", backgroundColor: "#e0e0e0" }}></div>
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

  const handleAddToCart = () => {
    try {
      // Create cart item object
      const cartItem = {
        id: product.id,
        cartId: `${product.id}-${Date.now()}`,
        name: product.nama_katalog,
        price: product.price,
        image: `${process.env.REACT_APP_API_URL}/${product.gambar}`,
        size: selectedSizeName,
        sizeId: selectedSizeId,
        color: selectedColorName,
        colorId: selectedColorId,
        quantity: selectedQuantity,
      }

      // Get current cart from localStorage
      const currentCart = JSON.parse(localStorage.getItem("cart")) || []

      // Add new item to cart
      const newCart = [...currentCart, cartItem]

      // Save updated cart to localStorage
      localStorage.setItem("cart", JSON.stringify(newCart))

      // Update cart count
      updateCartCount()

      // Show success toast
      setShowToast(true)
    } catch (error) {
      console.error("Error adding to cart:", error)
      alert("Failed to add product to cart")
    }
  }

  const addToCart = async () => {
    try {
      // Validate that size and color are selected
      if (!selectedSizeId || !selectedColorId) {
        alert("Please select both size and color")
        return
      }

      // Create cart item object for localStorage (if needed)
      const cartItem = {
        id: product.id,
        name: product.nama_katalog,
        price: product.price,
        image: `${process.env.REACT_APP_API_URL}/${product.gambar}`,
        size: selectedSizeName,
        sizeId: selectedSizeId,
        color: selectedColorName,
        colorId: selectedColorId,
        quantity: selectedQuantity > 0 ? selectedQuantity : 1, // Default to 1 if quantity is 0
      }

      // Check if user is logged in
      const isLoggedIn = localStorage.getItem("token") // Assuming token is stored in localStorage

      if (isLoggedIn) {
        // Create payload with IDs as expected by the API
        const payload = {
          catalog_id: product.id,
          jumlah: selectedQuantity,
          size: selectedSizeId,
          color: selectedColorId,
        }

        // Log the payload for debugging
        console.log("Sending to API:", payload)

        // Post cart item to backend
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/order/additem`, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${isLoggedIn}`,
          },
        })

        if (response.status === 201) {
          // Update cart count
          updateCartCount()

          // Show success toast
          setShowToast(true)
        } else {
          alert(response.data.message || "Failed to add product to cart")
        }
      } else {
        // User is not logged in, save to localStorage
        const currentCart = JSON.parse(localStorage.getItem("cart")) || []

        // Check if the product already exists in the cart
        const existingItemIndex = currentCart.findIndex(
          (item) => item.id === cartItem.id && item.sizeId === cartItem.sizeId && item.colorId === cartItem.colorId,
        )

        if (existingItemIndex !== -1) {
          // Update quantity if the item already exists
          currentCart[existingItemIndex].quantity += cartItem.quantity
        } else {
          // Add new item to cart
          currentCart.push(cartItem)
        }

        // Save updated cart to localStorage
        localStorage.setItem("cart", JSON.stringify(currentCart))

        // Update cart count
        updateCartCount()

        // Show success toast
        setShowToast(true)
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      alert(error.response?.data?.message || "Failed to add product to cart")
    }
  }

  // Function to get the size for a selected color
  const getSizeForColor = (colorId) => {
    const colorObj = product.colors.find((color) => color.id === colorId)
    return colorObj ? colorObj.sizes : null
  }

  return (
    <Container className="my-5 position-relative">
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        delay={1500}
        autohide
        className="position-fixed top-0 end-0 m-4"
        style={{ zIndex: 1000 }}
      >
        <Toast.Header>
          <strong className="me-auto">Success!</strong>
        </Toast.Header>
        <Toast.Body>
          {product.nama_katalog} ({selectedSizeName}, {selectedColorName}) added to cart!
        </Toast.Body>
      </Toast>

      <Row>
        <Col md={6}>
          <img
            src={`${process.env.REACT_APP_API_URL}/${product.gambar}`}
            alt={product.nama_katalog}
            className="img-fluid mb-3"
            style={{ width: "100%", height: "auto", maxHeight: "500px", objectFit: "cover" }}
          />
        </Col>
        <Col md={6}>
          <small className="text-muted">{product.koleksi}</small>
          <h2>{product.nama_katalog}</h2>
          <h4 className="text-muted mb-4">Rp {product.price}</h4>

          <div className="mb-4">
            <h5>Color</h5>
            <div className="d-flex gap-2">
              {product.colors.map((color) => (
                <Button
                  key={color.id}
                  variant={selectedColorId === color.id ? "dark" : "outline-dark"}
                  className="color-btn"
                  onClick={() => {
                    setSelectedColorId(color.id)
                    setSelectedColorName(color.color_name)
                    // Reset size when color changes
                    setSelectedSizeId(null)
                    setSelectedSizeName("")
                  }}
                >
                  {color.color_name}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h5>Size</h5>
            <div className="d-flex gap-2">
              {selectedColorId ? (
                (() => {
                  const sizeObj = getSizeForColor(selectedColorId)
                  if (sizeObj) {
                    return (
                      <Button
                        key={sizeObj.id}
                        variant={selectedSizeId === sizeObj.id ? "dark" : "outline-dark"}
                        className="size-btn"
                        onClick={() => {
                          setSelectedSizeId(sizeObj.id)
                          setSelectedSizeName(sizeObj.size)
                        }}
                      >
                        {sizeObj.size} ({sizeObj.stok} in stock)
                      </Button>
                    )
                  } else {
                    return <p className="text-muted">No sizes available for this color</p>
                  }
                })()
              ) : (
                <p className="text-muted">Please select a color first</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <h5>Quantity</h5>
            <div className="d-flex align-items-center">
              <Button variant="outline-dark" onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}>
                -
              </Button>
              <span className="mx-3">{selectedQuantity}</span>
              <Button variant="outline-dark" onClick={() => setSelectedQuantity(selectedQuantity + 1)}>
                +
              </Button>
            </div>
          </div>

          <Button
            variant="dark"
            size="lg"
            className="w-100 mb-3"
            onClick={addToCart}
            disabled={!selectedSizeId || !selectedColorId || selectedQuantity < 1}
          >
            Tambah ke Keranjang
          </Button>

          <Tabs defaultActiveKey="details" className="mb-3">
            <Tab eventKey="details" title="Details">
              <p>{product.details}</p>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  )
}

export default ProductDetail
