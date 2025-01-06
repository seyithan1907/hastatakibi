import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const resolvedParams = await params;
    const hastaId = parseInt(resolvedParams.id);
    const tedaviler = await prisma.tedaviPlani.findMany({
      where: { hastaId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ data: tedaviler, error: null });
  } catch (error) {
    console.error("Tedavi planları getirilirken hata:", error);
    return NextResponse.json(
      { data: null, error: "Tedavi planları getirilemedi" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  console.log('POST isteği başladı');
  console.log('Params:', params);

  try {
    const resolvedParams = await params;
    console.log('Resolved params:', resolvedParams);

    if (!resolvedParams?.id) {
      console.log('Hasta ID eksik');
      return NextResponse.json(
        { data: null, error: 'Hasta ID gerekli' },
        { status: 400 }
      );
    }

    const hastaId = parseInt(resolvedParams.id);
    console.log('Parse edilmiş hastaId:', hastaId);

    if (isNaN(hastaId)) {
      console.log('Geçersiz hasta ID');
      return NextResponse.json(
        { data: null, error: 'Geçersiz hasta ID' },
        { status: 400 }
      );
    }

    // Request body'sini kontrol et
    const rawBody = await request.text();
    console.log('Ham request body:', rawBody);

    let body;
    try {
      body = JSON.parse(rawBody);
      console.log('Parse edilmiş request body:', body);
    } catch (parseError) {
      console.error('Body parse hatası:', parseError);
      return NextResponse.json(
        { data: null, error: 'Geçersiz JSON formatı' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      console.log('Geçersiz body formatı:', body);
      return NextResponse.json(
        { data: null, error: 'Geçersiz veri formatı' },
        { status: 400 }
      );
    }

    // Gerekli alanların varlığını kontrol et
    const { disNo, islem, fiyat, durum = 'Planlandı', odenen = 0 } = body;
    console.log('Çıkarılan alanlar:', { disNo, islem, fiyat, durum, odenen });

    if (!disNo || !islem || typeof fiyat !== 'number') {
      console.log('Eksik veya hatalı alanlar:', { disNo, islem, fiyat });
      return NextResponse.json(
        { data: null, error: 'Eksik veya hatalı veri' },
        { status: 400 }
      );
    }

    // Tedavi planını kaydet
    let tedaviPlani;
    try {
      console.log('Prisma create başlıyor. Data:', {
        hastaId,
        disNo,
        islem,
        fiyat,
        durum,
        odenen,
      });

      tedaviPlani = await prisma.tedaviPlani.create({
        data: {
          hastaId,
          disNo,
          islem,
          fiyat,
          durum,
          odenen,
        },
      });
      console.log('Oluşturulan tedavi planı:', tedaviPlani);
    } catch (prismaError) {
      console.error('Prisma create hatası - stack:', prismaError?.stack);
      console.error('Prisma create hatası - detay:', prismaError);
      return NextResponse.json(
        { 
          data: null, 
          error: 'Veritabanına kayıt yapılamadı',
          details: prismaError instanceof Error ? prismaError.message : 'Bilinmeyen hata'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: tedaviPlani, error: null },
      { status: 201 }
    );
  } catch (error) {
    console.error('Genel hata - stack:', error?.stack);
    console.error('Genel hata - detay:', error);
    return NextResponse.json(
      { 
        data: null, 
        error: 'Tedavi planı kaydedilemedi',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const hastaId = parseInt(id);

    // Tüm tedavi planlarını sil ve hastanın toplam indirimini sıfırla
    const [deletedTedaviler, hasta] = await prisma.$transaction([
      // Tüm tedavi planlarını sil
      prisma.tedaviPlani.deleteMany({
        where: { hastaId },
      }),
      // Hastanın toplam indirimini sıfırla
      prisma.hasta.update({
        where: { id: hastaId },
        data: {
          toplamIndirim: null,
        },
      }),
    ]);

    return NextResponse.json({ data: { tedaviler: deletedTedaviler, hasta } });
  } catch (error) {
    console.error('Tedavi planları silinirken hata:', error);
    return NextResponse.json(
      { error: 'Tedavi planları silinemedi' },
      { status: 500 }
    );
  }
} 