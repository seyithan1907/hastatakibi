"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Islem {
  id: number;
  ad: string;
  fiyat: number;
  doktor?: {
    username: string;
    ad: string;
    soyad: string;
  };
}

export default function Islemler() {
  const router = useRouter();
  const [islemler, setIslemler] = useState<Islem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [yeniIslem, setYeniIslem] = useState({ ad: "", fiyat: "" });

  useEffect(() => {
    const fetchIslemler = async () => {
      try {
        const res = await fetch("/api/islemler");
        if (!res.ok) throw new Error("İşlemler getirilemedi");
        const { data } = await res.json();
        setIslemler(data);
      } catch (err) {
        setError("İşlemler yüklenirken bir hata oluştu");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIslemler();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/islemler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ad: yeniIslem.ad,
          fiyat: parseFloat(yeniIslem.fiyat),
        }),
      });

      if (!res.ok) throw new Error("İşlem eklenemedi");

      const { data } = await res.json();
      setIslemler(prev => [...prev, data]);
      setShowModal(false);
      setYeniIslem({ ad: "", fiyat: "" });
    } catch (err) {
      console.error(err);
      setError("İşlem eklenirken bir hata oluştu");
    }
  };

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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">İşlem Listesi</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Yeni İşlem Ekle
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlem Adı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fiyat
              </th>
              {islemler[0]?.doktor && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doktor
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {islemler.map((islem) => (
              <tr key={islem.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {islem.ad}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {islem.fiyat.toLocaleString("tr-TR")} ₺
                </td>
                {islem.doktor && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {islem.doktor.ad} {islem.doktor.soyad} ({islem.doktor.username})
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold mb-4">Yeni İşlem Ekle</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="ad" className="block text-sm font-medium text-gray-700">
                    İşlem Adı
                  </label>
                  <input
                    type="text"
                    id="ad"
                    value={yeniIslem.ad}
                    onChange={(e) => setYeniIslem(prev => ({ ...prev, ad: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="fiyat" className="block text-sm font-medium text-gray-700">
                    Fiyat
                  </label>
                  <input
                    type="number"
                    id="fiyat"
                    value={yeniIslem.fiyat}
                    onChange={(e) => setYeniIslem(prev => ({ ...prev, fiyat: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 