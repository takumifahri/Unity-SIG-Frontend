import { Box, Button, TextField } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const Kontak = () => {
    const [ulasam, setUlasan] = useState([])
    const sendUlasan = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        console.log(data);

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/contact-us`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.status === 200) {
                alert('Pesan berhasil dikirim!');
            } else {
                alert('Gagal mengirim pesan.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat mengirim pesan.');
        }
    };

    useEffect(() => {
        // Any initialization logic if needed
    }, []);
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white rounded-lg shadow-sm p-6">
                {/* Contact Form Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-6">Kirimkan Pesanmu di Sini!</h2>
                    <form action={sendUlasan} className="space-y-4">
                        <Box sx={{ width: 1500, maxWidth: '100%' }}>
                            <TextField fullWidth label="Nama" placeholder='Contoh : Rafii Alexander' id="name"  />
                        </Box>
                        <Box sx={{ width: 1500, maxWidth: '100%' }}>
                            <TextField fullWidth label="email" placeholder='Contoh : Rafi@gmail.com' id="email"/>
                        </Box>
                        {/* <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Nomor Telfon</label>
                            <input
                                type="tel"
                                id="phone"
                                className="w-full p-2 border border-gray-300 rounded-md bg-[#F5E6E0]"
                                required
                            />
                        </div> */}
                        <Box sx={{ width: 1500, maxWidth: '100%' }}>
                            <TextField fullWidth label="phone" placeholder='Contoh : 081232312312' id="phone" required />
                        </Box>
                        {/* <div>
                            <label htmlFor="pesan" className="block text-sm font-medium text-gray-700 mb-1">Pesan</label>
                            <textarea
                                id="pesan"
                                rows="4"
                                className="w-full p-2 border border-gray-300 rounded-md bg-[#F5E6E0]"
                                required
                            ></textarea> */}
                        <Box sx={{ width: 1500, maxWidth: '100%' }}>
                            <TextField fullWidth label="pesan" id="pesan" />
                        </Box>

                        {/* </div> */}
                        <div className="text-right">
                            <Button
                                variant='contained'
                                type="submit"
                                style={{backgroundColor: '#7D5A50'}}
                                className=" text-white w-[100%] px-6 py-2 rounded-md hover:bg-[#6d4c42] transition-colors"
                            >
                                Kirim
                            </Button>
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
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126875.13274175681!2d106.67647087919927!3d-6.413583848270743!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69e9000b2ae0db%3A0x43461f59f5af9d27!2sJR%20Konveksi!5e0!3m2!1sen!2sid!4v1746321615003!5m2!1sen!2sid   "
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
                        Jln. Haji Sulaiman Bedahan, Perumahan Griya Perigi Blk. B1 No.12 RT06, RW.08, KelBedahanKec, Kec. Sawangan, Kota Depok, Jawa Barat 16519
                    </p>

                    {/* WhatsApp Contact */}
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Atau Hubungi Melalui:</span>
                        <a
                            href="https://wa.me/your-whatsapp-number"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex no-underline items-center space-x-2 bg-[#7D5A50] text-white px-4 py-2 rounded-md hover:bg-[#6d4c42] transition-colors"
                        >
                            <FaWhatsapp className="text-xl" />
                            <span className=' no-underline'>WhatsApp</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Kontak;