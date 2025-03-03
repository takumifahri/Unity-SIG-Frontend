import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

function Ulasan() {
  const testimonials = [
    {
      id: 1,
      name: "PT. ABC",
      comment: "Kualitas jahitan sangat rapi dan pengerjaan tepat waktu",
      rating: 5,
      image: "/images/client1.jpg"
    },
    {
      id: 2,
      name: "CV. XYZ",
      comment: "Pelayanan sangat memuaskan dan harga bersaing",
      rating: 5,
      image: "/images/client2.jpg"
    },
    // Tambahkan testimonial lainnya
  ];

  return (
    <Container className="mt-5 pt-5">
      <h2 className="text-center mb-5">Ulasan Pelanggan</h2>
      <Row>
        {testimonials.map((testimonial) => (
          <Col md={4} key={testimonial.id} className="mb-4">
            <Card>
              <Card.Body>
                <div className="text-center mb-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="rounded-circle"
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                  />
                </div>
                <Card.Title className="text-center">{testimonial.name}</Card.Title>
                <Card.Text className="text-center">
                  {testimonial.comment}
                </Card.Text>
                <div className="text-center">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <i key={i} className="fas fa-star text-warning"></i>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Ulasan; 