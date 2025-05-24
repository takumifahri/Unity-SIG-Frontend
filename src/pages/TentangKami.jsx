import '../styles/MapComponent.css';
import CustomerMapDistribution from '../components/TentangKamiMap';
import { FaTshirt, FaRuler, FaPencilRuler } from 'react-icons/fa';

const TentangKami = () => {
  // Data jasa yang ditawarkan
  const jasaKami = [
    {
      icon: <FaTshirt className="text-4xl text-[#6D4C3D]" />,
      title: "Pembelian Baju Jadi",
      description: "Koleksi baju siap pakai dengan berbagai model, ukuran, dan bahan berkualitas untuk kebutuhan sehari-hari maupun acara khusus."
    },
    {
      icon: <FaPencilRuler className="text-4xl text-[#6D4C3D]" />,
      title: "Pemesanan Khusus",
      description: "Layanan pembuatan baju sesuai desain dan kebutuhan khusus Anda, dengan konsultasi desain dan pilihan bahan premium."
    },
    {
      icon: <FaRuler className="text-4xl text-[#6D4C3D]" />,
      title: "Produksi Massal",
      description: "Solusi pembuatan seragam, merchandise, atau kebutuhan pakaian dalam jumlah besar dengan harga kompetitif dan kualitas terjamin."
    }
  ];

  return (
    <div className="w-full bg-white text-gray-800">
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        
        {/* Section: Logo & Deskripsi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          {/* Logo */}
          <div className="flex justify-center " data-aos="fade-right" data-aos-duration="1000">
            <img 
              src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              alt="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              className="w-full max-w-xs md:max-w-sm object-contain"
            />
          </div>
          
          <div>
            <h2 className="text-4xl font-bold mb-4">Deskripsi Singkat</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              JR Konveksi adalah solusi terpercaya untuk kebutuhan konveksi Anda. Kami menghadirkan layanan jahit berkualitas tinggi dengan harga terjangkau, dikerjakan oleh tim profesional berpengalaman. Kepuasan pelanggan adalah prioritas kami.
            </p>
          </div>
        </div>

        {/* Section: Foto */}
        <div className="rounded-xl overflow-hidden mb-16 shadow-lg">
          <img 
            src="https://images.unsplash.com/photo-1545007805-a44ee83438fa?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="JR Konveksi" 
            className="w-full h-64 object-cover"
          />
        </div>

        {/* Section: Peta Persebaran Pelanggan */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Persebaran Pelanggan Kami</h2>
          <p className="text-gray-600 text-center mb-8 max-w-3xl mx-auto">
            Kami telah melayani pelanggan dari berbagai wilayah di Jakarta dan sekitarnya. 
            Peta di bawah ini menunjukkan persebaran pelanggan kami berdasarkan jumlah order.
          </p>
          <CustomerMapDistribution />
        </div>

        {/* Section: Kutipan */}
        <div className="text-center mb-20">
          <p className="text-2xl italic text-gray-700">"Kualitas pakaian mencerminkan kualitas hidup. Kami hadir untuk memastikan Anda tampil dengan kualitas terbaik."</p>
        </div>

        {/* Section: Jasa Kami */}
        <section className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-6">Jasa Kami</h2>
          <p className="text-gray-600 text-center mb-10 max-w-3xl mx-auto">
            JR Konveksi menyediakan berbagai layanan untuk memenuhi kebutuhan fashion Anda, dari pembelian baju jadi hingga pemesanan khusus sesuai desain Anda.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {jasaKami.map((jasa, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                data-aos="fade-up" 
                data-aos-delay={index * 100}
              >
                <div className="w-16 h-16 bg-[#F8F3ED] rounded-full mx-auto flex items-center justify-center mb-4">
                  {jasa.icon}
                </div>
                <h3 className="text-xl font-bold text-[#6D4C3D] mb-3">{jasa.title}</h3>
                <p className="text-gray-600">{jasa.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default TentangKami;