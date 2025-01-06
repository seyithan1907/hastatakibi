"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Islem {
  id: number;
  ad: string;
  fiyat: number;
  aciklama?: string;
  aktif: boolean;
}

interface YeniIslem {
  ad: string;
  fiyat: number;
  aciklama?: string;
}

export default function Islemler() {
  const router = useRouter();
  const [islemler, setIslemler] = useState<Islem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [varsayilanEkleniyor, setVarsayilanEkleniyor] = useState(false);
  const [yeniIslem, setYeniIslem] = useState<YeniIslem>({
    ad: "",
    fiyat: 0,
    aciklama: "",
  });

  useEffect(() => {
    fetchIslemler();
  }, []);

  const fetchIslemler = async () => {
    try {
      const response = await fetch("/api/islemler");
      if (!response.ok) {
        throw new Error("İşlemler getirilemedi");
      }
      const { data } = await response.json();
      setIslemler(data || []);
    } catch (err) {
      setError("İşlemler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/islemler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(yeniIslem),
      });

      if (!response.ok) {
        throw new Error("İşlem eklenirken bir hata oluştu");
      }

      await fetchIslemler();
      setShowForm(false);
      setYeniIslem({ ad: "", fiyat: 0, aciklama: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    }
  };

  const handleVarsayilanEkle = async () => {
    try {
      setVarsayilanEkleniyor(true);
      const response = await fetch("/api/islemler/varsayilan", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Varsayılan işlemler eklenirken bir hata oluştu");
      }

      await fetchIslemler();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setVarsayilanEkleniyor(false);
    }
  };

  const handleIslemGuncelle = async (id: number, aktif: boolean) => {
    try {
      const response = await fetch(`/api/islemler/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ aktif }),
      });

      if (!response.ok) {
        throw new Error("İşlem güncellenirken bir hata oluştu");
      }

      await fetchIslemler();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    }
  };

  const handleFiyatGuncelle = async (id: number, yeniFiyat: number) => {
    try {
      const response = await fetch(`/api/islemler/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fiyat: yeniFiyat }),
      });

      if (!response.ok) {
        throw new Error("Fiyat güncellenirken bir hata oluştu");
      }

      await fetchIslemler();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    }
  };

  const handleIslemSil = async (id: number) => {
    if (!confirm('Bu işlemi silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/islemler/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('İşlem silinirken bir hata oluştu');
      }

      await fetchIslemler();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  if (loading) {
    return <div className="text-center p-6">Yükleniyor...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">İşlemler</h1>
        <div className="space-x-4">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800"
          >
            Geri Dön
          </button>
          {islemler.length === 0 && (
            <button
              onClick={handleVarsayilanEkle}
              disabled={varsayilanEkleniyor}
              className={`bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 ${
                varsayilanEkleniyor ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {varsayilanEkleniyor ? "Ekleniyor..." : "Varsayılan İşlemleri Ekle"}
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Yeni İşlem Ekle
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Yeni İşlem Ekle</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  İşlem Adı
                </label>
                <input
                  type="text"
                  value={yeniIslem.ad}
                  onChange={(e) =>
                    setYeniIslem({ ...yeniIslem, ad: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fiyat
                </label>
                <input
                  type="number"
                  value={yeniIslem.fiyat}
                  onChange={(e) =>
                    setYeniIslem({
                      ...yeniIslem,
                      fiyat: parseFloat(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Açıklama
                </label>
                <textarea
                  value={yeniIslem.aciklama}
                  onChange={(e) =>
                    setYeniIslem({ ...yeniIslem, aciklama: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlem Adı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fiyat
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {islemler.map((islem) => (
              <tr key={islem.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {islem.ad}
                  </div>
                  {islem.aciklama && (
                    <div className="text-sm text-gray-500">{islem.aciklama}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={islem.fiyat}
                      onChange={(e) =>
                        handleFiyatGuncelle(islem.id, parseFloat(e.target.value))
                      }
                      className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                    <span className="ml-2">₺</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      islem.aktif
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {islem.aktif ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => handleIslemGuncelle(islem.id, !islem.aktif)}
                      className={`text-sm ${
                        islem.aktif
                          ? "text-red-600 hover:text-red-900"
                          : "text-green-600 hover:text-green-900"
                      }`}
                    >
                      {islem.aktif ? "Pasife Al" : "Aktife Al"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleIslemSil(islem.id);
                      }}
                      className="text-sm text-red-600 hover:text-red-900"
                    >
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 