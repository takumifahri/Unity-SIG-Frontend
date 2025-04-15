import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function MapIntegration() {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([-6.2088, 106.8456]); // Jakarta coordinates
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    type: 'store', // store, warehouse, supplier
    description: ''
  });

  // Fetch locations
  const fetchLocations = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/locations`);
      setLocations(response.data.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      Swal.fire('Error', 'Failed to fetch locations', 'error');
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle map click to set coordinates
  const handleMapClick = (e) => {
    setFormData(prev => ({
      ...prev,
      latitude: e.latlng.lat,
      longitude: e.latlng.lng
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedLocation) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/admin/locations/${selectedLocation.id}`,
          formData
        );
        Swal.fire('Success', 'Location updated successfully', 'success');
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/admin/locations`,
          formData
        );
        Swal.fire('Success', 'Location added successfully', 'success');
      }
      setSelectedLocation(null);
      setFormData({
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        type: 'store',
        description: ''
      });
      fetchLocations();
    } catch (error) {
      console.error('Error saving location:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to save location', 'error');
    }
  };

  // Handle location deletion
  const handleDelete = async (locationId) => {
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
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/locations/${locationId}`);
        Swal.fire('Deleted!', 'Location has been deleted.', 'success');
        fetchLocations();
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      Swal.fire('Error', 'Failed to delete location', 'error');
    }
  };

  // Get marker icon based on location type
  const getMarkerIcon = (type) => {
    const iconSize = [25, 41];
    const iconAnchor = [12, 41];
    const popupAnchor = [1, -34];
    const shadowSize = [41, 41];

    let iconUrl;
    switch (type) {
      case 'store':
        iconUrl = '/markers/store-marker.png';
        break;
      case 'warehouse':
        iconUrl = '/markers/warehouse-marker.png';
        break;
      case 'supplier':
        iconUrl = '/markers/supplier-marker.png';
        break;
      default:
        iconUrl = '/markers/default-marker.png';
    }

    return L.icon({
      iconUrl,
      iconSize,
      iconAnchor,
      popupAnchor,
      shadowSize
    });
  };

  return (
    <div>
      <h2 className="mb-4">Integrasi Peta QGIS</h2>
      
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <div style={{ height: '600px' }}>
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  onClick={handleMapClick}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {locations.map(location => (
                    <Marker
                      key={location.id}
                      position={[location.latitude, location.longitude]}
                      icon={getMarkerIcon(location.type)}
                    >
                      <Popup>
                        <div>
                          <h6>{location.name}</h6>
                          <p>{location.address}</p>
                          <p><strong>Type:</strong> {location.type}</p>
                          <div className="mt-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => {
                                setSelectedLocation(location);
                                setFormData({
                                  name: location.name,
                                  address: location.address,
                                  latitude: location.latitude,
                                  longitude: location.longitude,
                                  type: location.type,
                                  description: location.description
                                });
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(location.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Body>
              <h5 className="mb-3">{selectedLocation ? 'Edit Location' : 'Add New Location'}</h5>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Latitude</Form.Label>
                      <Form.Control
                        type="number"
                        step="any"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Longitude</Form.Label>
                      <Form.Control
                        type="number"
                        step="any"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="store">Store</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="supplier">Supplier</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <div className="d-flex justify-content-between">
                  {selectedLocation && (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelectedLocation(null);
                        setFormData({
                          name: '',
                          address: '',
                          latitude: '',
                          longitude: '',
                          type: 'store',
                          description: ''
                        });
                      }}
                    >
                      Cancel Edit
                    </Button>
                  )}
                  <Button variant="primary" type="submit">
                    {selectedLocation ? 'Update Location' : 'Add Location'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default MapIntegration; 