"use client"

import { useState, useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import axios from "axios"

// Komponen utama Peta Sebaran Pelanggan
const CustomerDistribution = () => {
  // State untuk menyimpan data pelanggan
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // State untuk pencarian
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredCustomers, setFilteredCustomers] = useState([])

  // State untuk pencarian lokasi
  const [locationSearch, setLocationSearch] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  // State untuk form tambah pelanggan
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    customerId: "",
    address: "",
    phone: "",
  })

  // State untuk koordinat yang dipilih dari peta
  const [selectedCoordinates, setSelectedCoordinates] = useState([-6.2, 106.8]) // Default ke Jakarta

  // State for polygon data
  const [polygonData, setPolygonData] = useState(null)
  const [showPolygons, setShowPolygons] = useState(false)
  const [polygonLoading, setPolygonLoading] = useState(false)

  // Fetch data pelanggan dari API
  const getCustomers = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      // Transformasi data untuk memastikan format yang benar untuk peta
      const formattedCustomers = res.data.data.map((customer) => ({
        ...customer,
        coordinates: [Number.parseFloat(customer.latitude) || 0, Number.parseFloat(customer.longitude) || 0],
      }))

      setCustomers(formattedCustomers)
      setFilteredCustomers(formattedCustomers)
      setError(null)
    } catch (err) {
      console.error("Error fetching customers:", err)
      setError("Gagal memuat data pelanggan")
    } finally {
      setLoading(false)
    }
  }

  // Fetch GeoJSON data untuk kabupaten/kota di Indonesia
  const fetchGeoJSONData = async () => {
    setPolygonLoading(true)
    try {
      // Menggunakan GeoJSON yang lebih detail untuk Jakarta dan Depok
      const response = await axios.get(
        "https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-province-simple.geojson",
      )

      if (response.data && response.data.features) {
        // Filter hanya untuk DKI Jakarta dan Jawa Barat (untuk Depok)
        const filteredFeatures = response.data.features.filter((feature) => {
          const name = feature.properties.name || ""
          return name.includes("Jakarta") || name.includes("Jawa Barat")
        })

        if (filteredFeatures.length > 0) {
          const filteredGeoJSON = {
            ...response.data,
            features: filteredFeatures,
          }

          console.log("Filtered GeoJSON loaded:", filteredFeatures.length, "features")
          setPolygonData(filteredGeoJSON)
        } else {
          console.error("No features found for Jakarta or Jawa Barat")
          setError("Tidak ditemukan data peta untuk Jakarta atau Jawa Barat")
        }
      } else {
        console.error("Invalid GeoJSON data structure")
        setError("Format data GeoJSON tidak valid")
      }
    } catch (err) {
      console.error("Error fetching GeoJSON data:", err)

      // Fallback to hardcoded GeoJSON if fetch fails
      console.log("Using fallback GeoJSON data")

      // Simplified but more accurate boundaries for Jakarta and Depok
      const fallbackGeoJSON = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              name: "DKI Jakarta",
              id: "jakarta",
            },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [106.681395, -6.104694],
                  [106.731863, -6.09434],
                  [106.801901, -6.085553],
                  [106.831427, -6.088123],
                  [106.880865, -6.097767],
                  [106.910734, -6.109693],
                  [106.947126, -6.126091],
                  [106.973219, -6.153753],
                  [106.978884, -6.186009],
                  [106.973048, -6.223271],
                  [106.958113, -6.255527],
                  [106.930647, -6.279618],
                  [106.89404, -6.293116],
                  [106.828035, -6.305042],
                  [106.781343, -6.309183],
                  [106.734651, -6.305042],
                  [106.695544, -6.293116],
                  [106.673228, -6.279618],
                  [106.652483, -6.255527],
                  [106.640557, -6.223271],
                  [106.636416, -6.186009],
                  [106.644345, -6.153753],
                  [106.660743, -6.126091],
                  [106.681395, -6.104694],
                ],
              ],
            },
          },
          {
            type: "Feature",
            properties: {
              name: "Depok",
              id: "depok",
            },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [106.743438, -6.347656],
                  [106.76409, -6.339727],
                  [106.788181, -6.335586],
                  [106.816505, -6.335586],
                  [106.840596, -6.339727],
                  [106.861248, -6.347656],
                  [106.877646, -6.359582],
                  [106.889572, -6.37598],
                  [106.893713, -6.396632],
                  [106.889572, -6.417284],
                  [106.877646, -6.433682],
                  [106.861248, -6.445608],
                  [106.840596, -6.453537],
                  [106.816505, -6.457678],
                  [106.788181, -6.457678],
                  [106.76409, -6.453537],
                  [106.743438, -6.445608],
                  [106.72704, -6.433682],
                  [106.715114, -6.417284],
                  [106.710973, -6.396632],
                  [106.715114, -6.37598],
                  [106.72704, -6.359582],
                  [106.743438, -6.347656],
                ],
              ],
            },
          },
        ],
      }

      setPolygonData(fallbackGeoJSON)
    } finally {
      setPolygonLoading(false)
    }
  }

  // Handler untuk pencarian pelanggan
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)

    if (!query) {
      setFilteredCustomers(customers)
      return
    }

    const filtered = customers.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(query) ||
        customer.address?.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query),
    )

    setFilteredCustomers(filtered)
  }

  // Handler untuk pencarian lokasi menggunakan Nominatim API
  const searchLocation = async () => {
    if (!locationSearch.trim()) return

    setIsSearching(true)
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: locationSearch,
          format: "json",
          limit: 5,
        },
      })

      setSearchResults(response.data)
    } catch (err) {
      console.error("Error searching location:", err)
      alert("Gagal mencari lokasi")
    } finally {
      setIsSearching(false)
    }
  }

  // Handler untuk memilih hasil pencarian lokasi
  const handleSelectLocation = (result) => {
    const lat = Number.parseFloat(result.lat)
    const lon = Number.parseFloat(result.lon)

    setSelectedCoordinates([lat, lon])
    setFormData((prev) => ({
      ...prev,
      address: result.display_name,
    }))

    setSearchResults([])
    setLocationSearch("")

    // Pindahkan peta ke lokasi yang dipilih
    if (window.map) {
      window.map.setView([lat, lon], 16)

      // Update marker jika sedang dalam mode form
      if (isFormOpen && window.draggableMarker) {
        window.draggableMarker.setLatLng([lat, lon])
      }
    }
  }

  // Handler untuk menambah pelanggan baru
  const handleAddCustomer = async () => {
    // Validasi form
    if (!formData.customerId || !formData.address) {
      alert("Pelanggan dan alamat harus diisi")
      return
    }

    try {
      // Implementasi API call untuk menambah/update lokasi pelanggan
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/addAlamat/${formData.customerId}`,
        {
          address: formData.address,
          latitude: selectedCoordinates[0],
          longitude: selectedCoordinates[1],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )

      // Refresh data pelanggan
      getCustomers()

      // Reset form
      setFormData({
        customerId: "",
        address: "",
        phone: "",
      })

      setIsFormOpen(false)
    } catch (err) {
      console.error("Error adding customer location:", err)
      alert("Gagal menambahkan lokasi pelanggan")
    }
  }

  // Handler untuk menghapus pelanggan
  const handleDeleteCustomer = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data lokasi pelanggan ini?")) {
      try {
        // Implementasi API call untuk menghapus lokasi pelanggan
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/users/delete-location/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        // Refresh data pelanggan
        getCustomers()
      } catch (err) {
        console.error("Error deleting customer location:", err)
        alert("Gagal menghapus lokasi pelanggan")
      }
    }
  }

  // Handler untuk perubahan input form
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Hitung total pesanan dari semua pelanggan
  const totalOrders = filteredCustomers.reduce((sum, customer) => sum + (customer.total_order || 0), 0)
  const formatPhoneNumber = (phone) => {
    // Hapus karakter non-digit
    const cleanedPhone = phone.replace(/\D/g, "")

    // Jika nomor dimulai dengan "08", ubah menjadi format internasional "62"
    if (cleanedPhone.startsWith("08")) {
      return `62${cleanedPhone.slice(1)}`
    }

    // Jika nomor sudah dimulai dengan "62", gunakan langsung
    if (cleanedPhone.startsWith("62")) {
      return cleanedPhone
    }

    // Jika nomor dimulai dengan "021", tambahkan awalan "62"
    if (cleanedPhone.startsWith("021")) {
      return `62${cleanedPhone}`
    }

    // Jika tidak sesuai dengan format di atas, kembalikan nomor asli
    return cleanedPhone
  }

  // Load data pelanggan saat komponen dimount
  useEffect(() => {
    getCustomers()
    fetchGeoJSONData()
  }, [])

  return (
    <div className="p-4 max-w-[100%] mx-auto">
      <h1 className="text-2xl font-bold mb-4">Peta Sebaran Pelanggan</h1>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari pelanggan berdasarkan nama, alamat, atau telepon..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* View Toggle Controls */}
      <div className="mb-4 flex space-x-2">
        <button
          onClick={() => setShowPolygons(false)}
          className={`px-4 py-2 rounded-md text-sm transition-colors duration-200 ${
            !showPolygons ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Tampilan Titik
        </button>
        <button
          onClick={() => setShowPolygons(true)}
          className={`px-4 py-2 rounded-md text-sm transition-colors duration-200 ${
            showPolygons ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Tampilan Wilayah
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Kolom kiri: Form dan Statistik */}
        <div className="lg:col-span-1 space-y-4">
          {/* Form Tambah Pelanggan */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold">Update Lokasi Pelanggan</h2>
              <button
                onClick={() => setIsFormOpen(!isFormOpen)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200"
              >
                {isFormOpen ? "Tutup Form" : "+ Update"}
              </button>
            </div>

            {isFormOpen && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Pelanggan</label>
                  <select
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">-- Pilih Pelanggan --</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} (Order: {customer.total_order || 0})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pencarian Lokasi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cari Lokasi</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      placeholder="Cari alamat atau tempat..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      onClick={searchLocation}
                      disabled={isSearching}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm transition-colors duration-200 disabled:bg-blue-300"
                    >
                      {isSearching ? "Mencari..." : "Cari"}
                    </button>
                  </div>

                  {/* Hasil Pencarian */}
                  {searchResults.length > 0 && (
                    <div className="mt-2 border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                      <ul className="divide-y divide-gray-200">
                        {searchResults.map((result, index) => (
                          <li
                            key={index}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => handleSelectLocation(result)}
                          >
                            {result.display_name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Alamat Lengkap"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                  <p className="text-xs text-gray-500 mb-2">
                    Geser marker pada peta atau gunakan pencarian untuk menentukan lokasi pelanggan
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm">
                      <span className="font-medium">Latitude:</span> {selectedCoordinates[0].toFixed(6)}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Longitude:</span> {selectedCoordinates[1].toFixed(6)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleAddCustomer}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 w-[100%] rounded-md text-sm transition-colors duration-200"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Statistik */}
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-blue-700">Total Pelanggan</h3>
              <p className="text-2xl font-bold text-blue-800">{filteredCustomers.length}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-green-700">Total Order</h3>
              <p className="text-2xl font-bold text-green-800">{totalOrders}</p>
            </div>
          </div>
        </div>

        {/* Kolom kanan: Peta */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-lg font-bold mb-2">Peta Lokasi</h2>
            {loading ? (
              <div className="h-[400px] w-full flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                  <p>Memuat peta...</p>
                </div>
              </div>
            ) : error ? (
              <div className="h-[400px] w-full flex items-center justify-center bg-red-50 rounded-lg">
                <div className="text-center text-red-500">
                  <p>{error}</p>
                  <button
                    onClick={getCustomers}
                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-[400px] w-full rounded-lg overflow-hidden">
                <MapComponent
                  customers={filteredCustomers}
                  selectedCoordinates={selectedCoordinates}
                  setSelectedCoordinates={setSelectedCoordinates}
                  isFormOpen={isFormOpen}
                  polygonData={polygonData}
                  showPolygons={showPolygons}
                  polygonLoading={polygonLoading}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabel Daftar Pelanggan */}
      <div className="bg-white rounded-lg shadow-lg p-4 mt-4">
        <h2 className="text-lg font-bold mb-3">Daftar Pelanggan</h2>
        {loading ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p>Memuat data pelanggan...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-4 py-2 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                    Alamat
                  </th>
                  <th className="px-4 py-2 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                    Telepon
                  </th>
                  <th className="px-4 py-2 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                    Koordinat
                  </th>
                  <th className="px-4 py-2 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                    Total Order
                  </th>
                  <th className="px-4 py-2 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-md font-medium text-gray-900">{customer.name}</div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="text-md text-gray-900 max-w-xs truncate">{customer.address || "-"}</div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-md text-gray-900">
                        {customer.phone ? (
                          <a
                            href={`https://wa.me/${formatPhoneNumber(customer.phone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {customer.phone}
                          </a>
                        ) : (
                          "-"
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-md text-gray-900">
                        {customer.latitude && customer.longitude
                          ? `${Number.parseFloat(customer.latitude).toFixed(6)}, ${Number.parseFloat(customer.longitude).toFixed(6)}`
                          : "-"}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-md font-medium text-gray-900">{customer.total_order || 0}</div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-2 py-1 rounded-full transition-colors duration-200"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredCustomers.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            {searchQuery ? "Tidak ada pelanggan yang sesuai dengan pencarian" : "Belum ada data pelanggan"}
          </div>
        )}
      </div>
    </div>
  )
}

