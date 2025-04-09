import  { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { useReview } from '../context/ReviewContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
// Import jQuery dengan benar
import jQuery from 'jquery';
import 'dropify';
import 'dropify/dist/css/dropify.min.css';
export default function Kontak(){
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      no_hp: '',
      subject: '',
      message: '',
      attachment: null
    });
    const dropifyRef = useRef(null);
  
    useEffect(() => {
      // Mendefinisikan $ sebagai alias dari jQuery yang diimpor
      const $ = jQuery;
      
      // Initialize Dropify
      if (dropifyRef.current) {
        const dropify = $(dropifyRef.current).dropify({
          messages: {
            default: 'Seret dan lepas file di sini atau klik',
            replace: 'Seret dan lepas atau klik untuk mengganti',
            remove: 'Hapus',
            error: 'Oops, terjadi kesalahan.'
          },
          error: {
            fileSize: 'Ukuran file terlalu besar (maks. 10MB).'
          },
          maxFileSize: 10 * 1024 * 1024 // 10MB
        });
  
        // Listen to the change event
        dropify.on('dropify.fileReady', function(event, element) {
          // Element bukanlah file, kita perlu mengambil file dari input
          const fileInput = $(this)[0].files[0]; // Dapatkan file asli
          setFormData(prev => ({ ...prev, attachment: fileInput }));
        });
  
        // Listen to remove event
        dropify.on('dropify.beforeClear', function() {
          setFormData(prev => ({ ...prev, attachment: null }));
          return true;
        });
      }
  
      // Cleanup function
      return () => {
        // Gunakan jQuery yang diimpor
        if (dropifyRef.current) {
          const dropifyInstance = $(dropifyRef.current).data('dropify');
          if (dropifyInstance) {
            dropifyInstance.destroy();
          }
        }
      };
    }, []);
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      
      try {
        // Create FormData for file upload
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('no_hp', formData.no_hp);
        formDataToSend.append('subject', formData.subject);
        formDataToSend.append('message', formData.message);
        if (formData.attachment) {
          formDataToSend.append('attachment', formData.attachment);
        }
        
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/contactus/send`, 
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          }
        );
        
        console.log(response);
        
        // Reset form after successful submission
        setFormData({
          name: '',
          email: '',
          no_hp: '',
          subject: '',
          message: '',
          attachment: null
        });
        
        // Clear dropify - mendefinisikan $ lokal lagi
        const $ = jQuery;
        const dropifyInstance = $(dropifyRef.current).data('dropify');
        if (dropifyInstance) {
          dropifyInstance.resetPreview();
          dropifyInstance.clearElement();
        }
        
        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Pesan berhasil dikirim!',
        });
        
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 5000);
        
      } catch (err) {
        console.log(err);
        
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `Something went wrong! ${err.message}`,
        });
      } finally {
        setLoading(false);
      }
    };
    return (
      <section id="contact" className="py-5">
        <Container>
          <h2 className="text-center mb-4">Contact Us</h2>
          
          {/* {showAlert && (
            <Alert 
              variant="success" 
              onClose={() => setShowAlert(false)} 
              dismissible
              className="mb-4"
            >
              Terima kasih atas ulasan Anda! Mengalihkan ke halaman ulasan...
            </Alert>
          )} */}
  
          <Row>
          <Col md={6}>
            <Card className="p-4 mb-4">
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nama</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Telepon</Form.Label>
                  <Form.Control
                    type="tel"
                    name="no_hp"
                    value={formData.no_hp}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Subjek</Form.Label>
                  <Form.Control
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Pesan</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Lampiran (Opsional - Maks. 10MB)</Form.Label>
                  <input
                    type="file"
                    className="dropify"
                    data-max-file-size="10M"
                    ref={dropifyRef}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Mengirim...' : 'Kirim'}
                </Button>
              </Form>
            </Card>
          </Col>
  
            {/* Informasi Kontak dan Lokasi */}
            <Col md={6}>
              <Card className="p-4">
                <h4>JR Konveksi</h4>
                <p>
                  <strong>Alamat:</strong><br />
                  Jl. Raya Dramaga, Bogor<br /><br />
                  <strong>Jam Operasional:</strong><br />
                  Senin - Jumat: 08.00 - 17.00<br />
                  Sabtu: 08.00 - 15.00<br />
                  Minggu: Tutup<br /><br />
                  <strong>Kontak:</strong><br />
                  WhatsApp: +62 812-XXXX-XXXX<br />
                  Email: JR@konveksi.com
                </p>
                <div className="mt-3">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.729046039927!2d106.7291066!3d-6.5607899!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c4b758d5c1b5%3A0x89b0802179c78bdf!2sInstitut%20Pertanian%20Bogor!5e0!3m2!1sid!2sid!4v1709865283044!5m2!1sid!2sid"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="lokasi"
                  ></iframe>
                </div>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    );
}