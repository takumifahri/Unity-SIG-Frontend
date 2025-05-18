"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const LocationMap = ({ position, setPosition }) => {
  const mapRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      // Fix Leaflet icon issues
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      })

      // Create map
      const map = L.map("location-map").setView(position, 13)

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      // Add click handler to map
      map.on("click", (e) => {
        const { lat, lng } = e.latlng
        setPosition([lat, lng])
      })

      // Create marker
      markerRef.current = L.marker(position, { draggable: true }).addTo(map)

      // Add drag end event
      markerRef.current.on("dragend", () => {
        const { lat, lng } = markerRef.current.getLatLng()
        setPosition([lat, lng])
      })

      mapRef.current = map
    }

    // Update marker position when position prop changes
    if (markerRef.current && mapRef.current) {
      markerRef.current.setLatLng(position)
      mapRef.current.setView(position, mapRef.current.getZoom())
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
  }, [position, setPosition])

  return <div id="location-map" style={{ height: "400px", width: "100%", borderRadius: "8px" }}></div>
}

export default LocationMap
