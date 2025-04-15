import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Image } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash } from 'react-icons/fa';

function MaterialManagement() {
  const [materials, setMaterials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_per_meter: '',
    stock_meter: '',
    supplier: '',
    image: null
  });

  // Fetch materials
  const fetchMaterials = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/materials`);
      setMaterials(response.data.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
      Swal.fire('Error', 'Failed to fetch materials', 'error');
    }
  };

  useEffect(() => {
    fetchMaterials();
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
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Open modal for adding/editing material
  const handleShowModal = (material = null) => {
    if (material) {
      setSelectedMaterial(material);
      setFormData({
        name: material.name,
        description: material.description,
        price_per_meter: material.price_per_meter,
        stock_meter: material.stock_meter,
        supplier: material.supplier,
        image: null
      });
      setImagePreview(material.image_url);
    } else {
      setSelectedMaterial(null);
      setFormData({
        name: '',
        description: '',
        price_per_meter: '',
        stock_meter: '',
        supplier: '',
        image: null
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
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (selectedMaterial) {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/admin/materials/${selectedMaterial.id}`,
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        Swal.fire('Success', 'Material updated successfully', 'success');
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/admin/materials`,
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        Swal.fire('Success', 'Material created successfully', 'success');
      }
      setShowModal(false);
      fetchMaterials();
    } catch (error) {
      console.error('Error saving material:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to save material', 'error');
    }
  };

  // Handle material deletion
  const handleDelete = async (materialId) => {
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
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/materials/${materialId}`);
        Swal.fire('Deleted!', 'Material has been deleted.', 'success');
        fetchMaterials();
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      Swal.fire('Error', 'Failed to delete material', 'error');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manajemen Bahan Kain</h2>
        <Button variant="primary" onClick={() => handleShowModal()}>
          Tambah Bahan
        </Button>
      </div>

      <Table striped bordered hover className="admin-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Nama Bahan</th>
            <th>Harga/Meter</th>
            <th>Stok (Meter)</th>
            <th>Supplier</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {materials.map(material => (
            <tr key={material.id}>
              <td>
                <Image 
                  src={material.image_url} 
                  alt={material.name}
                  style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                />
              </td>
              <td>{material.name}</td>
              <td>Rp {parseInt(material.price_per_meter).toLocaleString()}</td>
              <td>{material.stock_meter}</td>
              <td>{material.supplier}</td>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-2"
                  onClick={() => handleShowModal(material)}
                >
                  <FaEdit />
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(material.id)}
                >
                  <FaTrash />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add/Edit Material Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedMaterial ? 'Edit Material' : 'Add New Material'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nama Bahan</Form.Label>
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

            <Form.Group className="mb-3">
              <Form.Label>Harga per Meter</Form.Label>
              <Form.Control
                type="number"
                name="price_per_meter"
                value={formData.price_per_meter}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Stok (Meter)</Form.Label>
              <Form.Control
                type="number"
                name="stock_meter"
                value={formData.stock_meter}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Supplier</Form.Label>
              <Form.Control
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Gambar Bahan</Form.Label>
              <div className="d-flex flex-column align-items-center">
                {imagePreview && (
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    className="mb-2"
                    style={{ width: '200px', height: '200px', objectFit: 'cover' }}
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

            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {selectedMaterial ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default MaterialManagement; 