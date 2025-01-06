import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; tedaviId: string } }
) {
  try {
    const hastaId = parseInt(params.id);
    const tedaviId = parseInt(params.tedaviId);
    const body = await request.json();

    if (!body.durum || !['Planlandı', 'Tamamlandı'].includes(body.durum)) {
      return NextResponse.json(
        { error: 'Geçersiz durum değeri' },
        { status: 400 }
      );
    }

    const tedavi = await prisma.tedaviPlani.update({
      where: {
        id: tedaviId,
        hastaId: hastaId,
      },
      data: {
        durum: body.durum,
      },
    });

    return NextResponse.json({ data: tedavi });
  } catch (error) {
    console.error('Tedavi durumu güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Tedavi durumu güncellenemedi' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; tedaviId: string } }
) {
  try {
    const { id, tedaviId } = await params;
    const hastaId = parseInt(id);
    const tedaviIdInt = parseInt(tedaviId);

    // Önce tedavi planını bul
    const tedavi = await prisma.tedaviPlani.findUnique({
      where: {
        id: tedaviIdInt,
        hastaId: hastaId,
      },
    });

    if (!tedavi) {
      return NextResponse.json(
        { error: 'Tedavi planı bulunamadı' },
        { status: 404 }
      );
    }

    // Tedavi planını sil ve hastanın toplam indirimini güncelle
    const [deletedTedavi, hasta] = await prisma.$transaction([
      // Tedavi planını sil
      prisma.tedaviPlani.delete({
        where: {
          id: tedaviIdInt,
          hastaId: hastaId,
        },
      }),
      // Hastanın toplam indirimini güncelle
      prisma.hasta.update({
        where: { id: hastaId },
        data: {
          toplamIndirim: tedavi.indirimli === null ? null : {
            decrement: tedavi.fiyat - tedavi.indirimli
          }
        },
      }),
    ]);

    return NextResponse.json({ data: { tedavi: deletedTedavi, hasta } });
  } catch (error) {
    console.error('Tedavi planı silinirken hata:', error);
    return NextResponse.json(
      { error: 'Tedavi planı silinemedi' },
      { status: 500 }
    );
  }
} 