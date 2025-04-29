import React, { useState } from 'react';

const Kontak = () => {
  const [formData, setFormData] = useState({
    email: '',
    noTelpon: '',
    pesan: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Form Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Kirimkan Pesanmu di Sini!</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 rounded-md bg-[#F2E5D7] border-none focus:ring-2 focus:ring-[#8B4513]"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Nomor Telfon</label>
              <input
                type="tel"
                name="noTelpon"
                value={formData.noTelpon}
                onChange={handleChange}
                className="w-full p-3 rounded-md bg-[#F2E5D7] border-none focus:ring-2 focus:ring-[#8B4513]"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Pesan</label>
              <textarea
                name="pesan"
                value={formData.pesan}
                onChange={handleChange}
                rows="4"
                className="w-full p-3 rounded-md bg-[#F2E5D7] border-none focus:ring-2 focus:ring-[#8B4513]"
                required
              ></textarea>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="bg-[#8B4513] text-white px-6 py-2 rounded-md hover:bg-[#7D5A50] transition-colors"
            >
              Kirim
            </button>
          </div>
        </form>
      </div>

      {/* Map Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Kunjungi Kami</h2>
        <div className="mb-6">
          <div className="w-full h-[300px] bg-gray-200 rounded-lg mb-4">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.729046039927!2d106.7291066!3d-6.5607899!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c4b758d5c1b5%3A0x89b0802179c78bdf!2sInstitut%20Pertanian%20Bogor!5e0!3m2!1sid!2sid!4v1709865283044!5m2!1sid!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg"
            ></iframe>
          </div>
          <p className="text-gray-700 mb-4">
            Jl. Lodaya II, RT.02/RW.06, Babakan, Kecamatan Bogor Tengah, Kota Bogor, Jawa Barat 16128, Indonesia.
          </p>
          <div className="flex items-center space-x-2">
            <img src="/whatsapp-icon.png" alt="WhatsApp" className="w-6 h-6" />
            <div className="bg-[#8B4513] text-white px-4 py-2 rounded-md">
              Hubungi Kami di WhatsApp
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kontak;