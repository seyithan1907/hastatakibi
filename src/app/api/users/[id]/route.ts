export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Kullanıcı bilgilerini getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        role: true,
        ad: true,
        soyad: true,
        email: true,
        aktif: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Kullanıcı bilgileri getirme hatası:', error);
    return NextResponse.json(
      { error: 'Kullanıcı bilgileri alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Kullanıcı silme
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const username = cookieStore.get('username')?.value;

    if (username !== 'seyithan1907') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    return NextResponse.json(
      { error: 'Kullanıcı silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Kullanıcı güncelleme
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const username = cookieStore.get('username')?.value;

    if (username !== 'seyithan1907') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);

    // Güncelleme verilerini hazırla
    const updateData: any = {
      username: body.username,
      role: body.role,
      ad: body.ad,
      soyad: body.soyad,
      email: body.email,
    };

    // Eğer şifre değiştirilecekse
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        role: true,
        ad: true,
        soyad: true,
        email: true,
        aktif: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Kullanıcı güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 