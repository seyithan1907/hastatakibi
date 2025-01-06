'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

interface Islem {
  id: number;
  ad: string;
  fiyat: number;
}

interface TedaviPlani {
  disNo: string;
  islem: string;
  fiyat: number;
}

export default function TedaviPlani({ params }: { params: { id: string } }) {
  const hastaId = use(params).id;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [islemler, setIslemler] = useState<Islem[]>([]);
  const [seciliDis, setSeciliDis] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [tedaviPlanlari, setTedaviPlanlari] = useState<TedaviPlani[]>([]);

  const disNumaralari = {
    ustSag: ['18', '17', '16', '15', '14', '13', '12', '11'],
    ustSol: ['21', '22', '23', '24', '25', '26', '27', '28'],
    altSag: ['48', '47', '46', '45', '44', '43', '42', '41'],
    altSol: ['31', '32', '33', '34', '35', '36', '37', '38'],
  };

  useEffect(() => {
    const fetchIslemler = async () => {
      try {
        const res = await fetch('/api/islemler');
        if (!res.ok) throw new Error('İşlemler getirilemedi');
        const { data } = await res.json();
        setIslemler(data || []);
      } catch (err) {
        setError('İşlemler yüklenirken bir hata oluştu');
        console.error(err);
      }
    };

    fetchIslemler();
  }, []);

  const handleDisSecimi = (disNo: string) => {
    setSeciliDis(disNo);
    setShowPopup(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Her bir tedavi planını tek tek gönder
      for (const plan of tedaviPlanlari) {
        const tedaviData = {
          disNo: plan.disNo,
          islem: plan.islem,
          fiyat: plan.fiyat,
          durum: 'Planlandı',
          odenen: 0
        };

        console.log('Gönderilen veri:', tedaviData);

        const response = await fetch(`/api/hastalar/${hastaId}/tedaviler`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tedaviData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Hata yanıtı:', errorText);
          
          let errorMessage = 'Tedavi planı kaydedilemedi';
          try {
            if (errorText) {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.error || errorMessage;
            }
          } catch (parseError) {
            console.error('JSON parse hatası:', parseError);
          }
          
          throw new Error(errorMessage);
        }

        const responseData = await response.json();
        if (!responseData?.data) {
          throw new Error('Sunucudan geçersiz yanıt alındı');
        }
      }

      router.push(`/hastalar/${hastaId}`);
    } catch (err) {
      console.error('Hata detayı:', err);
      setError(err instanceof Error ? err.message : 'Kayıt sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const toplamFiyat = tedaviPlanlari.reduce((acc, plan) => acc + plan.fiyat, 0);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Yeni Tedavi Planı</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
        >
          Geri Dön
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-2 gap-8">
          {/* Üst Dişler */}
          <div className="flex justify-end gap-2">
            {disNumaralari.ustSag.map((no) => (
              <button
                key={no}
                onClick={() => handleDisSecimi(no)}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium
                  ${tedaviPlanlari.some(p => p.disNo === no)
                    ? 'border-green-500 bg-green-100 text-green-700'
                    : seciliDis === no 
                    ? 'border-blue-500 bg-blue-100 text-blue-700' 
                    : 'border-gray-300 hover:border-gray-400'
                  }`}
              >
                {no}
              </button>
            ))}
          </div>
          <div className="flex justify-start gap-2">
            {disNumaralari.ustSol.map((no) => (
              <button
                key={no}
                onClick={() => handleDisSecimi(no)}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium
                  ${tedaviPlanlari.some(p => p.disNo === no)
                    ? 'border-green-500 bg-green-100 text-green-700'
                    : seciliDis === no 
                    ? 'border-blue-500 bg-blue-100 text-blue-700' 
                    : 'border-gray-300 hover:border-gray-400'
                  }`}
              >
                {no}
              </button>
            ))}
          </div>

          {/* Alt Dişler */}
          <div className="flex justify-end gap-2">
            {disNumaralari.altSag.map((no) => (
              <button
                key={no}
                onClick={() => handleDisSecimi(no)}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium
                  ${tedaviPlanlari.some(p => p.disNo === no)
                    ? 'border-green-500 bg-green-100 text-green-700'
                    : seciliDis === no 
                    ? 'border-blue-500 bg-blue-100 text-blue-700' 
                    : 'border-gray-300 hover:border-gray-400'
                  }`}
              >
                {no}
              </button>
            ))}
          </div>
          <div className="flex justify-start gap-2">
            {disNumaralari.altSol.map((no) => (
              <button
                key={no}
                onClick={() => handleDisSecimi(no)}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium
                  ${tedaviPlanlari.some(p => p.disNo === no)
                    ? 'border-green-500 bg-green-100 text-green-700'
                    : seciliDis === no 
                    ? 'border-blue-500 bg-blue-100 text-blue-700' 
                    : 'border-gray-300 hover:border-gray-400'
                  }`}
              >
                {no}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* İşlem Seçme Popup'ı */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {seciliDis} Numaralı Diş İçin İşlemler
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {islemler.map((islem) => (
                <button
                  key={islem.id}
                  onClick={() => {
                    setTedaviPlanlari(prev => [...prev, {
                      disNo: seciliDis,
                      islem: islem.ad,
                      fiyat: islem.fiyat
                    }]);
                    setShowPopup(false);
                    setSeciliDis('');
                  }}
                  className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{islem.ad}</div>
                  <div className="text-sm text-gray-500 mt-1">{islem.fiyat.toLocaleString('tr-TR')} ₺</div>
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowPopup(false);
                  setSeciliDis('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seçilen İşlemler Listesi */}
      {tedaviPlanlari.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Seçilen İşlemler</h2>
            <div className="text-sm">
              <span className="font-medium">Toplam: </span>
              <span className="text-gray-900">{toplamFiyat.toLocaleString('tr-TR')} ₺</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diş No
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlem
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fiyat
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tedaviPlanlari.map((plan, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {plan.disNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {plan.islem}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {plan.fiyat.toLocaleString('tr-TR')} ₺
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Kaydediliyor...' : 'Tedavi Planını Kaydet'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 