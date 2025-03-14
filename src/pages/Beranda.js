import React, { useState } from 'react';
import { Container, Row, Col, Card, Carousel, Modal, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

function Beranda() {
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Data kategori produk dengan informasi lengkap
  const categories = [
    {
      id: 1,
      title: "MALAYA GIRL SERIES",
      image: "/products/Gamis_coklat.jpeg",
      description: "Koleksi busana muslim modern dengan sentuhan elegan",
      path: "/category/gamis",
      price: "Rp 450.000",
      details: "Dress muslim modern dengan bahan premium cotton. Tersedia dalam berbagai ukuran dan warna. Cocok untuk acara formal maupun casual.",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "Navy", "Maroon"]
    },
    {
      id: 2,
      title: "ABAYA LUNA SERIES",
      image: "/products/gamis_krem.jpeg",
      description: "Koleksi gamis premium dengan desain modern",
      path: "/category/gamis",
      price: "Rp 475.000",
      details: "Gamis premium dengan desain modern dan elegan. Menggunakan bahan berkualitas tinggi dengan detail yang sempurna.",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "Navy", "Brown"]
    },
    {
      id: 3,
      title: "BUSANA AKHWAT",
      image: "/products/akhwat.jpg",
      description: "Koleksi busana syar'i untuk muslimah",
      path: "/category/akhwat",
      price: "Rp 425.000",
      details: "Busana syar'i dengan desain yang anggun dan nyaman dipakai. Cocok untuk kegiatan sehari-hari maupun acara formal.",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Brown", "Black", "Navy", "Grey"]
    },
    {
      id: 4,
      title: "HIJAB COLLECTION",
      image: "/products/hijab.jpg",
      description: "Koleksi hijab dengan berbagai model",
      path: "/category/hijab",
      price: "Rp 150.000",
      details: "Hijab dengan berbagai model dan bahan premium. Nyaman dipakai dan mudah dibentuk.",
      sizes: ["All Size"],
      colors: ["Brown", "Black", "Navy", "Grey", "Cream"]
    }
  ];

  
  const handleQuickView = (category) => {
    setSelectedProduct(category);
    setShowQuickView(true);
  };

  return (
    <>
      <div className="hero-carousel">
        <Carousel
          indicators={true}
          prevIcon={<div className="carousel-nav-btn prev"><FaChevronLeft /></div>}
          nextIcon={<div className="carousel-nav-btn next"><FaChevronRight /></div>}
        >
          <Carousel.Item>
            <img
              className="d-block w-100"
              src="/beranda/jahit.jpeg"
              alt="First slide"
              style={{ height: '400px', objectFit: 'cover' }}
            />
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src="/beranda/jahit2.jpeg"
              alt="Second slide"
              style={{ height: '400px', objectFit: 'cover' }}
            />
          </Carousel.Item>
        </Carousel>
      </div>

      {/* Kategori Produk */}
      <Container className="my-5">
        <h2 className="text-center mb-4">Kategori Produk</h2>
        <Row>
          {categories.map((category) => (
            <Col md={3} sm={6} className="mb-4" key={category.id}>
              <Card className="h-100">
                <div className="position-relative">
                  <Card.Img 
                    variant="top" 
                    src={category.image} 
                    className="category-image"
                  />
                  <div className="card-overlay">
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
                  <Card.Title>{category.title}</Card.Title>
                  <Card.Text>{category.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Modal Quick View */}
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
          <Row>
            <Col md={6}>
              <img 
                src={selectedProduct?.image} 
                alt={selectedProduct?.title}
                className="img-fluid"
              />
            </Col>
            <Col md={6}>
              <h4>{selectedProduct?.title}</h4>
              <p className="text-muted">{selectedProduct?.price}</p>
              <p>{selectedProduct?.details}</p>
              <div className="mb-3">
                <strong>Ukuran Tersedia:</strong>
                <div className="mt-2">
                  {selectedProduct?.sizes?.map((size, index) => (
                    <span key={index} className="me-2 badge bg-secondary">{size}</span>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <strong>Warna Tersedia:</strong>
                <div className="mt-2">
                  {selectedProduct?.colors?.map((color, index) => (
                    <span key={index} className="me-2 badge bg-secondary">{color}</span>
                  ))}
                </div>
              </div>
              <Link 
                to={selectedProduct?.path}
                className="btn btn-primary"
              >
                Lihat Selengkapnya
              </Link>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Beranda;