import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { CircleLoader, MoonLoader } from 'react-spinners';
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
  }, []);

  if (loading) {
    return (
      <Container className="my-5 d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <MoonLoader color="#000000" size={150} />
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
        {categoryData?.map((product) => (
          <Col md={4} sm={6} className="mb-4" key={product.id}>
            <Card className="h-100 product-card">
              <div className="position-relative">
                <Card.Img 
                  variant="top" 
                  src={`${process.env.REACT_APP_API_URL}/${product.gambar}`}
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
                <Card.Title className="text-left">{product.nama_katalog}</Card.Title>
                <Card.Text className="text-left text-muted">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)}
                </Card.Text>
                <div className="colors mb-2">
                  <small className="text-muted">Colors:</small>
                  <div className="d-flex flex-wrap">
                    {product.colors.map((color) => (
                      <span key={color.id} className="badge bg-secondary me-2 ">{color.color_name}</span>
                    ))}
                  </div>
                </div>
                <div className="colors mb-2">
                  <small className="text-muted">Size and Stok</small>
                  {product.colors.map((color) => (
                    <div key={color.id} className="mb-2">
                      <span className="me-2 badge bg-secondary">{color.sizes.size}</span>
                      <span className="me-2 badge bg-secondary">{color.sizes.stok}</span>
                    </div>
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