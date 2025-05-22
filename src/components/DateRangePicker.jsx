import { useState, useEffect } from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Box, TextField, Button, Stack, Typography, Paper, useMediaQuery, useTheme } from '@mui/material';
import { addDays, differenceInDays, format, isAfter, isBefore, isWithinInterval } from 'date-fns';
import id from 'date-fns/locale/id';

const DateRangePickerModal = ({ onSelect }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const today = new Date();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(addDays(today, 7));
  const [activeButton, setActiveButton] = useState(7); // Default to 1 week
  
  const handleQuickSelect = (days) => {
    setStartDate(today);
    setEndDate(addDays(today, days));
    setActiveButton(days);
  };
  
  const calculateDuration = () => {
    if (!startDate || !endDate) return 0;
    return differenceInDays(endDate, startDate) + 1;
  };
  
  useEffect(() => {
    // Reset active button if dates are changed manually
    if (startDate && endDate) {
      const duration = calculateDuration();
      const quickDurations = [3, 7, 14, 30];
      const isQuickDuration = 
        startDate.getTime() === today.getTime() && 
        quickDurations.includes(duration - 1);
      
      if (!isQuickDuration) {
        setActiveButton(null);
      }
    }
  }, [startDate, endDate]);
  
  const handleConfirm = () => {
    if (onSelect && startDate && endDate) {
      onSelect({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        duration: calculateDuration()
      });
    }
  };
  
  // Prevent selecting end date before start date
  const shouldDisableEndDate = (date) => {
    return isBefore(date, startDate) || isBefore(date, today);
  };
  
  // Prevent selecting start date after end date
  const shouldDisableStartDate = (date) => {
    return isAfter(date, endDate) || isBefore(date, today);
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
      <Paper 
        elevation={0} 
        sx={{ 
          width: '100%', 
          maxWidth: { xs: '100%', sm: 500 }, 
          p: { xs: 1.5, sm: 2.5 },
          mx: 'auto',
          overflow: 'hidden'
        }}
      >
        <Typography 
          variant={isMobile ? "h6" : "subtitle1"} 
          sx={{ 
            mb: 2, 
            textAlign: 'center',
            fontWeight: 'medium'
          }}
        >
          Pilih Periode Produksi
        </Typography>
        
        <Stack 
          spacing={isMobile ? 1.5 : 2}
          direction={isMobile ? "column" : "row"}
          sx={{ mb: 2 }}
        >
          <DatePicker
            label="Tanggal Mulai"
            value={startDate}
            onChange={(newValue) => {
              setStartDate(newValue);
              // If end date is before new start date, adjust it
              if (endDate && isBefore(endDate, newValue)) {
                setEndDate(addDays(newValue, 1));
              }
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                size: isMobile ? "small" : "medium",
                sx: { 
                  "& .MuiInputBase-root": {
                    fontSize: isMobile ? "0.875rem" : "1rem"
                  }
                }
              }
            }}
            shouldDisableDate={shouldDisableStartDate}
            disablePast
            minDate={today}
          />
          
          <DatePicker
            label="Tanggal Selesai"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            slotProps={{
              textField: {
                fullWidth: true,
                size: isMobile ? "small" : "medium", 
                sx: { 
                  "& .MuiInputBase-root": {
                    fontSize: isMobile ? "0.875rem" : "1rem"
                  }
                }
              }
            }}
            shouldDisableDate={shouldDisableEndDate}
            disablePast
            minDate={startDate || today}
          />
        </Stack>
        
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              mb: 1, 
              fontSize: isMobile ? '0.7rem' : '0.875rem',
              textAlign: isMobile ? 'center' : 'left'
            }}
          >
            Durasi Cepat:
          </Typography>
          
          <Stack 
            direction="row" 
            spacing={isMobile ? 0.5 : 1} 
            flexWrap="wrap" 
            justifyContent="space-between"
            sx={{ gap: 1 }}
          >
            <Button 
              variant={activeButton === 3 ? "contained" : "outlined"}
              size="small" 
              onClick={() => handleQuickSelect(3)}
              sx={{ 
                fontSize: isMobile ? '0.65rem' : '0.75rem',
                flex: { xs: '1 0 calc(50% - 4px)', sm: '1 0 calc(25% - 8px)' },
                py: 0.5,
                bgcolor: activeButton === 3 ? '#a97142' : 'transparent',
                color: activeButton === 3 ? 'white' : 'inherit',
                '&:hover': {
                  bgcolor: activeButton === 3 ? '#8a5a35' : 'rgba(169, 113, 66, 0.04)'
                }
              }}
            >
              3 Hari
            </Button>
            <Button 
              variant={activeButton === 7 ? "contained" : "outlined"}
              size="small" 
              onClick={() => handleQuickSelect(7)}
              sx={{ 
                fontSize: isMobile ? '0.65rem' : '0.75rem',
                flex: { xs: '1 0 calc(50% - 4px)', sm: '1 0 calc(25% - 8px)' },
                py: 0.5,
                bgcolor: activeButton === 7 ? '#a97142' : 'transparent',
                color: activeButton === 7 ? 'white' : 'inherit',
                '&:hover': {
                  bgcolor: activeButton === 7 ? '#8a5a35' : 'rgba(169, 113, 66, 0.04)'
                }
              }}
            >
              1 Minggu
            </Button>
            <Button 
              variant={activeButton === 14 ? "contained" : "outlined"}
              size="small" 
              onClick={() => handleQuickSelect(14)}
              sx={{ 
                fontSize: isMobile ? '0.65rem' : '0.75rem',
                flex: { xs: '1 0 calc(50% - 4px)', sm: '1 0 calc(25% - 8px)' },
                py: 0.5,
                bgcolor: activeButton === 14 ? '#a97142' : 'transparent',
                color: activeButton === 14 ? 'white' : 'inherit',
                '&:hover': {
                  bgcolor: activeButton === 14 ? '#8a5a35' : 'rgba(169, 113, 66, 0.04)'
                }
              }}
            >
              2 Minggu
            </Button>
            <Button 
              variant={activeButton === 30 ? "contained" : "outlined"}
              size="small" 
              onClick={() => handleQuickSelect(30)}
              sx={{ 
                fontSize: isMobile ? '0.65rem' : '0.75rem',
                flex: { xs: '1 0 calc(50% - 4px)', sm: '1 0 calc(25% - 8px)' },
                py: 0.5,
                bgcolor: activeButton === 30 ? '#a97142' : 'transparent',
                color: activeButton === 30 ? 'white' : 'inherit',
                '&:hover': {
                  bgcolor: activeButton === 30 ? '#8a5a35' : 'rgba(169, 113, 66, 0.04)'
                }
              }}
            >
              1 Bulan
            </Button>
          </Stack>
        </Box>
        
        <Box sx={{ 
          bgcolor: '#f5f5f5', 
          p: { xs: 1, sm: 1.5 }, 
          borderRadius: 1, 
          textAlign: 'center',
          mb: { xs: 1.5, sm: 2 }
        }}>
          <Typography variant="body2" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
            Periode: {startDate && endDate ? (
              <>
                <strong>{format(startDate, 'dd MMM yyyy', { locale: id })}</strong>
                {' '}s/d{' '}
                <strong>{format(endDate, 'dd MMM yyyy', { locale: id })}</strong>
                {' '}({calculateDuration()} hari)
              </>
            ) : 'Pilih tanggal'}
          </Typography>
        </Box>
        
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth
          size={isMobile ? "small" : "medium"}
          onClick={handleConfirm}
          sx={{ 
            bgcolor: '#a97142', 
            '&:hover': { bgcolor: '#8a5a35' },
            py: { xs: 0.75, sm: 1 },
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          Konfirmasi Periode
        </Button>
      </Paper>
    </LocalizationProvider>
  );
};

export default DateRangePickerModal;