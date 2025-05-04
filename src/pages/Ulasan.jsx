"use client"

import { useState } from "react"
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Rating,
  CircularProgress,
  Divider,
  Paper,
  Modal,
  IconButton,
  useMediaQuery,
  Grid,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import Badge from "@mui/material/Badge"
import Avatar from "@mui/material/Avatar"
import { Person, Close, ArrowBackIos, ArrowForwardIos, ZoomIn } from "@mui/icons-material"
import { useReview } from "../context/ReviewContext"
import { createTheme, ThemeProvider } from "@mui/material/styles"

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: "#2e7d32", // Green color
    },
    secondary: {
      main: "#f50057",
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
})

// Styled components
const ReviewCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[8],
  },
}))

const UserInfo = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(2),
}))

const RatingSummaryCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  marginBottom: theme.spacing(4),
}))

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}))

// Styled component for product thumbnail
const ProductThumbnail = styled(Box)(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  cursor: "pointer",
  height: 100,
  "&:hover img": {
    transform: "scale(1.05)",
  },
  "&:hover .zoom-icon": {
    opacity: 1,
  },
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s ease",
  },
  "& .zoom-icon": {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "white",
    borderRadius: "50%",
    padding: theme.spacing(0.5),
    opacity: 0,
    transition: "opacity 0.3s ease",
    fontSize: "1rem",
  },
  "& .more-overlay": {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: "1.5rem",
  },
}))

// Styled component for the image modal
const ImageModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& .modal-content": {
    position: "relative",
    outline: "none",
    maxWidth: "90vw",
    maxHeight: "90vh",
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2),
  },
  "& .modal-image-container": {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  "& .modal-image": {
    maxWidth: "100%",
    maxHeight: "70vh",
    objectFit: "contain",
  },
  "& .close-button": {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
    zIndex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "white",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
  },
  "& .nav-button": {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "white",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
  },
  "& .prev-button": {
    left: theme.spacing(1),
  },
  "& .next-button": {
    right: theme.spacing(1),
  },
  "& .thumbnails": {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(2),
    overflowX: "auto",
    gap: theme.spacing(1),
    padding: theme.spacing(1),
  },
  "& .thumbnail": {
    width: 60,
    height: 60,
    objectFit: "cover",
    borderRadius: theme.shape.borderRadius,
    cursor: "pointer",
    opacity: 0.7,
    transition: "opacity 0.3s ease, transform 0.3s ease",
    "&:hover": {
      opacity: 1,
      transform: "scale(1.05)",
    },
  },
  "& .active-thumbnail": {
    opacity: 1,
    border: `2px solid ${theme.palette.primary.main}`,
  },
  "& .image-counter": {
    position: "absolute",
    bottom: theme.spacing(1),
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "white",
    padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
    borderRadius: 20,
    fontSize: "0.875rem",
  },
}))

