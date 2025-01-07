'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);
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
    const userId = Cookies.get('userId');
    const auth = Cookies.get('auth');

    if (!userId || !auth) {
      router.push('/login');
      return;
    }

    // Kullanıcı bilgilerini getir
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        setUserInfo(data);
      })
      .catch(err => {
        console.error('Kullanıcı bilgileri getirilemedi:', err);
        setError('Kullanıcı bilgileri getirilemedi');
      });
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('auth');
    Cookies.remove('userId');
    Cookies.remove('username');
    router.push('/login');
  };

  const handleYedekle = async () => {
    try {
      const response = await fetch('/api/yedekle');
      if (!response.ok) throw new Error('Yedekleme başarısız');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `yedek-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Yedekleme hatası:', err);
      setError('Yedekleme sırasında bir hata oluştu');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/hastalar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          doktorId: userInfo.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Hasta kaydedilemedi');
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
      console.error('Kayıt hatası:', err);
      setError(err instanceof Error ? err.message : 'Kayıt sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Hoş Geldiniz, {userInfo?.ad} {userInfo?.soyad}
            </h1>
            <div className="flex gap-4">
              <button
                onClick={handleYedekle}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Verileri Yedekle
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Çıkış Yap
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sol Taraf: Menü */}
            <div className="space-y-4">
              <a
                href="/hastalar"
                className="block p-6 bg-blue-50 dark:bg-blue-900 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
              >
                <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">Hasta Listesi</h2>
                <p className="text-blue-700 dark:text-blue-200">Tüm hastaları görüntüle ve yönet</p>
              </a>

              <a
                href="/islemler"
                className="block p-6 bg-purple-50 dark:bg-purple-900 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors"
              >
                <h2 className="text-xl font-semibold text-purple-900 dark:text-purple-100 mb-2">İşlemler</h2>
                <p className="text-purple-700 dark:text-purple-200">İşlem listesini görüntüle ve düzenle</p>
              </a>

              {userInfo?.role === 'admin' && (
                <a
                  href="/users"
                  className="block p-6 bg-yellow-50 dark:bg-yellow-900 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-800 transition-colors"
                >
                  <h2 className="text-xl font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Kullanıcılar</h2>
                  <p className="text-yellow-700 dark:text-yellow-200">Kullanıcıları yönet</p>
                </a>
              )}
            </div>

            {/* Sağ Taraf: Yeni Hasta Kaydı */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Yeni Hasta Kaydı</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ad" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ad
                    </label>
                    <input
                      type="text"
                      id="ad"
                      name="ad"
                      value={formData.ad}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="soyad" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Soyad
                    </label>
                    <input
                      type="text"
                      id="soyad"
                      name="soyad"
                      value={formData.soyad}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="tcKimlik" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      T.C. Kimlik No
                    </label>
                    <input
                      type="text"
                      id="tcKimlik"
                      name="tcKimlik"
                      value={formData.tcKimlik}
                      onChange={handleChange}
                      required
                      maxLength={11}
                      pattern="[0-9]{11}"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="dogumTarihi" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Doğum Tarihi
                    </label>
                    <input
                      type="date"
                      id="dogumTarihi"
                      name="dogumTarihi"
                      value={formData.dogumTarihi}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="telefon" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      id="telefon"
                      name="telefon"
                      value={formData.telefon}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      E-posta
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="adres" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Adres
                  </label>
                  <textarea
                    id="adres"
                    name="adres"
                    value={formData.adres}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
          </div>
        </div>
      </div>
    </div>
  );
} 