import React from 'react';

const About = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Logo and Description Section */}
            <div className="flex flex-col md:flex-row items-start gap-8 mb-12">
                <div className="w-full md:w-1/3 bg-gray-200 p-8 rounded-lg">
                    <h2 className="text-3xl font-bold text-brown-800 mb-4">Logo</h2>
                </div>
                <div className="w-full md:w-2/3">
                    <h2 className="text-2xl font-bold mb-4">Deskripsi Singkat</h2>
                    <p className="text-gray-600">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                        dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                        aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
                        cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
                        officia deserunt mollit anim id est laborum.
                    </p>
                </div>
            </div>

            {/* Photo Section */}
            <div className="mb-12">
                <div className="w-full h-64 md:h-96 bg-gray-200 rounded-lg">
                    <h2 className="text-2xl font-bold text-center py-24">Foto</h2>
                </div>
            </div>

            {/* Quote Section */}
            <div className="text-center mb-12">
                <blockquote className="text-xl font-semibold italic text-gray-700">
                    "Kutipan singkat dari JR konveksi"
                </blockquote>
            </div>

            {/* Services Section */}
            <div>
                <h2 className="text-2xl font-bold mb-8 text-center">Jasa Kami</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Service 1 */}
                    <div className="text-center">
                        <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full mb-4">
                            <h3 className="text-lg font-semibold py-12">Jasa 1</h3>
                        </div>
                        <p className="text-gray-600">Deskripsi singkat jasanya</p>
                    </div>

                    {/* Service 2 */}
                    <div className="text-center">
                        <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full mb-4">
                            <h3 className="text-lg font-semibold py-12">Jasa 2</h3>
                        </div>
                        <p className="text-gray-600">Deskripsi singkat jasanya</p>
                    </div>

                    {/* Service 3 */}
                    <div className="text-center">
                        <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full mb-4">
                            <h3 className="text-lg font-semibold py-12">Jasa 3</h3>
                        </div>
                        <p className="text-gray-600">Deskripsi singkat jasanya</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;