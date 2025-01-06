import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Tüm üyeleri getir
export async function GET() {
  try {
    const users = await prisma.user.findMany({
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

    return NextResponse.json(users);
  } catch (error) {
    console.error('Kullanıcılar getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Kullanıcılar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Yeni üye ekle
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        username: body.username,
        password: hashedPassword,
        role: body.role,
        ad: body.ad,
        soyad: body.soyad,
        email: body.email,
        aktif: true,
      },
    });

    // Şifreyi response'dan çıkar
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Kullanıcı oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Kullanıcı oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 