"use client"

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
      if (!position || !position[0] || !position[1]) return

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
          <div className="mb-2">
            <strong>Koordinat:</strong> {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </div>

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
