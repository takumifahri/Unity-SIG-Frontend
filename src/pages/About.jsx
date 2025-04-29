import React from 'react';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Tentang Kami</h1>
        <div className="prose prose-lg mx-auto">
          <p className="mb-4">
            Selamat datang di JR Konveksi. Kami adalah perusahaan yang bergerak di bidang produksi pakaian
            dengan pengalaman bertahun-tahun dalam industri konveksi.
          </p>
          <p className="mb-4">
            Kami berkomitmen untuk memberikan produk berkualitas tinggi dengan harga yang kompetitif
            dan pelayanan yang memuaskan kepada setiap pelanggan kami.
          </p>
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Visi</h2>
            <p className="mb-4">
              Menjadi perusahaan konveksi terpercaya dengan standar kualitas internasional.
            </p>
          </div>
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Misi</h2>
            <ul className="list-disc pl-6">
              <li>Mengutamakan kepuasan pelanggan</li>
              <li>Menghasilkan produk berkualitas tinggi</li>
              <li>Memberikan pelayanan yang profesional</li>
              <li>Mengembangkan inovasi dalam desain dan produksi</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 