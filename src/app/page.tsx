'use client';

import Link from 'next/link';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Diş Hekimi Hasta Takip Sistemi
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
              Hasta kayıtlarınızı kolayca yönetin, tedavi planlarını takip edin ve ödemeleri düzenleyin.
            </p>
            <div className="mt-8">
              <Link href="/login">
                <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Giriş Yap
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hasta Yönetimi</h3>
            <ul className="space-y-3 text-gray-600">
              <li>• Detaylı hasta kayıtları</li>
              <li>• Tedavi geçmişi takibi</li>
              <li>• Randevu planlaması</li>
              <li>• Hasta iletişim bilgileri</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tedavi Planlaması</h3>
            <ul className="space-y-3 text-gray-600">
              <li>• Tedavi planı oluşturma</li>
              <li>• İşlem takibi</li>
              <li>• Diş haritası</li>
              <li>• Tedavi notları</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Finansal Takip</h3>
            <ul className="space-y-3 text-gray-600">
              <li>• Ödeme takibi</li>
              <li>• Fatura yönetimi</li>
              <li>• İndirim yönetimi</li>
              <li>• Finansal raporlar</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              İletişime Geçin
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Daha fazla bilgi almak veya demo talep etmek için bizimle iletişime geçin.
            </p>
            <div className="mt-6">
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                <a href="mailto:info@hastatakibi.com" className="text-gray-600 hover:text-gray-800">
                  info@hastatakibi.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
