import React from 'react';

const TentangKami = () => {
  return (
    <div className="w-full">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Logo Section */}
          <div className="w-full flex items-center justify-center">
            <img 
              src="/assets/logo.png" 
              alt="JR Konveksi Logo" 
              className="w-full max-w-md h-auto object-contain"
            />
          </div>
          
          {/* Description Section */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Deskripsi Singkat</h2>
            <p className="text-gray-600 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        </div>

        {/* Photo Section */}
        <div className="bg-gray-200 h-64 mb-12 rounded-lg flex items-center justify-center">
          <span className="text-2xl text-gray-600">Foto</span>
        </div>

        {/* Quote Section */}
        <div className="text-center mb-12">
          <p className="text-xl italic">"Kutipan singkat dari JR konveksi"</p>
        </div>

        {/* Services Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-8 text-center">Jasa Kami</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((index) => (
              <div key={index} className="bg-gray-200 rounded-full aspect-square flex flex-col items-center justify-center p-4">
                <div className="text-xl mb-2">Jasa {index}</div>
                <p className="text-sm text-center">Deskripsi singkat jasanya</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TentangKami;