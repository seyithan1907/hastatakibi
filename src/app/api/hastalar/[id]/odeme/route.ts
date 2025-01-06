import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Ödeme geçmişini getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const hastaId = parseInt(resolvedParams.id);

    if (isNaN(hastaId)) {
      return NextResponse.json(
        { data: null, error: 'Geçersiz hasta ID' },
        { status: 400 }
      );
    }

    const odemeler = await prisma.odeme.findMany({
      where: { hastaId },
      orderBy: { tarih: 'desc' },
    });

    return NextResponse.json({ data: odemeler, error: null });
  } catch (error) {
    console.error('Ödeme geçmişi getirme hatası:', error);
    return NextResponse.json(
      { data: null, error: 'Ödeme geçmişi getirilemedi' },
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
    const resolvedParams = await params;
    const hastaId = parseInt(resolvedParams.id);

    if (isNaN(hastaId)) {
      return NextResponse.json(
        { data: null, error: 'Geçersiz hasta ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { miktar, tip, notlar } = body;

    if (!miktar || !tip) {
      return NextResponse.json(
        { data: null, error: 'Miktar ve tip alanları zorunludur' },
        { status: 400 }
      );
    }

    // Ödemeyi kaydet
    const odeme = await prisma.odeme.create({
      data: {
        hastaId,
        miktar,
        tip,
        notlar,
        tarih: new Date(),
      },
    });

    // Hastanın alınan ücretini güncelle
    const hasta = await prisma.hasta.update({
      where: { id: hastaId },
      data: {
        alinanUcret: {
          increment: miktar,
        },
      },
    });

    return NextResponse.json({ data: { odeme, hasta }, error: null });
  } catch (error) {
    console.error('Ödeme ekleme hatası:', error);
    return NextResponse.json(
      { data: null, error: 'Ödeme eklenemedi' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string; odemeId: string } }) {
  try {
    const resolvedParams = await params;
    const hastaId = parseInt(resolvedParams.id);
    const odemeId = parseInt(resolvedParams.odemeId);

    if (isNaN(hastaId) || isNaN(odemeId)) {
      return NextResponse.json(
        { data: null, error: 'Geçersiz ID' },
        { status: 400 }
      );
    }

    // Önce ödemeyi bul
    const odeme = await prisma.odeme.findUnique({
      where: { id: odemeId },
    });

    if (!odeme) {
      return NextResponse.json(
        { data: null, error: 'Ödeme bulunamadı' },
        { status: 404 }
      );
    }

    // Ödemeyi sil ve hastanın alınan ücretini güncelle
    const [deletedOdeme, hasta] = await prisma.$transaction([
      prisma.odeme.delete({
        where: { id: odemeId },
      }),
      prisma.hasta.update({
        where: { id: hastaId },
        data: {
          alinanUcret: {
            decrement: odeme.miktar,
          },
        },
      }),
    ]);

    return NextResponse.json({ data: { odeme: deletedOdeme, hasta }, error: null });
  } catch (error) {
    console.error('Ödeme silme hatası:', error);
    return NextResponse.json(
      { data: null, error: 'Ödeme silinemedi' },
      { status: 500 }
    );
  }
} 