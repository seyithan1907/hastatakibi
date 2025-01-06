import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Ödeme geçmişini getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const hastaId = parseInt(id);

    const odemeler = await prisma.odeme.findMany({
      where: {
        hastaId: hastaId,
      },
      orderBy: {
        tarih: 'desc',
      },
    });

    return NextResponse.json({ data: odemeler });
  } catch (error) {
    console.error('Ödemeler getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Ödemeler getirilemedi' },
      { status: 500 }
    );
  }
}

// Yeni ödeme ekle
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const hastaId = parseInt(id);
    const body = await request.json();

    // Ödeme tutarını kontrol et
    const miktar = parseFloat(body.miktar.toString());
    if (isNaN(miktar) || miktar <= 0) {
      return NextResponse.json(
        { error: 'Geçersiz ödeme tutarı' },
        { status: 400 }
      );
    }

    // Ödeme tipini kontrol et
    const tip = body.tip;
    if (!['Nakit', 'Kredi Kartı', 'Havale/EFT'].includes(tip)) {
      return NextResponse.json(
        { error: 'Geçersiz ödeme tipi' },
        { status: 400 }
      );
    }

    // Prisma transaction ile hem ödemeyi kaydet hem de hasta toplam ücretini güncelle
    const [odeme, hasta] = await prisma.$transaction([
      // Yeni ödemeyi kaydet
      prisma.odeme.create({
        data: {
          hastaId,
          miktar,
          tip,
          notlar: body.notlar,
        },
      }),
      // Hasta toplam ücretini güncelle
      prisma.hasta.update({
        where: { id: hastaId },
        data: {
          alinanUcret: {
            increment: miktar,
          },
        },
      }),
    ]);

    return NextResponse.json({ data: { odeme, hasta } });
  } catch (error) {
    console.error('Ödeme eklenirken hata:', error);
    return NextResponse.json(
      { error: 'Ödeme eklenemedi' },
      { status: 500 }
    );
  }
} 