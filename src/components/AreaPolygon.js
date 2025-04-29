// AreaPolygon.js
import React from 'react';
import { Polygon, Popup } from 'react-leaflet';

// Fungsi bantu untuk menentukan warna berdasarkan jumlah user
function getColor(users) {
  if (users > 150) return '#800026';
  if (users > 100) return '#BD0026';
  if (users > 50)  return '#F03B20';
  if (users > 20)  return '#feb24c';
  return '#ffeda0';
}

function AreaPolygon({ area }) {
  const { name, users, coordinates } = area;
  const color = getColor(users);

  return (
    <Polygon 
      pathOptions={{ color: color, fillColor: color, fillOpacity: 0.5 }}
      positions={coordinates}
    >
      {/* Popup bertuliskan jumlah user di area ini */} 
      <Popup>
        <div className="card" style={{ width: '150px' }}>
          <div className="card-body p-2">
            <h6 className="card-title mb-1">{name}</h6>
            <p className="card-text mb-0">User login: {users}</p>
          </div>
        </div>
      </Popup>
    </Polygon>
  );
}

export default AreaPolygon;
