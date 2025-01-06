import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const islemler = await prisma.islem.findMany({
      orderBy: {
        ad: 'asc',
      },
    });

    return NextResponse.json({ data: islemler });
  } catch (error) {
    console.error('İşlemleri getirme hatası:', error);
    return NextResponse.json(
      { error: 'İşlemler getirilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const islem = await prisma.islem.create({
      data: {
        ad: body.ad,
        fiyat: body.fiyat,
        aciklama: body.aciklama || null,
      },
    });

    return NextResponse.json({ data: islem });
  } catch (error) {
    console.error('İşlem ekleme hatası:', error);
    return NextResponse.json(
      { error: 'İşlem eklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
} 