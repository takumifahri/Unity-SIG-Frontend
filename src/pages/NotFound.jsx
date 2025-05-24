import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { Error, HomeOutlined, SearchOutlined } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Fragment } from 'react';
// Custom theme dengan warna coklat
const theme = createTheme({
  palette: {
    primary: {
      main: '#6D4C3D', // Coklat tua
      light: '#8A6D5D',
      dark: '#523A2E',
    },
    secondary: {
      main: '#D3B597', // Coklat muda
      light: '#E5D2BD',
      dark: '#A99073',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FDFAF5',
    },
    text: {
      primary: '#3E2E23',
      secondary: '#6D5E53',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          boxShadow: '0 4px 10px rgba(109, 76, 61, 0.25)',
          '&:hover': {
            boxShadow: '0 6px 15px rgba(109, 76, 61, 0.35)',
          },
        },
        outlinedPrimary: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(109, 76, 61, 0.05)',
          },
        },
      },
    },
  },
});

const NotFound = () => {
  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md">
        <Paper 
          elevation={0}
          sx={{
            py: 8,
            px: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            borderRadius: 4,
            my: 8,
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: theme.palette.background.paper,
          }}
        >
          {/* Background elements */}
          <Box 
            sx={{
              position: 'absolute',
              top: -100,
              right: -100,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'rgba(211, 181, 151, 0.2)', // Light secondary color
              zIndex: 0,
            }}
          />
          <Box 
            sx={{
              position: 'absolute',
              bottom: -150,
              left: -150,
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'rgba(211, 181, 151, 0.15)', // Light secondary color
              zIndex: 0,
            }}
          />
          
          {/* 404 Icon */}
          <Box 
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: 150,
              height: 150,
              borderRadius: '50%',
              backgroundColor: 'rgba(109, 76, 61, 0.1)', // Light primary color
              mb: 4,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Error
              sx={{
                fontSize: 80,
                color: theme.palette.primary.main,
              }}
            />
          </Box>
          
          {/* 404 Text */}
          <Typography 
            variant="h1" 
            sx={{ 
              fontWeight: 800, 
              color: theme.palette.primary.main,
              mb: 2,
              fontSize: { xs: '4rem', md: '6rem' },
              position: 'relative',
              zIndex: 1,
            }}
          >
            404
          </Typography>
          
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600, 
              mb: 2,
              color: theme.palette.text.primary,
              position: 'relative',
              zIndex: 1,
            }}
          >
            Halaman Tidak Ditemukan
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4, 
              maxWidth: 500,
              color: theme.palette.text.secondary,
              fontSize: '1.1rem',
              position: 'relative',
              zIndex: 1,
            }}
          >
            Maaf, halaman yang Anda cari tidak ditemukan. Halaman mungkin telah dipindahkan, 
            dihapus, atau URL yang Anda masukkan salah.
          </Typography>
          
          {/* Action Buttons */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flexWrap: 'wrap', 
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
          }}>
            <Button 
              component={Link} 
              to="/"
              variant="contained" 
              color="primary"
              size="large"
              startIcon={<HomeOutlined />}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 10px rgba(109, 76, 61, 0.25)',
                '&:hover': {
                  boxShadow: '0 6px 15px rgba(109, 76, 61, 0.35)',
                }
              }}
            >
              Kembali ke Beranda
            </Button>
            
            <Button 
              component={Link} 
              to="/catalog"
              variant="outlined" 
              color="primary"
              size="large"
              startIcon={<SearchOutlined />}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  backgroundColor: 'rgba(109, 76, 61, 0.05)',
                }
              }}
            >
              Jelajahi Katalog
            </Button>
          </Box>
          
          {/* Decorative elements - coffee beans pattern */}
          <Box sx={{ 
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            opacity: 0.15,
            zIndex: 0,
            overflow: 'hidden',
          }}>
            {[...Array(20)].map((_, i) => (
              <Fragment key={i}>
                <Box 
                  sx={{
                    position: 'absolute',
                    bottom: -10 + (i % 3) * 20,
                    left: (i * 50) % 800,
                    width: 30,
                    height: 45,
                    borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                    transform: `rotate(${45 + (i % 4) * 20}deg)`,
                    backgroundColor: theme.palette.primary.main,
                  }}
                />
                <Box 
                  sx={{
                    position: 'absolute',
                    bottom: 5 + (i % 4) * 25,
                    left: (i * 40 + 20) % 800,
                    width: 20,
                    height: 35,
                    borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                    transform: `rotate(${-30 + (i % 5) * 15}deg)`,
                    backgroundColor: theme.palette.secondary.main,
                  }}
                />
              </Fragment>
            ))}
          </Box>
          
          {/* Additional decorative element - coffee cup icon */}
          <Box 
            sx={{ 
              position: 'absolute',
              top: 30,
              right: 30,
              width: 60,
              height: 60,
              opacity: 0.1,
              zIndex: 0,
              borderRadius: '0 0 15px 15px',
              border: `4px solid ${theme.palette.primary.main}`,
              borderTop: 'none',
            }}
          />
          <Box 
            sx={{ 
              position: 'absolute',
              top: 30,
              right: 40,
              width: 20,
              height: 15,
              borderRadius: '0 0 10px 10px',
              backgroundColor: 'transparent',
              borderBottom: `4px solid ${theme.palette.primary.main}`,
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              borderRight: `4px solid ${theme.palette.primary.main}`,
              opacity: 0.1,
              zIndex: 0,
            }}
          />
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default NotFound;