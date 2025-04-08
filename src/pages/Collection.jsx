import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/Collection.css';

function Collection() {
  const products = [
    {
      id: 1,
      name: 'Gamis Modern Cream',
      price: 450000,
      image: '/images/products/gamis-1.jpg',
      description: 'Gamis modern dengan desain elegan',
    },
    {
      id: 2,
      name: 'Kemeja Pria Navy',
      price: 275000,
      image: '/images/products/kemeja-1.jpg',
      description: 'Kemeja casual dengan bahan premium',
    },
    {
      id: 3,
      name: 'Dress Floral',
      price: 385000,
      image: '/images/products/dress-1.jpg',
      description: 'Dress cantik dengan motif bunga',
    },
    {
      id: 4,
      name: 'Blazer Formal',
      price: 550000,
      image: '/images/products/blazer-1.jpg',
      description: 'Blazer formal untuk tampilan profesional',
    },
    // Tambahkan produk lainnya...
  ];

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Our Collection</h2>
      <Row>
        {products.map((product) => (
          <Col key={product.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <Card className="product-card h-100">
              <div className="card-img-wrapper">
                <Card.Img 
                  variant="top" 
                  src={product.image} 
                  className="product-image"
                />
                <div className="card-overlay">
                  <Link 
                    to={`/product/${product.id}`} 
                    className="btn btn-light btn-sm"
                  >
                    Lihat Detail
                  </Link>
                </div>
              </div>
              <Card.Body className="d-flex flex-column">
                <Card.Title className="product-title">{product.name}</Card.Title>
                <Card.Text className="product-description">
                  {product.description}
                </Card.Text>
                <div className="mt-auto">
                  <p className="product-price">
                    Rp {product.price.toLocaleString()}
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Collection; 