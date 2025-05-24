import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { Box, Typography } from '@mui/material';

const DeliveryTrackingMap = ({ userCoords, orderStatus }) => {
  // JR Konveksi coordinates (hardcoded)
  const shopCoords = [-6.4072857, 106.7687122];
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routingControlRef = useRef(null);
  const markersRef = useRef([]);
  const deliveryMarkerRef = useRef(null);
  const animationRef = useRef(null);

  // Fix Leaflet icon issue
  useEffect(() => {
    // Fix Leaflet icon issues
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });

    return () => {
      // Clean up any ongoing animations when component unmounts
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  // Initialize map once component mounts
  useEffect(() => {
    if (!mapRef.current || !userCoords || !Array.isArray(userCoords) || userCoords.length < 2) return;

    // Convert to floats to ensure proper handling
    const userLat = parseFloat(userCoords[0]);
    const userLng = parseFloat(userCoords[1]);
    
    if (isNaN(userLat) || isNaN(userLng)) return;

    // Clean up previous map instance if it exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Clean up previous markers
    markersRef.current.forEach(marker => {
      if (marker) marker.remove();
    });
    markersRef.current = [];

    // Calculate center point between shop and user
    const centerLat = (userLat + shopCoords[0]) / 2;
    const centerLng = (userLng + shopCoords[1]) / 2;

    // Create map
    const map = L.map(mapRef.current).setView([centerLat, centerLng], 12);
    mapInstanceRef.current = map;

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Custom icons
    const shopIcon = L.divIcon({
      html: `<div style="background-color: #4285F4; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #4285F4;"></div>`,
      className: 'custom-div-icon',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const userIcon = L.divIcon({
      html: `<div style="background-color: #DB4437; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #DB4437;"></div>`,
      className: 'custom-div-icon',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const deliveryIcon = L.divIcon({
      html: `<div style="background-color: #0F9D58; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #0F9D58;"></div>`,
      className: 'custom-div-icon',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    // Add markers
    const userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(map);
    userMarker.bindPopup("<b>Lokasi Pelanggan</b><br>Tujuan pengiriman");
    markersRef.current.push(userMarker);

    const shopMarker = L.marker(shopCoords, { icon: shopIcon }).addTo(map);
    shopMarker.bindPopup("<b>JR Konveksi</b><br>Lokasi toko");
    markersRef.current.push(shopMarker);

    // Set up routing
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(shopCoords[0], shopCoords[1]),
        L.latLng(userLat, userLng)
      ],
      lineOptions: {
        styles: [{ color: '#D9B99B', opacity: 0.8, weight: 5 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      },
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      createMarker: () => null // Don't create default markers
    }).addTo(map);

    routingControlRef.current = routingControl;

    // If order is in delivery, add animated delivery marker
    if (orderStatus === 'Sedang_Dikirim') {
      routingControl.on('routesfound', function(e) {
        const routes = e.routes;
        if (routes && routes.length > 0) {
          const route = routes[0];
          const coordinates = route.coordinates;
          
          // Clean up any previous animation
          if (animationRef.current) {
            clearInterval(animationRef.current);
          }
          
          // Remove existing delivery marker
          if (deliveryMarkerRef.current) {
            deliveryMarkerRef.current.remove();
          }
          
          // Create new delivery marker at the start point
          const deliveryMarker = L.marker([shopCoords[0], shopCoords[1]], { icon: deliveryIcon }).addTo(map);
          deliveryMarker.bindPopup("<b>Kurir</b><br>Sedang dalam perjalanan");
          deliveryMarkerRef.current = deliveryMarker;
          
          // Animate marker along the route
          let i = 0;
          animationRef.current = setInterval(() => {
            if (i < coordinates.length - 1) {
              deliveryMarker.setLatLng([coordinates[i].lat, coordinates[i].lng]);
              i++;
            } else {
              clearInterval(animationRef.current);
            }
          }, 500); // Move every 500ms
        }
      });
    }

    // Create bounds for zooming
    const bounds = L.latLngBounds(
      L.latLng(userLat, userLng),
      L.latLng(shopCoords[0], shopCoords[1])
    );
    map.fitBounds(bounds, { padding: [50, 50] });

    // Add legend
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function() {
      const div = L.DomUtil.create('div', 'info legend');
      div.style.backgroundColor = 'white';
      div.style.padding = '8px';
      div.style.borderRadius = '4px';
      div.style.boxShadow = '0 1px 5px rgba(0,0,0,0.2)';
      div.style.fontSize = '12px';
      
      div.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 5px">
          <div style="width: 15px; height: 4px; background-color: #D9B99B; margin-right: 5px"></div>
          <span>Rute pengiriman</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 5px">
          <div style="width: 12px; height: 12px; background-color: #4285F4; border-radius: 50%; margin-right: 5px; border: 2px solid white; box-shadow: 0 0 0 1px #4285F4"></div>
          <span>JR Konveksi</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 5px">
          <div style="width: 12px; height: 12px; background-color: #DB4437; border-radius: 50%; margin-right: 5px; border: 2px solid white; box-shadow: 0 0 0 1px #DB4437"></div>
          <span>Pelanggan</span>
        </div>
        ${orderStatus === 'Sedang_Dikirim' ? `
        <div style="display: flex; align-items: center;">
          <div style="width: 12px; height: 12px; background-color: #0F9D58; border-radius: 50%; margin-right: 5px; border: 2px solid white; box-shadow: 0 0 0 1px #0F9D58"></div>
          <span>Kurir</span>
        </div>` : ''}
      `;
      return div;
    };
    legend.addTo(map);

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (routingControlRef.current) {
        routingControlRef.current = null;
      }
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
      markersRef.current = [];
      deliveryMarkerRef.current = null;
    };
  }, [userCoords, orderStatus]); // Re-initialize map if coordinates or status change

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
      {(!userCoords || !Array.isArray(userCoords) || userCoords.length < 2) && (
        <Box sx={{ 
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f5f5'
        }}>
          <Typography variant="body1" color="text.secondary">
            Koordinat lokasi tidak tersedia
          </Typography>
        </Box>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </Box>
  );
};

export default DeliveryTrackingMap;