"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Carousel, Modal, Button } from "react-bootstrap"
import { Link } from "react-router-dom"
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { usePakaian } from "../context/PakaianContext"

function Beranda() {
  const [showQuickView, setShowQuickView] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [items, setItems] = useState([])

  // Use the PakaianContext instead of direct API calls
  const { catalogList, bestSellers, loading, error, fetchCatalogs, fetchBestSellers } = usePakaian  ()

  // Map catalog data to UI format
  const mapCatalogToUIFormat = (catalog) => {
    return {
      id: catalog.id,
      title: catalog.nama_katalog,
      kategori: catalog.jenis_katalog?.nama_jenis_katalog,
      jenis_katalog_id: catalog.jenis_katalog_id,
      detail: catalog.detail,
      // Take only the first image from the array
      image: `${process.env.REACT_APP_API_URL}/${Array.isArray(catalog.gambar) && catalog.gambar.length > 0 ? catalog.gambar[0] : ""}`,
      description: catalog.deskripsi,
      path: `/category/${catalog.jenis_katalog_id}`,
      price: `Rp ${Number.parseInt(catalog.price).toLocaleString()}`,
      details: catalog.details,
      features:
        typeof catalog.feature === "object"
          ? Object.entries(catalog.feature).map(([key, value]) => `${key}: ${value}`)
          : [],
      // Extract sizes, stocks, and colors from the nested structure
      sizes: catalog.colors?.flatMap((color) => (color.sizes ? [color.sizes.size] : [])) || [],
      stocks: catalog.colors?.flatMap((color) => (color.sizes ? [color.sizes.stok] : [])) || [],
      colors: catalog.colors?.map((color) => color.color_name) || [],
      careInstructions: catalog.jenis_katalog?.tata_cara_pemakaian
        ? JSON.parse(catalog.jenis_katalog.tata_cara_pemakaian || "[]")
        : [],
    }
  }

  useEffect(() => {
    // Use context methods instead of local API calls
    fetchCatalogs()
    fetchBestSellers()
  }, [])

  useEffect(() => {
    if (catalogList.length > 0) {
      const mappedItems = catalogList.map(mapCatalogToUIFormat)
      setItems(mappedItems)
    }
  }, [catalogList])

  const handleQuickView = (category) => {
    setSelectedProduct(category)
    setShowQuickView(true)
  }

  // Map bestSeller item for display
  const mapBestSellerForDisplay = (product) => {
    return {
      id: product.id,
      title: product.nama_katalog,
      image: `${process.env.REACT_APP_API_URL}/${Array.isArray(product.gambar) && product.gambar.length > 0 ? product.gambar[0] : ""}`,
      description: product.deskripsi,
      path: `/product/${product.id}`,
      price: `Rp ${Number.parseInt(product.price).toLocaleString()}`,
      details: product.details,
      features:
        typeof product.feature === "object"
          ? Object.entries(product.feature).map(([key, value]) => `${key}: ${value}`)
          : [],
      sizes: product.colors?.flatMap((color) => (color.sizes ? [color.sizes.size] : [])) || [],
      stocks: product.colors?.flatMap((color) => (color.sizes ? [color.sizes.stok] : [])) || [],
      colors: product.colors?.map((color) => color.color_name) || [],
    }
  }

  return (
    <>
      {/* Hero Section */}
      <div className="hero-carousel">
        <Carousel
          indicators={true}
          interval={5000}
          fade={true}
          prevIcon={
            <div className="carousel-nav-btn prev">
              <FaChevronLeft />
            </div>
          }
          nextIcon={
            <div className="carousel-nav-btn next">
              <FaChevronRight />
            </div>
          }
        >
          <Carousel.Item>
            <div className="carousel-image-wrapper">
              <img
                className="d-block w-100"
                src="/beranda/jahit.jpeg"
                alt="First slide"
                style={{ objectFit: "cover", height: "500px" }}
              />
            </div>
            <Carousel.Caption className="text-end carousel-content">
              <h1 className="display-4 fw-bold">PREMIUM SERIES</h1>
              <p className="lead">#KONVEKSIKEREN</p>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <div className="carousel-image-wrapper">
              <img
                className="d-block w-100"
                src="/beranda/jahit2.jpeg"
                alt="Second slide"
                style={{ objectFit: "cover", height: "500px" }}
              />
            </div>
            <Carousel.Caption className="text-end carousel-content">
              <h1 className="display-4 fw-bold">ELEGANT COLLECTION</h1>
              <p className="lead">#KONVEKSITOP</p>
            </Carousel.Caption>
          </Carousel.Item>
        </Carousel>
      </div>

      {/* Kategori Produk */}
      <Container className="my-5">
        <h2 className="text-center mb-4">Our Collections</h2>
        {loading ? (
          <Row>
            {Array.from({ length: 8 }).map((_, index) => (
              <Col md={3} sm={6} className="mb-4" key={index}>
                <Card className="h-100">
                  <div className="skeleton-image" style={{ height: "400px", backgroundColor: "#e0e0e0" }}></div>
                  <Card.Body>
                    <div
                      className="skeleton-text"
                      style={{ height: "20px", width: "70%", backgroundColor: "#e0e0e0", margin: "10px auto" }}
                    ></div>
                    <div
                      className="skeleton-text"
                      style={{ height: "15px", width: "50%", backgroundColor: "#e0e0e0", margin: "10px auto" }}
                    ></div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <img
              src="https://thaka.bing.com/th/id/OIP.wTWyveIMu3qLvi5h96G8AAHaFj?w=241&h=181&c=7&r=0&o=5&pid=1.7"
              alt="maintenance"
            />
            <h1 className="text-2xl font-bold mb-4">Website Sedang Maintenance</h1>
            <p className="text-gray-600">Mohon maaf atas ketidaknyamanannya. Silakan coba lagi nanti.</p>
          </div>
        ) : (
          <Row>
            {items.map((category) => (
              <Col md={3} sm={6} className="mb-4" key={category.id}>
                <Card className="h-100 product-card">
                  <div className="position-relative">
                    <Card.Img
                      variant="top"
                      src={category.image}
                      className="category-image"
                      style={{ height: "400px", objectFit: "cover" }}
                    />
                    <div className="product-overlay">
                      <Link to={`/product/${category.id}`} className="btn btn-light me-2">
                        View All
                      </Link>
                      <Button variant="light" onClick={() => handleQuickView(category)}>
                        Quick View
                      </Button>
                    </div>
                  </div>
                  <Card.Body>
                    <Card.Title className="text-center">{category.title}</Card.Title>
                    <Card.Text className="text-center text-muted">{category.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* New Arrivals */}
      <Container className="my-5">
        <h2 className="text-center mb-4">New Arrivals!</h2>
        {loading ? (
          <Row>
            {Array.from({ length: 8 }).map((_, index) => (
              <Col md={3} sm={6} className="mb-4" key={index}>
                <Card className="h-100">
                  <div className="skeleton-image" style={{ height: "400px", backgroundColor: "#e0e0e0" }}></div>
                  <Card.Body>
                    <div
                      className="skeleton-text"
                      style={{ height: "20px", width: "70%", backgroundColor: "#e0e0e0", margin: "10px auto" }}
                    ></div>
                    <div
                      className="skeleton-text"
                      style={{ height: "15px", width: "50%", backgroundColor: "#e0e0e0", margin: "10px auto" }}
                    ></div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <img
              src="https://thaka.bing.com/th/id/OIP.wTWyveIMu3qLvi5h96G8AAHaFj?w=241&h=181&c=7&r=0&o=5&pid=1.7"
              alt="maintenance"
            />
            <h1 className="text-2xl font-bold mb-4">Website Sedang Maintenance</h1>
            <p className="text-gray-600">Mohon maaf atas ketidaknyamanannya. Silakan coba lagi nanti.</p>
          </div>
        ) : (
          <Row>
            {items.map((category) => (
              <Col md={3} sm={6} className="mb-4" key={category.id}>
                <Card className="h-100 product-card">
                  <div className="position-relative">
                    <Card.Img
                      variant="top"
                      src={category.image}
                      className="category-image"
                      style={{ height: "400px", objectFit: "cover" }}
                    />
                    <div className="product-overlay">
                      <Link to={`/product/${category.id}`} className="btn btn-light me-2">
                        View All
                      </Link>
                      <Button variant="light" onClick={() => handleQuickView(category)}>
                        Quick View
                      </Button>
                    </div>
                  </div>
                  <Card.Body>
                    <Card.Title className="text-center">{category.title}</Card.Title>
                    <Card.Text className="text-center text-muted">{category.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Best Seller */}
      <Container className="my-5">
        <h2 className="text-center mb-4">Best Seller!</h2>
        {loading ? (
          <Row>
            {Array.from({ length: 8 }).map((_, index) => (
              <Col md={3} sm={6} className="mb-4" key={index}>
                <Card className="h-100">
                  <div className="skeleton-image" style={{ height: "400px", backgroundColor: "#e0e0e0" }}></div>
                  <Card.Body>
                    <div
                      className="skeleton-text"
                      style={{ height: "20px", width: "70%", backgroundColor: "#e0e0e0", margin: "10px auto" }}
                    ></div>
                    <div
                      className="skeleton-text"
                      style={{ height: "15px", width: "50%", backgroundColor: "#e0e0e0", margin: "10px auto" }}
                    ></div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : bestSellers.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <img
              src="https://thaka.bing.com/th/id/OIP.wTWyveIMu3qLvi5h96G8AAHaFj?w=241&h=181&c=7&r=0&o=5&pid=1.7"
              alt="maintenance"
            />
            <h1 className="text-2xl font-bold mb-4">Website Sedang Maintenance</h1>
            <p className="text-gray-600">Mohon maaf atas ketidaknyamanannya. Silakan coba lagi nanti.</p>
          </div>
        ) : (
          <Row>
            {bestSellers.map((product) => {
              const mappedProduct = mapBestSellerForDisplay(product)
              return (
                <Col md={3} sm={6} className="mb-4" key={product.id}>
                  <Card className="h-100 product-card">
                    <div className="position-relative">
                      <Card.Img
                        variant="top"
                        src={mappedProduct.image}
                        className="category-image"
                        style={{ height: "400px", objectFit: "cover" }}
                      />
                      <div className="product-overlay">
                        <Link to={`/product/${product.id}`} className="btn btn-light me-2">
                          View All
                        </Link>
                        <Button variant="light" onClick={() => handleQuickView(mappedProduct)}>
                          Quick View
                        </Button>
                      </div>
                    </div>
                    <Card.Body>
                      <Card.Title className="text-center">{product.nama_katalog}</Card.Title>
                      <Card.Text className="text-center text-muted">{product.deskripsi}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              )
            })}
          </Row>
        )}
      </Container>

      {/* Quick View Modal */}
      <Modal show={showQuickView} onHide={() => setShowQuickView(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedProduct?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <Row>
              <Col md={6}>
                <img
                  src={selectedProduct.image || "/placeholder.svg"}
                  alt={selectedProduct.title}
                  className="img-fluid rounded mb-3"
                />
                <div className="quick-view-price text-center">
                  <h4 className="mb-0">{selectedProduct.price}</h4>
                </div>
              </Col>
              <Col md={6}>
                <div className="quick-view-details">
                  <h4 className="mb-3">{selectedProduct.title}</h4>
                  <p className="description mb-4">{selectedProduct.details}</p>

                  {selectedProduct.features?.length > 0 && (
                    <div className="features mb-4">
                      <h5 className="mb-3">Features:</h5>
                      <ul className="list-unstyled">
                        {selectedProduct.features.map((feature, index) => (
                          <li key={index} className="mb-2">
                            <i className="fas fa-check text-success me-2"></i>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedProduct.sizes?.length > 0 && (
                    <div className="sizes mb-4">
                      <h5 className="mb-3">Available Sizes:</h5>
                      <div className="d-flex flex-wrap gap-2">
                        {selectedProduct.sizes.map((size, index) => (
                          <span key={index} className="size-badge">
                            {size}{" "}
                            {selectedProduct.stocks &&
                              selectedProduct.stocks[index] &&
                              `(Stock: ${selectedProduct.stocks[index]})`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedProduct.colors?.length > 0 && (
                    <div className="colors mb-4">
                      <h5 className="mb-3">Available Colors:</h5>
                      <div className="d-flex flex-wrap gap-2">
                        {selectedProduct.colors.map((color, index) => (
                          <span key={index} className="color-badge">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="d-grid gap-2">
                    <Link to={`/product/${selectedProduct.id}`} className="btn btn-primary">
                      View Full Details
                    </Link>
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>
    </>
  )
}

export default Beranda
