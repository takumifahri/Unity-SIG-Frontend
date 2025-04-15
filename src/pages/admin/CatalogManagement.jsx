import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col, Image } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaImage } from 'react-icons/fa';

function CatalogManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    material_id: '',
    stock: '',
    image: null,
    sizes: [],
    colors: []
  });

  // Fetch products, categories, and materials
  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, materialsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/products`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/categories`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/materials`)
      ]);

      setProducts(productsRes.data.data);
      setCategories(categoriesRes.data.data);
      setMaterials(materialsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire('Error', 'Failed to fetch data', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (name === 'sizes' || name === 'colors') {
      // Handle multiple select
      const values = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prev => ({
        ...prev,
        [name]: values
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Open modal for adding/editing product
  const handleShowModal = (product = null) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category_id: product.category_id,
        material_id: product.material_id,
        stock: product.stock,
        image: null,
        sizes: product.sizes || [],
        colors: product.colors || []
      });
      setImagePreview(product.image_url);
    } else {
      setSelectedProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category_id: '',
        material_id: '',
        stock: '',
        image: null,
        sizes: [],
        colors: []
      });
      setImagePreview(null);
    }
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'sizes' || key === 'colors') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (selectedProduct) {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/admin/products/${selectedProduct.id}`,
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        Swal.fire('Success', 'Product updated successfully', 'success');
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/admin/products`,
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        Swal.fire('Success', 'Product created successfully', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving product:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to save product', 'error');
    }
  };

  // Handle product deletion
  const handleDelete = async (productId) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/products/${productId}`);
        Swal.fire('Deleted!', 'Product has been deleted.', 'success');
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      Swal.fire('Error', 'Failed to delete product', 'error');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manajemen Katalog</h2>
        <Button variant="primary" onClick={() => handleShowModal()}>
          Tambah Produk
        </Button>
      </div>

      <Table striped bordered hover className="admin-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Nama</th>
            <th>Kategori</th>
            <th>Harga</th>
            <th>Stok</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>
                <Image 
                  src={product.image_url} 
                  alt={product.name}
                  style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                />
              </td>
              <td>{product.name}</td>
              <td>{product.category?.name}</td>
              <td>Rp {parseInt(product.price).toLocaleString()}</td>
              <td>{product.stock}</td>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-2"
                  onClick={() => handleShowModal(product)}
                >
                  <FaEdit />
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                >
                  <FaTrash />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add/Edit Product Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedProduct ? 'Edit Product' : 'Add New Product'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Nama Produk</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Deskripsi</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Kategori</Form.Label>
                      <Form.Select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Pilih Kategori</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Bahan</Form.Label>
                      <Form.Select
                        name="material_id"
                        value={formData.material_id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Pilih Bahan</option>
                        {materials.map(material => (
                          <option key={material.id} value={material.id}>
                            {material.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Harga</Form.Label>
                      <Form.Control
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Stok</Form.Label>
                      <Form.Control
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ukuran</Form.Label>
                      <Form.Select
                        multiple
                        name="sizes"
                        value={formData.sizes}
                        onChange={handleInputChange}
                      >
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Warna</Form.Label>
                      <Form.Select
                        multiple
                        name="colors"
                        value={formData.colors}
                        onChange={handleInputChange}
                      >
                        <option value="Black">Black</option>
                        <option value="White">White</option>
                        <option value="Navy">Navy</option>
                        <option value="Red">Red</option>
                        <option value="Green">Green</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Gambar Produk</Form.Label>
                  <div className="d-flex flex-column align-items-center">
                    {imagePreview && (
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        className="mb-2"
                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                      />
                    )}
                    <Form.Control
                      type="file"
                      name="image"
                      onChange={handleInputChange}
                      accept="image/*"
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {selectedProduct ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default CatalogManagement; 