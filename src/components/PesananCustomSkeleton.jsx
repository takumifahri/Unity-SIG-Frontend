import { Container, Box, Skeleton, CardContent, Card, Grid, Paper, Divider, } from "@mui/material";
const PesananCustomSkeleton = () => {
    return (
      <Container maxWidth="xl" sx={{ padding: 4 }}>
        <Card
          sx={{
            margin: "0 auto",
            border: "1px solid #D9B99B",
            borderRadius: "12px",
            padding: 4,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <CardContent>
            {/* Header Skeleton */}
            <Box sx={{ position: "relative", mb: 4 }}>
              {/* Back button skeleton */}
              <Skeleton
                variant="circular"
                width={40}
                height={40}
                sx={{ position: "absolute", top: 0, left: 0 }}
              />
  
              {/* Centered heading skeleton */}
              <Box sx={{ textAlign: "center" }}>
                <Skeleton
                  variant="text"
                  width={300}
                  height={50}
                  sx={{ margin: "0 auto", mb: 2 }}
                />
                <Skeleton
                  variant="text"
                  width={200}
                  height={30}
                  sx={{ margin: "0 auto", mb: 2 }}
                />
              </Box>
            </Box>
  
            <Divider sx={{ mb: 4, borderColor: "#f0e6d9" }} />
  
            {/* Navigation tabs skeleton */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", borderBottom: "1px solid #f0e6d9", gap: 2 }}>
                {[1, 2, 3, 4].map((item) => (
                  <Skeleton
                    key={item}
                    variant="rectangular"
                    width={150}
                    height={40}
                    sx={{ borderRadius: 1 }}
                  />
                ))}
              </Box>
            </Box>
  
            {/* Main content skeleton */}
            <Box sx={{ marginBottom: 4 }}>
              <Grid container spacing={4}>
                {/* Image gallery skeleton */}
                <Grid item xs={12} md={5}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {/* Main image skeleton */}
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={450}
                      sx={{ borderRadius: 2 }}
                    />
                    
                    {/* Thumbnails skeleton */}
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                      {[1, 2, 3, 4].map((item) => (
                        <Skeleton
                          key={item}
                          variant="rectangular"
                          width={70}
                          height={70}
                          sx={{ borderRadius: 1 }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Grid>
  
                {/* Order details skeleton */}
                <Grid item xs={12} md={7}>
                  <Paper
                    sx={{
                      mb: 2,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      border: "1px solid #f0f0f0",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    {/* Table header skeleton */}
                    <Box sx={{ backgroundColor: "#f9f4ef", p: 2 }}>
                      <Skeleton variant="text" width={150} height={30} />
                    </Box>
  
                    {/* Table rows skeleton */}
                    <Box sx={{ p: 2 }}>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                        <Box
                          key={item}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            py: 1.5,
                            borderBottom: item !== 8 ? "1px solid #f0f0f0" : "none",
                          }}
                        >
                          <Skeleton variant="text" width={120} height={25} />
                          <Skeleton variant="text" width={180} height={25} />
                        </Box>
                      ))}
                    </Box>
                  </Paper>
  
                  {/* Price summary skeleton */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: "8px",
                      backgroundColor: "#f9f4ef",
                      border: "1px solid #D9B99B",
                    }}
                  >
                    <Skeleton variant="text" width={200} height={35} />
                  </Paper>
                </Grid>
              </Grid>
            </Box>
  
            <Divider sx={{ my: 4, borderColor: "#f0e6d9" }} />
  
            {/* Action buttons skeleton */}
            <Box sx={{ mb: 4, display: "flex", justifyContent: "center", gap: 2 }}>
              <Skeleton variant="rectangular" width={150} height={45} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width={150} height={45} sx={{ borderRadius: 1 }} />
            </Box>
  
            {/* Timeline skeleton */}
            <Box>
              <Skeleton variant="text" width={150} height={35} sx={{ mb: 3 }} />
  
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
                {/* Timeline items skeleton */}
                {[1, 2, 3, 4].map((item) => (
                  <Box
                    key={item}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      mb: item !== 4 ? 3 : 0,
                    }}
                  >
                    {/* Date skeleton */}
                    <Box sx={{ minWidth: 120 }}>
                      <Skeleton variant="text" width={100} height={20} />
                      <Skeleton variant="text" width={60} height={16} />
                    </Box>
  
                    {/* Timeline dot skeleton */}
                    <Skeleton variant="circular" width={12} height={12} />
  
                    {/* Timeline content skeleton */}
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width={180} height={25} />
                      <Skeleton variant="text" width={250} height={20} />
                    </Box>
                  </Box>
                ))}
              </Paper>
            </Box>
  
            {/* Customer information skeleton */}
            <Box sx={{ mt: 4 }}>
              <Skeleton variant="text" width={180} height={35} sx={{ mb: 3 }} />
  
              <Paper
                sx={{
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  border: "1px solid #f0f0f0",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <Box sx={{ p: 2 }}>
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Box
                      key={item}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 1.5,
                        borderBottom: item !== 5 ? "1px solid #f0f0f0" : "none",
                      }}
                    >
                      <Skeleton variant="text" width={100} height={25} />
                      <Skeleton variant="text" width={200} height={25} />
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  };
export default PesananCustomSkeleton;