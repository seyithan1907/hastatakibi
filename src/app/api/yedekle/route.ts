import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Tüm verileri çek
    const [hastalar, tedaviler, odemeler, islemler, users] = await Promise.all([
      prisma.hasta.findMany(),
      prisma.tedaviPlani.findMany(),
      prisma.odeme.findMany(),
      prisma.islem.findMany(),
      prisma.user.findMany({
        select: {
          id: true,
          username: true,
          role: true,
          ad: true,
          soyad: true,
          email: true,
          aktif: true,
          // password alanını dahil etmiyoruz
        }
      })
    ]);

    // Verileri JSON formatında döndür
    const yedek = {
      hastalar,
      tedaviler,
      odemeler,
      islemler,
      users,
      tarih: new Date().toISOString()
    };

    // Content-Disposition header'ı ile dosya indirme
    return new NextResponse(JSON.stringify(yedek, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="yedek-${new Date().toISOString().split('T')[0]}.json"`
      }
    });
  } catch (error) {
    console.error('Yedekleme hatası:', error);
    return NextResponse.json(
      { error: 'Yedekleme sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 