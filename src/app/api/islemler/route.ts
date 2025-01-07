import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    // Cookie'den kullanıcı bilgilerini al
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;
    const username = cookieStore.get('username')?.value;

    if (!userId || !username) {
      return NextResponse.json(
        { error: 'Oturum bulunamadı' },
        { status: 401 }
      );
    }

    // Kullanıcı bilgilerini kontrol et
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Eğer kullanıcı seyithan1907 ise tüm işlemleri göster
    if (username === 'seyithan1907') {
      const islemler = await prisma.islem.findMany({
        include: {
          doktor: {
            select: {
              username: true,
              ad: true,
              soyad: true
            }
          }
        },
        orderBy: {
          ad: 'asc'
        }
      });
      return NextResponse.json({ data: islemler });
    }

    // Diğer doktorlar için sadece kendi işlemlerini göster
    const islemler = await prisma.islem.findMany({
      where: {
        doktorId: user.id
      },
      orderBy: {
        ad: 'asc'
      }
    });

    return NextResponse.json({ data: islemler });
  } catch (error) {
    console.error('İşlemler getirilirken hata:', error);
    return NextResponse.json(
      { error: 'İşlemler getirilemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Cookie'den kullanıcı bilgilerini al
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Oturum bulunamadı' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ad, fiyat } = body;

    if (!ad || typeof fiyat !== 'number') {
      return NextResponse.json(
        { error: 'Geçersiz veri' },
        { status: 400 }
      );
    }

    const islem = await prisma.islem.create({
      data: {
        ad,
        fiyat,
        doktorId: parseInt(userId)
      }
    });

    return NextResponse.json({ data: islem }, { status: 201 });
  } catch (error) {
    console.error('İşlem eklenirken hata:', error);
    return NextResponse.json(
      { error: 'İşlem eklenemedi' },
      { status: 500 }
    );
  }
} 