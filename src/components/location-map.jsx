import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Add custom CSS to control Leaflet's z-index
const customMapStyle = `
  .leaflet-container,
  .leaflet-control-container,
  .leaflet-pane,
  .leaflet-top,
  .leaflet-bottom {
    z-index: 1 !important;
  }
  
  .leaflet-control {
    z-index: 400 !important;
  }
  
  .leaflet-pane {
    z-index: 200 !important;
  }
  
  .leaflet-marker-pane {
    z-index: 300 !important;
  }
`;

const LocationMap = ({ position, setPosition }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Check if position is valid (has valid coordinates)
  const hasValidPosition = Array.isArray(position) && position.length >= 2 && 
    typeof position[0] === 'number' && !isNaN(position[0]) &&
    typeof position[1] === 'number' && !isNaN(position[1]);
  
  // Default position (Jakarta, Indonesia) if no valid position is provided
  const defaultPosition = [-6.200000, 106.816666];
  
  // Use valid position or default
  const mapPosition = hasValidPosition ? position : defaultPosition;

  useEffect(() => {
    // Only initialize if map instance doesn't exist
    if (!mapInstanceRef.current && mapRef.current) {
      // Initialize map
      mapInstanceRef.current = L.map(mapRef.current).setView(mapPosition, 13);

      // Add OpenStreetMap tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstanceRef.current);

      // Add marker at initial position if valid
      if (hasValidPosition) {
        markerRef.current = L.marker(mapPosition, { draggable: true })
          .addTo(mapInstanceRef.current)
          .on("dragend", (e) => {
            const marker = e.target;
            const position = marker.getLatLng();
            setPosition([position.lat, position.lng]);
          });
      }

      // Handle click on map to set marker
      mapInstanceRef.current.on("click", (e) => {
        const { lat, lng } = e.latlng;
        
        // Update marker position or create a new one if it doesn't exist
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { draggable: true })
            .addTo(mapInstanceRef.current)
            .on("dragend", (e) => {
              const marker = e.target;
              const position = marker.getLatLng();
              setPosition([position.lat, position.lng]);
            });
        }

        // Update position state
        setPosition([lat, lng]);
      });
    }

    // Clean up function to prevent memory leaks
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [mapRef, hasValidPosition, mapPosition, setPosition]); // Added dependencies

  // Update map view when position changes and map is already initialized
  useEffect(() => {
    if (mapInstanceRef.current && hasValidPosition) {
      mapInstanceRef.current.setView(mapPosition, 13);
      
      // Update marker position or create new marker
      if (markerRef.current) {
        markerRef.current.setLatLng(mapPosition);
      } else {
        markerRef.current = L.marker(mapPosition, { draggable: true })
          .addTo(mapInstanceRef.current)
          .on("dragend", (e) => {
            const marker = e.target;
            const position = marker.getLatLng();
            setPosition([position.lat, position.lng]);
          });
      }
    }
  }, [position, hasValidPosition, mapPosition, setPosition]); // Added dependencies

  return (
    <>
      {/* Add the style element to control Leaflet z-index */}
      <style>{customMapStyle}</style>
      
      <div 
        ref={mapRef} 
        style={{ 
          height: "400px", 
          width: "100%",
          position: "relative",
          zIndex: 1 // Explicitly set container z-index
        }} 
      />
    </>
  );
};

export default LocationMap;