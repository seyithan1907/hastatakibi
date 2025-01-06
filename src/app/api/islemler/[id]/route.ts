import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const id = parseInt(params.id);

    const islem = await prisma.islem.delete({
      where: { id },
    });

    return NextResponse.json({ data: islem });
  } catch (error) {
    console.error('İşlem silme hatası:', error);
    return NextResponse.json(
      { error: 'İşlem silinirken bir hata oluştu.' },
      { status: 500 }
    );
  }
} 