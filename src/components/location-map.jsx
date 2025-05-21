import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
  }, [mapRef]); // Only run on mount and unmount

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
  }, [position]);

  return <div ref={mapRef} style={{ height: "400px", width: "100%" }} />;
};

export default LocationMap;