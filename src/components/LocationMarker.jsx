import React, { useEffect, useRef } from 'react';
import { Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

// Import icon untuk marker
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Definisikan icon default untuk marker
const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function LocationMarker({ position, setPosition, setUserInfo }) {
  const markerRef = useRef(null);

  // Fungsi untuk mendapatkan alamat dari koordinat (reverse geocoding)
  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat: lat,
          lon: lng,
          format: 'json',
          addressdetails: 1,
        },
        headers: {
          'Accept-Language': 'id', // Bahasa Indonesia
        }
      });

      if (response.data && response.data.display_name) {
        // Update user info dengan alamat yang diperoleh
        setUserInfo(prev => ({
          ...prev,
          address: response.data.display_name,
          latitude: lat,
          longitude: lng
        }));
      }
    } catch (error) {
      console.error('Error melakukan reverse geocoding:', error);
    }
  };

  // Tangani klik pada peta untuk mengubah posisi marker
  const map = useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      getAddressFromCoordinates(lat, lng);
    },
  });

  // Update posisi peta ketika position berubah
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  // Tangani event drag selesai pada marker
  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        const newPosition = marker.getLatLng();
        setPosition([newPosition.lat, newPosition.lng]);
        getAddressFromCoordinates(newPosition.lat, newPosition.lng);
      }
    },
  };

  return position ? (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={defaultIcon}
    />
  ) : null;
}

export default LocationMarker;