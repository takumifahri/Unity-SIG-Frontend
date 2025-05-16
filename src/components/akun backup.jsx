export default function AkunBackup() {
  return(
    <Tab.Pane eventKey="account">
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h4 className="mb-0">Informasi Akun</h4>
      {!isEditing && (
        <Button 
          variant="outline-primary" 
          onClick={handleEditToggle}
        >
          <i className="fas fa-edit me-2"></i>
          Edit Informasi
        </Button>
      )}
    </div>
    
    <Form onSubmit={handleInfoUpdate}>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Nama Lengkap</Form.Label>
            <Form.Control
              type="text"
              value={isEditing ? tempUserInfo.nama : userInfo.nama}
              onChange={(e) => setTempUserInfo({...tempUserInfo, nama: e.target.value})}
              disabled={!isEditing}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={isEditing ? tempUserInfo.email : userInfo.email}
              onChange={(e) => setTempUserInfo({...tempUserInfo, email: e.target.value})}
              disabled={!isEditing}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Nomor Telepon</Form.Label>
            <Form.Control
              type="tel"
              value={isEditing ? tempUserInfo.telepon : userInfo.telepon}
              onChange={(e) => setTempUserInfo({...tempUserInfo, telepon: e.target.value})}
              disabled={!isEditing}
              placeholder="Contoh: 08123456789"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Gender</Form.Label>
            <Form.Select
              value={isEditing ? tempUserInfo.gender : userInfo.gender}
              onChange={(e) => setTempUserInfo({...tempUserInfo, gender: e.target.value})}
              disabled={!isEditing}
            >
              <option value="">Pilih Gender</option>
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      
      {/* Display user role (read-only) */}
      <Form.Group className="mb-3">
        <Form.Label>Alamat Lengkap</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          name="address"
          value={isEditing ? tempUserInfo.address : userInfo.address}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
      </Form.Group>

      {isEditing && (
        <div className="mb-4" style={{ height: '300px', borderRadius: '10px', overflow: 'hidden' }}>
          <MapContainer 
            center={mapPosition} 
            zoom={15} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker 
              position={mapPosition} 
              setPosition={setMapPosition}
              setUserInfo={setTempUserInfo} 
            />
          </MapContainer>
        </div>
      )}

      {isEditing && (
        <div className="d-flex gap-2">
          <Button type="submit" variant="primary">
            Simpan Perubahan
          </Button>
          <Button type="button" variant="secondary" onClick={handleEditToggle}>
            Batal
          </Button>
        </div>
      )}
    </Form>
  </Tab.Pane>
  )
}