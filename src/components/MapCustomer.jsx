"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix Leaflet icon issues
const fixLeafletIcon = () => {
  // Only run this once
  if (typeof window !== "undefined") {
    // Fix marker icons
    delete L.Icon.Default.prototype._getIconUrl

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    })
  }
}

const Map = ({ customers }) => {
  const mapRef = useRef(null)
  const mapContainerRef = useRef(null)

  useEffect(() => {
    // Fix Leaflet icon issues
    fixLeafletIcon()

    // Initialize map if it doesn't exist yet
    if (!mapRef.current && mapContainerRef.current) {
      // Create map instance
      mapRef.current = L.map(mapContainerRef.current).setView([-7.2575, 112.7521], 12)

      // Add OpenStreetMap tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current)
    }

    // Add markers for customers
    const map = mapRef.current
    if (map) {
      // Clear existing markers
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer)
        }
      })

      // Add markers for each customer
      customers.forEach((customer) => {
        const { coordinates, name, address, phone } = customer

        if (coordinates && coordinates.length === 2) {
          const marker = L.marker([coordinates[0], coordinates[1]]).addTo(map)

          // Add popup with customer info
          marker.bindPopup(`
            <strong>${name}</strong><br>
            ${address}<br>
            ${phone}
          `)
        }
      })

      // Adjust map view to fit all markers if there are customers
      if (customers.length > 0) {
        const bounds = customers
          .filter((c) => c.coordinates && c.coordinates.length === 2)
          .map((c) => L.latLng(c.coordinates[0], c.coordinates[1]))

        if (bounds.length > 0) {
          map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50] })
        }
      }
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [customers])

  // Handle window resize to make map responsive
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize()
      }
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <div ref={mapContainerRef} className="h-full w-full rounded-lg" />
}

export default Map
