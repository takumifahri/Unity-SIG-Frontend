import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Divider, 
  Grid, 
  Paper, 
  Skeleton, 
  Typography 
} from '@mui/material';

const OrderDetailsSkeleton = () => {
  return (
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
        <Box sx={{ position: 'relative', mb: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Skeleton variant="text" width="60%" height={48} sx={{ mx: 'auto', mb: 2 }} />
            <Skeleton variant="text" width="40%" height={24} sx={{ mx: 'auto' }} />
          </Box>
        </Box>

        <Divider sx={{ mb: 4, borderColor: "#f0e6d9" }} />

        {/* Navigation tabs Skeleton */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", borderBottom: "1px solid #f0e6d9" }}>
            <Skeleton variant="rectangular" width={120} height={40} sx={{ mr: 2 }} />
            <Skeleton variant="rectangular" width={150} height={40} sx={{ mr: 2 }} />
            <Skeleton variant="rectangular" width={120} height={40} />
          </Box>
        </Box>

        {/* Product details Skeleton */}
        <Box sx={{ marginBottom: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
              alignItems: "flex-start",
            }}
          >
            {/* Left Side - Image */}
            <Box
              sx={{
                flex: { xs: "1 1 100%", md: "0 0 40%" },
                maxWidth: { xs: "100%", md: "40%" },
              }}
            >
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height={400} 
                sx={{ 
                  borderRadius: "8px",
                  mb: 2
                }} 
              />
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                {[1, 2, 3, 4].map((_, index) => (
                  <Skeleton 
                    key={index}
                    variant="rectangular"
                    width={70}
                    height={70}
                    sx={{ borderRadius: "4px" }}
                  />
                ))}
              </Box>
            </Box>

            {/* Right Side - Details */}
            <Box
              sx={{
                flex: { xs: "1 1 100%", md: "0 0 60%" },
                maxWidth: { xs: "100%", md: "60%" },
              }}
            >
              <Paper
                sx={{
                  mb: 2,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  border: "1px solid #f0f0f0",
                  borderRadius: "8px",
                  overflow: "hidden",
                  p: 2
                }}
              >
                <Skeleton variant="text" height={32} width="70%" sx={{ mb: 1 }} />
                
                <Grid container spacing={2}>
                  {[1, 2, 3, 4, 5, 6, 7].map((_, index) => (
                    <React.Fragment key={index}>
                      <Grid item xs={5}>
                        <Skeleton variant="text" height={24} />
                      </Grid>
                      <Grid item xs={7}>
                        <Skeleton variant="text" height={24} />
                      </Grid>
                    </React.Fragment>
                  ))}
                </Grid>
              </Paper>

              <Skeleton 
                variant="rectangular" 
                height={60} 
                sx={{ 
                  width: "100%",
                  borderRadius: "8px"
                }} 
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4, borderColor: "#f0e6d9" }} />

        {/* Status Timeline Skeleton */}
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" height={32} width="30%" sx={{ mb: 3 }} />
          
          <Paper
            elevation={0}
            sx={{
              border: "1px solid #D9B99B",
              borderRadius: "8px",
              padding: 3,
              backgroundColor: "#f9f4ef",
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {[1, 2, 3, 4].map((_, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start'
                  }}
                >
                  <Skeleton variant="text" width="20%" height={24} />
                  
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    mx: 2
                  }}>
                    <Skeleton variant="circular" width={20} height={20} />
                    {index < 3 && (
                      <Skeleton 
                        variant="rectangular" 
                        width={3} 
                        height={60} 
                        sx={{ mt: 0.5 }} 
                      />
                    )}
                  </Box>
                  
                  <Box sx={{ width: '60%' }}>
                    <Skeleton variant="text" height={24} width="50%" />
                    <Skeleton variant="text" height={20} width="80%" />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Customer Information Skeleton */}
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" height={32} width="30%" sx={{ mb: 3 }} />
          
          <Paper
            sx={{
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              border: "1px solid #f0f0f0",
              borderRadius: "8px",
              padding: 2,
            }}
          >
            <Grid container spacing={2}>
              {[1, 2, 3, 4, 5].map((_, index) => (
                <React.Fragment key={index}>
                  <Grid item xs={5}>
                    <Skeleton variant="text" height={24} />
                  </Grid>
                  <Grid item xs={7}>
                    <Skeleton variant="text" height={24} />
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
          </Paper>
        </Box>
        
        {/* Action buttons Skeleton */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Skeleton 
            variant="rectangular" 
            width={200} 
            height={40} 
            sx={{ 
              borderRadius: "20px" 
            }} 
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default OrderDetailsSkeleton;