import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const VARSAYILAN_ISLEMLER = [
  { ad: "Dolgu", fiyat: 1000, aciklama: "Diş dolgu işlemi" },
  { ad: "Kanal Tedavisi", fiyat: 2500, aciklama: "Kök kanal tedavisi" },
  { ad: "Çekim", fiyat: 800, aciklama: "Diş çekim işlemi" },
  { ad: "Protez", fiyat: 5000, aciklama: "Protez diş uygulaması" },
  { ad: "Kaplama", fiyat: 3000, aciklama: "Diş kaplama işlemi" },
  { ad: "Temizlik", fiyat: 600, aciklama: "Diş temizliği" },
  { ad: "Diş Taşı Temizliği", fiyat: 700, aciklama: "Diş taşı temizleme işlemi" },
  { ad: "İmplant", fiyat: 15000, aciklama: "Diş implant uygulaması" }
];

export async function POST() {
  try {
    // Tüm işlemleri tek bir transaction'da ekle
    const islemler = await prisma.$transaction(
      VARSAYILAN_ISLEMLER.map(islem => 
        prisma.islem.create({
          data: islem
        })
      )
    );

    return NextResponse.json({ data: islemler });
  } catch (error) {
    console.error('Varsayılan işlemler eklenirken hata:', error);
    return NextResponse.json(
      { error: 'Varsayılan işlemler eklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
} 