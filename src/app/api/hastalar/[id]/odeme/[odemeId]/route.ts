import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; odemeId: string } }
) {
  try {
    const { id, odemeId } = await params;
    const hastaId = parseInt(id);
    const odemeIdInt = parseInt(odemeId);

    // Önce ödemeyi bul
    const odeme = await prisma.odeme.findUnique({
      where: {
        id: odemeIdInt,
        hastaId: hastaId,
      },
    });

    if (!odeme) {
      return NextResponse.json(
        { error: 'Ödeme bulunamadı' },
        { status: 404 }
      );
    }

    // Prisma transaction ile hem ödemeyi sil hem de hasta toplam ücretini güncelle
    const [deletedOdeme, hasta] = await prisma.$transaction([
      // Ödemeyi sil
      prisma.odeme.delete({
        where: {
          id: odemeIdInt,
          hastaId: hastaId,
        },
      }),
      // Hasta toplam ücretini güncelle (ödeme tutarını düş)
      prisma.hasta.update({
        where: { id: hastaId },
        data: {
          alinanUcret: {
            decrement: odeme.miktar,
          },
        },
      }),
    ]);

    return NextResponse.json({ data: { odeme: deletedOdeme, hasta } });
  } catch (error) {
    console.error('Ödeme silinirken hata:', error);
    return NextResponse.json(
      { error: 'Ödeme silinemedi' },
      { status: 500 }
    );
  }
} 