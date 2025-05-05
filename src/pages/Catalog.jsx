import axios from "axios"
import { useEffect, useState } from "react"
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { Link } from "react-router-dom";
export default function Catalog(){
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedSort, setSelectedSort] = useState("default")
    const [currentPage, setCurrentPage] = useState(1);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/catalog`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            setProducts(response.data.data)
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }
    const itemsPerPage = 12;
    const totalPages = Math.ceil(products.length / itemsPerPage);
  
    const handlePageChange = (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    };
  
    // Get products to display on the current page
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
    useEffect(() => {
        fetchProducts()
    }, [])

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div
                    key={index}
                    className="bg-white rounded-md overflow-hidden shadow-sm border border-gray-200 h-full"
                    >
                    <div className="skeleton-image h-[300px] bg-[#e0e0e0]"></div>

                    <div className="p-4">
                        <div className="skeleton-text h-5 w-[70%] bg-[#e0e0e0] mx-auto my-2.5 rounded"></div>
                        <div className="skeleton-text h-4 w-[50%] bg-[#e0e0e0] mx-auto my-2.5 rounded"></div>
                    </div>
                    </div>
                ))}
                </div>
        )
    }

    if (error) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                                <img src='https://thaka.bing.com/th/id/OIP.wTWyveIMu3qLvi5h96G8AAHaFj?w=241&h=181&c=7&r=0&o=5&pid=1.7' alt='maintainenance' className='' />
            <h1 className="text-2xl font-bold mb-4">Website Sedang Maintenance</h1>
            <p className="text-gray-600">Mohon maaf atas ketidaknyamanannya. Silakan coba lagi nanti.</p>
          </div>
        );
      }
    return (
        <>
            <main className="flex-1 container mx-auto p-6">
                {/* Heading */}
                <div className="relative flex flex-col md:flex-row items-center justify-center mb-6">
                    <h1 className="text-2xl font-bold md:absolute md:left-1/2 md:-translate-x-1/2">Pakaian</h1>
                    <div className="mt-4 md:mt-0 md:ml-auto">
                        <select
                            value={selectedSort}
                            onChange={(e) => {
                                const sortValue = e.target.value;
                                setSelectedSort(sortValue);
                                if (sortValue === "termurah") {
                                    setProducts((prevProducts) =>
                                        [...prevProducts].sort((a, b) => a.price - b.price)
                                    );
                                } else if (sortValue === "termahal") {
                                    setProducts((prevProducts) =>
                                        [...prevProducts].sort((a, b) => b.price - a.price)
                                    );
                                } else {
                                    fetchProducts(); // Re-fetch products to reset sorting
                                }
                            }}
                            className="border rounded-full py-2 px-4"
                        >
                            <option value="default">Urutkan</option>
                            <option value="termurah">Termurah</option>
                            <option value="termahal">Termahal</option>
                        </select>
                    </div>
                </div>

                {/* Product Grid */}
                    {loading ? (
                        Array.from({ length: 8 }).map((_, index) => (
                            <div key={index} className="bg-white rounded-md overflow-hidden shadow-sm border border-gray-200">
                                <div className="h-[300px] bg-[#e0e0e0]"></div>
                                <div className="p-4">
                                    <div className="h-5 w-[70%] bg-[#e0e0e0] mx-auto my-2.5 rounded"></div>
                                    <div className="h-4 w-[50%] bg-[#e0e0e0] mx-auto my-2.5 rounded"></div>
                                </div>
                            </div>
                        ))
                    ) : products.length > 0 ? (
                        currentProducts.map((product) => (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">

                                <Link to={`/product/${product.id}`} key={product.id} className="no-underline text-black">
                                    <div className="text-left border rounded-xl overflow-hidden shadow-sm">
                                        <img
                                            src={`${process.env.REACT_APP_API_URL}/${product.gambar}`}
                                            alt={product.nama_katalog}
                                            className="w-full h-72 object-cover"
                                        />
                                        <div className="p-4">
                                            <h2 className="font-semibold mt-2 text-lg">{product.nama_katalog}</h2>
                                            <p className="text-gray-600 mt-2">Rp{product.price.toLocaleString("id-ID")}</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>

                        ))
                    ) : (
                        <>
                            <div className="grid grid-cols-1  gap-8">
                                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                                    <img src="https://cdn-icons-png.flaticon.com/512/7486/7486747.png" alt="maintenance" />
                                    <h1 className="text-2xl font-bold mb-4">Website Sedang Maintenance</h1>
                                    <p className="col-span-4 text-center text-gray-500">Produk masih kosong, mohon tunggu sebentar ya.</p>
                                </div>
                            </div>
                        </>
                       
                    )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-8">
                        <Stack spacing={2} className="mt-4">
                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                onChange={(event, page) => handlePageChange(page)}
                                color="primary"
                                siblingCount={1}
                                boundaryCount={1}
                            />
                        </Stack>
                    </div>
                )}
            </main>
        </>
    );
}
