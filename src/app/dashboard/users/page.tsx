'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';

export default function UserManagement() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    username: '',
    password: '',
    role: 'doctor',
    ad: '',
    soyad: '',
    email: ''
  });

  useEffect(() => {
    const username = Cookies.get('username');
    const auth = Cookies.get('auth');
    console.log('Cookie değerleri:', { username, auth });
    
    if (username === 'seyithan1907' && auth === 'admin') {
      setCurrentUser('seyithan1907');
    } else {
      setCurrentUser('');
    }
    
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Kullanıcılar yüklenemedi');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError('Kullanıcılar yüklenirken bir hata oluştu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Kullanıcı eklenemedi');
      }

      const newUser = await response.json();
      setUsers([...users, newUser]);
      setShowAddForm(false);
      resetForm();
    } catch (err) {
      console.error('Kullanıcı ekleme hatası:', err);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/users/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          role: formData.role,
          ad: formData.ad,
          soyad: formData.soyad,
          email: formData.email,
          ...(formData.password ? { password: formData.password } : {})
        }),
      });

      if (!response.ok) {
        throw new Error('Kullanıcı güncellenemedi');
      }

      const updatedUser = await response.json();
      setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
      setShowEditForm(false);
      resetForm();
    } catch (err) {
      console.error('Kullanıcı güncelleme hatası:', err);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Kullanıcı silinemedi');
      }

      setUsers(users.filter((user: any) => user.id !== userId));
    } catch (err) {
      console.error('Kullanıcı silme hatası:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      id: '',
      username: '',
      password: '',
      role: 'doctor',
      ad: '',
      soyad: '',
      email: ''
    });
  };

  const startEdit = (user: any) => {
    setFormData({
      id: user.id,
      username: user.username,
      password: '',
      role: user.role,
      ad: user.ad,
      soyad: user.soyad,
      email: user.email
    });
    setShowEditForm(true);
    setShowAddForm(false);
  };

  if (loading) {
    return <div className="p-6">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  const canManageUsers = currentUser === 'seyithan1907';

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Dashboard'a Dön
            </button>
          </Link>
          <h1 className="text-2xl font-bold">Üye Yönetimi</h1>
        </div>
        {canManageUsers && !showEditForm && (
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              resetForm();
            }}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {showAddForm ? 'İptal' : 'Yeni Üye Ekle'}
          </button>
        )}
      </div>

      {showAddForm && canManageUsers && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">Yeni Üye Ekle</h2>
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Kullanıcı Adı</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Şifre</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rol</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="doctor">Doktor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ad</label>
              <input
                type="text"
                name="ad"
                value={formData.ad}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Soyad</label>
              <input
                type="text"
                name="soyad"
                value={formData.soyad}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">E-posta</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Kaydet
              </button>
            </div>
          </form>
        </div>
      )}

      {showEditForm && canManageUsers && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Üye Düzenle</h2>
            <button
              onClick={() => {
                setShowEditForm(false);
                resetForm();
              }}
              className="text-gray-600 hover:text-gray-800"
            >
              İptal
            </button>
          </div>
          <form onSubmit={handleEditUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Kullanıcı Adı</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Şifre (Boş bırakılabilir)</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Değiştirmek için yeni şifre girin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rol</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="doctor">Doktor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ad</label>
              <input
                type="text"
                name="ad"
                value={formData.ad}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Soyad</label>
              <input
                type="text"
                name="soyad"
                value={formData.soyad}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">E-posta</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Güncelle
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kullanıcı Adı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ad Soyad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                E-posta
              </th>
              {canManageUsers && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user: any) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.ad} {user.soyad}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.role === 'admin' ? 'Admin' : 'Doktor'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.email}
                </td>
                {canManageUsers && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                      onClick={() => startEdit(user)}
                    >
                      Düzenle
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Sil
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 