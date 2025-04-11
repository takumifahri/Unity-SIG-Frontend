import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Carousel, Modal, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';

function Beranda() {
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCatalog = async () => {
    try {
      const resp = await axios.get(`${process.env.REACT_APP_API_URL}/api/catalog`, {
        headers: {
          "Content-Type": "application/json",
        }
      });

      console.log('resp',resp)
      // Mapping data sesuai kebutuhan UI
      const mappedData = resp.data.data.map(item => ({
        id: item.id,
        title: item.nama_katalog,
        kategori: item.jenis_katalog?.nama_jenis_katalog,
        jenis_katalog_id: item.jenis_katalog_id,
        detail: item.detail,
        image:  `${process.env.REACT_APP_API_URL}/${item.gambar}`,
        description: item.deskripsi,
        path: `/category/${item.jenis_katalog_id}`,
        price: `Rp ${parseInt(item.price).toLocaleString()}`,
        details: item.details,
        features: JSON.parse(item.feature || '[]'),
        sizes: [item.size],
        size_guide: [item.size_guide],
        colors: [item.colors],
      careInstructions: JSON.parse(item.jenis_katalog?.tata_cara_pemakaian || '[]'),
    }));
      console.log('mappedData',mappedData)
      setItems(mappedData);
    } catch (error) {
      console.log('failed to fetch data', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch data from server',
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getCatalog();
  }, []);

  const handleQuickView = (category) => {
    setSelectedProduct(category);
    setShowQuickView(true);
  };


  return (
    <>
      {/* Hero Section */}
      <div className="hero-carousel">
        <Carousel
          indicators={true}
          interval={5000}
          fade={true}
          prevIcon={<div className="carousel-nav-btn prev"><FaChevronLeft /></div>}
          nextIcon={<div className="carousel-nav-btn next"><FaChevronRight /></div>}
        >
          <Carousel.Item>
            <img className="d-block w-100" src="/beranda/jahit.jpeg" alt="First slide" />
            <Carousel.Caption className="text-end carousel-content">
              <h1 className="display-4 fw-bold">PREMIUM SERIES</h1>
              <p className="lead">#KONVEKSIKEREN</p>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img className="d-block w-100" src="/beranda/jahit.jpeg" alt="Second slide" />
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
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : (
            items.map((category) => (
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
                      <Link to={category.path} className="btn btn-light me-2">View All</Link>
                      <Button variant="light" onClick={() => handleQuickView(category)}>Quick View</Button>
                    </div>
                  </div>
                  <Card.Body>
                    <Card.Title className="text-center">{category.title}</Card.Title>
                    <Card.Text className="text-center text-muted">{category.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </Container>

      {/* Modal Quick View */}
      <Modal show={showQuickView} onHide={() => setShowQuickView(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedProduct?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <Row>
              <Col md={6}>
                <img src={selectedProduct.image} alt={selectedProduct.title} className="img-fluid rounded mb-3" />
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
                            <i className="fas fa-check text-success me-2"></i>{feature}
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
                          <span key={index} className="size-badge">{size}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedProduct.colors?.length > 0 && (
                    <div className="colors mb-4">
                      <h5 className="mb-3">Available Colors:</h5>
                      <div className="d-flex flex-wrap gap-2">
                        {selectedProduct.colors.map((color, index) => (
                          <span key={index} className="color-badge">{color}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="d-grid gap-2">
                    <Link to={selectedProduct.path} className="btn btn-primary">View Full Collection</Link>
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