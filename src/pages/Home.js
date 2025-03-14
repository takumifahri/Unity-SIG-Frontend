import React, { useState } from 'react';
import { Container, Row, Col, Card, Carousel, Modal, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

function Beranda() {
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Data kategori produk
  const categories = [
    {
      id: 1,
      title: "MALAYA DRESS",
      image: "/products/malayadres.jpeg",
      description: "Koleksi busana muslim modern dengan sentuhan elegan",
      path: "/category/gamis",
      price: "Rp 450.000",
      details: "Dress muslim modern dengan bahan premium cotton yang nyaman digunakan sehari-hari.",
      features: [
        "Bahan Premium Cotton",
        "Jahitan Rapi dan Kuat",
        "Model Loose Fit",
        "Desain Exclusive"
      ],
      sizes: ["S", "M", "L", "XL"],
      sizeGuide: {
        S: "LD: 96cm, Panjang: 135cm",
        M: "LD: 100cm, Panjang: 137cm",
        L: "LD: 104cm, Panjang: 139cm",
        XL: "LD: 108cm, Panjang: 141cm"
      },
      colors: ["Brown", "Black", "Navy"],
      careInstructions: [
        "Cuci dengan air dingin",
        "Jangan gunakan pemutih",
        "Setrika suhu sedang"
      ]
    },
    {
      id: 2,
      title: "CLOTHES COLLECTION",
      image: "/products/tunic-brown.jpg",
      description: "Koleksi pakaian casual dan formal untuk muslimah",
      path: "/category/clothes",
      price: "Rp 275.000",
      details: "Pakaian modern untuk kebutuhan sehari-hari",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Brown", "Black", "Navy"]
    },
    {
      id: 3,
      title: "KNITWARE COLLECTION",
      image: "/products/sweater-cream.jpg",
      description: "Koleksi rajutan premium dengan desain eksklusif",
      path: "/category/knitware",
      price: "Rp 225.000",
      details: "Rajutan premium dengan bahan berkualitas",
      sizes: ["S", "M", "L"],
      colors: ["Cream", "Grey", "Pink"]
    },
    {
      id: 4,
      title: "HIJAB COLLECTION",
      image: "/products/pashmina-plisket.jpg",
      description: "Koleksi hijab premium dengan berbagai model",
      path: "/category/hijab",
      price: "Rp 85.000",
      details: "Hijab premium dengan berbagai model dan bahan berkualitas",
      sizes: ["175x75cm", "115x115cm"],
      colors: ["Brown", "Black", "Navy", "Grey"]
    }
  ];

  const handleQuickView = (category) => {
    setSelectedProduct(category);
    setShowQuickView(true);
  };

  return (
    <>
      {/* Hero Section dengan Carousel */}
      <div className="hero-carousel">
        <Carousel
          indicators={true}
          interval={5000}
          fade={true}
          prevIcon={<div className="carousel-nav-btn prev"><FaChevronLeft /></div>}
          nextIcon={<div className="carousel-nav-btn next"><FaChevronRight /></div>}
        >
          <Carousel.Item>
            <img
              className="d-block w-100"
              src="/beranda/jahit.jpeg"
              alt="First slide"
            />
            <Carousel.Caption className="text-end carousel-content">
              <h1 className="display-4 fw-bold">PREMIUM SERIES</h1>
              <p className="lead">#KONVEKSIKEREN</p>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src="/beranda/jahit.jpeg"
              alt="Second slide"
            />
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
        <Row>
          {categories.map((category) => (
            <Col md={3} sm={6} className="mb-4" key={category.id}>
              <Card className="h-100 product-card">
                <div className="position-relative">
                  <Card.Img 
                    variant="top" 
                    src={category.image} 
                    className="category-image"
                    style={{ height: '400px', objectFit: 'cover' }}
                  />
                  <div className="product-overlay">
                    <Link 
                      to={category.path} 
                      className="btn btn-light me-2"
                    >
                      View All
                    </Link>
                    <Button 
                      variant="light" 
                      onClick={() => handleQuickView(category)}
                    >
                      Quick View
                    </Button>
                  </div>
                </div>
                <Card.Body>
                  <Card.Title className="text-center">{category.title}</Card.Title>
                  <Card.Text className="text-center text-muted">
                    {category.description}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Modal Quick View dengan pengecekan */}
      <Modal 
        show={showQuickView} 
        onHide={() => setShowQuickView(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedProduct?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <Row>
              <Col md={6}>
                <img 
                  src={selectedProduct.image} 
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
                  
                  {/* Features - dengan pengecekan */}
                  {selectedProduct.features && selectedProduct.features.length > 0 && (
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

                  {/* Sizes - dengan pengecekan */}
                  {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                    <div className="sizes mb-4">
                      <h5 className="mb-3">Available Sizes:</h5>
                      <div className="d-flex flex-wrap gap-2">
                        {selectedProduct.sizes.map((size, index) => (
                          <span key={index} className="size-badge">
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Colors - dengan pengecekan */}
                  {selectedProduct.colors && selectedProduct.colors.length > 0 && (
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

                  {/* Action Button */}
                  <div className="d-grid gap-2">
                    <Link 
                      to={selectedProduct.path}
                      className="btn btn-primary"
                    >
                      View Full Collection
                    </Link>
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Beranda;