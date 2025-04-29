// MapComponent.js
import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import AreaPolygon from './AreaPolygon';  
import 'bootstrap/dist/css/bootstrap.min.css';

function MapComponent() {
  const [areas, setAreas] = useState([]);
  const mapRef = useRef();

  useEffect(() => {
    async function fetchAreas() {
      return [
        {
          id: 1,
          name: "Wilayah A",
          users: 120,
          coordinates: [
            [-6.2000, 106.8167],
            [-6.2100, 106.8100],
            [-6.2200, 106.8200],
            [-6.2100, 106.8300]
          ]
        },
        {
          id: 2,
          name: "Wilayah B",
          users: 45,
          coordinates: [
            [-6.3000, 106.8167],
            [-6.3100, 106.8100],
            [-6.3200, 106.8200],
            [-6.3100, 106.8300]
          ]
        }
      ];
    }

    fetchAreas().then(data => {
      setAreas(data);
    });
  }, []);


  return (
    <MapContainer 
      center={[-6.2000, 106.8167]} zoom={12} 
      style={{ height: '800px', width: '100%' }} 
      ref={mapRef}
    >
      {/* Tile layer OpenStreetMap */} 
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Render AreaPolygon untuk setiap area */} 
      {areas.map(area => (
        <AreaPolygon key={area.id} area={area} />
      ))}

      {/* Legend warna di pojok kiri bawah */} 
      <div className="card legend-card">
        <div className="card-body">
          <h6 className="card-title">Jumlah User</h6>
          <div><span className="legend-box" style={{backgroundColor: '#ffeda0'}}></span> 0–20 user</div>
          <div><span className="legend-box" style={{backgroundColor: '#feb24c'}}></span> 21–50 user</div>
          <div><span className="legend-box" style={{backgroundColor: '#f03b20'}}></span> 51–100 user</div>
          <div><span className="legend-box" style={{backgroundColor: '#bd0026'}}></span> 101–150 user</div>
          <div><span className="legend-box" style={{backgroundColor: '#800026'}}></span> &gt;150 user</div>
        </div>
      </div>
    </MapContainer>
  );
}

export default MapComponent;
