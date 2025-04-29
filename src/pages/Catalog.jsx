import React from 'react';

const Catalog = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Katalog Produk</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Add your catalog items here */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
          <h3 className="font-semibold mb-2">Produk 1</h3>
          <p className="text-gray-600 text-sm">Deskripsi produk akan ditampilkan di sini</p>
        </div>
      </div>
    </div>
  );
};

export default Catalog; 