import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Header } from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Hasta Takip Sistemi',
  description: 'Diş hekimleri için hasta takip sistemi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900`}>
        <Providers>
          <Header />
          <main className="min-h-screen">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
