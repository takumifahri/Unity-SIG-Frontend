import React from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useReview } from '../context/ReviewContext';
import { FaStar } from 'react-icons/fa';

function Ulasan() {
  const { reviews, loading, error } = useReview();

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        color={index < rating ? "#ffc107" : "#e4e5e9"}
        size={20}
        className="me-1"
      />
    ));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Card className="text-center p-5">
          <Card.Body>
            <h5>Gagal memuat ulasan</h5>
            <p>Mohon coba beberapa saat lagi</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Ulasan Pelanggan</h2>
      
      {reviews.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <h5>Belum ada ulasan</h5>
            <p>Jadilah yang pertama memberikan ulasan!</p>
          </Card.Body>
        </Card>
      ) : (
        <>
          {/* Rata-rata Rating */}
          <Card className="mb-4 text-center py-4">
            <Card.Body>
              <h4>Rating Keseluruhan</h4>
              <div className="d-flex justify-content-center align-items-center mb-2">
                {renderStars(
                  Math.round(
                    reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
                  )
                )}
              </div>
              <p className="mb-0">
                {(reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)} dari 5
                <br />
                <small className="text-muted">Berdasarkan {reviews.length} ulasan</small>
              </p>
            </Card.Body>
          </Card>

          {/* Daftar Ulasan */}
          <Row>
            {reviews.map((review) => (
              <Col md={6} className="mb-4" key={review.id}>
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="mb-0">{review.nama}</h5>
                      <small className="text-muted">
                        {formatDate(review.date)}
                      </small>
                    </div>
                    <div className="mb-3">
                      {renderStars(review.rating)}
                    </div>
                    <Card.Text style={{ whiteSpace: 'pre-line' }}>
                      {review.ulasan}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
}

export default Ulasan; 