export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// Hasta listesini getir
export async function GET() {
  try {
    const cookieStore = await cookies();
    const username = cookieStore.get('username')?.value;
    const userId = cookieStore.get('userId')?.value;

    if (!username || !userId) {
      return NextResponse.json(
        { error: 'Oturum bulunamadı' },
        { status: 401 }
      );
    }

    // Kullanıcı bilgilerini kontrol et
    const user = await prisma.user.findUnique({
      where: { username },
      select: { role: true }
    });

    let hastalar;
    if (username === 'seyithan1907' || user?.role === 'admin') {
      // Admin tüm hastaları görebilir
      hastalar = await prisma.hasta.findMany({
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
          createdAt: 'desc'
        }
      });
    } else {
      // Diğer kullanıcılar sadece kendi hastalarını görebilir
      hastalar = await prisma.hasta.findMany({
        where: {
          doktorId: parseInt(userId)
        },
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
          createdAt: 'desc'
        }
      });
    }

    return NextResponse.json(hastalar);
  } catch (error) {
    console.error('Hasta listesi getirme hatası:', error);
    return NextResponse.json(
      { error: 'Hasta listesi alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Yeni hasta ekle
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      console.error('Oturum bulunamadı');
      return NextResponse.json(
        { error: 'Oturum bulunamadı' },
        { status: 401 }
      );
    }

    // Request body'sini kontrol et
    const rawBody = await request.text();
    console.log('Ham request body:', rawBody);

    let body;
    try {
      body = JSON.parse(rawBody);
      console.log('Parse edilmiş body:', body);
    } catch (parseError) {
      console.error('Body parse hatası:', parseError);
      return NextResponse.json(
        { error: 'Geçersiz JSON formatı' },
        { status: 400 }
      );
    }

    // Gerekli alanların varlığını kontrol et
    if (!body || typeof body !== 'object') {
      console.error('Geçersiz body formatı:', body);
      return NextResponse.json(
        { error: 'Geçersiz veri formatı' },
        { status: 400 }
      );
    }

    const { ad, soyad, telefon, dogumTarihi, tcKimlik } = body;
    
    if (!ad || !soyad || !telefon || !dogumTarihi || !tcKimlik) {
      console.error('Eksik alanlar:', { ad, soyad, telefon, dogumTarihi, tcKimlik });
      return NextResponse.json(
        { error: 'Eksik veya hatalı veri. Ad, soyad, telefon, TC kimlik ve doğum tarihi zorunludur.' },
        { status: 400 }
      );
    }

    // TC Kimlik numarasının benzersiz olup olmadığını kontrol et
    const existingHasta = await prisma.hasta.findUnique({
      where: { tcKimlik }
    });

    if (existingHasta) {
      return NextResponse.json(
        { error: 'Bu TC Kimlik numarası ile kayıtlı bir hasta zaten var.' },
        { status: 400 }
      );
    }

    // Hasta kaydını oluştur
    console.log('Prisma create başlıyor. Data:', {
      ad,
      soyad,
      telefon,
      tcKimlik,
      dogumTarihi: new Date(dogumTarihi),
      email: body.email || null,
      adres: body.adres || null,
      doktorId: parseInt(userId),
      alinanUcret: 0,
      toplamIndirim: null,
    });

    const hasta = await prisma.hasta.create({
      data: {
        ad,
        soyad,
        telefon,
        tcKimlik,
        dogumTarihi: new Date(dogumTarihi),
        email: body.email || null,
        adres: body.adres || null,
        doktorId: parseInt(userId),
        alinanUcret: 0,
        toplamIndirim: null,
      },
    });

    console.log('Oluşturulan hasta:', hasta);
    return NextResponse.json({ data: hasta });
  } catch (error) {
    console.error('Hasta ekleme hatası:', error);
    console.error('Hata detayı:', error instanceof Error ? error.stack : 'Bilinmeyen hata');
    return NextResponse.json(
      { error: 'Hasta eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 