import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

const initialOrders = [
  {
    id: 1,
    user: { name: 'Ahmad Fauzi', email: 'ahmadf@example.com' },
    orderDate: '2024-06-01',
    description: 'Pengajuan izin cuti 3 hari',
    status: 'pending',
  },
  {
    id: 2,
    user: { name: 'Sari Dewi', email: 'sari.dewi@example.com' },
    orderDate: '2024-06-05',
    description: 'Pengajuan penggantian alat kantor',
    status: 'approved',
  },
  {
    id: 3,
    user: { name: 'Budi Santoso', email: 'budi.s@example.com' },
    orderDate: '2024-06-03',
    description: 'Pengajuan lembur hari Sabtu',
    status: 'rejected',
  },
  {
    id: 4,
    user: { name: 'Dina Marlina', email: 'dina.marlina@example.com' },
    orderDate: '2024-06-06',
    description: 'Pengajuan pelatihan online',
    status: 'pending',
  },
];

const statusColorMap = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

export default function Pengajuan() {
  const [orders, setOrders] = useState(initialOrders);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const handleStatusChange = (id, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
  };

  const openDeleteDialog = (order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setOrderToDelete(null);
    setDeleteDialogOpen(false);
  };

  const confirmDelete = () => {
    if (orderToDelete) {
      setOrders((prev) => prev.filter((order) => order.id !== orderToDelete.id));
    }
    closeDeleteDialog();
  };

  return (
    <Box className="min-h-screen bg-gray-100">
      <AppBar position="static" className="bg-blue-700">
        <Toolbar>
          <Typography variant="h6" component="div" className="flex-grow">
            Admin Panel - User Order Management
          </Typography>
        </Toolbar>
      </AppBar>
      <Box className="p-4 max-w-7xl mx-auto">
        <Typography variant="h5" gutterBottom className="font-semibold">
          Daftar Pengajuan User
        </Typography>

        {orders.length === 0 ? (
          <Typography color="textSecondary" className="italic mt-10 text-center">
            Belum ada pengajuan.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {orders.map((order) => (
              <Grid item xs={12} sm={6} md={4} key={order.id}>
                <Card className="flex flex-col h-full">
                  <CardContent className="flex-grow">
                    <Box className="flex justify-between items-center mb-2 flex-wrap gap-2">
                      <Typography variant="subtitle1" color="primary" fontWeight="bold" noWrap>
                        #ID {order.id}
                      </Typography>
                      <Chip
                        label={order.status.toUpperCase()}
                        color={statusColorMap[order.status]}
                        size="small"
                        className="font-bold"
                      />
                    </Box>
                    <Typography variant="body2" className="mb-1">
                      <strong>Nama:</strong> {order.user.name}
                    </Typography>
                    <Typography variant="body2" className="mb-1">
                      <strong>Email:</strong> {order.user.email}
                    </Typography>
                    <Typography variant="body2" className="mb-1">
                      <strong>Tanggal Pengajuan:</strong> {order.orderDate}
                    </Typography>
                    <Typography variant="body2" className="whitespace-pre-wrap">
                      <strong>Deskripsi:</strong> {order.description}
                    </Typography>
                  </CardContent>
                  <CardActions className="justify-between flex-wrap gap-2 px-3 pb-3 pt-0">
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleOutlineIcon />}
                      disabled={order.status === 'approved'}
                      onClick={() => handleStatusChange(order.id, 'approved')}
                      className={`capitalize ${order.status === 'approved' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Setujui
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      startIcon={<CancelOutlinedIcon />}
                      disabled={order.status === 'rejected'}
                      onClick={() => handleStatusChange(order.id, 'rejected')}
                      className={`capitalize ${order.status === 'rejected' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Tolak
                    </Button>
                    <IconButton
                      aria-label={`Hapus pengajuan ID ${order.id}`}
                      color="default"
                      onClick={() => openDeleteDialog(order)}
                      size="small"
                      className="text-gray-700 hover:text-gray-900"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog} aria-labelledby="delete-dialog-title">
          <DialogTitle id="delete-dialog-title">
            Apakah Anda yakin ingin menghapus pengajuan ini?
          </DialogTitle>
          <DialogActions>
            <Button onClick={closeDeleteDialog} color="primary">
              Batal
            </Button>
            <Button onClick={confirmDelete} color="error" variant="contained" autoFocus>
              Hapus
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

