"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Hasta {
  id: number;
  tcKimlik: string;
  ad: string;
  soyad: string;
  dogumTarihi: string;
  telefon: string;
  email: string | null;
  adres: string | null;
  alinanUcret: number;
  toplamIndirim: number | null;
}

interface TedaviPlani {
  id: number;
  disNo: string;
  islem: string;
  durum: string;
  fiyat: number;
  odenen: number;
  createdAt: string;
}

interface Odeme {
  id: number;
  miktar: number;
  tip: string;
  tarih: string;
  notlar?: string;
}

export default function HastaDetayClient({ id }: { id: string }) {
  const router = useRouter();
  const [hasta, setHasta] = useState<Hasta | null>(null);
  const [tedaviler, setTedaviler] = useState<TedaviPlani[]>([]);
  const [odemeler, setOdemeler] = useState<Odeme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showOdemeModal, setShowOdemeModal] = useState(false);
  const [odemeYapiliyor, setOdemeYapiliyor] = useState(false);
  const [showOdemeSilModal, setShowOdemeSilModal] = useState(false);
  const [selectedOdeme, setSelectedOdeme] = useState<Odeme | null>(null);
  const [odemeSiliniyor, setOdemeSiliniyor] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hastaRes, tedaviRes, odemeRes] = await Promise.all([
          fetch(`/api/hastalar/${id}`),
          fetch(`/api/hastalar/${id}/tedaviler`),
          fetch(`/api/hastalar/${id}/odeme`)
        ]);

        if (!hastaRes.ok) throw new Error("Hasta bilgileri getirilemedi");
        if (!tedaviRes.ok) throw new Error("Tedavi planları getirilemedi");
        if (!odemeRes.ok) throw new Error("Ödeme geçmişi getirilemedi");

        const hastaData = await hastaRes.json();
        const tedaviData = await tedaviRes.json();
        const odemeData = await odemeRes.json();

        setHasta(hastaData);
        setTedaviler(tedaviData.data || []);
        setOdemeler(odemeData.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/hastalar/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error("Hasta silinemedi");
      }

      router.push('/hastalar');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hasta silinirken bir hata oluştu");
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleDurumDegistir = async (tedaviId: number, yeniDurum: string) => {
    try {
      const response = await fetch(`/api/hastalar/${id}/tedaviler/${tedaviId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ durum: yeniDurum }),
      });

      if (!response.ok) {
        throw new Error('Durum güncellenemedi');
      }

      // Tedavi listesini güncelle
      const updatedTedaviler = tedaviler.map(tedavi =>
        tedavi.id === tedaviId ? { ...tedavi, durum: yeniDurum } : tedavi
      );
      setTedaviler(updatedTedaviler);
    } catch (err) {
      console.error('Durum güncelleme hatası:', err);
      setError('Durum güncellenirken bir hata oluştu');
    }
  };

  const handleUcretGuncelle = async () => {
    const yeniUcret = window.prompt('Alınan toplam ücreti girin:');
    if (yeniUcret === null) return;

    const ucretDegeri = parseFloat(yeniUcret);
    if (isNaN(ucretDegeri) || ucretDegeri < 0) {
      alert('Geçersiz ücret tutarı!');
      return;
    }

    try {
      const response = await fetch(`/api/hastalar/${id}/ucret`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alinanUcret: ucretDegeri }),
      });

      if (!response.ok) {
        throw new Error('Ücret güncellenemedi');
      }

      const { data } = await response.json();
      setHasta(prevHasta => prevHasta ? { ...prevHasta, alinanUcret: data.alinanUcret } : null);
    } catch (err) {
      console.error('Ücret güncelleme hatası:', err);
      setError('Ücret güncellenirken bir hata oluştu');
    }
  };

  const handleOdemeYap = async (formData: FormData) => {
    try {
      setOdemeYapiliyor(true);
      const miktar = formData.get('miktar');
      const tip = formData.get('tip');
      const notlar = formData.get('notlar');

      const response = await fetch(`/api/hastalar/${id}/odeme`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          miktar: parseFloat(miktar as string),
          tip,
          notlar,
        }),
      });

      if (!response.ok) {
        throw new Error('Ödeme eklenemedi');
      }

      const { data } = await response.json();
      setHasta(prevHasta => prevHasta ? { ...prevHasta, alinanUcret: data.hasta.alinanUcret } : null);
      setOdemeler(prev => [data.odeme, ...prev]);
      setShowOdemeModal(false);
    } catch (err) {
      console.error('Ödeme ekleme hatası:', err);
      setError('Ödeme eklenirken bir hata oluştu');
    } finally {
      setOdemeYapiliyor(false);
    }
  };

  const handleOdemeSil = async () => {
    if (!selectedOdeme) return;

    try {
      setOdemeSiliniyor(true);
      const response = await fetch(`/api/hastalar/${id}/odeme/${selectedOdeme.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Ödeme silinemedi');
      }

      const { data } = await response.json();
      setHasta(prevHasta => prevHasta ? { ...prevHasta, alinanUcret: data.hasta.alinanUcret } : null);
      setOdemeler(prev => prev.filter(o => o.id !== selectedOdeme.id));
      setShowOdemeSilModal(false);
    } catch (err) {
      console.error('Ödeme silme hatası:', err);
      setError('Ödeme silinirken bir hata oluştu');
    } finally {
      setOdemeSiliniyor(false);
      setSelectedOdeme(null);
    }
  };

  const handleFiyatGuncelle = async (tedaviId: number, indirimli: number | null) => {
    try {
      const response = await fetch(`/api/hastalar/${id}/tedaviler/${tedaviId}/fiyat`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ indirimli }),
      });

      if (!response.ok) {
        throw new Error('Fiyat güncellenemedi');
      }

      const { data } = await response.json();
      
      // Tedavi listesini güncelle
      setTedaviler(prev => prev.map(tedavi =>
        tedavi.id === tedaviId ? { ...tedavi, indirimli: data.indirimli } : tedavi
      ));
    } catch (err) {
      console.error('Fiyat güncelleme hatası:', err);
      setError('Fiyat güncellenirken bir hata oluştu');
    }
  };

  const handleIndirimGuncelle = async () => {
    const yeniFiyat = window.prompt(
      'İndirimli toplam fiyatı girin (İndirimi kaldırmak için boş bırakın):',
      hasta?.toplamIndirim?.toString() || ''
    );
    
    if (yeniFiyat === null) return; // İptal edildi
    
    const fiyat = yeniFiyat === '' ? null : parseFloat(yeniFiyat);
    if (yeniFiyat !== '' && (isNaN(fiyat!) || fiyat! < 0)) {
      alert('Geçersiz fiyat!');
      return;
    }

    try {
      const response = await fetch(`/api/hastalar/${id}/indirim`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ toplamIndirim: fiyat }),
      });

      if (!response.ok) {
        throw new Error('İndirimli fiyat güncellenemedi');
      }

      const { data } = await response.json();
      setHasta(prevHasta => prevHasta ? { ...prevHasta, toplamIndirim: data.toplamIndirim } : null);
    } catch (err) {
      console.error('İndirimli fiyat güncelleme hatası:', err);
      setError('İndirimli fiyat güncellenirken bir hata oluştu');
    }
  };

  const handleTedaviSil = async (tedaviId: number) => {
    try {
      const response = await fetch(`/api/hastalar/${id}/tedaviler/${tedaviId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Tedavi planı silinemedi');
      }

      // Tedavi listesini güncelle
      setTedaviler(prev => prev.filter(t => t.id !== tedaviId));
    } catch (err) {
      console.error('Tedavi planı silme hatası:', err);
      setError('Tedavi planı silinirken bir hata oluştu');
    }
  };

  // Toplam fiyat ve kalan borç hesaplama
  const toplamFiyat = Array.isArray(tedaviler) 
    ? tedaviler.reduce((acc, t) => acc + (t.fiyat || 0), 0)
    : 0;

  const alinanUcret = hasta?.alinanUcret || 0;
  const kalanBorc = (hasta?.toplamIndirim ?? toplamFiyat) - alinanUcret;

  if (loading) {
    return <div className="text-center p-6">Yükleniyor...</div>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!hasta) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p className="text-yellow-700">Hasta bulunamadı</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {hasta.ad} {hasta.soyad}
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
            >
              Geri Dön
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? "Siliniyor..." : "Hastayı Sil"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Hasta Bilgileri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">T.C. Kimlik No</p>
              <p className="text-gray-800">{hasta.tcKimlik}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Doğum Tarihi</p>
              <p className="text-gray-800">
                {new Date(hasta.dogumTarihi).toLocaleDateString('tr-TR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Telefon</p>
              <p className="text-gray-800">{hasta.telefon}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">E-posta</p>
              <p className="text-gray-800">{hasta.email || "-"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Adres</p>
              <p className="text-gray-800">{hasta.adres || "-"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Muhasebe Özeti */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Muhasebe Özeti</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Toplam Tutar</p>
                <p className={`text-xl font-semibold ${hasta?.toplamIndirim ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                  {toplamFiyat.toLocaleString('tr-TR')} ₺
                </p>
                {hasta?.toplamIndirim && (
                  <>
                    <p className="text-sm text-gray-500 mt-2">İndirimli Tutar</p>
                    <p className="text-xl font-semibold text-green-600">
                      {hasta.toplamIndirim.toLocaleString('tr-TR')} ₺
                    </p>
                  </>
                )}
                <button
                  onClick={handleIndirimGuncelle}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  {hasta?.toplamIndirim ? 'İndirimi Güncelle' : 'İndirim Uygula'}
                </button>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Alınan Ücret</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-semibold text-green-600">{alinanUcret.toLocaleString('tr-TR')} ₺</p>
                  <button
                    onClick={() => setShowOdemeModal(true)}
                    className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
                  >
                    Ödeme Yap
                  </button>
                </div>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Kalan Borç</p>
                <p className="text-xl font-semibold text-red-600">{kalanBorc.toLocaleString('tr-TR')} ₺</p>
              </div>
            </div>

            {/* Ödeme Geçmişi */}
            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Ödeme Geçmişi</h4>
              {odemeler.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tarih
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tutar
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ödeme Tipi
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Not
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {odemeler.map((odeme) => (
                        <tr key={odeme.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(odeme.tarih).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {odeme.miktar.toLocaleString('tr-TR')} ₺
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {odeme.tip}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {odeme.notlar || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => {
                                setSelectedOdeme(odeme);
                                setShowOdemeSilModal(true);
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              Sil
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">Henüz ödeme yapılmamış.</p>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">Tedavi Planı</h2>
              <button
                onClick={() => router.push(`/hastalar/${id}/tedavi-plani`)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Yeni Tedavi Planı
              </button>
            </div>
          </div>

          {tedaviler.length > 0 ? (
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
                      Durum
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fiyat
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tedaviler.map((tedavi) => (
                    <tr key={tedavi.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tedavi.disNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tedavi.islem}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select
                          value={tedavi.durum}
                          onChange={(e) => handleDurumDegistir(tedavi.id, e.target.value)}
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            tedavi.durum === "Tamamlandı"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          <option value="Planlandı">Planlandı</option>
                          <option value="Tamamlandı">Tamamlandı</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tedavi.fiyat.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(tedavi.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            if (window.confirm('Bu tedavi planını silmek istediğinizden emin misiniz?')) {
                              handleTedaviSil(tedavi.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">Henüz tedavi planı oluşturulmamış.</p>
          )}
        </div>
      </div>

      {/* Silme Onay Modalı */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Hastayı Sil
            </h3>
            <p className="text-gray-500 mb-4">
              Bu hastayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Siliniyor..." : "Evet, Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ödeme Modalı */}
      {showOdemeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ödeme Yap
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleOdemeYap(new FormData(e.currentTarget));
            }}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="miktar" className="block text-sm font-medium text-gray-700">
                    Ödeme Tutarı
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="miktar"
                      id="miktar"
                      step="0.01"
                      required
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="tip" className="block text-sm font-medium text-gray-700">
                    Ödeme Tipi
                  </label>
                  <select
                    id="tip"
                    name="tip"
                    required
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="Nakit">Nakit</option>
                    <option value="Kredi Kartı">Kredi Kartı</option>
                    <option value="Havale/EFT">Havale/EFT</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="notlar" className="block text-sm font-medium text-gray-700">
                    Notlar
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="notlar"
                      name="notlar"
                      rows={3}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Ödeme ile ilgili notlar..."
                    />
                  </div>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowOdemeModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={odemeYapiliyor}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {odemeYapiliyor ? "Kaydediliyor..." : "Ödemeyi Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ödeme Silme Modalı */}
      {showOdemeSilModal && selectedOdeme && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ödeme Sil
            </h3>
            <p className="text-gray-500 mb-4">
              {selectedOdeme.tarih && new Date(selectedOdeme.tarih).toLocaleDateString('tr-TR')} tarihli{' '}
              {selectedOdeme.miktar.toLocaleString('tr-TR')} ₺ tutarındaki ödemeyi silmek istediğinizden emin misiniz?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowOdemeSilModal(false);
                  setSelectedOdeme(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              >
                İptal
              </button>
              <button
                onClick={handleOdemeSil}
                disabled={odemeSiliniyor}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
              >
                {odemeSiliniyor ? "Siliniyor..." : "Evet, Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 