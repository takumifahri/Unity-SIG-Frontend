import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useCart } from '../context/CartContext';

function Cart() {
  const { cartItems, removeFromCart } = useCart();

  const total = cartItems.reduce((sum, item) => 
    sum + (parseFloat(item.price.replace('Rp ', '').replace(',', '')) * item.quantity), 
    0
  );

  return (
    <Container className="my-5">
      <h2 className="mb-4">Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          {cartItems.map((item, index) => (
            <Card key={index} className="mb-3">
              <Card.Body>
                <Row>
                  <Col md={2}>
                    <img 
                      src={item.images[0]} 
                      alt={item.title} 
                      className="img-fluid"
                    />
                  </Col>
                  <Col md={6}>
                    <h5>{item.title}</h5>
                    <p className="text-muted mb-0">Size: {item.selectedSize}</p>
                    <p className="text-muted">Color: {item.selectedColor}</p>
                  </Col>
                  <Col md={2}>
                    <p className="mb-0">Quantity: {item.quantity}</p>
                    <p>{item.price}</p>
                  </Col>
                  <Col md={2}>
                    <Button 
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                    >
                      Remove
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
          <div className="text-end mt-4">
            <h4>Total: Rp {total.toLocaleString()}</h4>
            <Button variant="dark" size="lg">
              Proceed to Checkout
            </Button>
          </div>
        </>
      )}
    </Container>
  );
}

export default Cart; 