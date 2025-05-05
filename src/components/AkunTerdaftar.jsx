import { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';
import '../styles/akun-terdaftar.css';
import axios from 'axios';
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
import Badge from "@mui/material/Badge"
import Avatar from "@mui/material/Avatar"
import { styled } from "@mui/material/styles"
import { Person, Close, ArrowBackIos, ArrowForwardIos, ZoomIn } from "@mui/icons-material"

const AkunTerdaftar = () => {
  const [accounts, setAccounts] = useState([
    {
      id: 1,
      photo: '/default-avatar.png',
      username: 'johndoe',
      email: 'john@example.com',
      alamat: 'Jl. Contoh No. 123',
      telepon: '081234567890',
      status: 'Aktif'
    }
  ]);
  const [akun, setAkun] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    photo: '',
    username: '',
    email: '',
    alamat: '',
    telepon: '',
    password: '',
    confirmPassword: ''
  });

  const handleAddAccount = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Password tidak cocok!');
      return;
    }
    
    const newAccount = {
      id: Date.now(),
      photo: formData.photo || '/default-avatar.png',
      username: formData.username,
      email: formData.email,
      alamat: formData.alamat,
      telepon: formData.telepon,
      status: 'Aktif'
    };

    setAccounts([...accounts, newAccount]);
    setShowModal(false);
    setFormData({
      photo: '',
      username: '',
      email: '',
      alamat: '',
      telepon: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleDeleteAccount = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
      setAccounts(accounts.filter(account => account.id !== id));
    }
  };
  const handleStatusChange = (id) => {
    setAccounts(accounts.map(account => {
      if (account.id === id) {
        return {
          ...account,
          status: account.status === 'Aktif' ? 'Nonaktif' : 'Aktif'
        };
      }
      return account;
    }));
  };
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
  
  const akunterdaftar = async() => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`,{
      headers: {
        'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem("token")}`

      }
    });
    console.log("akun terdaftar",response.data.data)
    setAkun(response.data.data)
  } 
  useEffect(() =>{
    akunterdaftar()
  },[])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Akun Terdaftar</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaUserPlus />
          Tambah Akun
        </button>
      </div>

      {/* Tabel Akun */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Foto Profil
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alamat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nomor Telepon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {akun.map((account, index) => (
                <tr key={account.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* <img
                      src={`${process.env.REACT_APP_API_URL}/${account.profile_photo || '-'}`}
                      alt={account.username}
                      className="h-10 w-10 rounded-full"
                    /> */}
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        {account.isActive ? (
                          <StyledBadge
                            overlap="circular"
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            variant="dot"
                          >
                            <Avatar alt={account.name} src={`${process.env.REACT_APP_API_URL}/${account.profile_photo || '-'}`}>
                              {!account.profile_photo && <Person />}
                            </Avatar>
                          </StyledBadge>
                        ) : (
                          <Avatar alt={account.name} src={account.profile_photo || ""}>
                            {!account.profile_photo && <Person />}
                          </Avatar>
                        )}

                      </Box>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {account.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {account.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {account.gender}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {account.alamat}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <a
                      href={`https://wa.me/${account.phone.replace(/^0/, '62').replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {account.phone}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {account.total_order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        account.status === 'Aktif'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {account.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStatusChange(account.id)}
                        className={`${
                          account.status === 'Aktif'
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        } px-3 py-1 rounded-full`}
                      >
                        {account.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(account.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Akun */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Tambah Akun Baru</h2>
            <form onSubmit={handleAddAccount}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Foto Profil
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({...formData, photo: URL.createObjectURL(e.target.files[0])})}
                    className="mt-1 block w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Alamat
                  </label>
                  <textarea
                    required
                    value={formData.alamat}
                    onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.telepon}
                    onChange={(e) => setFormData({...formData, telepon: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Konfirmasi Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AkunTerdaftar;