// Komponen Peta menggunakan Leaflet
const MapComponent = ({
  customers,
  selectedCoordinates,
  setSelectedCoordinates,
  isFormOpen,
  polygonData,
  showPolygons,
  polygonLoading,
}) => {
  const mapRef = useRef(null)
  const mapContainerRef = useRef(null)
  const draggableMarkerRef = useRef(null)
  const markersRef = useRef({})
  const polygonLayerRef = useRef(null)

  // Function to determine if a customer is in a specific region
  const isCustomerInRegion = (customer, regionName) => {
    if (!customer.address || !regionName) return false

    const address = customer.address.toLowerCase()
    const region = regionName.toLowerCase()

    // Check for Jakarta
    if (region.includes("jakarta")) {
      return (
        address.includes("jakarta") ||
        address.includes("jkt") ||
        address.includes("dki") ||
        address.includes("condet") ||
        address.includes("kramat jati") ||
        (customer.latitude &&
          customer.longitude &&
          Number.parseFloat(customer.latitude) >= -6.4 &&
          Number.parseFloat(customer.latitude) <= -6.1 &&
          Number.parseFloat(customer.longitude) >= 106.7 &&
          Number.parseFloat(customer.longitude) <= 107.0)
      )
    }

    // Check for Jawa Barat / Depok
    if (region.includes("jawa barat") || region.includes("depok")) {
      return (
        address.includes("depok") ||
        address.includes("jawa barat") ||
        address.includes("west java") ||
        (customer.latitude &&
          customer.longitude &&
          Number.parseFloat(customer.latitude) >= -6.45 &&
          Number.parseFloat(customer.latitude) <= -6.35 &&
          Number.parseFloat(customer.longitude) >= 106.75 &&
          Number.parseFloat(customer.longitude) <= 106.9)
      )
    }

    return false
  }

  // Function to get color based on value
  const getColor = (value) => {
    return value > 20
      ? "#800026"
      : value > 15
        ? "#BD0026"
        : value > 10
          ? "#E31A1C"
          : value > 5
            ? "#FC4E2A"
            : value > 3
              ? "#FD8D3C"
              : value > 1
                ? "#FEB24C"
                : value > 0
                  ? "#FED976"
                  : "#FFEDA0"
  }

  // Function to style polygons
  const stylePolygon = (feature) => {
    if (!feature || !feature.properties) {
      console.warn("Invalid feature:", feature)
      return {
        fillColor: "#ccc",
        weight: 1,
        opacity: 0.5,
        color: "#999",
        fillOpacity: 0.2,
      }
    }

    // Get region name
    const regionName = feature.properties.name || ""

    // Find customers in this region
    const customersInRegion = customers.filter((customer) => isCustomerInRegion(customer, regionName))

    // Calculate total orders in this region
    const totalOrders = customersInRegion.reduce((sum, c) => sum + (c.total_order || 0), 0)

    // Get color based on total orders
    const color = getColor(totalOrders)

    return {
      fillColor: color,
      weight: 2,
      opacity: 1,
      color: "white",
      dashArray: "3",
      fillOpacity: 0.7,
    }
  }

  // Function to handle polygon click
  const onEachFeature = (feature, layer) => {
    if (!feature || !feature.properties) {
      console.warn("Invalid feature in onEachFeature:", feature)
      return
    }

    const regionName = feature.properties.name || ""

    // Find customers in this region
    const customersInRegion = customers.filter((customer) => isCustomerInRegion(customer, regionName))

    const count = customersInRegion.length
    const totalOrders = customersInRegion.reduce((sum, c) => sum + (c.total_order || 0), 0)

    layer.bindPopup(`
      <strong>${regionName}</strong><br>
      Jumlah Pelanggan: ${count}<br>
      Total Order: ${totalOrders}
    `)

    // Highlight polygon on hover
    layer.on({
      mouseover: () => {
        if (!layer.isPopupOpen()) {
          layer.setStyle({
            weight: 5,
            color: "#666",
            dashArray: "",
            fillOpacity: 0.7,
          })
          if (layer.bringToFront) {
            layer.bringToFront()
          }
        }
      },
      mouseout: () => {
        if (!layer.isPopupOpen() && polygonLayerRef.current) {
          polygonLayerRef.current.resetStyle(layer)
        }
      },
      click: () => {
        layer.setStyle({
          weight: 5,
          color: "#666",
          dashArray: "",
          fillOpacity: 0.7,
        })
        if (layer.bringToFront) {
          layer.bringToFront()
        }
      },
    })
  }

  useEffect(() => {
    // Fix Leaflet icon issues
    if (typeof window !== "undefined") {
      delete L.Icon.Default.prototype._getIconUrl

      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      })
    }

    // Initialize map if it doesn't exist yet
    if (!mapRef.current && mapContainerRef.current) {
      // Create map instance - center on Jakarta/Depok area
      mapRef.current = L.map(mapContainerRef.current).setView([-6.3, 106.8], 10)

      // Store map reference in window for access from outside component
      window.map = mapRef.current

      // Add OpenStreetMap tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current)

      // Add click handler to map
      mapRef.current.on("click", (e) => {
        if (isFormOpen) {
          setSelectedCoordinates([e.latlng.lat, e.latlng.lng])
        }
      })
    }

    // Add markers for customers
    const map = mapRef.current
    if (map) {
      // Clear existing markers (except draggable marker)
      Object.values(markersRef.current).forEach((marker) => {
        map.removeLayer(marker)
      })
      markersRef.current = {}

      // Add markers for each customer if not in polygon mode
      if (!showPolygons) {
        customers.forEach((customer) => {
          if (customer.latitude && customer.longitude) {
            const lat = Number.parseFloat(customer.latitude)
            const lng = Number.parseFloat(customer.longitude)

            if (!isNaN(lat) && !isNaN(lng)) {
              const marker = L.marker([lat, lng]).addTo(map)

              // Add popup with customer info
              marker.bindPopup(`
                <strong>${customer.name}</strong><br>
                ${customer.address || ""}<br>
                ${customer.phone || ""}<br>
                <strong>Total Order:</strong> ${customer.total_order || 0}
              `)

              // Store marker reference
              markersRef.current[customer.id] = marker
            }
          }
        })
      }

      // Add or update polygon layer
      if (showPolygons && polygonData) {
        // Remove existing polygon layer if it exists
        if (polygonLayerRef.current) {
          map.removeLayer(polygonLayerRef.current)
        }

        try {
          console.log("Adding polygon layer with data:", polygonData)

          // Add new polygon layer
          polygonLayerRef.current = L.geoJSON(polygonData, {
            style: stylePolygon,
            onEachFeature: onEachFeature,
          }).addTo(map)

          // Add a legend
          if (!map.legend) {
            const legend = L.control({ position: "bottomright" })

            legend.onAdd = (map) => {
              const div = L.DomUtil.create("div", "info legend")
              div.style.backgroundColor = "white"
              div.style.padding = "6px"
              div.style.borderRadius = "4px"
              div.style.boxShadow = "0 0 15px rgba(0,0,0,0.2)"

              // Add title
              div.innerHTML = '<h4 style="margin:0 0 5px 0; font-weight: bold;">Total Order per Wilayah</h4>'

              // Create legend for order intensity
              const grades = [0, 1, 3, 5, 10, 15, 20]

              // Loop through order intervals
              for (let i = 0; i < grades.length; i++) {
                div.innerHTML += `<div style="margin-bottom: 3px;">
                    <i style="background:${getColor(grades[i] + 1)}; width:18px; height:18px; float:left; margin-right:8px; opacity:0.7"></i> 
                    ${grades[i]}${grades[i + 1] ? ` - ${grades[i + 1]}` : "+"} orders
                  </div>`
              }

              return div
            }

            legend.addTo(map)
            map.legend = legend
          }

          // Zoom to fit polygon bounds
          if (polygonLayerRef.current.getBounds) {
            map.fitBounds(polygonLayerRef.current.getBounds(), { padding: [50, 50] })
          } else {
            // Fallback to Jakarta/Depok area
            map.setView([-6.3, 106.8], 10)
          }
        } catch (err) {
          console.error("Error rendering GeoJSON:", err)
        }
      } else if (!showPolygons && map.legend) {
        // Remove legend if not in polygon mode
        map.removeControl(map.legend)
        map.legend = null
      }

      // Add or update draggable marker if form is open
      if (isFormOpen) {
        if (draggableMarkerRef.current) {
          draggableMarkerRef.current.setLatLng(selectedCoordinates)
        } else {
          // Create draggable marker with custom icon
          const redIcon = new L.Icon({
            iconUrl:
              "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          })

          draggableMarkerRef.current = L.marker(selectedCoordinates, {
            draggable: true,
            icon: redIcon,
          }).addTo(map)

          // Store draggable marker reference in window for access from outside component
          window.draggableMarker = draggableMarkerRef.current

          draggableMarkerRef.current.bindPopup("Geser marker untuk memilih lokasi").openPopup()

          // Update coordinates when marker is dragged
          draggableMarkerRef.current.on("dragend", (e) => {
            const marker = e.target
            const position = marker.getLatLng()
            setSelectedCoordinates([position.lat, position.lng])
          })
        }
      } else if (draggableMarkerRef.current) {
        map.removeLayer(draggableMarkerRef.current)
        draggableMarkerRef.current = null
        window.draggableMarker = null
      }

      // Adjust map view to fit all markers if there are customers with valid coordinates
      if (!showPolygons) {
        const validCustomers = customers.filter(
          (c) =>
            c.latitude &&
            c.longitude &&
            !isNaN(Number.parseFloat(c.latitude)) &&
            !isNaN(Number.parseFloat(c.longitude)),
        )

        if (validCustomers.length > 0) {
          const bounds = validCustomers.map((c) =>
            L.latLng(Number.parseFloat(c.latitude), Number.parseFloat(c.longitude)),
          )

          if (bounds.length > 0) {
            map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50] })
          }
        }
      }
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        if (draggableMarkerRef.current) {
          mapRef.current.removeLayer(draggableMarkerRef.current)
        }
        if (polygonLayerRef.current) {
          mapRef.current.removeLayer(polygonLayerRef.current)
        }
      }
    }
  }, [customers, selectedCoordinates, setSelectedCoordinates, isFormOpen, polygonData, showPolygons])

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

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full" />
      {showPolygons && (
        <div className="absolute top-2 right-2 bg-white p-2 rounded-md shadow-md z-[1000] text-xs">
          <div className="font-bold mb-1">Tampilan Wilayah</div>
          {polygonLoading && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mb-1"></div>
              <span className="ml-1">Memuat data wilayah...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CustomerDistribution
