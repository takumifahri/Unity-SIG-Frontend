// Fixed component code that properly handles undefined/null coordinates

import { useEffect, useState } from "react"
import axios from "axios"

const LocationInfo = ({ position, isEditing, address }) => {
  const [locationInfo, setLocationInfo] = useState({
    display_name: "",
    address: {
      road: "",
      city: "",
      state: "",
      country: "",
      postcode: "",
    },
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchLocationInfo = async () => {
      // Check if position contains valid coordinates
      if (!position || !Array.isArray(position) || position.length < 2 || 
          typeof position[0] !== 'number' || typeof position[1] !== 'number') {
        return;
      }

      setLoading(true)
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
          params: {
            lat: position[0],
            lon: position[1],
            format: "json",
          },
        })

        setLocationInfo(response.data)
      } catch (error) {
        console.error("Error fetching location info:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLocationInfo()
  }, [position])

  // Check if position is a valid array with two numeric elements
  const hasValidCoordinates = Array.isArray(position) && 
    position.length >= 2 && 
    typeof position[0] === 'number' && 
    !isNaN(position[0]) &&
    typeof position[1] === 'number' && 
    !isNaN(position[1]);

  return (
    <div className="mt-3 mb-4 p-3 border rounded bg-light">
      <h6 className="mb-2">Informasi Lokasi</h6>

      {loading ? (
        <div className="d-flex align-items-center">
          <div className="spinner-border spinner-border-sm me-2" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span>Memuat informasi lokasi...</span>
        </div>
      ) : (
        <div>
          {hasValidCoordinates ? (
            <div className="mb-2">
              <strong>Koordinat:</strong> {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </div>
          ) : (
            <div className="mb-2 text-muted">
              <strong>Koordinat:</strong> Tidak tersedia
            </div>
          )}

          {address ? (
            <div className="mb-2">
              <strong>Alamat:</strong> {address}
            </div>
          ) : locationInfo.display_name ? (
            <div className="mb-2">
              <strong>Alamat:</strong> {locationInfo.display_name}
            </div>
          ) : (
            <div className="text-muted">Alamat tidak tersedia</div>
          )}

          {isEditing && <small className="text-muted">Alamat ini akan digunakan sebagai alamat pengiriman Anda.</small>}
        </div>
      )}
    </div>
  )
}

export default LocationInfo