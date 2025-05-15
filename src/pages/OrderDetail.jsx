import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
  Typography,
  Card,
  CardContent,
  Box,
  Container,
  Paper,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material"

import Timeline from "@mui/lab/Timeline"
import TimelineItem from "@mui/lab/TimelineItem"
import TimelineSeparator from "@mui/lab/TimelineSeparator"
import TimelineConnector from "@mui/lab/TimelineConnector"
import TimelineContent from "@mui/lab/TimelineContent"
import TimelineDot from "@mui/lab/TimelineDot"
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent"
import axios from "axios"

const CustomOrderDetail = () => {
  const { id } = useParams() // Ambil id dari URL
  const [anchorEl, setAnchorEl] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [order, setOrder] = useState(null)

  const getDetail = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/order/custom/show/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      console.log("detail pesanan : ", res.data.data)
      setOrder(res.data.data)
    } catch (error) {
      console.error("Error fetching order details:", error)
    }
  }

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const menuId = "primary-search-account-menu"
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      id={menuId}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
      <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
    </Menu>
  )

  const navItems = [
    { name: "Katalog", path: "/katalog" },
    { name: "Pemesanan", path: "/pemesanan" },
    { name: "Galeri", path: "/galeri" },
    { name: "Tentang Kami", path: "/tentang-kami" },
    { name: "Kontak", path: "/kontak" },
    { name: "Ulasan", path: "/ulasan" },
  ]
const statusMapping = {
    pending: {
        title: "Pengajuan harga",
        description: "Penjual akan menimbang harga yang Anda ajukan",
    },
    disetujui: {
        title: "Harga diterima",
        description: "Penjual telah menerima harga yang Anda ajukan",
    },
    proses: {
        title: "Produk dibuat",
        description: "Penjual sedang membuat produk Anda",
    },
    selesai: {
        title: "Produk diterima",
        description: "Produk telah sampai ke tangan Anda",
    },
    ditolak: {
        title: "Pengajuan ditolak",
        description: "Penjual menolak pengajuan Anda",
    },
    dibatalkan: {
        title: "Pesanan dibatalkan",
        description: "Pesanan telah dibatalkan",
    },
};

const orderTimelineSteps = [];
const statuses = ["pending", "disetujui", "proses", "selesai", "ditolak", "dibatalkan"];
const currentStatusIndex = statuses.indexOf(order?.status || "pending");

statuses.forEach((status, index) => {
    if (index > currentStatusIndex) return; // Skip steps beyond the current status

    orderTimelineSteps.push({
        date: new Date(order?.created_at).toLocaleDateString("id-ID", { year: 'numeric', month: 'long', day: 'numeric' }),
        time: new Date(order?.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }),
        title: statusMapping[status].title,
        description: statusMapping[status].description,
        active: index === currentStatusIndex,
    });
});

  useEffect(() => {
    getDetail()
  }, [id]) // Fixed dependency array

  return (
    <Container maxWidth="lg" sx={{ padding: 4 }}>
      <Card
        sx={{
          maxWidth: 900,
          margin: "0 auto",
          border: "1px solid #D9B99B",
          borderRadius: "12px",
          padding: 4,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent>
          <Typography
            variant="h4"
            component="h1"
            align="center"
            sx={{
              color: "#D9B99B",
              marginBottom: 4,
              fontWeight: 600,
              borderBottom: "2px solid #f0e6d9",
              paddingBottom: 2,
            }}
          >
            Pesanan Custom
          </Typography>

          <Box sx={{ marginBottom: 4 }}>
            {/* <Typography
              variant="h6"
              component="h2"
              sx={{
                borderBottom: "1px solid #75584A",
                paddingBottom: "8px",
                marginBottom: "24px",
                fontWeight: 500,
              }}
            >
              Item
            </Typography> */}

            {order ? (
              <Box sx={{ marginBottom: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 4,
                    alignItems: "flex-start",
                  }}
                >
                  {/* Product Image */}
                  <Box
                    sx={{
                      flex: { xs: "1 1 100%", md: "0 0 40%" },
                      maxWidth: { xs: "100%", md: "40%" },
                    }}
                  >
                    <Box
                      component="img"
                      src={`${process.env.REACT_APP_API_URL}/${order.gambar_referensi}`}
                      alt="Baju Koko Katun"
                      sx={{
                        width: "100%",
                        borderRadius: "8px",
                        objectFit: "cover",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      }}
                    />
                  </Box>

                  {/* Product Details Table */}
                  <Box
                    sx={{
                      flex: { xs: "1 1 100%", md: "0 0 60%" },
                      maxWidth: { xs: "100%", md: "60%" },
                    }}
                  >
                    <TableContainer
                      component={Paper}
                      sx={{
                        mb: 2,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        border: "1px solid #f0f0f0",
                        borderRadius: "8px",
                        overflow: "hidden",
                      }}
                    >
                      <Table>
                        <TableHead sx={{ backgroundColor: "#f9f4ef" }}>
                          <TableRow>
                            <TableCell colSpan={2}>
                              <Typography variant="h6" sx={{ fontWeight: 500, color: "#75584A" }}>
                                Detail Pesanan
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 500, width: "40%" }}>Jenis Bahan</TableCell>
                            <TableCell>{order.detail_bahan || "pending"}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 500 }}>Sumber Kain</TableCell>
                            <TableCell>{order.sumber_kain || "pending"}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 500 }}>Tipe Pakaian</TableCell>
                            <TableCell>{order.jenis_baju || "Baju koko"}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 500 }}>Ukuran</TableCell>
                            <TableCell>{order.ukuran || 'Ukuran'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 500 }}>Jumlah</TableCell>
                            <TableCell>{order.jumlah || 'Jumlah'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 500 }}>Catatan</TableCell>
                            <TableCell>{order.catatan || 'Catatan'}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: "8px",
                        backgroundColor: "#f9f4ef",
                        border: "1px solid #D9B99B",
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 500, color: "#75584A" }}>
                        Harga: {order.price ? `Rp ${order.price.toLocaleString("id-ID")}` : "pending"}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography>Loading order details...</Typography>
              </Box>
            )}
          </Box>

          <Box>
            <Typography variant="h6" component="h2" sx={{ marginBottom: 3, fontWeight: 500 }}>
              Status Pesanan
            </Typography>

            <Paper
              elevation={0}
              sx={{
                border: "1px solid #D9B99B",
                borderRadius: "8px",
                padding: 3,
                backgroundColor: "#f9f4ef",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <Timeline position="right">
                {orderTimelineSteps.map((step, index) => (
                  <TimelineItem key={index}>
                    <TimelineOppositeContent sx={{ flex: 0.2 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {step.date}
                      </Typography>
                      <Typography variant="caption">{step.time}</Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot
                        sx={{
                          backgroundColor: step.active ? "#2BAA6D" : "grey.400",
                        }}
                      />
                      {index < orderTimelineSteps.length - 1 && (
                        <TimelineConnector
                          sx={{
                            backgroundColor: orderTimelineSteps[index + 1].active ? "#2BAA6D" : "grey.400",
                          }}
                        />
                      )}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body1" fontWeight="medium">
                        {step.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {step.description}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </Paper>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}

export default CustomOrderDetail
