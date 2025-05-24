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
  Skeleton,
} from "@mui/material"
import { styled, useTheme } from "@mui/material/styles"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag"
import { useNavigate } from "react-router-dom"

// Context imports
import { useCart } from "../context/CartContext"
import axios from "axios"

// Styled components
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

const ProductImage = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  objectFit: "cover",
  marginRight: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}))

const MobileProductImage = styled(CardMedia)(({ theme }) => ({
  width: 100,
  height: 100,
  objectFit: "cover",
}))

function Cart() {
  // State
  const [cartItems, setCartItems] = useState([])
  const [notes, setNotes] = useState("")
  const [selectedItems, setSelectedItems] = useState({})
  const [loading, setLoading] = useState(true)
  
  // Hooks
  const { updateCartCount } = useCart()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // Image processing helper function
  const getImageUrl = (imagePaths) => {
    if (!imagePaths) return "/placeholder-image.jpg";
    
    try {
      // Handle array of images
      if (Array.isArray(imagePaths) && imagePaths.length > 0) {
        return `${process.env.REACT_APP_API_URL}/${imagePaths[0]}`;
      }
      
      // Handle JSON string of array
      if (typeof imagePaths === 'string') {
        // Try parsing as JSON first
        try {
          const parsedImages = JSON.parse(imagePaths);
          if (Array.isArray(parsedImages) && parsedImages.length > 0) {
            return `${process.env.REACT_APP_API_URL}/${parsedImages[0]}`;
          }
        } catch (e) {
          // If not valid JSON, check if it contains commas (possible stringified array)
          if (imagePaths.includes(',')) {
            const firstImage = imagePaths.split(',')[0]
              .replace('[', '')
              .replace('"', '')
              .replace("'", '')
              .trim();
            return `${process.env.REACT_APP_API_URL}/${firstImage}`;
          }
          
          // Handle as single path
          return imagePaths.startsWith('http') ? 
            imagePaths : 
            `${process.env.REACT_APP_API_URL}/${imagePaths}`;
        }
      }
      
      return "/placeholder-image.jpg";
    } catch (error) {
      console.error("Error processing image path:", error);
      return "/placeholder-image.jpg";
    }
  };

  // Load cart items from API or localStorage
  const loadCartItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      let items = [];

      if (token) {
        // If user is logged in, get items from API
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/order/itemlist`, 
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.data.data) {
            items = response.data.data.map((order, index) => {
              const catalog = order.order.catalog || {};
              return {
                ...order,
                cartId: order.order.id ? `backend-${order.order.id}` : `backend-temp-${index}`,
                name: catalog.nama_katalog || "Unknown Product",
                price: catalog.price || 0,
                image: catalog.gambar || "",
                quantity: order.order.jumlah || 1,
                size: order.order.size || "",
                colorName: order.order.color_name || "",
                features: catalog.feature ? JSON.parse(catalog.feature) : {},
                material: catalog.bahan || "",
              };
            });
          }
        } catch (error) {
          console.error("Error fetching cart from API:", error);
          // Fallback to localStorage
          items = processLocalItems();
        }
      } else {
        // Use localStorage for non-logged in users
        items = processLocalItems();
      }

      // Initialize all items as selected
      const initialSelectedState = {};
      items.forEach(item => {
        initialSelectedState[item.cartId] = true;
      });

      setSelectedItems(initialSelectedState);
      setCartItems(items);
      updateCartCount?.(items.length);
      
    } catch (error) {
      console.error("Failed to load cart items:", error);
    } finally {
      setLoading(false);
    }
  };

  // Process items from localStorage
  const processLocalItems = () => {
    const localItems = JSON.parse(localStorage.getItem("cart")) || [];
    return localItems.map(item => ({
      ...item,
      cartId: item.cartId || `local-${item.id || Date.now()}`,
    }));
  };

  // Load cart on component mount
  useEffect(() => {
    loadCartItems();
  }, []);

  // Format price for display
  const formatPrice = (price) => {
    if (!price || price === "RpNaN" || price === "Rp 0") return "Rp 0";
    
    if (typeof price === "string") {
      price = Number.parseFloat(price.replace(/[^\d]/g, ""));
    }
    
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    .format(price)
    .replace("IDR", "Rp");
  };

  // Handle quantity change
  const handleQuantityChange = async (cartId, value) => {
    const newQuantity = Math.max(1, Number.parseInt(value) || 1);

    // Optimistic UI update
    const newCartItems = cartItems.map(item =>
      item.cartId === cartId ? { ...item, quantity: newQuantity, jumlah: newQuantity } : item
    );
    setCartItems(newCartItems);

    const isBackendItem = cartId.startsWith("backend-");
    const token = localStorage.getItem("token");

    if (isBackendItem && token) {
      // Update via API for logged in users
      try {
        const itemId = cartId.replace("backend-", "");
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/order/addQuantity`,
          { order_id: itemId, jumlah: newQuantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error("Failed to update item quantity:", error);
        loadCartItems(); // Revert on error
      }
    } else {
      // Update localStorage for non-logged in users
      const localItems = JSON.parse(localStorage.getItem("cart")) || [];
      const updatedLocalItems = localItems.map(item => {
        const localCartId = item.cartId || `local-${item.id || Date.now()}`;
        return localCartId === cartId ? 
          { ...item, quantity: newQuantity, jumlah: newQuantity } : item;
      });
      localStorage.setItem("cart", JSON.stringify(updatedLocalItems));
    }
  };

  // Handle item removal
  const handleRemoveItem = async (cartId) => {
    const isBackendItem = cartId.startsWith("backend-");
    const token = localStorage.getItem("token");

    if (isBackendItem && token) {
      // Remove via API for logged in users
      try {
        const itemId = cartId.replace("backend-", "");
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/order/removeItem`, 
          {
            headers: { Authorization: `Bearer ${token}` },
            data: { order_id: itemId }
          }
        );
      } catch (error) {
        console.error("Failed to remove item:", error);
      }
    } else {
      // Remove from localStorage for non-logged in users
      const localItems = JSON.parse(localStorage.getItem("cart")) || [];
      const updatedLocalItems = localItems.filter(item => {
        const localCartId = item.cartId || `local-${item.id || Date.now()}`;
        return localCartId !== cartId;
      });
      localStorage.setItem("cart", JSON.stringify(updatedLocalItems));
    }

    // Update UI
    const newCartItems = cartItems.filter(item => item.cartId !== cartId);
    setCartItems(newCartItems);
    
    // Update selection state
    const newSelectedItems = { ...selectedItems };
    delete newSelectedItems[cartId];
    setSelectedItems(newSelectedItems);
    
    // Update cart count
    updateCartCount?.(newCartItems.length);
  };

  // Handle item selection
  const handleSelectItem = (cartId, checked) => {
    setSelectedItems(prev => ({
      ...prev,
      [cartId]: checked
    }));
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    const newSelectedState = {};
    cartItems.forEach(item => {
      newSelectedState[item.cartId] = checked;
    });
    setSelectedItems(newSelectedState);
  };

  // Calculate item total
  const calculateItemTotal = (item) => {
    const price = typeof item.price === "string"
      ? Number.parseFloat(item.price.replace(/[^\d]/g, ""))
      : item.price || item.catalog?.price || 0;
    
    return price * (item.quantity || item.jumlah || 1);
  };

  // Calculate cart total
  const calculateTotal = () => {
    return cartItems
      .filter(item => selectedItems[item.cartId])
      .reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  // Get selected item count
  const getSelectedItemCount = () => {
    return cartItems.filter(item => selectedItems[item.cartId]).length;
  };

  // Check if all items are selected
  const areAllSelected = cartItems.length > 0 && 
    cartItems.every(item => selectedItems[item.cartId]);

  // Handle checkout
  const handleCheckout = () => {
    const itemsToCheckout = cartItems.filter(item => selectedItems[item.cartId]);
    localStorage.setItem("checkoutItems", JSON.stringify(itemsToCheckout));
    localStorage.setItem("orderNotes", notes); // Save notes for checkout
    navigate("/checkout");
  };

  // Render loading skeleton for mobile
  const renderMobileSkeletons = () => (
    Array.from({ length: 2 }).map((_, index) => (
      <Card key={index} sx={{ mb: 2, position: "relative", opacity: 0.7 }}>
        <Box sx={{ display: "flex" }}>
          <Box sx={{ display: "flex", alignItems: "center", pl: 1 }}>
            <Skeleton variant="rectangular" width={24} height={24} sx={{ borderRadius: 1 }} />
          </Box>
          <Skeleton variant="rectangular" width={100} height={100} />
          <CardContent sx={{ flex: "1 0 auto", p: 2 }}>
            <Skeleton variant="text" width="70%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="40%" height={16} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="30%" height={16} sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", alignItems: "center", mt: 2, justifyContent: "space-between" }}>
              <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
              <Skeleton variant="text" width={60} height={20} />
            </Box>
          </CardContent>
        </Box>
      </Card>
    ))
  );

  // Render mobile cart
  const renderMobileCart = () => (
    <Box sx={{ mt: 2 }}>
      {loading ? renderMobileSkeletons() : (
        cartItems.map(item => (
          <Card key={item.cartId} sx={{ mb: 2, position: "relative" }}>
            <Box sx={{ display: "flex" }}>
              <Box sx={{ display: "flex", alignItems: "center", pl: 1 }}>
                <Checkbox
                  checked={selectedItems[item.cartId] || false}
                  onChange={(e) => handleSelectItem(item.cartId, e.target.checked)}
                  color="primary"
                />
              </Box>
              <MobileProductImage
                component="img"
                image={getImageUrl(item.image || (item.catalog?.gambar))}
                alt={item.name || "Product"}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/placeholder-image.jpg";
                }}
              />
              <CardContent sx={{ flex: "1 0 auto", p: 2 }}>
                <Typography variant="subtitle1" component="div" fontWeight="bold">
                  {item.name || item.catalog?.nama_katalog || "Product"}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  {item.size && (
                    <Typography variant="body2" color="text.secondary">
                      Ukuran: {item.size}
                    </Typography>
                  )}
                  {item.colorName && (
                    <Typography variant="body2" color="text.secondary">
                      Warna: {item.colorName}
                    </Typography>
                  )}
                </Box>
                <Typography variant="body1" color="primary" fontWeight="medium" sx={{ mt: 1 }}>
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
        ))
      )}
    </Box>
  );

  // Render loading skeleton for desktop
  const renderDesktopSkeletons = () => (
    Array.from({ length: 3 }).map((_, index) => (
      <StyledTableRow key={index}>
        <TableCell padding="checkbox">
          <Skeleton variant="rectangular" width={24} height={24} sx={{ borderRadius: 1 }} />
        </TableCell>
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Skeleton 
              variant="rectangular" 
              width={60} 
              height={60} 
              sx={{ mr: 2, borderRadius: 1 }} 
            />
            <Box>
              <Skeleton variant="text" width={120} height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" width={80} height={16} />
            </Box>
          </Box>
        </TableCell>
        <TableCell align="right">
          <Skeleton variant="text" width={80} height={20} sx={{ ml: "auto" }} />
        </TableCell>
        <TableCell align="center">
          <Skeleton variant="rectangular" width={100} height={32} sx={{ margin: "0 auto" }} />
        </TableCell>
        <TableCell align="right">
          <Skeleton variant="text" width={80} height={20} sx={{ ml: "auto" }} />
        </TableCell>
        <TableCell align="center">
          <Skeleton variant="circular" width={32} height={32} sx={{ margin: "0 auto" }} />
        </TableCell>
      </StyledTableRow>
    ))
  );

  // Render desktop cart
  const renderDesktopCart = () => (
    <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 2 }}>
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
          {loading ? renderDesktopSkeletons() : (
            cartItems.map(item => (
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
                    <ProductImage
                      component="img"
                      src={getImageUrl(item.image || (item.catalog?.gambar))}
                      alt={item.name || "Product"}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder-image.jpg";
                      }}
                    />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {item.name || item.catalog?.nama_katalog || "Product"}
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 0.5 }}>
                        {item.size && (
                          <Typography variant="body2" color="text.secondary">
                            Ukuran: {item.size}
                          </Typography>
                        )}
                        {item.colorName && (
                          <Typography variant="body2" color="text.secondary" sx={{ ml: item.size ? 1 : 0 }}>
                            • Warna: {item.colorName}
                          </Typography>
                        )}
                      </Box>
                      {item.material && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                          Bahan: {item.material}
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
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Render empty cart
  const renderEmptyCart = () => (
    <EmptyCartContainer>
      <ShoppingBagIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Keranjang belanja Anda kosong
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => navigate("/category/gamis")} 
        sx={{ mt: 2 }}
      >
        Mulai Belanja
      </Button>
    </EmptyCartContainer>
  );

  // Order summary
  const renderOrderSummary = () => (
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
  );

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
            {renderOrderSummary()}
          </Box>
        </Box>
      )}
    </Container>
  );
}

export default Cart