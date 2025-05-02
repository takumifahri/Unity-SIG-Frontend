import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Galeri = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sample data - replace with your actual gallery items
  const galleryItems = [
    [
      { id: 1, image: '/gallery/image1.jpg' },
      { id: 2, image: '/gallery/image2.jpg' },
      { id: 3, image: '/gallery/image3.jpg' },
      { id: 4, image: '/gallery/image4.jpg' },
      { id: 5, image: '/gallery/image5.jpg' },
      { id: 6, image: '/gallery/image6.jpg' },
      { id: 7, image: '/gallery/image7.jpg' },
      { id: 8, image: '/gallery/image8.jpg' },
      { id: 9, image: '/gallery/image9.jpg' },
    ],
    [
      { id: 10, image: '/gallery/image10.jpg' },
      { id: 11, image: '/gallery/image11.jpg' },
      { id: 12, image: '/gallery/image12.jpg' },
      { id: 13, image: '/gallery/image13.jpg' },
      { id: 14, image: '/gallery/image14.jpg' },
      { id: 15, image: '/gallery/image15.jpg' },
      { id: 16, image: '/gallery/image16.jpg' },
      { id: 17, image: '/gallery/image17.jpg' },
      { id: 18, image: '/gallery/image18.jpg' },
    ],
    // Add more arrays of 9 items for more pages
  ];

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? galleryItems.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === galleryItems.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8"></h1>
      
      <div className="relative">
        {/* Left Arrow */}
        <button 
          onClick={handlePrevious}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-black/5 transition-colors cursor-pointer z-10"
        >
          <FaChevronLeft className="w-8 h-8 text-[#8B4513]" />
        </button>

        {/* Right Arrow */}
        <button 
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-black/5 transition-colors cursor-pointer z-10"
        >
          <FaChevronRight className="w-8 h-8 text-[#8B4513]" />
        </button>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {galleryItems[currentIndex].map((item) => (
            <div 
              key={item.id} 
              className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* Placeholder for images - replace with actual images */}
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-500">Image {item.id}</span>
              </div>
              {/* Uncomment below and remove above div when you have actual images */}
              {/* <img
                src={item.image}
                alt={`Gallery item ${item.id}`}
                className="w-full h-full object-cover"
              /> */}
            </div>
          ))}
        </div>
      </div>

      {/* Page Indicators */}
      <div className="flex justify-center mt-8 gap-2">
        {galleryItems.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentIndex === index 
                ? 'bg-[#8B4513] scale-110' 
                : 'bg-gray-300 hover:bg-[#8B4513]/50'
            }`}
            aria-label={`Go to page ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Galeri; 