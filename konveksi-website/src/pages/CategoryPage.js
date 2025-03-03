import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

function CategoryPage() {
  const { categoryId } = useParams();

  // Data produk berdasarkan kategori
  const categoryProducts = {
    malaya: {
      title: "Gamis Collection",
      description: "Koleksi busana muslim modern dengan sentuhan elegan",
      products: [
        {
          id: 1,
          title: "Malaya Dress Brown",
          image: "/products/Gamis_coklat.jpeg",
          price: "Rp 450.000",
          sizes: ["S", "M", "L", "XL"],
          colors: ["Brown", "Black", "Navy"]
        },
        // Tambahkan produk lain
      ]
    },
    abaya: {
      title: "ABAYA LUNA SERIES",
      description: "Koleksi gamis premium dengan desain modern",
      products: [
        {
          id: 1,
          title: "Abaya Luna Classic",
          image: "/products/gamis_krem.jpeg",
          price: "Rp 475.000",
          sizes: ["S", "M", "L", "XL"],
          colors: ["Cream", "Black", "Navy"]
        },
        // Tambahkan produk lain
      ]
    },
    gamis: {
      title: "GAMIS GIRL COLLECTION",
      description: "Koleksi gamis modern untuk wanita muslimah",
      products: [
        {
          id: 1,
          title: "Gamis Modern Cream",
          image: "/products/gamis3.jpeg",
          price: "Rp 450.000",
          description: "Gamis modern dengan desain elegan",
          sizes: ["S", "M", "L", "XL"],
          colors: ["Brown", "Black", "Navy"]
        },

        {
          id: 2,
          title: "Gamis Classic Brown",
          image: "/products/gamis4.jpeg",
          price: "Rp 475.000",
          description: "Gamis klasik dengan sentuhan modern",
          sizes: ["S", "M", "L", "XL"],
          colors: ["Black", "Navy", "Grey"]
        },

        {
         id: 3,
         title: "Malaya Dress Brown",
         image: "/products/Gamis_coklat.jpeg",
         price: "Rp 450.000",
         sizes: ["S", "M", "L", "XL"],
         colors: ["Brown", "Black", "Navy"]
        },

        {
         id: 4,
         title: "Abaya Luna Classic",
         image: "/products/gamis_krem.jpeg",
         price: "Rp 475.000",
         sizes: ["S", "M", "L", "XL"],
         colors: ["Cream", "Black", "Navy"]
         },


      ]
    }
  };

  const category = categoryProducts[categoryId];

  return (
    <Container className="my-5">
      <div className="category-header mb-4">
        <h2 className="text-center">{category?.title}</h2>
        <p className="text-center text-muted">{category?.description}</p>
      </div>

      <Row>
        {category?.products.map((product) => (
          <Col md={4} sm={6} className="mb-4" key={product.id}>
            <Card className="h-100 product-card">
              <div className="position-relative">
                <Card.Img 
                  variant="top" 
                  src={product.image} 
                  className="product-image"
                  style={{ height: '400px', objectFit: 'cover' }}
                />
                <div className="product-overlay">
                  <Button 
                    variant="light" 
                    className="me-2"
                    href={`/product/${product.id}`}
                  >
                    View Details
                  </Button>
                </div>
              </div>
              <Card.Body>
                <Card.Title className="text-center">{product.title}</Card.Title>
                <Card.Text className="text-center text-muted">{product.price}</Card.Text>
                <div className="sizes mb-2 text-center">
                  <small className="text-muted">Sizes: </small>
                  {product.sizes.map((size, index) => (
                    <span key={index} className="me-2 badge bg-secondary">{size}</span>
                  ))}
                </div>
                <div className="colors text-center">
                  <small className="text-muted">Colors: </small>
                  {product.colors.map((color, index) => (
                    <span key={index} className="me-2 badge bg-secondary">{color}</span>
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

export default CategoryPage; 