function Ulasan() {
  const { reviews, loading, error } = useReview()
  const [modalOpen, setModalOpen] = useState(false)
  const [currentImages, setCurrentImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleOpenModal = (images, index = 0) => {
    setCurrentImages(images)
    setCurrentImageIndex(index)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
  }

  const handlePrevImage = (e) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === 0 ? currentImages.length - 1 : prev - 1))
  }

  const handleNextImage = (e) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === currentImages.length - 1 ? 0 : prev + 1))
  }

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index)
  }

  // Function to handle keyboard navigation in the modal
  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      handlePrevImage(e)
    } else if (e.key === "ArrowRight") {
      handleNextImage(e)
    } else if (e.key === "Escape") {
      handleCloseModal()
    }
  }

  // Function to render product images
  const renderProductImages = (images, reviewId) => {
    // If it's a string, convert to array (for backward compatibility)
    const imageArray = typeof images === "string" ? JSON.parse(images) : images;

    if (!imageArray || imageArray.length === 0) {
      return null;
    }

    // If there's only one image, render it normally (full width)
    if (imageArray.length === 1) {
      return (
        <Box
          sx={{
            height: 200,
            borderRadius: 1,
            overflow: "hidden",
            mb: 2,
            cursor: "pointer",
            position: "relative",
            "&:hover img": {
              transform: "scale(1.05)",
            },
            "&:hover .zoom-icon": {
              opacity: 1,
            },
          }}
          onClick={() => handleOpenModal(imageArray, 0)}
        >
          <img
            src={`${process.env.REACT_APP_API_URL}/${imageArray[0]}`}
            alt="Gambar Produk"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.3s ease",
            }}
          />
          <Box
            className="zoom-icon"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              color: "white",
              borderRadius: "50%",
              padding: 1,
              opacity: 0,
              transition: "opacity 0.3s ease",
            }}
          >
            <ZoomIn />
          </Box>
        </Box>
      )
    }

    // If there are multiple images, render in a uniform grid layout
    // Show max 5 images with a "+X" overlay for additional images
    const MAX_VISIBLE_IMAGES = 5
    const visibleImages = imageArray.slice(0, MAX_VISIBLE_IMAGES)
    const remainingCount = imageArray.length - MAX_VISIBLE_IMAGES

    return (
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={1}>
          {visibleImages.map((image, index) => (
            <Grid item xs={4} sm={4} md={4} key={index}>
              <ProductThumbnail onClick={() => handleOpenModal(imageArray, index)}>
                <img src={`${process.env.REACT_APP_API_URL}/${image}`} alt={`Gambar Produk ${index + 1}`} />
                <Box className="zoom-icon">
                  <ZoomIn fontSize="small" />
                </Box>
                {index === MAX_VISIBLE_IMAGES - 1 && remainingCount > 0 && (
                  <Box className="more-overlay">+{remainingCount}</Box>
                )}
              </ProductThumbnail>
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Container sx={{ py: 5, textAlign: "center" }}>
          <CircularProgress color="primary" />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Memuat ulasan...
          </Typography>
        </Container>
      </ThemeProvider>
    )
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <Container sx={{ py: 5 }}>
          <Card sx={{ textAlign: "center", p: 5 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Gagal memuat ulasan
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Mohon coba beberapa saat lagi
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </ThemeProvider>
    )
  }

  // Calculate average rating
  const averageRating = reviews.length ? reviews.reduce((acc, curr) => acc + curr.ratings, 0) / reviews.length : 0

  // Modify the reviews data to simulate multiple images for demonstration
  // In a real app, this would come from your API
  const enhancedReviews = reviews.map((review) => {
    // Simulate multiple images by creating an array if it's a string
    // In a real app, this would already be an array from your API
    const gambarProduk = Array.isArray(review.gambar_produk)
      ? review.gambar_produk
      : JSON.parse(review.gambar_produk || "[]");

    return {
      ...review,
      gambar_produk: gambarProduk,
    }
  })

  return (
    <ThemeProvider theme={theme}>
      <Container sx={{ py: 5 }}>
        <Typography
          variant="h4"
          component="h2"
          align="center"
          gutterBottom
          sx={{
            fontWeight: "bold",
            mb: 4,
            position: "relative",
            "&:after": {
              content: '""',
              position: "absolute",
              bottom: -10,
              left: "50%",
              transform: "translateX(-50%)",
              width: 60,
              height: 4,
              backgroundColor: theme.palette.primary.main,
              borderRadius: 2,
            },
          }}
        >
          Ulasan Pelanggan
        </Typography>

        {reviews.length === 0 ? (
          <Card sx={{ textAlign: "center", p: 5, maxWidth: 500, mx: "auto" }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Belum ada ulasan
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Jadilah yang pertama memberikan ulasan!
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Rating Summary */}
            <RatingSummaryCard elevation={3}>
              <Typography variant="h5" gutterBottom fontWeight="medium">
                Rating Keseluruhan
              </Typography>
              <Typography variant="h3" component="span" sx={{ mr: 2, fontWeight: "bold" }}>
                {averageRating.toFixed(1)}
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 1 }} className="">
                <Rating
                  value={averageRating}
                  precision={0.5}
                  readOnly
                  size="large"
                  sx={{
                    fontSize: "2rem",
                    color: theme.palette.primary.main,
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Berdasarkan {reviews.length} ulasan
              </Typography>
            </RatingSummaryCard>

            {/* Reviews List */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, 1fr)",
                },
                gap: 3,
              }}
            >
              {enhancedReviews.map((review) => (
                <ReviewCard key={review.id}>
                  <CardContent>
                    <UserInfo>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {review.user.isActive ? (
                          <StyledBadge
                            overlap="circular"
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            variant="dot"
                          >
                            <Avatar alt={review.user.name} src={review.user.profile_photo || ""}>
                              {!review.user.photo && <Person />}
                            </Avatar>
                          </StyledBadge>
                        ) : (
                          <Avatar alt={review.user.name} src={review.user.photo || ""}>
                            {!review.user.photo && <Person />}
                          </Avatar>
                        )}
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ ml: 1 }}>
                          {review.user.name}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(review.created_at)}
                      </Typography>
                    </UserInfo>

                    {/* Render product images */}
                    {renderProductImages(review.gambar_produk, review.id)}

                    <Box sx={{ mb: 2 }}>
                      <Rating
                        value={review.ratings}
                        readOnly
                        precision={0.5}
                        sx={{ color: theme.palette.primary.main }}
                      />
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Typography
                      variant="body1"
                      component="p"
                      sx={{
                        whiteSpace: "pre-line",
                        color: theme.palette.text.secondary,
                      }}
                    >
                      {review.ulasan} 
                    </Typography>
                  </CardContent>
                </ReviewCard>
              ))}
            </Box>
          </>
        )}

        {/* Image Modal */}
        <ImageModal
          open={modalOpen}
          onClose={handleCloseModal}
          aria-labelledby="image-modal"
          aria-describedby="modal-to-view-product-images"
          onKeyDown={handleKeyDown}
          closeAfterTransition
        >
          <Box className="modal-content">
            <IconButton className="close-button" onClick={handleCloseModal} aria-label="tutup">
              <Close />
            </IconButton>

            <Box className="modal-image-container">
              {currentImages.length > 1 && (
                <IconButton className="nav-button prev-button" onClick={handlePrevImage} aria-label="gambar sebelumnya">
                  <ArrowBackIos />
                </IconButton>
              )}

              <img
                src={`${process.env.REACT_APP_API_URL}/${currentImages[currentImageIndex]}`}
                alt={`Gambar Produk ${currentImageIndex + 1}`}
                className="modal-image"
              />

              {currentImages.length > 1 && (
                <IconButton className="nav-button next-button" onClick={handleNextImage} aria-label="gambar berikutnya">
                  <ArrowForwardIos />
                </IconButton>
              )}

              {currentImages.length > 1 && (
                <Box className="image-counter">
                  {currentImageIndex + 1} / {currentImages.length}
                </Box>
              )}
            </Box>

            {/* Thumbnails for navigation */}
            {currentImages.length > 1 && !isMobile && (
              <Box className="thumbnails">
                {currentImages.map((image, index) => (
                  <img
                    key={index}
                    src={`${process.env.REACT_APP_API_URL}/${image}`}
                    alt={`Thumbnail ${index + 1}`}
                    className={`thumbnail ${index === currentImageIndex ? "active-thumbnail" : ""}`}
                    onClick={() => handleThumbnailClick(index)}
                  />
                ))}
              </Box>
            )}
          </Box>
        </ImageModal>
      </Container>
    </ThemeProvider>
  )
}

export default Ulasan
