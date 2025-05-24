import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

// Import gambar untuk Leaflet marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fungsi helper untuk menambahkan CSS fix untuk Leaflet
const applyLeafletCSSFixes = () => {
  if (typeof document !== 'undefined') {
    const existingStyle = document.getElementById('leaflet-fixes');
    if (!existingStyle) {
      const style = document.createElement('style');
      style.id = 'leaflet-fixes';
      style.textContent = `
        .leaflet-container {
          z-index: 0 !important;
        }
        .leaflet-control-container {
          z-index: 800 !important;
        }
        .leaflet-top, .leaflet-bottom {
          z-index: 900 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }
};

const CustomerMapDistribution = () => {
  const [mapData, setMapData] = useState({
    total_users: 0,
    total_orders: 0,
    users_with_orders: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [polygonData, setPolygonData] = useState(null);
  const [polygonLoading, setPolygonLoading] = useState(false);
  const [activeView, setActiveView] = useState("polygon"); // Default tampilan polygon

  // Tambahkan CSS fixes saat komponen dimount
  useEffect(() => {
    applyLeafletCSSFixes();
    
    // Fix Leaflet's default icon path issues
    if (typeof window !== "undefined") {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: markerIcon2x,
        iconUrl: markerIcon,
        shadowUrl: markerShadow,
      });
    }
  }, []);

  // Fetch data dari API landing/map
  const getMapData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/landing/map`);

      if (res.data && res.data.status === "success") {
        setMapData(res.data.data);
        setError(null);
      } else {
        throw new Error("Data tidak valid");
      }
    } catch (err) {
      console.error("Error fetching map data:", err);
      
      // Data dummy jika API gagal
      const dummyData = {
        total_users: 4,
        total_orders: 2,
        users_with_orders: [
          {
            id: 1,
            name: "Tester",
            email: "fahri.radiansyah@gmail.com",
            address: "SMA Negeri 104 Jakarta, Jalan Haji Taiman, RW 10, Gedong, Pasar Rebo, East Jakarta, Special capital Region of Jakarta, Java, 13760, Indonesia",
            longitude: "106.86332200",
            latitude: "-6.29917650"
          },
          {
            id: 2,
            name: "Fahri Radiansyah",
            email: "takumifahri@apps.ipb.ac.id",
            address: "Gunung Batu, Banjar, South Kalimantan, Kalimantan, 70673, Indonesia",
            longitude: "115.09163760",
            latitude: "-3.22943510"
          },
          {
            id: 3,
            name: "agridation",
            email: "agridation2025@gmail.com",
            address: null,
            longitude: null,
            latitude: null
          },
          {
            id: 4,
            name: "Jr Konveksi",
            email: "jrkonveksiemail@gmail.com",
            address: "PGC, 76, Jalan Mayor Jenderal Sutoyo, RW 13, Cililitan, Kramat Jati, East Jakarta, Special capital Region of Jakarta, Java, 13640, Indonesia",
            longitude: "106.86542610",
            latitude: "-6.26202750"
          }
        ]
      };
      
      setMapData(dummyData);
      setError("Menggunakan data contoh karena tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  // Fetch GeoJSON data untuk wilayah 
  const fetchGeoJSONData = async () => {
    setPolygonLoading(true);
    try {
      const response = await axios.get(
        "https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-province-simple.geojson"
      );

      if (response.data && response.data.features) {
        // Filter hanya untuk wilayah Indonesia yang relevan
        const filteredFeatures = response.data.features;
        
        if (filteredFeatures.length > 0) {
          const filteredGeoJSON = {
            ...response.data,
            features: filteredFeatures,
          };
          setPolygonData(filteredGeoJSON);
        } else {
          // Fallback jika tidak ada fitur yang ditemukan
          setPolygonData(getFallbackGeoJSON());
        }
      } else {
        setPolygonData(getFallbackGeoJSON());
      }
    } catch (err) {
      console.error("Error fetching GeoJSON data:", err);
      setPolygonData(getFallbackGeoJSON());
    } finally {
      setPolygonLoading(false);
    }
  };

  // GeoJSON fallback jika API gagal
  const getFallbackGeoJSON = () => {
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            name: "DKI Jakarta",
            id: "jakarta",
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [106.681395, -6.104694],
                [106.731863, -6.09434],
                [106.801901, -6.085553],
                [106.831427, -6.088123],
                [106.880865, -6.097767],
                [106.910734, -6.109693],
                [106.947126, -6.126091],
                [106.973219, -6.153753],
                [106.978884, -6.186009],
                [106.973048, -6.223271],
                [106.958113, -6.255527],
                [106.930647, -6.279618],
                [106.89404, -6.293116],
                [106.828035, -6.305042],
                [106.781343, -6.309183],
                [106.734651, -6.305042],
                [106.695544, -6.293116],
                [106.673228, -6.279618],
                [106.652483, -6.255527],
                [106.640557, -6.223271],
                [106.636416, -6.186009],
                [106.644345, -6.153753],
                [106.660743, -6.126091],
                [106.681395, -6.104694],
              ],
            ],
          },
        },
        {
          type: "Feature",
          properties: {
            name: "Kalimantan Selatan",
            id: "kalsel",
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [114.5, -3.6],
                [115.5, -3.6],
                [115.5, -2.8],
                [114.5, -2.8],
                [114.5, -3.6],
              ],
            ],
          },
        }
      ],
    };
  };

  // Load data saat komponen dimount
  useEffect(() => {
    getMapData();
    fetchGeoJSONData();
  }, []);

  // Filter hanya user dengan koordinat valid
  const validUsers = mapData.users_with_orders?.filter(
    user => user.latitude && user.longitude && user.address
  ) || [];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Sebaran Pelanggan Kami</h2>
        <p className="text-gray-600 mt-1">
          Lihat persebaran pelanggan kami di berbagai wilayah di Indonesia
        </p>
        
        {/* Toggle view buttons */}
        <div className="mt-3 flex space-x-2">
          <button
            onClick={() => setActiveView("points")}
            className={`px-3 py-1 rounded-md text-sm transition-colors duration-200 
              ${activeView === "points" 
                ? "bg-[#6D4C3D] text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            Lokasi Pelanggan
          </button>
          <button
            onClick={() => setActiveView("polygon")}
            className={`px-3 py-1 rounded-md text-sm transition-colors duration-200
              ${activeView === "polygon" 
                ? "bg-[#6D4C3D] text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            Peta Wilayah
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Map Container */}
        <div className="h-[400px] w-full">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6D4C3D] mb-2"></div>
                <p className="text-gray-600">Memuat data peta...</p>
              </div>
            </div>
          ) : error ? (
            <div className="h-full w-full flex items-center justify-center bg-amber-50 text-center p-4">
              <div>
                <p className="text-amber-700 mb-2">{error}</p>
                <p className="text-gray-600">Menampilkan data contoh untuk visualisasi</p>
              </div>
            </div>
          ) : (
            <MapView
              users={validUsers}
              totalOrders={mapData.total_orders}
              polygonData={polygonData}
              showPolygons={activeView === "polygon"}
              polygonLoading={polygonLoading}
            />
          )}
        </div>
        
        {/* Statistik ringkas */}
        <div className="absolute bottom-3 left-3 bg-white bg-opacity-90 p-3 rounded-lg shadow-md z-10 border border-gray-200">
          <div className="text-sm font-medium text-gray-800">Statistik Pelanggan</div>
          <div className="flex space-x-4 mt-1">
            <div>
              <span className="text-xs text-gray-500">Total Pelanggan:</span>
              <div className="text-lg font-semibold text-[#6D4C3D]">{mapData.total_users || 0}</div>
            </div>
            <div>
              <span className="text-xs text-gray-500">Total Order:</span>
              <div className="text-lg font-semibold text-[#D3B597]">{mapData.total_orders || 0}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Komponen untuk menampilkan peta
