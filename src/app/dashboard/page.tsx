'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
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
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <a
              href="/hastalar"
              className="block p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <h2 className="text-xl font-semibold text-blue-900 mb-2">Hasta Listesi</h2>
              <p className="text-blue-700">Tüm hastaları görüntüle ve yönet</p>
            </a>

            <a
              href="/hasta-kayit"
              className="block p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <h2 className="text-xl font-semibold text-green-900 mb-2">Yeni Hasta</h2>
              <p className="text-green-700">Yeni hasta kaydı oluştur</p>
            </a>

            <a
              href="/islemler"
              className="block p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <h2 className="text-xl font-semibold text-purple-900 mb-2">İşlemler</h2>
              <p className="text-purple-700">İşlem listesini görüntüle ve düzenle</p>
            </a>

            {userInfo?.role === 'admin' && (
              <a
                href="/uyeler"
                className="block p-6 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <h2 className="text-xl font-semibold text-yellow-900 mb-2">Kullanıcılar</h2>
                <p className="text-yellow-700">Kullanıcıları yönet</p>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 