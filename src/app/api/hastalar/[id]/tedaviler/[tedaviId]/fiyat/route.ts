import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; tedaviId: string } }
) {
  try {
    const { id, tedaviId } = await params;
    const hastaId = parseInt(id);
    const tedaviIdInt = parseInt(tedaviId);
    const body = await request.json();

    // İndirimli fiyatı kontrol et (null olabilir)
    const indirimli = body.indirimli === null ? null : parseFloat(body.indirimli.toString());
    if (indirimli !== null && (isNaN(indirimli) || indirimli < 0)) {
      return NextResponse.json(
        { error: 'Geçersiz fiyat' },
        { status: 400 }
      );
    }

    // Tedavi planını güncelle
    const tedavi = await prisma.tedaviPlani.update({
      where: {
        id: tedaviIdInt,
        hastaId: hastaId,
      },
      data: {
        indirimli: indirimli,
      },
    });

    return NextResponse.json({ data: tedavi });
  } catch (error) {
    console.error('Fiyat güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Fiyat güncellenemedi' },
      { status: 500 }
    );
  }
} 