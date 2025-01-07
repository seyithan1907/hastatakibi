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

    // Önce hastanın tüm tedavi planlarını ve hasta bilgisini getir
    const hasta = await prisma.hasta.findUnique({
      where: { id: hastaId },
      include: {
        tedaviPlanlari: true
      }
    });

    if (!hasta || !hasta.tedaviPlanlari) {
      return NextResponse.json(
        { error: 'Hasta veya tedavi planları bulunamadı' },
        { status: 404 }
      );
    }

    // Silinecek tedavi planını bul
    const silinecekTedavi = hasta.tedaviPlanlari.find(t => t.id === tedaviIdInt);
    if (!silinecekTedavi) {
      return NextResponse.json(
        { error: 'Tedavi planı bulunamadı' },
        { status: 404 }
      );
    }

    // Tedavi planına ait toplam ödeme miktarını kontrol et
    if (silinecekTedavi.odenen > 0) {
      return NextResponse.json(
        { error: 'Ödeme yapılmış tedavi planı silinemez. Önce ödemeleri silmelisiniz.' },
        { status: 400 }
      );
    }

    // Toplam tutarları hesapla (silinecek tedavi hariç)
    const kalanTedaviler = hasta.tedaviPlanlari.filter(t => t.id !== tedaviIdInt);
    const toplamFiyat = kalanTedaviler.reduce((acc, t) => acc + t.fiyat, 0);
    
    // İndirim oranını hesapla (mevcut toplam indirimden)
    const mevcutToplamFiyat = hasta.tedaviPlanlari.reduce((acc, t) => acc + t.fiyat, 0);
    const indirimOrani = hasta.toplamIndirim 
      ? (mevcutToplamFiyat - hasta.toplamIndirim) / mevcutToplamFiyat 
      : 1;

    // Yeni indirimli toplam tutarı hesapla
    const yeniIndirimliTutar = toplamFiyat * indirimOrani;

    // Tedavi planını sil ve gerekli güncellemeleri yap
    const [deletedTedavi, updatedHasta] = await prisma.$transaction([
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
          toplamIndirim: yeniIndirimliTutar === toplamFiyat ? null : yeniIndirimliTutar
        },
      })
    ]);

    return NextResponse.json({ 
      data: { 
        tedavi: deletedTedavi, 
        hasta: updatedHasta 
      } 
    });
  } catch (error) {
    console.error('Tedavi planı silinirken hata:', error);
    return NextResponse.json(
      { error: 'Tedavi planı silinemedi' },
      { status: 500 }
    );
  }
} 