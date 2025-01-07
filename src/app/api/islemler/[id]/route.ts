import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    const islem = await prisma.islem.update({
      where: { id },
      data: {
        ...(body.fiyat !== undefined && { fiyat: body.fiyat }),
        ...(body.aktif !== undefined && { aktif: body.aktif }),
        ...(body.aciklama !== undefined && { aciklama: body.aciklama }),
      },
    });

    return NextResponse.json(islem);
  } catch (error) {
    console.error('İşlem güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'İşlem güncellenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const islemId = parseInt(params.id);
    if (isNaN(islemId)) {
      return NextResponse.json(
        { error: 'Geçersiz işlem ID' },
        { status: 400 }
      );
    }

    // İşlemi bul
    const islem = await prisma.islem.findUnique({
      where: { id: islemId },
      include: { doktor: true }
    });

    if (!islem) {
      return NextResponse.json(
        { error: 'İşlem bulunamadı' },
        { status: 404 }
      );
    }

    // Sadece işlemi oluşturan doktor veya seyithan1907 silebilir
    if (username !== 'seyithan1907' && islem.doktorId !== parseInt(userId)) {
      return NextResponse.json(
        { error: 'Bu işlemi silme yetkiniz yok' },
        { status: 403 }
      );
    }

    // İşlemi sil
    await prisma.islem.delete({
      where: { id: islemId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('İşlem silinirken hata:', error);
    return NextResponse.json(
      { error: 'İşlem silinemedi' },
      { status: 500 }
    );
  }
} 