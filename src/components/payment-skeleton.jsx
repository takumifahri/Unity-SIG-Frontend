"use client"

import { useState, useEffect } from "react"
import { Box, Card, CardContent, CardHeader, Container, Grid, Paper, Skeleton, Divider, Fade } from "@mui/material"

const PaymentSkeletonWithAnimation = () => {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box maxWidth="md" mx="auto">
        <Fade in={showContent} timeout={500}>
          <Box>
            {/* Header Section Skeleton */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} animation="wave" />
              <Skeleton variant="rectangular" width={140} height={32} sx={{ borderRadius: 4 }} animation="wave" />
            </Box>

            {/* Order Details Card Skeleton */}
            <Card variant="outlined" sx={{ mb: 3, overflow: "hidden" }}>
              <CardHeader
                title={<Skeleton variant="text" width={120} animation="wave" />}
                sx={{
                  bgcolor: "grey.200",
                  py: 2,
                }}
              />

              <CardContent sx={{ p: 3 }}>
                {/* Order Information Section */}
                <Grid container spacing={3} mb={3} justifyContent="space-between">
                  <Grid item xs={12} md={6}>
                    <Skeleton variant="text" width={140} height={28} sx={{ mb: 1 }} animation="wave" />
                    <Skeleton variant="text" width={180} height={20} sx={{ mb: 0.5 }} animation="wave" />
                    <Skeleton variant="text" width={160} height={20} sx={{ mb: 1 }} animation="wave" />
                    <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 1 }} animation="wave" />
                  </Grid>

                  <Grid item xs={12} md={6} sx={{ textAlign: { md: "right" } }}>
                    <Skeleton
                      variant="text"
                      width={120}
                      height={28}
                      sx={{ mb: 1, ml: { md: "auto" } }}
                      animation="wave"
                    />
                    <Skeleton
                      variant="text"
                      width={150}
                      height={40}
                      sx={{ mb: 1, ml: { md: "auto" } }}
                      animation="wave"
                    />
                    <Skeleton variant="text" width={140} height={20} sx={{ ml: { md: "auto" } }} animation="wave" />
                  </Grid>
                </Grid>

                {/* Payment Information Section */}
                <Divider sx={{ my: 3 }} />
                <Skeleton variant="text" width={140} height={28} sx={{ mb: 2 }} animation="wave" />

                <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "grey.50" }}>
                  <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
                    <Grid item xs={12} sm={4} md={3}>
                      <Skeleton variant="text" width={40} height={16} sx={{ mb: 0.5 }} animation="wave" />
                      <Skeleton variant="text" width={60} height={20} animation="wave" />
                    </Grid>
                    <Grid item xs={12} sm={4} md={4}>
                      <Skeleton variant="text" width={100} height={16} sx={{ mb: 0.5 }} animation="wave" />
                      <Box display="flex" alignItems="center">
                        <Skeleton variant="text" width={120} height={20} sx={{ mr: 1 }} animation="wave" />
                        <Skeleton
                          variant="rectangular"
                          width={50}
                          height={24}
                          sx={{ borderRadius: 1 }}
                          animation="wave"
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                      <Skeleton variant="text" width={90} height={16} sx={{ mb: 0.5 }} animation="wave" />
                      <Skeleton variant="text" width={100} height={20} animation="wave" />
                    </Grid>
                  </Grid>
                </Paper>

                {/* Alert Skeleton */}
                <Box sx={{ p: 2, bgcolor: "blue.50", borderRadius: 1, mb: 3 }}>
                  <Skeleton variant="text" width="80%" height={20} animation="wave" />
                </Box>

                {/* Order Summary Section */}
                <Divider sx={{ my: 3 }} />
                <Skeleton variant="text" width={120} height={28} sx={{ mb: 2 }} animation="wave" />

                {/* Product Item Skeleton */}
                <Box sx={{ maxHeight: 300, overflow: "auto", pr: 1, mb: 3 }}>
                  <Box display="flex" pb={2} borderBottom={1} borderColor="divider">
                    <Skeleton
                      variant="rectangular"
                      width={64}
                      height={64}
                      sx={{ mr: 2, borderRadius: 1 }}
                      animation="wave"
                    />
                    <Box flex={1}>
                      <Skeleton variant="text" width="70%" height={24} sx={{ mb: 1 }} animation="wave" />
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        <Skeleton
                          variant="rectangular"
                          width={80}
                          height={20}
                          sx={{ borderRadius: 1 }}
                          animation="wave"
                        />
                        <Skeleton
                          variant="rectangular"
                          width={60}
                          height={20}
                          sx={{ borderRadius: 1 }}
                          animation="wave"
                        />
                        <Skeleton
                          variant="rectangular"
                          width={70}
                          height={20}
                          sx={{ borderRadius: 1 }}
                          animation="wave"
                        />
                      </Box>
                    </Box>
                    <Box textAlign="right">
                      <Skeleton variant="text" width={80} height={16} sx={{ mb: 0.5 }} animation="wave" />
                      <Skeleton variant="text" width={90} height={20} animation="wave" />
                    </Box>
                  </Box>
                </Box>

                {/* Price Summary Skeleton */}
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Skeleton variant="text" width={60} height={16} animation="wave" />
                    <Skeleton variant="text" width={80} height={16} animation="wave" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Skeleton variant="text" width={90} height={16} animation="wave" />
                    <Skeleton variant="text" width={60} height={16} animation="wave" />
                  </Box>
                  <Divider sx={{ my: 1.5 }} />
                  <Box display="flex" justifyContent="space-between">
                    <Skeleton variant="text" width={50} height={20} animation="wave" />
                    <Skeleton variant="text" width={100} height={20} animation="wave" />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Payment Proof Upload Card Skeleton */}
            <Card variant="outlined" sx={{ mb: 3, overflow: "hidden" }}>
              <CardHeader
                title={<Skeleton variant="text" width={160} animation="wave" />}
                sx={{
                  bgcolor: "grey.200",
                  py: 2,
                }}
              />

              <CardContent sx={{ p: 3 }}>
                <Skeleton variant="text" width="90%" height={20} sx={{ mb: 3 }} animation="wave" />

                {/* Upload Area Skeleton */}
                <Box
                  sx={{
                    border: "2px dashed",
                    borderColor: "grey.300",
                    borderRadius: 1,
                    p: 3,
                    textAlign: "center",
                    mb: 3,
                    bgcolor: "grey.50",
                  }}
                >
                  <Skeleton variant="circular" width={40} height={40} sx={{ mx: "auto", mb: 1 }} animation="wave" />
                  <Skeleton variant="text" width={200} height={20} sx={{ mx: "auto", mb: 0.5 }} animation="wave" />
                  <Skeleton variant="text" width={120} height={16} sx={{ mx: "auto" }} animation="wave" />
                </Box>

                {/* Alert Skeleton */}
                <Box sx={{ p: 2, bgcolor: "orange.50", borderRadius: 1, mb: 3 }}>
                  <Skeleton variant="text" width={140} height={20} sx={{ mb: 1 }} animation="wave" />
                  <Skeleton variant="text" width="100%" height={16} sx={{ mb: 0.5 }} animation="wave" />
                  <Skeleton variant="text" width="90%" height={16} sx={{ mb: 0.5 }} animation="wave" />
                  <Skeleton variant="text" width="85%" height={16} sx={{ mb: 0.5 }} animation="wave" />
                  <Skeleton variant="text" width="80%" height={16} animation="wave" />
                </Box>

                {/* Upload Button Skeleton */}
                <Skeleton variant="rectangular" width="100%" height={48} sx={{ borderRadius: 1 }} animation="wave" />
              </CardContent>
            </Card>

            {/* Tracking Map Card Skeleton */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardHeader
                title={<Skeleton variant="text" width={120} animation="wave" />}
                sx={{
                  bgcolor: "grey.200",
                  py: 2,
                }}
              />
              <CardContent>
                <Skeleton variant="text" width={180} height={20} sx={{ mb: 2 }} animation="wave" />
                <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 1 }} animation="wave" />
              </CardContent>
            </Card>

            {/* Bottom Button Skeleton */}
            <Box textAlign="center">
              <Skeleton
                variant="rectangular"
                width={140}
                height={40}
                sx={{ borderRadius: 1, mx: "auto" }}
                animation="wave"
              />
            </Box>
          </Box>
        </Fade>
      </Box>
    </Container>
  )
}

export default PaymentSkeletonWithAnimation
