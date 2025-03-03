import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Tabs, Tab, Toast } from 'react-bootstrap';
import { useCart } from '../context/CartContext';

function ProductDetail() {
  const { productId } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Database produk (nanti bisa diganti dengan API/database)
  const products = {
    1: {
      id: 1,
      title: "Gamis Modern Cream",
      images: [
        "/products/Gamis3.jpeg",
        // Tambahkan gambar lain dari produk yang sama
      ],
      price: "Rp 450.000",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Brown", "Black", "Navy"],
      description: "Dress muslim modern dengan bahan premium cotton",
      details: [
        "Bahan: Premium Cotton",
        "Model: Loose Fit",
        "Lengan: Panjang",
        "Tinggi Model: 168cm",
        "Size yang digunakan model: M"
      ],
      careInstructions: [
        "Cuci dengan air dingin",
        "Jangan gunakan pemutih",
        "Setrika suhu sedang",
        "Dry clean aman"
      ],
      sizeGuide: {
        S: "LD: 96cm, Panjang: 135cm",
        M: "LD: 100cm, Panjang: 137cm",
        L: "LD: 104cm, Panjang: 139cm",
        XL: "LD: 108cm, Panjang: 141cm"
      }
    },
    2: {
      id: 2,
      title: "Gamis Classic Brown",
      images: [
        "/products/gamis4.jpeg",
        // Tambahkan gambar lain dari produk yang sama
      ],
      price: "Rp 475.000",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Cream", "Black", "Navy"],
      description: "Abaya premium dengan desain modern dan elegan",
      details: [
        "Bahan: Premium Crepe",
        "Model: A-Line Cut",
        "Lengan: Panjang",
        "Tinggi Model: 168cm",
        "Size yang digunakan model: M"
      ],
      careInstructions: [
        "Cuci dengan air dingin",
        "Jangan gunakan pemutih",
        "Setrika suhu sedang",
        "Dry clean aman"
      ],
      sizeGuide: {
        S: "LD: 98cm, Panjang: 140cm",
        M: "LD: 102cm, Panjang: 142cm",
        L: "LD: 106cm, Panjang: 144cm",
        XL: "LD: 110cm, Panjang: 146cm"
      }
    }
  };

  const product = products[productId];

  if (!product) return <div>Product not found</div>;

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select size and color');
      return;
    }

    addToCart(product, selectedSize, selectedColor);
    setShowToast(true);
    setTimeout(() => navigate('/cart'), 1500);
  };

  return (
    <Container className="my-5 position-relative">
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        delay={1500}
        autohide
        className="position-fixed top-0 end-0 m-4"
      >
        <Toast.Header>
          <strong className="me-auto">Success!</strong>
        </Toast.Header>
        <Toast.Body>Item added to cart. Redirecting to cart...</Toast.Body>
      </Toast>

      <Row>
        <Col md={6}>
          <img 
            src={product.images[0]} 
            alt={product.title} 
            className="img-fluid mb-3"
            style={{ width: '100%', height: 'auto' }}
          />
        </Col>
        <Col md={6}>
          <small className="text-muted">{product.collection}</small>
          <h2>{product.title}</h2>
          <h4 className="text-muted mb-4">{product.price}</h4>
          
          <div className="mb-4">
            <h5>Size</h5>
            <div className="d-flex gap-2">
              {product.sizes.map((size) => (
                <Button 
                  key={size} 
                  variant={selectedSize === size ? "dark" : "outline-dark"}
                  className="size-btn"
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h5>Color</h5>
            <div className="d-flex gap-2">
              {product.colors.map((color) => (
                <Button 
                  key={color} 
                  variant={selectedColor === color ? "dark" : "outline-dark"}
                  className="color-btn"
                  onClick={() => setSelectedColor(color)}
                >
                  {color}
                </Button>
              ))}
            </div>
          </div>

          <Button 
            variant="dark" 
            size="lg" 
            className="w-100 mb-3"
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>

          <Tabs defaultActiveKey="details" className="mb-3">
            <Tab eventKey="details" title="Details">
              <p>{product.description}</p>
              <ul>
                {product.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </Tab>
            <Tab eventKey="size-guide" title="Size Guide">
              <table className="table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Measurements</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(product.sizeGuide).map(([size, measurements]) => (
                    <tr key={size}>
                      <td>{size}</td>
                      <td>{measurements}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Tab>
            <Tab eventKey="care" title="Care Instructions">
              <ul>
                {product.careInstructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
}

export default ProductDetail; 