import { useState, useEffect } from "react"
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
  Checkbox,
} from "@mui/material"
import { styled, useTheme } from "@mui/material/styles"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag"
import { useNavigate } from "react-router-dom"

// Assuming CartContext is imported the same way
import { useCart } from "../context/CartContext"
import axios from "axios"

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 500,
  padding: theme.spacing(2),
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
}))

const QuantityInput = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderRadius: theme.shape.borderRadius,
    },
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
  "& .MuiInputBase-input": {
    textAlign: "center",
    padding: theme.spacing(1),
    width: "40px",
  },
}))

const EmptyCartContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(8),
  textAlign: "center",
}))

const OrderSummaryPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  boxShadow: theme.shadows[2],
  position: "sticky",
  top: theme.spacing(2),
}))

function Cart() {
  const [cartItems, setCartItems] = useState([])
  const [notes, setNotes] = useState("")
  const [selectedItems, setSelectedItems] = useState({})
  const [loading, setLoading] = useState(true)
  const { updateCartCount } = useCart()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // Add this function to help with debugging
  const debugCartItems = () => {
    console.log("Current cart items:", cartItems)
    if (cartItems.length > 0) {
      console.log("First item details:", {
        name: cartItems[0].name,
        price: cartItems[0].price,
        image: cartItems[0].image,
        quantity: cartItems[0].quantity,
        catalog: cartItems[0].catalog,
      })
    }
  }



  useEffect(() => {
    if (!loading && cartItems.length > 0) {
      debugCartItems()
    }
  }, [loading, cartItems])

  const loadCartItems = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      // Initialize items array
      let items = []

      if (token) {
        // If user is logged in, prioritize backend items
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/order/itemlist`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          console.log("API Response:", response.data.data)

          if (response.data.data) {
            items = response.data.data.map((order, index) => {
              const catalog = order.order.catalog || {}
              return {
                ...order,
                cartId: order.order.id ? `backend-${order.order.id}` : `backend-temp-${index}`,
                name: catalog.nama_katalog || "Unknown Product",
                price: catalog.price || 0,
                image: catalog.gambar || "",
                quantity: order.order.jumlah || 1,
                size: order.order.size || "",
              }
            })
            console.log(
              "Mapped items with IDs:",
              items.map((item) => ({
                id: item.id,
                cartId: item.cartId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size,
              })),
            )
          }
        } catch (error) {
          console.error("Error fetching cart from API:", error)
          // If API fails, fall back to localStorage
          const localItems = JSON.parse(localStorage.getItem("cart")) || []
          items = localItems.map((item) => ({
            ...item,
            cartId: item.cartId || `local-${item.id || Date.now()}`,
          }))
        }
      } else {
        // If user is not logged in, use localStorage only
        const localItems = JSON.parse(localStorage.getItem("cart")) || []
        items = localItems.map((item) => ({
          ...item,
          cartId: item.cartId || `local-${item.id || Date.now()}`,
        }))
      }

      // Initialize all items as selected
      const initialSelectedState = {}
      items.forEach((item) => {
        initialSelectedState[item.cartId] = true
      })

      setSelectedItems(initialSelectedState)
      setCartItems(items)

      // Update cart count in context
      if (typeof updateCartCount === "function") {
        updateCartCount(items.length)
      }
    } catch (error) {
      console.error("Failed to load cart items:", error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    loadCartItems()
  }, [])
  const formatPrice = (price) => {
    if (!price || price === "RpNaN" || price === "Rp 0") return "Rp 0"
    if (typeof price === "string") {
      price = Number.parseFloat(price.replace(/[^\d]/g, ""))
    }
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(price)
      .replace("IDR", "Rp")
  }

  const handleQuantityChange = async (cartId, value) => {
    const newQuantity = Number.parseInt(value) || 1

    // Update UI immediately for better UX
    const newCartItems = cartItems.map((item) =>
      item.cartId === cartId ? { ...item, quantity: newQuantity, jumlah: newQuantity } : item,
    )
    setCartItems(newCartItems)

    // Determine if this is a backend or local item
    const isBackendItem = cartId.startsWith("backend-")

    if (isBackendItem && localStorage.getItem("token")) {
      // If it's a backend item and user is logged in, update via API
      try {
        const itemId = cartId.replace("backend-", "")
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/order/addQuantity`,
          { order_id: itemId, jumlah: newQuantity },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        )
      } catch (error) {
        console.error("Failed to update item quantity:", error)
        // Revert UI if API call fails
        loadCartItems()
      }
    } else {
      // For local items, update localStorage
      const localItems = JSON.parse(localStorage.getItem("cart")) || []
      const updatedLocalItems = localItems.map((item) => {
        const localCartId = item.cartId || `local-${item.id || Date.now()}`
        return localCartId === cartId ? { ...item, quantity: newQuantity, jumlah: newQuantity } : item
      })
      localStorage.setItem("cart", JSON.stringify(updatedLocalItems))
    }
  }

  const handleRemoveItem = async (cartId) => {
    // Determine if this is a backend or local item
    const isBackendItem = cartId.startsWith("backend-")

    if (isBackendItem && localStorage.getItem("token")) {
      // If it's a backend item and user is logged in, delete via API
      try {
        const itemId = cartId.replace("backend-", "")
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/order/removeItem`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          data: { order_id: itemId },
        })
      } catch (error) {
        console.error("Failed to remove item:", error)
      }
    } else {
      // For local items, update localStorage
      const localItems = JSON.parse(localStorage.getItem("cart")) || []
      const updatedLocalItems = localItems.filter((item) => {
        const localCartId = item.cartId || `local-${item.id || Date.now()}`
        return localCartId !== cartId
      })
      localStorage.setItem("cart", JSON.stringify(updatedLocalItems))
    }

    // Update UI
    const newCartItems = cartItems.filter((item) => item.cartId !== cartId)
    setCartItems(newCartItems)

    // Update selected items state
    const newSelectedItems = { ...selectedItems }
    delete newSelectedItems[cartId]
    setSelectedItems(newSelectedItems)

    // Update cart count in context
    if (typeof updateCartCount === "function") {
      updateCartCount(newCartItems.length)
    }
  }

  const handleSelectItem = (cartId, checked) => {
    setSelectedItems((prev) => ({
      ...prev,
      [cartId]: checked,
    }))
  }

  const handleSelectAll = (checked) => {
    const newSelectedState = {}
    cartItems.forEach((item) => {
      newSelectedState[item.cartId] = checked
    })
    setSelectedItems(newSelectedState)
  }

  const areAllSelected = cartItems.length > 0 && cartItems.every((item) => selectedItems[item.cartId])

  const calculateItemTotal = (item) => {
    const price =
      typeof item.price === "string"
        ? Number.parseFloat(item.price.replace(/[^\d]/g, ""))
        : item.price || item.catalog?.price || 0
    return price * (item.quantity || item.jumlah || 1)
  }

  const calculateTotal = () => {
    return cartItems
      .filter((item) => selectedItems[item.cartId])
      .reduce((total, item) => total + calculateItemTotal(item), 0)
  }

  const getSelectedItemCount = () => {
    return cartItems.filter((item) => selectedItems[item.cartId]).length
  }

  const handleCheckout = () => {
    // Filter only selected items for checkout
    const itemsToCheckout = cartItems.filter((item) => selectedItems[item.cartId])
    // Store selected items for checkout
    localStorage.setItem("checkoutItems", JSON.stringify(itemsToCheckout))
    navigate("/checkout")
  }

  const renderMobileCart = () => {
    return (
      <Box sx={{ mt: 2 }}>
        {loading
          ? Array.from({ length: 2 }).map((_, index) => (
              <Card key={index} sx={{ mb: 2, position: "relative", opacity: 0.7 }}>
                <Box sx={{ display: "flex" }}>
                  <Box sx={{ display: "flex", alignItems: "center", pl: 1 }}>
                    <div style={{ width: 24, height: 24, backgroundColor: "#e0e0e0", borderRadius: 4 }} />
                  </Box>
                  <div style={{ width: 100, height: 100, backgroundColor: "#e0e0e0" }} />
                  <CardContent sx={{ flex: "1 0 auto", p: 2 }}>
                    <div style={{ width: "70%", height: 20, backgroundColor: "#e0e0e0", marginBottom: 8 }} />
                    <div style={{ width: "40%", height: 16, backgroundColor: "#e0e0e0", marginBottom: 8 }} />
                    <div style={{ width: "30%", height: 16, backgroundColor: "#e0e0e0", marginBottom: 16 }} />
                    <Box sx={{ display: "flex", alignItems: "center", mt: 2, justifyContent: "space-between" }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <div style={{ width: 80, height: 32, backgroundColor: "#e0e0e0", borderRadius: 4 }} />
                      </Box>
                      <div style={{ width: 60, height: 20, backgroundColor: "#e0e0e0" }} />
                    </Box>
                  </CardContent>
                </Box>
              </Card>
            ))
          : cartItems.map((item) => (
              <Card key={item.cartId} sx={{ mb: 2, position: "relative" }}>
                <Box sx={{ display: "flex" }}>
                  <Box sx={{ display: "flex", alignItems: "center", pl: 1 }}>
                    <Checkbox
                      checked={selectedItems[item.cartId] || false}
                      onChange={(e) => handleSelectItem(item.cartId, e.target.checked)}
                      color="primary"
                    />
                  </Box>
                  <CardMedia
                    component="img"
                    sx={{ width: 100, height: 100, objectFit: "cover" }}
                    image={item.image ? `${process.env.REACT_APP_API_URL}/${item.image}` : "/placeholder-image.jpg"}
                    alt={item.name || "Product"}
                  />
                  <CardContent sx={{ flex: "1 0 auto", p: 2 }}>
                    <Typography variant="subtitle1" component="div" fontWeight="bold">
                      {item.name || item.catalog?.nama_katalog || "Product"}
                    </Typography>
                    {item.size && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Ukuran: {item.size}
                      </Typography>
                    )}
                    <Typography variant="body1" color="primary" fontWeight="medium">
                      {formatPrice(item.price)}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", mt: 2, justifyContent: "space-between" }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.cartId, (item.quantity || 1) - 1)}
                          disabled={(item.quantity || 1) <= 1}
                          sx={{ bgcolor: "action.hover" }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <TextField
                          variant="outlined"
                          size="small"
                          value={item.quantity || 1}
                          onChange={(e) => handleQuantityChange(item.cartId, e.target.value)}
                          inputProps={{ min: 1, style: { textAlign: "center", width: "30px", padding: "4px" } }}
                          sx={{ mx: 1 }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.cartId, (item.quantity || 1) + 1)}
                          sx={{ bgcolor: "action.hover" }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      <Typography variant="body1" fontWeight="bold">
                        {formatPrice(calculateItemTotal(item))}
                      </Typography>
                    </Box>
                  </CardContent>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveItem(item.cartId)}
                  sx={{ position: "absolute", top: 8, right: 8 }}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Card>
            ))}
      </Box>
    )
  }

  const renderDesktopCart = () => {
    return (
      <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 2, width: "100%" }}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell padding="checkbox" width="48px">
                <Checkbox
                  checked={areAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  color="primary"
                  indeterminate={getSelectedItemCount() > 0 && getSelectedItemCount() < cartItems.length}
                />
              </StyledTableCell>
              <StyledTableCell>Produk</StyledTableCell>
              <StyledTableCell align="right">Harga</StyledTableCell>
              <StyledTableCell align="center">Kuantitas</StyledTableCell>
              <StyledTableCell align="right">Total</StyledTableCell>
              <StyledTableCell align="center">Aksi</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <StyledTableRow key={index}>
                    <TableCell padding="checkbox">
                      <div style={{ width: 24, height: 24, backgroundColor: "#e0e0e0", borderRadius: 4 }} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <div
                          style={{
                            width: 60,
                            height: 60,
                            backgroundColor: "#e0e0e0",
                            marginRight: 16,
                            borderRadius: 4,
                          }}
                        />
                        <Box>
                          <div style={{ width: 120, height: 20, backgroundColor: "#e0e0e0", marginBottom: 8 }} />
                          <div style={{ width: 80, height: 16, backgroundColor: "#e0e0e0" }} />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <div style={{ width: 80, height: 20, backgroundColor: "#e0e0e0", marginLeft: "auto" }} />
                    </TableCell>
                    <TableCell align="center">
                      <div style={{ width: 100, height: 32, backgroundColor: "#e0e0e0", margin: "0 auto" }} />
                    </TableCell>
                    <TableCell align="right">
                      <div style={{ width: 80, height: 20, backgroundColor: "#e0e0e0", marginLeft: "auto" }} />
                    </TableCell>
                    <TableCell align="center">
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          backgroundColor: "#e0e0e0",
                          borderRadius: "50%",
                          margin: "0 auto",
                        }}
                      />
                    </TableCell>
                  </StyledTableRow>
                ))
              : cartItems.map((item) => (
                  <StyledTableRow key={item.cartId}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedItems[item.cartId] || false}
                        onChange={(e) => handleSelectItem(item.cartId, e.target.checked)}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                          component="img"
                          src={item.image ? `${process.env.REACT_APP_API_URL}/${item.image}` : "/placeholder-image.jpg"}
                          alt={item.name || "Product"}
                          sx={{ width: 60, height: 60, objectFit: "cover", mr: 2, borderRadius: 1 }}
                        />
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {item.name || item.catalog?.nama_katalog || "Product"}
                          </Typography>
                          {item.size && (
                            <Typography variant="body2" color="text.secondary">
                              Ukuran: {item.size}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">{formatPrice(item.price)}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.cartId, (item.quantity || 1) - 1)}
                          disabled={(item.quantity || 1) <= 1}
                          sx={{ bgcolor: "action.hover" }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <QuantityInput
                          variant="outlined"
                          size="small"
                          value={item.quantity || 1}
                          onChange={(e) => handleQuantityChange(item.cartId, e.target.value)}
                          inputProps={{ min: 1 }}
                          sx={{ mx: 1 }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.cartId, (item.quantity || 1) + 1)}
                          sx={{ bgcolor: "action.hover" }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="medium">{formatPrice(calculateItemTotal(item))}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color="error" onClick={() => handleRemoveItem(item.cartId)} size="small">
                        <DeleteOutlineIcon />
                      </IconButton>
                    </TableCell>
                  </StyledTableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  const renderEmptyCart = () => {
    return (
      <EmptyCartContainer>
        <ShoppingBagIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Keranjang belanja Anda kosong
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate("/category/gamis")} sx={{ mt: 2 }}>
          Mulai Belanja
        </Button>
      </EmptyCartContainer>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Keranjang
      </Typography>

      {!loading && cartItems.length === 0 ? (
        renderEmptyCart()
      ) : (
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>
          <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 70%" }, mb: { xs: 3, md: 0 } }}>
            {isMobile ? renderMobileCart() : renderDesktopCart()}
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", md: "0 0 28%" }, ml: { xs: 0, md: 2 } }}>
            <OrderSummaryPaper>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Catatan Pesanan
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Masukkan catatan untuk pesanan Anda"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                variant="outlined"
                sx={{ mb: 3 }}
              />

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom fontWeight="bold">
                Ringkasan Pesanan
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body1">Jumlah Item:</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {getSelectedItemCount()}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Total:
                </Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {formatPrice(calculateTotal())}
                </Typography>
              </Box>

              <Button
                variant="contained"
                style={{ backgroundColor: "#6B4A3D", color: "white" }}
                fullWidth
                size="large"
                onClick={handleCheckout}
                sx={{ py: 1.5 }}
                disabled={getSelectedItemCount() === 0}
              >
                Pembayaran
              </Button>
            </OrderSummaryPaper>
          </Box>
        </Box>
      )}
    </Container>
  )
}

export default Cart