const MapView = ({ users, totalOrders, polygonData, showPolygons, polygonLoading }) => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markersRef = useRef({});
  const polygonLayerRef = useRef(null);
  const mouseEnterRef = useRef(null);
  const mouseLeaveRef = useRef(null);

  // Function untuk mengecek apakah user berada di wilayah tertentu
  const isUserInRegion = (user, regionName) => {
    if (!user.address || !regionName) return false;

    const address = user.address.toLowerCase();
    const region = regionName.toLowerCase();

    // Cek untuk Jakarta
    if (region.includes("jakarta")) {
      return (
        address.includes("jakarta") ||
        address.includes("jkt") ||
        address.includes("dki") ||
        (user.latitude && user.longitude &&
          Number.parseFloat(user.latitude) >= -6.4 &&
          Number.parseFloat(user.latitude) <= -6.1 &&
          Number.parseFloat(user.longitude) >= 106.7 &&
          Number.parseFloat(user.longitude) <= 107.0)
      );
    }

    // Cek untuk Kalimantan Selatan
    if (region.includes("kalimantan selatan") || region.includes("south kalimantan")) {
      return (
        address.includes("kalimantan selatan") ||
        address.includes("south kalimantan") ||
        address.includes("banjar") ||
        (user.latitude && user.longitude &&
          Number.parseFloat(user.latitude) >= -4.5 &&
          Number.parseFloat(user.latitude) <= -1.0 &&
          Number.parseFloat(user.longitude) >= 114.0 &&
          Number.parseFloat(user.longitude) <= 116.5)
      );
    }

    // Cek umum berdasarkan konten alamat
    return address.includes(region);
  };

  // Mendapatkan warna berdasarkan jumlah user di wilayah
  const getColor = (value) => {
    return value > 5
      ? "#800026"
      : value > 4
        ? "#BD0026"
        : value > 3
          ? "#E31A1C"
          : value > 2
            ? "#FC4E2A"
            : value > 1
              ? "#FD8D3C"
              : value > 0
                ? "#FEB24C"
                : "#FFEDA0";
  };

  // Style untuk polygon
  const stylePolygon = (feature) => {
    if (!feature || !feature.properties) {
      return {
        fillColor: "#ccc",
        weight: 1,
        opacity: 0.5,
        color: "#999",
        fillOpacity: 0.2,
      };
    }

    // Nama wilayah
    const regionName = feature.properties.name || "";

    // Cari user di wilayah ini
    const usersInRegion = users.filter((user) => 
      isUserInRegion(user, regionName)
    );

    // Jumlah user di wilayah ini
    const count = usersInRegion.length;

    // Warna berdasarkan jumlah user
    const color = getColor(count);

    return {
      fillColor: color,
      weight: 2,
      opacity: 1,
      color: "white",
      dashArray: "3",
      fillOpacity: 0.7,
    };
  };

  // Handler untuk polygon
  const onEachFeature = (feature, layer) => {
    if (!feature || !feature.properties) return;

    const regionName = feature.properties.name || "";

    // Cari user di wilayah ini
    const usersInRegion = users.filter((user) => 
      isUserInRegion(user, regionName)
    );

    const count = usersInRegion.length;

    layer.bindPopup(`
      <strong>${regionName}</strong><br>
      Jumlah Pelanggan: ${count}
    `);

    // Highlight polygon on hover
    layer.on({
      mouseover: () => {
        if (!layer.isPopupOpen()) {
          layer.setStyle({
            weight: 5,
            color: "#666",
            dashArray: "",
            fillOpacity: 0.7,
          });
          if (layer.bringToFront) {
            layer.bringToFront();
          }
        }
      },
      mouseout: () => {
        if (!layer.isPopupOpen() && polygonLayerRef.current) {
          polygonLayerRef.current.resetStyle(layer);
        }
      },
      click: () => {
        if (layer.bringToFront) {
          layer.bringToFront();
        }
      },
    });
  };

  useEffect(() => {
    // Buat handler untuk mouse enter/leave
    mouseEnterRef.current = () => {
      if (mapRef.current) {
        mapRef.current.scrollWheelZoom.enable();
      }
    };
    
    mouseLeaveRef.current = () => {
      if (mapRef.current) {
        mapRef.current.scrollWheelZoom.disable();
      }
    };

    // Inisialisasi peta
    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        scrollWheelZoom: false // Nonaktifkan scroll wheel zoom secara default
      }).setView([-2.5, 118], 5); // View Indonesia

      // Tambahkan layer peta
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
      
      // Tambahkan event listener untuk mengaktifkan/menonaktifkan scroll zoom
      if (mapContainerRef.current) {
        mapContainerRef.current.addEventListener('mouseenter', mouseEnterRef.current);
        mapContainerRef.current.addEventListener('mouseleave', mouseLeaveRef.current);
      }
    }

    // Menambahkan marker untuk pelanggan
    const map = mapRef.current;
    if (map) {
      // Hapus marker yang ada
      Object.values(markersRef.current).forEach((marker) => {
        map.removeLayer(marker);
      });
      markersRef.current = {};

      // Tambahkan marker untuk setiap user jika tidak dalam mode polygon
      if (!showPolygons) {
        // Custom icon untuk marker
        const customIcon = L.icon({
          iconUrl: 'https://i.pinimg.com/736x/db/b0/f7/dbb0f7a828e391927da9a70ded31f839.jpg',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        users.forEach((user) => {
          if (user.latitude && user.longitude) {
            const lat = Number.parseFloat(user.latitude);
            const lng = Number.parseFloat(user.longitude);

            if (!isNaN(lat) && !isNaN(lng)) {
              try {
                const marker = L.marker([lat, lng], {
                  icon: customIcon
                }).addTo(map);

                // Tambahkan popup dengan info user
                marker.bindPopup(`
                  <strong>${user.name || 'Pelanggan'}</strong><br>
                  ${user.address || ""}
                `);

                // Simpan referensi marker
                markersRef.current[user.id] = marker;
              } catch (error) {
                console.error("Error creating marker:", error);
                
                // Fallback ke marker default jika ada masalah
                const marker = L.marker([lat, lng]).addTo(map);
                marker.bindPopup(`<strong>${user.name || 'Pelanggan'}</strong><br>${user.address || ""}`);
                markersRef.current[user.id] = marker;
              }
            }
          }
        });
      }

      // Tambahkan atau update layer polygon
      if (showPolygons && polygonData) {
        // Hapus layer polygon yang ada
        if (polygonLayerRef.current) {
          map.removeLayer(polygonLayerRef.current);
        }

        try {
          // Tambahkan layer polygon baru
          polygonLayerRef.current = L.geoJSON(polygonData, {
            style: stylePolygon,
            onEachFeature: onEachFeature,
          }).addTo(map);

          // Tambahkan legenda
          if (!map.legend) {
            const legend = L.control({ position: "bottomright" });

            legend.onAdd = (map) => {
              const div = L.DomUtil.create("div", "info legend");
              div.style.backgroundColor = "white";
              div.style.padding = "6px";
              div.style.borderRadius = "4px";
              div.style.boxShadow = "0 0 15px rgba(0,0,0,0.2)";
              div.style.fontSize = "12px";

              // Judul legenda
              div.innerHTML = '<h4 style="margin:0 0 5px 0; font-weight: bold;">Jumlah Pelanggan per Wilayah</h4>';

              // Legenda untuk jumlah pelanggan
              const grades = [0, 1, 2, 3, 4, 5];

              // Loop interval user
              for (let i = 0; i < grades.length; i++) {
                div.innerHTML += `<div style="margin-bottom: 3px;">
                    <i style="background:${getColor(grades[i] + 1)}; width:15px; height:15px; float:left; margin-right:8px; opacity:0.7"></i> 
                    ${grades[i]}${grades[i + 1] ? ` - ${grades[i + 1]}` : "+"} pelanggan
                  </div>`;
              }

              return div;
            };

            legend.addTo(map);
            map.legend = legend;
          }

          // Zoom untuk menyesuaikan batas polygon
          if (polygonLayerRef.current.getBounds && polygonLayerRef.current.getBounds().isValid()) {
            map.fitBounds(polygonLayerRef.current.getBounds(), { padding: [50, 50] });
          } else {
            // Fallback ke tampilan Indonesia
            map.setView([-2.5, 118], 5);
          }
        } catch (err) {
          console.error("Error rendering GeoJSON:", err);
        }
      } else if (!showPolygons && map.legend) {
        // Hapus legenda jika tidak dalam mode polygon
        map.removeControl(map.legend);
        map.legend = null;
      }

      // Menyesuaikan tampilan peta untuk semua marker jika ada user dengan koordinat valid
      if (!showPolygons && users.length > 0) {
        const bounds = users.map((user) =>
          L.latLng(Number.parseFloat(user.latitude), Number.parseFloat(user.longitude))
        );

        if (bounds.length > 0) {
          try {
            const latLngBounds = L.latLngBounds(bounds);
            if (latLngBounds.isValid()) {
              map.fitBounds(latLngBounds, { padding: [50, 50] });
            }
          } catch (err) {
            console.error("Error fitting bounds:", err);
            map.setView([-2.5, 118], 5);
          }
        }
      }
    }

    // Cleanup function
    return () => {
      if (mapContainerRef.current) {
        if (mouseEnterRef.current) {
          mapContainerRef.current.removeEventListener('mouseenter', mouseEnterRef.current);
        }
        if (mouseLeaveRef.current) {
          mapContainerRef.current.removeEventListener('mouseleave', mouseLeaveRef.current);
        }
      }
      
      if (mapRef.current) {
        // Hapus semua marker
        Object.values(markersRef.current).forEach((marker) => {
          if (mapRef.current) mapRef.current.removeLayer(marker);
        });
        
        // Hapus polygon layer
        if (polygonLayerRef.current) {
          mapRef.current.removeLayer(polygonLayerRef.current);
        }
        
        // Hapus legenda
        if (mapRef.current.legend) {
          mapRef.current.removeControl(mapRef.current.legend);
        }
      }
    };
  }, [users, showPolygons, polygonData]);

  // Handle window resize agar peta responsif
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <div 
        ref={mapContainerRef} 
        className="h-full w-full" 
        style={{ zIndex: 0 }}
      />
      {showPolygons && polygonLoading && (
        <div className="absolute top-2 right-2 bg-white p-2 rounded-md shadow-md z-[1000] text-xs">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#6D4C3D] mb-1"></div>
            <span className="ml-1">Memuat data wilayah...</span>
          </div>
        </div>
      )}
      
      {/* Panduan penggunaan peta */}
      <div className="absolute bottom-2 right-2 bg-white bg-opacity-80 px-2 py-1 rounded text-xs text-gray-600 z-[1000] pointer-events-none">
        Arahkan mouse ke peta untuk menggunakan zoom
      </div>
    </div>
  );
};

export default CustomerMapDistribution;