import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    avatar: '/avatar-placeholder.png'
  });
  const [formData, setFormData] = useState(profile);
  const [errors, setErrors] = useState({});

  // Fungsi untuk mengambil data profil dari API/backend
  const fetchProfile = async () => {
    try {
      // Simulasi API call
      const mockProfile = {
        name: 'Admin',
        email: 'admin@jrkonveksi.com',
        phone: '081234567890',
        role: 'Administrator',
        avatar: '/avatar-placeholder.png'
      };
      setProfile(mockProfile);
      setFormData(mockProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Effect untuk mengambil data saat komponen dimount
  useEffect(() => {
    fetchProfile();
  }, []);

  // Fungsi validasi form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Nama tidak boleh kosong';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email tidak boleh kosong';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor telepon tidak boleh kosong';
    } else if (!/^[0-9]{10,13}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Format nomor telepon tidak valid';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fungsi untuk menangani perubahan input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Hapus error untuk field yang diubah
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Fungsi untuk menangani perubahan avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setErrors(prev => ({
          ...prev,
          avatar: 'Ukuran file tidak boleh lebih dari 2MB'
        }));
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          avatar: 'Format file harus JPEG atau PNG'
        }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatar: reader.result
        }));
        setErrors(prev => ({
          ...prev,
          avatar: undefined
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Fungsi untuk menyimpan perubahan
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      // Simulasi API call untuk menyimpan perubahan
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfile(formData);
      setIsEditing(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Gagal menyimpan perubahan. Silakan coba lagi.'
      }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
          Profil berhasil diperbarui!
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
        <div className="md:flex">
          {/* Sidebar dengan Avatar */}
          <div className="md:w-1/3 p-6 border-r border-gray-200 bg-gray-50">
            <div className="text-center">
              <div className="relative inline-block group">
                <img
                  src={formData.avatar}
                  alt="Profile"
                  className="w-32 h-32 rounded-full mx-auto object-cover ring-4 ring-brown-100 group-hover:ring-brown-300 transition-all duration-300 shadow-md"
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-brown-600 text-white rounded-full p-2 cursor-pointer hover:bg-brown-700 transform hover:scale-110 transition-all duration-300 shadow-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png"
                      onChange={handleAvatarChange}
                    />
                  </label>
                )}
              </div>
              {errors.avatar && (
                <p className="text-red-500 text-xs mt-1">{errors.avatar}</p>
              )}
              <h2 className="mt-4 text-xl font-semibold text-gray-800">{profile.name}</h2>
              <p className="text-gray-600 bg-brown-50 inline-block px-3 py-1 rounded-full mt-2">{profile.role}</p>
            </div>
          </div>

          {/* Form Profil */}
          <div className="md:w-2/3 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Informasi Profil</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Edit Profil
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-brown-600 transition-colors duration-200">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-lg disabled:bg-gray-50 focus:ring-2 focus:ring-brown-400 focus:border-brown-400 transition-all duration-200 hover:border-brown-300 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-brown-600 transition-colors duration-200">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-lg disabled:bg-gray-50 focus:ring-2 focus:ring-brown-400 focus:border-brown-400 transition-all duration-200 hover:border-brown-300 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-brown-600 transition-colors duration-200">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-lg disabled:bg-gray-50 focus:ring-2 focus:ring-brown-400 focus:border-brown-400 transition-all duration-200 hover:border-brown-300 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-brown-600 transition-colors duration-200">
                    Role
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  />
                </div>

                {errors.submit && (
                  <p className="text-red-500 text-sm">{errors.submit}</p>
                )}

                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className={`px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                        isSaving ? 'animate-pulse' : ''
                      }`}
                    >
                      {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => {
                        setFormData(profile);
                        setIsEditing(false);
                        setErrors({});
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-brown-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 