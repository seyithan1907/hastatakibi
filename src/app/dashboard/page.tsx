'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    tcKimlik: '',
    dogumTarihi: '',
    telefon: '',
    email: '',
    adres: '',
  });

  useEffect(() => {
    const userRole = Cookies.get('auth');
    const userId = Cookies.get('userId');
    console.log('Cookie değerleri:', {
      auth: Cookies.get('auth'),
      userId: Cookies.get('userId')
    });

    // Kullanıcı bilgilerini getir
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        if (response.ok) {
          const userData = await response.json();
          setUsername(userData.ad); // Kullanıcının gerçek adını kullan
        }
      } catch (error) {
        console.error('Kullanıcı bilgileri alınamadı:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = () => {
    // Çerezleri sil
    Cookies.remove('auth');
    Cookies.remove('userId');
    // Ana sayfaya yönlendir
    router.push('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/hastalar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Hasta kaydedilemedi');
      }

      setFormData({
        ad: '',
        soyad: '',
        tcKimlik: '',
        dogumTarihi: '',
        telefon: '',
        email: '',
        adres: '',
      });

      router.refresh();
    } catch (err) {
      setError('Kayıt sırasında bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Hoş Geldiniz, {username}
            </h2>
            <p className="text-gray-600">
              Hasta Takip Sistemine hoş geldiniz. Bu platform ile:
            </p>
            <ul className="mt-4 space-y-2 list-disc list-inside text-gray-600">
              <li>Hasta kayıtlarını görüntüleyebilir</li>
              <li>Tedavi süreçlerini izleyebilir</li>
              <li>İşlemleri yönetebilirsiniz</li>
            </ul>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Çıkış Yap
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Yeni Hasta Kaydı</h3>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ad" className="block text-sm font-medium text-gray-700">
                  Ad
                </label>
                <input
                  type="text"
                  id="ad"
                  name="ad"
                  value={formData.ad}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="soyad" className="block text-sm font-medium text-gray-700">
                  Soyad
                </label>
                <input
                  type="text"
                  id="soyad"
                  name="soyad"
                  value={formData.soyad}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="tcKimlik" className="block text-sm font-medium text-gray-700">
                  T.C. Kimlik No
                </label>
                <input
                  type="text"
                  id="tcKimlik"
                  name="tcKimlik"
                  value={formData.tcKimlik}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  maxLength={11}
                  pattern="[0-9]{11}"
                />
              </div>

              <div>
                <label htmlFor="dogumTarihi" className="block text-sm font-medium text-gray-700">
                  Doğum Tarihi
                </label>
                <input
                  type="date"
                  id="dogumTarihi"
                  name="dogumTarihi"
                  value={formData.dogumTarihi}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="telefon" className="block text-sm font-medium text-gray-700">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="telefon"
                  name="telefon"
                  value={formData.telefon}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  E-posta
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="adres" className="block text-sm font-medium text-gray-700">
                Adres
              </label>
              <textarea
                id="adres"
                name="adres"
                value={formData.adres}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Hasta Listesi</h3>
            <p className="text-gray-600">Tüm hastaları görüntüleyin ve yönetin.</p>
            <Link href="/hastalar">
              <button className="mt-4 w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                Hasta Listesi
              </button>
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">İşlemler</h3>
            <p className="text-gray-600">Tedavi işlemlerini ve fiyatlarını yönetin.</p>
            <Link href="/islemler">
              <button className="mt-4 w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4zm1 1h6v2H7V5zm0 4h6v2H7V9zm0 4h6v2H7v-2z" clipRule="evenodd" />
                </svg>
                İşlemler
              </button>
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Üye Yönetimi</h3>
            <p className="text-gray-600">Doktor ve personel hesaplarını yönetin.</p>
            <Link href="/dashboard/users">
              <button className="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                Üye Yönetimi
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 