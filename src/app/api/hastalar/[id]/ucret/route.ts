import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const hastaId = parseInt(params.id);
    const body = await request.json();

    // Yeni ücret tutarını kontrol et
    const yeniUcret = parseFloat(body.alinanUcret.toString());
    if (isNaN(yeniUcret) || yeniUcret < 0) {
      return NextResponse.json(
        { error: 'Geçersiz ücret tutarı' },
        { status: 400 }
      );
    }

    // Ücreti güncelle
    const hasta = await prisma.hasta.update({
      where: {
        id: hastaId,
      },
      data: {
        alinanUcret: yeniUcret,
      },
    });

    return NextResponse.json({ data: hasta });
  } catch (error) {
    console.error('Ücret güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Ücret güncellenemedi' },
      { status: 500 }
    );
  }
} 