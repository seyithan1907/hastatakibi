"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Hasta {
  id: number;
  ad: string;
  soyad: string;
  telefonNo: string;
  dogumTarihi: string;
  doktor: {
    ad: string;
    soyad: string;
  };
}

export default function HastaListesi() {
  const router = useRouter();
  const [hastalar, setHastalar] = useState<Hasta[]>([]);
  const [filteredHastalar, setFilteredHastalar] = useState<Hasta[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHastalar = async () => {
      try {
        const response = await fetch('/api/hastalar');
        if (!response.ok) {
          throw new Error('Hastalar alınamadı');
        }
        const data = await response.json();
        setHastalar(data);
        setFilteredHastalar(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchHastalar();
  }, []);

  useEffect(() => {
    const filtered = hastalar.filter(hasta =>
      `${hasta.ad} ${hasta.soyad} ${hasta.telefonNo}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredHastalar(filtered);
  }, [searchTerm, hastalar]);

  if (loading) return <div className="p-4">Yükleniyor...</div>;
  if (error) return <div className="p-4 text-red-500">Hata: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Hasta Listesi</h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Ana Sayfaya Dön
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Hasta ara... (Ad, Soyad veya Telefon)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredHastalar.map((hasta) => (
          <div
            key={hasta.id}
            onClick={() => router.push(`/hasta/${hasta.id}`)}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h3 className="text-lg font-semibold">{hasta.ad} {hasta.soyad}</h3>
            <p className="text-gray-600">{hasta.telefonNo}</p>
            <p className="text-sm text-gray-500 mt-2">
              Dr. {hasta.doktor.ad} {hasta.doktor.soyad}
            </p>
          </div>
        ))}
      </div>

      {filteredHastalar.length === 0 && (
        <div className="text-center text-gray-500 mt-6">
          {searchTerm ? 'Aranan kriterlere uygun hasta bulunamadı' : 'Henüz hasta kaydı bulunmuyor'}
        </div>
      )}
    </div>
  );
} 