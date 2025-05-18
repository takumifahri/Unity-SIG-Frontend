import { useState } from "react"

const AddCustomerForm = ({ onAddCustomer }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    latitude: "",
    longitude: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate form
    if (!formData.name || !formData.address || !formData.phone || !formData.latitude || !formData.longitude) {
      alert("Semua field harus diisi")
      return
    }

    // Create new customer
    const newCustomer = {
      id: Date.now(), // Simple ID generation
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      coordinates: [Number.parseFloat(formData.latitude), Number.parseFloat(formData.longitude)],
    }

    // Add customer
    onAddCustomer(newCustomer)

    // Reset form
    setFormData({
      name: "",
      address: "",
      phone: "",
      latitude: "",
      longitude: "",
    })

    // Close form
    setIsOpen(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {!isOpen ? (
        <div>
          <h2 className="text-xl font-bold mb-2">Tambah Pelanggan</h2>
          <button
            onClick={() => setIsOpen(true)}
            className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            + Tambah Pelanggan Baru
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <h2 className="text-xl font-bold mb-2">Tambah Pelanggan Baru</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pelanggan</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nama Pelanggan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nomor Telepon"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Alamat Lengkap"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="-7.2575"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="112.7521"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition-colors duration-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
            >
              Simpan
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default AddCustomerForm
