import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import axios from 'axios';
function CategoryPage() {
  const { categoryId } = useParams();
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      // Fetch master_jenis data
      const masterJenisResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/master_jenis/${categoryId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const masterJenisData = masterJenisResponse.data.data;
      console.log('Master Jenis Response:', masterJenisData);

      // Fetch catalog data using the master_jenis ID
      const catalogResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/catalog`, {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          master_jenis_id: masterJenisData.id, // Assuming the ID is in masterJenisData.id
        },
      });

      console.log('Catalog Response:', catalogResponse.data.data);
      setCategoryData(catalogResponse.data.data);
    } catch (error) {
      console.error("Error fetching category data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryData();
  }, [categoryId]);

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <p>Loading...</p>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <div className="category-header mb-4">
        <h2 className="text-center">{categoryData?.[0]?.master_jenis_id?.nama_jenis_katalog || "Category"}</h2>
        <p className="text-center text-muted">{categoryData?.[0]?.master_jenis_id?.deskripsi || "Explore our collection"}</p>
      </div>

      <Row>
        {categoryData.map((product) => (
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