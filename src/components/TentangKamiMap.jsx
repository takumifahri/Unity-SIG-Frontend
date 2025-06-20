"use client"

import { useState, useEffect, useRef } from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  Alert,
  AlertTitle,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Container,
  ButtonGroup,
  Tooltip,
} from "@mui/material"
import {
  Map as MapIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  LocationOn as LocationOnIcon,
  Warning as WarningIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material"
import { styled } from "@mui/material/styles"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
// Styled components untuk customization
const StyledCard = styled(Card)(({ theme }) => ({
  boxShadow: theme.shadows[4],
  borderRadius: theme.spacing(2),
}))

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}10)`,
  border: `1px solid ${theme.palette.primary.light}40`,
}))

const MapContainer = styled(Box)({
  height: "500px", // Pastikan height ditetapkan
  width: "100%",
  borderRadius: "12px",
  border: "1px solid #e0e0e0",
  position: "relative",
  overflow: "hidden",
  backgroundColor: "#f5f5f5",
  display: "block", // Pastikan display block
  minHeight: "500px", // Tambahkan minHeight
});

const LegendContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.spacing(1),
}))

// Data provinsi Indonesia dengan koordinat untuk polygon sederhana
const provinceData = [
  {
    name: "DKI Jakarta",
    aliases: [
      "jakarta",
      "dki jakarta",
      "special capital region of jakarta",
      "jakarta timur",
      "jakarta barat",
      "jakarta selatan",
      "jakarta utara",
      "jakarta pusat",
    ],
    coordinates: [
      [106.6816, -6.1045],
      [106.9318, -6.1045],
      [106.9318, -6.3676],
      [106.6816, -6.3676],
      [106.6816, -6.1045],
    ],
    center: [106.8065, -6.2361],
  },
  {
    name: "Jawa Barat",
    aliases: ["jawa barat", "west java", "bandung", "bogor", "depok", "bekasi", "cimahi"],
    coordinates: [
      [106.0, -5.5],
      [108.5, -5.5],
      [108.5, -7.8],
      [106.0, -7.8],
      [106.0, -5.5],
    ],
    center: [107.25, -6.65],
  },
  {
    name: "Jawa Tengah",
    aliases: ["jawa tengah", "central java", "semarang", "solo", "surakarta", "magelang", "salatiga"],
    coordinates: [
      [108.5, -6.0],
      [111.5, -6.0],
      [111.5, -8.5],
      [108.5, -8.5],
      [108.5, -6.0],
    ],
    center: [110.0, -7.25],
  },
  {
    name: "DI Yogyakarta",
    aliases: ["yogyakarta", "jogja", "yogya", "di yogyakarta"],
    coordinates: [
      [110.0, -7.5],
      [110.8, -7.5],
      [110.8, -8.2],
      [110.0, -8.2],
      [110.0, -7.5],
    ],
    center: [110.4, -7.85],
  },
  {
    name: "Jawa Timur",
    aliases: ["jawa timur", "east java", "surabaya", "malang", "kediri", "madiun", "jember"],
    coordinates: [
      [111.5, -6.5],
      [114.5, -6.5],
      [114.5, -8.8],
      [111.5, -8.8],
      [111.5, -6.5],
    ],
    center: [113.0, -7.65],
  },
  {
    name: "Sumatera Utara",
    aliases: ["sumatera utara", "north sumatra", "medan", "pematangsiantar", "binjai"],
    coordinates: [
      [97.0, 1.0],
      [100.0, 1.0],
      [100.0, 4.5],
      [97.0, 4.5],
      [97.0, 1.0],
    ],
    center: [98.5, 2.75],
  },
  {
    name: "Sumatera Selatan",
    aliases: ["sumatera selatan", "south sumatra", "palembang", "lubuklinggau"],
    coordinates: [
      [102.0, -5.0],
      [106.0, -5.0],
      [106.0, -1.5],
      [102.0, -1.5],
      [102.0, -5.0],
    ],
    center: [104.0, -3.25],
  },
  {
    name: "Bali",
    aliases: ["bali", "denpasar", "ubud", "sanur", "kuta"],
    coordinates: [
      [114.5, -8.8],
      [115.7, -8.8],
      [115.7, -8.1],
      [114.5, -8.1],
      [114.5, -8.8],
    ],
    center: [115.1, -8.45],
  },
  {
    name: "Sulawesi Selatan",
    aliases: ["sulawesi selatan", "south sulawesi", "makassar", "parepare"],
    coordinates: [
      [118.0, -6.5],
      [121.5, -6.5],
      [121.5, -3.0],
      [118.0, -3.0],
      [118.0, -6.5],
    ],
    center: [119.75, -4.75],
  },
  {
    name: "Kalimantan Selatan",
    aliases: ["kalimantan selatan", "south kalimantan", "banjarmasin", "banjarbaru"],
    coordinates: [
      [114.0, -4.5],
      [116.5, -4.5],
      [116.5, -1.5],
      [114.0, -1.5],
      [114.0, -4.5],
    ],
    center: [115.25, -3.0],
  },
]

const CustomerMapDistribution = () => {
  const [mapData, setMapData] = useState({
    total_users: 0,
    total_orders: 0,
    users_with_orders: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeView, setActiveView] = useState("polygon")
  const [refreshing, setRefreshing] = useState(false)
  const [mapLoading, setMapLoading] = useState(true)
  const [mapError, setMapError] = useState(null)
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const polygonLayersRef = useRef([])

  // Fungsi untuk mengekstrak provinsi dari alamat
  const extractProvinceFromAddress = (address) => {
    if (!address) return null

    const addressLower = address.toLowerCase()

    // Cari provinsi berdasarkan alias
    for (const province of provinceData) {
      for (const alias of province.aliases) {
        if (addressLower.includes(alias)) {
          return province.name
        }
      }
    }

    return null
  }

  // Fetch data dari API
  const getMapData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/landing/map`)
      const result = await response.json()

      if (result && result.status === "success") {
        setMapData(result.data)
        setError(null)
      } else {
        throw new Error("Data tidak valid")
      }
    } catch (err) {
      console.error("Error fetching map data:", err)
      setError("Tidak dapat memuat data dari server")

      // Gunakan data contoh jika API gagal
      setMapData({
        total_users: 4,
        total_orders: 11,
        users_with_orders: [
          {
            id: 1,
            name: "Fahri R",
            email: "fahri.radiansyah@gmail.com",
            address: null,
            longitude: null,
            latitude: null,
          },
          {
            id: 2,
            name: "Fahri Radiansyah",
            email: "takumifahri@apps.ipb.ac.id",
            address:
              "SMA Negeri 104 Jakarta, Jalan Haji Taiman, RW 10, Gedong, Pasar Rebo, East Jakarta, Special capital Region of Jakarta, Java, 13760, Indonesia",
            latitude: "-6.29917650",
            longitude: "106.86332200",
          },
          {
            id: 3,
            name: "Tester",
            email: "fahri1.radiansyah@gmail.com",
            address: null,
            longitude: null,
            latitude: null,
          },
          {
            id: 4,
            name: "Ujang",
            email: "muthiahhamidah18@gmail.com",
            address:
              "PGC, 76, Jalan Mayor Jenderal Sutoyo, RW 13, Cililitan, Kramat Jati, Jakarta Timur, Daerah Khusus Ibukota Jakarta, Jawa, 13640, Indonesia",
            latitude: "-6.26202750",
            longitude: "106.86542610",
          },
        ],
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }
  // Ganti useEffect untuk inisialisasi map dengan berikut
  useEffect(() => {
    if (!mapRef.current) return;
    
    const initializeMap = () => {
      try {
        console.log("Initializing map...");
        
        // Hapus peta yang sudah ada jika ada
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
        
        // Pastikan container memiliki ukuran sebelum inisialisasi
        if (mapRef.current.clientWidth === 0) {
          console.log("Map container has no width, rescheduling initialization");
          setTimeout(initializeMap, 300);
          return;
        }
        
        // Fix untuk icon Leaflet
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });
        
        // Inisialisasi peta dengan opsi dasar
        mapInstanceRef.current = L.map(mapRef.current).setView([-2.5, 118], 5);
        
        // Tambahkan tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(mapInstanceRef.current);
        
        console.log("Map initialized successfully!");
        setMapLoading(false);
        
        // Render polygon provinsi setelah map sudah dibuat
        renderProvincePolygons(L);
      } catch (error) {
        console.error("Error initializing map:", error);
        setMapError("Gagal memuat peta. Silakan refresh halaman.");
        setMapLoading(false);
      }
    };
    
    // Delay untuk memastikan DOM sudah siap
    const timer = setTimeout(initializeMap, 500);
    
    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Dependency array kosong supaya hanya dijalankan sekali
  // Menghitung jumlah pelanggan per provinsi
  const getProvinceStats = () => {
    const stats = {}
    const unidentifiedUsers = []

    mapData.users_with_orders.forEach((user) => {
      const province = extractProvinceFromAddress(user.address)

      if (province) {
        stats[province] = (stats[province] || 0) + 1
      } else if (user.address) {
        unidentifiedUsers.push(user)
      }
    })

    return { stats, unidentifiedUsers }
  }

  const { stats: provinceStats, unidentifiedUsers } = getProvinceStats()

  // Mendapatkan warna berdasarkan jumlah pelanggan
  const getColor = (count) => {
    if (count > 3) return "#d32f2f"
    if (count > 2) return "#f57c00"
    if (count > 1) return "#fbc02d"
    if (count > 0) return "#689f38"
    return "#e0e0e0"
  }

  // Inisialisasi peta dengan Leaflet
  // useEffect(() => {
  //   if (typeof window === "undefined" || !mapRef.current) return

  //   const initMap = async () => {
  //     setMapLoading(true)
  //     setMapError(null)

  //     try {
  //       // Dynamic import untuk Leaflet
  //       const L = (await import("leaflet")).default

  //       // Import CSS Leaflet
  //       if (!document.querySelector('link[href*="leaflet.css"]')) {
  //         const link = document.createElement("link")
  //         link.rel = "stylesheet"
  //         link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  //         link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
  //         link.crossOrigin = ""
  //         document.head.appendChild(link)
  //       }

  //       // Fix untuk icon Leaflet
  //       delete L.Icon.Default.prototype._getIconUrl
  //       L.Icon.Default.mergeOptions({
  //         iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  //         iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  //         shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  //       })

  //       // Hapus peta yang sudah ada jika ada
  //       if (mapInstanceRef.current) {
  //         mapInstanceRef.current.remove()
  //         mapInstanceRef.current = null
  //       }

  //       // Tunggu sebentar untuk memastikan DOM siap
  //       await new Promise((resolve) => setTimeout(resolve, 100))

  //       if (mapRef.current) {
  //         // Inisialisasi peta
  //         mapInstanceRef.current = L.map(mapRef.current, {
  //           center: [-2.5, 118],
  //           zoom: 5,
  //           zoomControl: true,
  //           scrollWheelZoom: true,
  //         })

  //         // Tambahkan tile layer
  //         L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  //           attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  //           maxZoom: 18,
  //         }).addTo(mapInstanceRef.current)

  //         // Render polygon provinsi
  //         renderProvincePolygons(L)

  //         setMapLoading(false)
  //       }
  //     } catch (error) {
  //       console.error("Error initializing map:", error)
  //       setMapError("Gagal memuat peta. Silakan refresh halaman.")
  //       setMapLoading(false)
  //     }
  //   }

  //   // Delay untuk memastikan DOM sudah siap
  //   const timer = setTimeout(initMap, 500)

  //   return () => {
  //     clearTimeout(timer)
  //     if (mapInstanceRef.current) {
  //       mapInstanceRef.current.remove()
  //       mapInstanceRef.current = null
  //     }
  //   }
  // }, [])
  useEffect(() => {
    if (!mapRef.current) {
      console.error("Map reference is not available!");
      return;
    }
    
    const initializeMap = () => {
      try {
        console.log("Initializing map...");
        console.log("Map container dimensions:", mapRef.current.clientWidth, mapRef.current.clientHeight);
        
        // Hapus peta yang sudah ada jika ada
        if (mapInstanceRef.current) {
          console.log("Removing existing map instance");
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
        
        // Pastikan container memiliki ukuran sebelum inisialisasi
        if (mapRef.current.clientWidth === 0 || mapRef.current.clientHeight === 0) {
          console.log("Map container has no dimensions, rescheduling initialization");
          setTimeout(initializeMap, 500);
          return;
        }
        
        // Fix untuk icon Leaflet
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });
        
        // Inisialisasi peta dengan opsi dasar
        console.log("Creating new map instance");
        mapInstanceRef.current = L.map(mapRef.current).setView([-2.5, 118], 5);
        
        // Tambahkan tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(mapInstanceRef.current);
        
        console.log("Map initialized successfully!");
        setMapLoading(false);
        
        // Render polygon provinsi setelah map sudah dibuat
        renderProvincePolygons();
      } catch (error) {
        console.error("Error initializing map:", error);
        setMapError("Gagal memuat peta. Silakan refresh halaman.");
        setMapLoading(false);
      }
    };
    
    // Delay lebih lama untuk memastikan DOM sudah siap
    const timer = setTimeout(initializeMap, 1000);
    
    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);
  // Render polygon untuk setiap provinsi
   // Function to determine the region color
  const getRegionBaseColor = (provinceName) => {
    // Classify provinces by island groups
    const javaProvinces = ["DKI Jakarta", "Jawa Barat", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur"];
    const sumateraProvinces = ["Sumatera Utara", "Sumatera Selatan"];
    const kalimantanProvinces = ["Kalimantan Selatan"];
    const sulawesiProvinces = ["Sulawesi Selatan"];
    const baliProvinces = ["Bali"];
    
    if (javaProvinces.includes(provinceName)) return "#1976d230"; // Blue for Java
    if (sumateraProvinces.includes(provinceName)) return "#388e3c30"; // Green for Sumatra
    if (kalimantanProvinces.includes(provinceName)) return "#e6510030"; // Orange for Kalimantan
    if (sulawesiProvinces.includes(provinceName)) return "#6a1b9a30"; // Purple for Sulawesi
    if (baliProvinces.includes(provinceName)) return "#f4511e30"; // Orange-red for Bali
    
    return "#78909c30"; // Grey for others
  };
  const renderProvincePolygons = () => {
    if (!mapInstanceRef.current) {
      console.log("Map instance not ready yet");
      return;
    }
    
    console.log("Rendering province polygons...");
    
    // Hapus polygon yang sudah ada
    polygonLayersRef.current.forEach((layer) => {
      mapInstanceRef.current.removeLayer(layer);
    });
    polygonLayersRef.current = [];
    
    provinceData.forEach((province) => {
      const customerCount = provinceStats[province.name] || 0;
      const color = getColor(customerCount);
      const regionBaseColor = getRegionBaseColor(province.name);
      
      // Buat polygon dengan intensitas warna berdasarkan jumlah pelanggan
      const polygon = L.polygon(province.coordinates, {
        color: "#333",
        weight: 2,
        fillColor: customerCount > 0 ? color : regionBaseColor,
        fillOpacity: customerCount > 0 ? 0.7 : 0.4,
        stroke: true,
      }).addTo(mapInstanceRef.current);
      
      polygonLayersRef.current.push(polygon);
      
      // Tambahkan tooltip yang muncul saat hover
      polygon.bindTooltip(`<strong>${province.name}</strong>: ${customerCount} pelanggan`, { 
        permanent: false, 
        direction: 'center',
        className: 'custom-tooltip'
      });
      
      // Tambahkan popup detail ketika di-klik
      polygon.bindPopup(`
        <div style="padding: 8px; min-width: 150px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px; color: #1976d2;">${province.name}</h3>
          <p style="margin: 0 0 5px 0; font-size: 14px;">Jumlah Pelanggan: <span style="font-weight: bold; color: #1976d2;">${customerCount}</span></p>
          <p style="margin: 0; font-size: 12px; color: #666;">Koordinat pusat: [${province.center[0]}, ${province.center[1]}]</p>
        </div>
      `);
      
      // Hover effects
      polygon.on("mouseover", function () {
        this.setStyle({
          weight: 3,
          fillOpacity: 0.9,
          color: "#1976d2",
        });
        this.openTooltip();
      });
      
      polygon.on("mouseout", function () {
        this.setStyle({
          weight: 2,
          fillOpacity: customerCount > 0 ? 0.7 : 0.4,
          color: "#333",
        });
        this.closeTooltip();
      });
      
      // Click event
      polygon.on("click", function () {
        this.openPopup();
      });
    });
    
    // Tambahkan marker untuk provinsi dengan pelanggan
    Object.entries(provinceStats).forEach(([provinceName, count]) => {
      const province = provinceData.find(p => p.name === provinceName);
      if (province) {
        const marker = L.marker(province.center, {
          icon: L.divIcon({
            className: 'customer-marker',
            html: `<div style="
              background: white;
              border: 2px solid #1976d2;
              border-radius: 50%;
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            ">${count}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })
        }).addTo(mapInstanceRef.current);
        
        polygonLayersRef.current.push(marker);
      }
    });
    
    // Fit bounds ke semua polygon
    if (polygonLayersRef.current.length > 0) {
      const group = new L.featureGroup(polygonLayersRef.current);
      if (group.getBounds().isValid()) {
        mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [20, 20] });
      }
    }
    
    console.log("Province polygons rendered successfully!");
  };
  // Add this helper function before renderProvincePolygons

  
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .province-label {
        background: transparent !important;
        border: none !important;
      }
      .custom-tooltip {
        background-color: rgba(255, 255, 255, 0.9);
        border: 2px solid #1976d2;
        border-radius: 4px;
        padding: 4px 8px;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      .customer-marker {
        background: transparent !important;
        border: none !important;
      }
      .leaflet-container {
        height: 100%;
        width: 100%;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // useEffect(() => {
  //   if (!mapInstanceRef.current || typeof window === "undefined") return;

  //   const loadGeoJSON = async () => {
  //     try {
  //       // Gunakan GeoJSON dari sumber publik atau simpan di folder lokal
  //       const response = await fetch('/data/indonesia-provinces.geojson');
  //       const data = await response.json();
        
  //       // Bersihkan layer yang ada
  //       if (polygonLayersRef.current.length > 0) {
  //         polygonLayersRef.current.forEach(layer => {
  //           mapInstanceRef.current.removeLayer(layer);
  //         });
  //         polygonLayersRef.current = [];
  //       }
        
  //       // Render data GeoJSON
  //       const geoJSONLayer = L.geoJSON(data, {
  //         style: (feature) => {
  //           const provinceName = feature.properties.name;
  //           const customerCount = provinceStats[provinceName] || 0;
  //           return {
  //             fillColor: getColor(customerCount),
  //             weight: 1,
  //             opacity: 1,
  //             color: '#333',
  //             fillOpacity: customerCount > 0 ? 0.7 : 0.3
  //           };
  //         },
  //         onEachFeature: (feature, layer) => {
  //           const provinceName = feature.properties.name;
  //           const customerCount = provinceStats[provinceName] || 0;
            
  //           layer.bindTooltip(`${provinceName}: ${customerCount} pelanggan`);
            
  //           layer.on({
  //             mouseover: (e) => {
  //               const layer = e.target;
  //               layer.setStyle({
  //                 weight: 2,
  //                 fillOpacity: 0.8,
  //                 color: '#1976d2'
  //               });
  //               layer.openTooltip();
  //             },
  //             mouseout: (e) => {
  //               const layer = e.target;
  //               const provinceName = layer.feature.properties.name;
  //               const customerCount = provinceStats[provinceName] || 0;
  //               geoJSONLayer.resetStyle(layer);
  //               layer.closeTooltip();
  //             },
  //             click: (e) => {
  //               const provinceName = e.target.feature.properties.name;
  //               // Bisa ditambahkan aksi ketika provinsi diklik
  //             }
  //           });
  //         }
  //       }).addTo(mapInstanceRef.current);
        
  //       polygonLayersRef.current.push(geoJSONLayer);
        
  //       // Fit bounds
  //       mapInstanceRef.current.fitBounds(geoJSONLayer.getBounds());
  //     } catch (error) {
  //       console.error('Error loading GeoJSON:', error);
  //       setMapError('Gagal memuat data peta provinsi');
  //     }
  //   };
    
  //   loadGeoJSON();
  // }, [provinceStats]);
  // Object.entries(provinceStats).forEach(([provinceName, count]) => {
  //   const province = provinceData.find(p => p.name === provinceName);
  //   if (province) {
  //     const marker = L.marker(province.center, {
  //       icon: L.divIcon({
  //         className: 'customer-marker',
  //         html: `<div class="marker-content">${count}</div>`,
  //         iconSize: [24, 24],
  //         iconAnchor: [12, 12]
  //       })
  //     }).addTo(mapInstanceRef.current);
      
  //     marker.bindTooltip(provinceName);
  //     polygonLayersRef.current.push(marker);
  //   }
  // });
  // Update peta ketika data berubah

// Dan juga update di useEffect
  useEffect(() => {
    if (mapInstanceRef.current && typeof window !== "undefined") {
      console.log("Province stats changed, updating map...");
      renderProvincePolygons(); // Tidak ada parameter L disini
    }
  }, [provinceStats]);

  // Load data saat komponen dimount
  useEffect(() => {
    getMapData()
  }, [])

  useEffect(() => {
    // Force update map size setelah render
    if (mapInstanceRef.current) {
      setTimeout(() => {
        console.log("Forcing map update...");
        mapInstanceRef.current.invalidateSize();
      }, 1000);
    }
  }, [activeView]); // Re
  // Hitung statistik
  const validUsersCount = mapData.users_with_orders.filter(
    (user) => user.address && user.latitude && user.longitude,
  ).length
  const usersWithoutLocation = mapData.users_with_orders.filter(
    (user) => !user.address || !user.latitude || !user.longitude,
  ).length

  const statsData = [
    {
      title: "Total Pelanggan",
      value: mapData.total_users,
      icon: <PeopleIcon />,
      color: "primary",
    },
    {
      title: "Total Pesanan",
      value: mapData.total_orders,
      icon: <ShoppingCartIcon />,
      color: "success",
    },
    {
      title: "Provinsi Aktif",
      value: Object.keys(provinceStats).length,
      icon: <MapIcon />,
      color: "info",
    },
    {
      title: "Tanpa Lokasi",
      value: usersWithoutLocation,
      icon: <WarningIcon />,
      color: "warning",
    },
  ]
  useEffect(() => {
    if (mapInstanceRef.current) {
      console.log("Province stats changed, updating map...");
      renderProvincePolygons();
    }
  }, [provinceStats]); // Re-render ketika data provinsi berubah
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <StyledCard>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
            <Box>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <MapIcon color="primary" />
                Sebaran Pelanggan per Provinsi
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Visualisasi distribusi pelanggan di berbagai provinsi Indonesia
              </Typography>
            </Box>
            <Tooltip title="Refresh Data">
              <Button
                variant="outlined"
                startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
                onClick={() => getMapData(true)}
                disabled={refreshing}
                sx={{ minWidth: 120 }}
              >
                {refreshing ? "Memuat..." : "Refresh"}
              </Button>
            </Tooltip>
          </Box>

          <ButtonGroup variant="contained" sx={{ mt: 2 }}>
            <Button
              variant={activeView === "polygon" ? "contained" : "outlined"}
              startIcon={<MapIcon />}
              onClick={() => setActiveView("polygon")}
            >
              Peta Provinsi
            </Button>
            <Button
              variant={activeView === "stats" ? "contained" : "outlined"}
              startIcon={<AnalyticsIcon />}
              onClick={() => setActiveView("stats")}
            >
              Statistik Detail
            </Button>
          </ButtonGroup>
        </Box>

        <CardContent>
          {/* Alert untuk error */}
          {error && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <AlertTitle>Peringatan</AlertTitle>
              {error}. Menampilkan data contoh untuk demonstrasi.
            </Alert>
          )}

          {/* Statistik Ringkas */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statsData.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StatsCard elevation={2}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 1 }}>
                    <Box sx={{ color: `${stat.color}.main`, mr: 1 }}>{stat.icon}</Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                      {stat.title}
                    </Typography>
                  </Box>
                  <Typography variant="h3" component="div" color={`${stat.color}.main`} fontWeight="bold">
                    {stat.value}
                  </Typography>
                </StatsCard>
              </Grid>
            ))}
          </Grid>

          
          {activeView === "polygon" ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <MapContainer>
                  {/* Atur style secara eksplisit */}
                  <div 
                    ref={mapRef} 
                    style={{ 
                      height: "100%", 
                      width: "100%", 
                      zIndex: 1,
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0
                    }} 
                  />
                  {mapLoading && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 2,
                      }}
                    >
                      <CircularProgress />
                      <Typography variant="body2" sx={{ ml: 2 }}>
                        Memuat peta...
                      </Typography>
                    </Box>
                  )}
                  {mapError && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 2,
                      }}
                    >
                      <Alert severity="error" sx={{ maxWidth: '80%' }}>
                        {mapError}
                      </Alert>
                    </Box>
                  )}
                </MapContainer>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, height: '100%', maxHeight: 500, overflow: 'auto' }}>
                  <Typography variant="h6" gutterBottom>
                    Sebaran Pelanggan
                  </Typography>
                  <List dense>
                    {Object.entries(provinceStats)
                      .sort(([, a], [, b]) => b - a)
                      .map(([province, count]) => (
                        <ListItem key={province}>
                          <ListItemIcon>
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                backgroundColor: getColor(count),
                                borderRadius: '50%'
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText 
                            primary={province} 
                            secondary={`${count} pelanggan`} 
                            primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItem>
                      ))}
                  </List>
                </Paper>
              </Grid>
              
              {/* Legenda di bawah */}
              <Grid item xs={12}>
                <LegendContainer>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Legenda Peta
                  </Typography>
                  
                  {/* Legenda kepadatan pelanggan */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                      Kepadatan Pelanggan
                    </Typography>
                    <Grid container spacing={2}>
                      {[
                        { range: "0 pelanggan", color: "#e0e0e0" },
                        { range: "1 pelanggan", color: "#689f38" },
                        { range: "2 pelanggan", color: "#fbc02d" },
                        { range: "3 pelanggan", color: "#f57c00" },
                        { range: ">3 pelanggan", color: "#d32f2f" },
                      ].map((item, index) => (
                        <Grid item xs={6} sm={4} md={2.4} key={index}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box
                              sx={{
                                width: 20,
                                height: 20,
                                backgroundColor: item.color,
                                borderRadius: 1,
                                border: 1,
                                borderColor: "grey.300",
                              }}
                            />
                            <Typography variant="body2">{item.range}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                  
                  {/* Legenda data regional */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                      Data Regional
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                          <Typography variant="subtitle2" gutterBottom color="primary">
                            Pulau Utama
                          </Typography>
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: '#1976d2',
                                    opacity: 0.3,
                                  }}
                                />
                                <Typography variant="body2">Jawa</Typography>
                              </Box>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: '#388e3c',
                                    opacity: 0.3,
                                  }}
                                />
                                <Typography variant="body2">Sumatera</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: '#e65100',
                                    opacity: 0.3,
                                  }}
                                />
                                <Typography variant="body2">Kalimantan</Typography>
                              </Box>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: '#f4511e',
                                    opacity: 0.3,
                                  }}
                                />
                                <Typography variant="body2">Bali</Typography>
                              </Box>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: '#6a1b9a',
                                    opacity: 0.3,
                                  }}
                                />
                                <Typography variant="body2">Sulawesi</Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                          <Typography variant="subtitle2" gutterBottom color="primary">
                            Elemen Peta
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <Box
                              sx={{
                                width: 20,
                                height: 10,
                                border: "2px solid #333",
                              }}
                            />
                            <Typography variant="body2">Batas provinsi</Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: 22,
                                height: 22,
                                border: "2px solid #1976d2",
                                borderRadius: '50%',
                                bgcolor: 'white',
                                color: '#1976d2',
                                fontSize: '10px',
                                fontWeight: 'bold',
                              }}
                            >
                              2
                            </Box>
                            <Typography variant="body2">Jumlah pelanggan per provinsi</Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box
                              sx={{
                                display: 'inline-block',
                                bgcolor: 'white',
                                border: '2px solid #1976d2',
                                borderRadius: '4px',
                                padding: '2px 6px',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                color: '#1976d2',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                              }}
                            >
                              Provinsi
                            </Box>
                            <Typography variant="body2">Tooltip saat hover</Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary">
                    * Warna provinsi menunjukkan kepadatan pelanggan. Provinsi tanpa pelanggan ditampilkan dengan warna dasar regional.
                    Hover pada provinsi untuk melihat detail dan klik untuk informasi lebih lanjut.
                  </Typography>
                </LegendContainer>
              </Grid>
            </Grid>
          ) : (
            /* Tampilan Statistik */
            <Box>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Detail Distribusi per Provinsi
              </Typography>

              {/* Provinsi dengan pelanggan */}
              {Object.keys(provinceStats).length > 0 && (
                <Paper sx={{ mb: 3 }}>
                  <Box sx={{ p: 2, backgroundColor: "primary.main", color: "white" }}>
                    <Typography variant="h6">Provinsi dengan Pelanggan</Typography>
                  </Box>
                  <List>
                    {Object.entries(provinceStats)
                      .sort(([, a], [, b]) => b - a)
                      .map(([province, count], index) => (
                        <Box key={province}>
                          <ListItem>
                            <ListItemIcon>
                              <Box
                                sx={{
                                  width: 24,
                                  height: 24,
                                  backgroundColor: getColor(count),
                                  borderRadius: 1,
                                  border: 1,
                                  borderColor: "grey.300",
                                }}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={province}
                              secondary={`${count} pelanggan terdaftar`}
                              primaryTypographyProps={{ fontWeight: "medium" }}
                            />
                            <Chip
                              label={count}
                              color="primary"
                              variant="outlined"
                              size="small"
                              sx={{ fontWeight: "bold" }}
                            />
                          </ListItem>
                          {index < Object.keys(provinceStats).length - 1 && <Divider />}
                        </Box>
                      ))}
                  </List>
                </Paper>
              )}

              {/* Pelanggan tanpa lokasi */}
              {usersWithoutLocation > 0 && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <AlertTitle>Informasi</AlertTitle>
                  Terdapat {usersWithoutLocation} pelanggan yang tidak memiliki alamat atau koordinat yang valid.
                </Alert>
              )}

              {/* Pelanggan dengan alamat tidak teridentifikasi */}
              {unidentifiedUsers.length > 0 && (
                <Paper sx={{ mb: 3 }}>
                  <Box sx={{ p: 2, backgroundColor: "warning.main", color: "white" }}>
                    <Typography variant="h6">Alamat Tidak Teridentifikasi</Typography>
                  </Box>
                  <List>
                    {unidentifiedUsers.map((user, index) => (
                      <Box key={user.id}>
                        <ListItem>
                          <ListItemIcon>
                            <LocationOnIcon color="warning" />
                          </ListItemIcon>
                          <ListItemText
                            primary={user.name}
                            secondary={user.address}
                            primaryTypographyProps={{ fontWeight: "medium" }}
                          />
                        </ListItem>
                        {index < unidentifiedUsers.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                </Paper>
              )}

              {Object.keys(provinceStats).length === 0 && usersWithoutLocation === 0 && (
                <Paper sx={{ p: 4, textAlign: "center" }}>
                  <LocationOnIcon sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Belum ada data pelanggan dengan lokasi yang valid
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Data akan muncul setelah pelanggan menambahkan alamat lengkap
                  </Typography>
                </Paper>
              )}
            </Box>
          )}
        </CardContent>
      </StyledCard>
    </Container>
  )
}

export default CustomerMapDistribution
