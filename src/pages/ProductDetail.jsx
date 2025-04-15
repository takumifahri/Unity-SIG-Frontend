import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Tabs, Tab, Toast } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import axios from 'axios';

function ProductDetail() {
  const { productId } = useParams();
  const { updateCartCount } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/catalog/show/${productId}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log('data show',response.data)
        setProduct(response.data.data);
      } catch (error) {
        console.error('Failed to fetch product data:', error);
      }
    };

    fetchProduct();
  }, [productId]);

  if (!product) return <div>Loading...</div>;

  const handleAddToCart = () => {
    try {
      // Create cart item object
      const cartItem = {
        id: product.id,
        cartId: `${product.id}-${Date.now()}`,
        name: product.nama_katalog,
        price: product.price,
        image: `${process.env.REACT_APP_API_URL}/${product.gambar}`,
        size: selectedSize,
        color: selectedColor,
        quantity: selectedQuantity,
      };

      // Get current cart from localStorage
      const currentCart = JSON.parse(localStorage.getItem('cart')) || [];

      // Add new item to cart
      const newCart = [...currentCart, cartItem];

      // Save updated cart to localStorage
      localStorage.setItem('cart', JSON.stringify(newCart));

      // Update cart count
      updateCartCount();

      // Show success toast
      setShowToast(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart');
    }
  };

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
          {product.nama_katalog} ({selectedSize}, {selectedColor}) added to cart!
        </Toast.Body>
      </Toast>

      <Row>
        <Col md={6}>
          <img 
            src={`${process.env.REACT_APP_API_URL}/${product.gambar}`} 
            alt={product.nama_katalog} 
            className="img-fluid mb-3"
            style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'cover' }}
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
                  variant={selectedColor === color.color_name ? "dark" : "outline-dark"}
                  className="color-btn"
                  onClick={() => {
                    setSelectedColor(color.color_name);
                    setSelectedSize(''); // Reset size when color changes
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
              {product.colors.flatMap((color) => color.sizes).map((size, index) => (
                <Button
                  key={index}
                  variant={selectedSize === size.size ? "dark" : "outline-dark"}
                  className="size-btn"
                  onClick={() => setSelectedSize(size.size)}
                >
                  {size.size}
                </Button>
              ))}
            </div>
          </div>

          <Button 
            variant="dark" 
            size="lg" 
            className="w-100 mb-3"
            onClick={handleAddToCart}
            disabled={!selectedSize || !selectedColor || selectedQuantity < 1}
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
  );
}

export default ProductDetail; 