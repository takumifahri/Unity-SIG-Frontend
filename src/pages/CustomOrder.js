import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Modal, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/CustomOrder.css';

function CustomOrder() {
  const navigate = useNavigate();
  const { updateCartCount } = useCart();
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    telepon: '',
    email: '',
    jenisBaju: '',
    ukuran: '',
    jumlah: '',
    catatan: '',
    sumberKain: 'konveksi', // 'konveksi' atau 'sendiri'
    gambarReferensi: null,
    estimasiPengerjaan: '2 minggu' // default
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setFormData(prevState => ({
      ...prevState,
      gambarReferensi: file
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validasi form
    if (!formData.nama || !formData.telepon || !formData.email || !formData.jenisBaju || 
        !formData.ukuran || !formData.jumlah) {
      alert('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    try {
      // Buat objek item untuk cart
      const cartItem = {
        id: 'CUSTOM-' + Date.now(),
        cartId: `custom-${Date.now()}`,
        productName: `Custom ${formData.jenisBaju}`,
        quantity: parseInt(formData.jumlah),
        size: formData.ukuran,
        price: calculatePrice(formData.jenisBaju, formData.jumlah),
        isCustomOrder: true,
        customDetails: {
          nama: formData.nama,
          telepon: formData.telepon,
          email: formData.email,
          sumberKain: formData.sumberKain,
          catatan: formData.catatan,
          estimasiPengerjaan: formData.estimasiPengerjaan,
          tanggalOrder: new Date().toISOString()
        }
      };

      // Ambil cart yang ada dari localStorage
      let currentCart = JSON.parse(localStorage.getItem('cart')) || [];
      
      // Tambahkan item baru ke cart
      currentCart.push(cartItem);
      
      // Simpan kembali ke localStorage
      localStorage.setItem('cart', JSON.stringify(currentCart));

      // Update cart count
      updateCartCount();

      // Redirect ke halaman cart
      navigate('/cart');
      
    } catch (error) {
      console.error('Error saving to cart:', error);
      alert('Terjadi kesalahan saat menyimpan pesanan');
    }
  };

  // Fungsi untuk menghitung harga berdasarkan jenis baju dan jumlah
  const calculatePrice = (jenisBaju, jumlah) => {
    let basePrice;
    switch (jenisBaju) {
      case 'kemeja':
        basePrice = 150000;
        break;
      case 'kaos':
        basePrice = 100000;
        break;
      case 'jaket':
        basePrice = 200000;
        break;
      case 'celana':
        basePrice = 175000;
        break;
      default:
        basePrice = 100000;
    }
    
    // Berikan diskon untuk pemesanan dalam jumlah besar
    if (jumlah >= 50) {
      return basePrice * jumlah * 0.8; // Diskon 20%
    } else if (jumlah >= 24) {
      return basePrice * jumlah * 0.9; // Diskon 10%
    }
    return basePrice * jumlah;
  };

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Custom Order</h2>
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* Informasi Pribadi */}
                <h5 className="mb-3">Informasi Pribadi</h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nama Lengkap*</Form.Label>
                      <Form.Control
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>No. Telepon*</Form.Label>
                      <Form.Control
                        type="tel"
                        name="telepon"
                        value={formData.telepon}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label>Email*</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                {/* Detail Pesanan */}
                <h5 className="mb-3">Detail Pesanan</h5>
                <Form.Group className="mb-3">
                  <Form.Label>Jenis Baju*</Form.Label>
                  <Form.Select
                    name="jenisBaju"
                    value={formData.jenisBaju}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Pilih Jenis Baju</option>
                    <option value="kemeja">Kemeja</option>
                    <option value="kaos">Kaos</option>
                    <option value="jaket">Jaket</option>
                    <option value="celana">Celana</option>
                  </Form.Select>
                </Form.Group>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Ukuran*</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Select
                          name="ukuran"
                          value={formData.ukuran}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Pilih Ukuran</option>
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                          <option value="XXL">XXL</option>
                        </Form.Select>
                        <Button 
                          variant="link" 
                          className="ms-2"
                          onClick={() => setShowSizeChart(true)}
                        >
                          Lihat Size Chart
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Jumlah*</Form.Label>
                      <Form.Control
                        type="number"
                        name="jumlah"
                        value={formData.jumlah}
                        onChange={handleInputChange}
                        min="1"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label>Sumber Kain</Form.Label>
                  <div>
                    <Form.Check
                      inline
                      type="radio"
                      label="Kain dari Konveksi"
                      name="sumberKain"
                      value="konveksi"
                      checked={formData.sumberKain === 'konveksi'}
                      onChange={handleInputChange}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      label="Kain Sendiri"
                      name="sumberKain"
                      value="sendiri"
                      checked={formData.sumberKain === 'sendiri'}
                      onChange={handleInputChange}
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Upload Desain/Referensi</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <Form.Text className="text-muted">
                    Format yang diterima: JPG, PNG (Max. 5MB)
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Catatan Tambahan</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="catatan"
                    value={formData.catatan}
                    onChange={handleInputChange}
                    placeholder="Tuliskan detail tambahan atau spesifikasi khusus..."
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button type="submit" variant="primary" size="lg">
                    Pesan Sekarang
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-3">Informasi Pesanan</h5>
              <div className="mb-3">
                <strong>Estimasi Pengerjaan:</strong>
                <p className="mb-0">2-3 minggu setelah konfirmasi pembayaran</p>
              </div>
              <div className="mb-3">
                <strong>Ketentuan:</strong>
                <ul className="small mb-0">
                  <li>Minimal pemesanan 3 pcs</li>
                  <li>DP 50% dari total harga</li>
                  <li>Revisi desain maksimal 3 kali</li>
                  <li>Harga final akan dikonfirmasi setelah detail pesanan lengkap</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal Size Chart */}
      <Modal show={showSizeChart} onHide={() => setShowSizeChart(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Size Chart</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered responsive>
            <thead>
              <tr>
                <th>Ukuran</th>
                <th>Lebar Dada (cm)</th>
                <th>Panjang Baju (cm)</th>
                <th>Panjang Lengan (cm)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>S</td>
                <td>48</td>
                <td>65</td>
                <td>22</td>
              </tr>
              <tr>
                <td>M</td>
                <td>50</td>
                <td>67</td>
                <td>23</td>
              </tr>
              <tr>
                <td>L</td>
                <td>52</td>
                <td>69</td>
                <td>24</td>
              </tr>
              <tr>
                <td>XL</td>
                <td>54</td>
                <td>71</td>
                <td>25</td>
              </tr>
              <tr>
                <td>XXL</td>
                <td>56</td>
                <td>73</td>
                <td>26</td>
              </tr>
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default CustomOrder; 