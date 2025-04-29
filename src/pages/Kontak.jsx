import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const Kontak = () => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white rounded-lg shadow-sm p-6">
                {/* Contact Form Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-6">Kirimkan Pesanmu di Sini!</h2>
                    <form className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                id="email"
                                className="w-full p-2 border border-gray-300 rounded-md bg-[#F5E6E0]"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Nomor Telfon</label>
                            <input
                                type="tel"
                                id="phone"
                                className="w-full p-2 border border-gray-300 rounded-md bg-[#F5E6E0]"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="pesan" className="block text-sm font-medium text-gray-700 mb-1">Pesan</label>
                            <textarea
                                id="pesan"
                                rows="4"
                                className="w-full p-2 border border-gray-300 rounded-md bg-[#F5E6E0]"
                                required
                            ></textarea>
                        </div>
                        <div className="text-right">
                            <button
                                type="submit"
                                className="bg-[#7D5A50] text-white px-6 py-2 rounded-md hover:bg-[#6d4c42] transition-colors"
                            >
                                Kirim
                            </button>
                        </div>
                    </form>
                </div>

                {/* Location Section */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Kunjungi Kami</h2>
                    {/* Map Container */}
                    <div className="w-full h-64 bg-gray-200 mb-4 rounded-lg">
                        <iframe
                            title="JR Konveksi Location"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.4721877565483!2d106.8061131!3d-6.5847463!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c5b3927dcbf3%3A0x500c5e5d2d5e0f0!2sJR%20Konveksi!5e0!3m2!1sen!2sid!4v1620120000000!5m2!1sen!2sid"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            className="rounded-lg"
                        ></iframe>
                    </div>
                    
                    {/* Address */}
                    <p className="text-gray-600 text-sm mb-4">
                        Jl. Lodaya II, RT.02/RW.06, Babakan, Kecamatan Bogor Tengah, Kota Bogor, Jawa Barat 16128, Indonesia.
                    </p>

                    {/* WhatsApp Contact */}
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Atau Hubungi Melalui:</span>
                        <a
                            href="https://wa.me/your-whatsapp-number"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 bg-[#7D5A50] text-white px-4 py-2 rounded-md hover:bg-[#6d4c42] transition-colors"
                        >
                            <FaWhatsapp className="text-xl" />
                            <span>WhatsApp</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Kontak;