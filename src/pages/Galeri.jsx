import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Galeri = () => {
    const [currentPage, setCurrentPage] = useState(0);
    
    // Sample data - replace with your actual gallery items
    const galleryItems = [
        [
            { id: 1, image: 'https://via.placeholder.com/400x300' },
            { id: 2, image: 'https://via.placeholder.com/400x300' },
            { id: 3, image: 'https://via.placeholder.com/400x300' },
            { id: 4, image: 'https://via.placeholder.com/400x300' },
            { id: 5, image: 'https://via.placeholder.com/400x300' },
            { id: 6, image: 'https://via.placeholder.com/400x300' },
            { id: 7, image: 'https://via.placeholder.com/400x300' },
            { id: 8, image: 'https://via.placeholder.com/400x300' },
            { id: 9, image: 'https://via.placeholder.com/400x300' },
        ],
        [
            { id: 10, image: 'https://via.placeholder.com/400x300' },
            { id: 11, image: 'https://via.placeholder.com/400x300' },
            { id: 12, image: 'https://via.placeholder.com/400x300' },
            { id: 13, image: 'https://via.placeholder.com/400x300' },
            { id: 14, image: 'https://via.placeholder.com/400x300' },
            { id: 15, image: 'https://via.placeholder.com/400x300' },
            { id: 16, image: 'https://via.placeholder.com/400x300' },
            { id: 17, image: 'https://via.placeholder.com/400x300' },
            { id: 18, image: 'https://via.placeholder.com/400x300' },
        ],
        // Add more arrays of 9 items for more pages
    ];

    const handlePrevious = () => {
        setCurrentPage(prev => 
            prev === 0 ? galleryItems.length - 1 : prev - 1
        );
    };

    const handleNext = () => {
        setCurrentPage(prev => 
            prev === galleryItems.length - 1 ? 0 : prev + 1
        );
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8"></h1>
            
            <div className="relative">
                {/* Left Navigation Arrow */}
                <button 
                    onClick={handlePrevious}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors z-10"
                    aria-label="Previous page"
                >
                    <FaChevronLeft className="w-6 h-6 text-[#7D5A50]" />
                </button>

                {/* Gallery Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-8">
                    {galleryItems[currentPage]?.map((item) => (
                        <div 
                            key={item.id} 
                            className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                        >
                            <img
                                src={item.image}
                                alt={`Gallery item ${item.id}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>

                {/* Right Navigation Arrow */}
                <button 
                    onClick={handleNext}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors z-10"
                    aria-label="Next page"
                >
                    <FaChevronRight className="w-6 h-6 text-[#7D5A50]" />
                </button>
            </div>

            {/* Page Indicators */}
            <div className="flex justify-center mt-8 gap-2">
                {galleryItems.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentPage(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            currentPage === index 
                                ? 'bg-[#7D5A50] scale-125' 
                                : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to page ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Galeri; 