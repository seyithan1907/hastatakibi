export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Gelen istek:', {
      username: body.username,
      passwordLength: body.password?.length
    });

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { username: body.username },
    });

    console.log('Veritabanı sorgusu sonucu:', user ? {
      id: user.id,
      username: user.username,
      role: user.role,
      aktif: user.aktif,
      passwordLength: user.password?.length
    } : 'Kullanıcı bulunamadı');

    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı adı veya şifre' },
        { status: 401 }
      );
    }

    // Şifre kontrolü
    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    console.log('Şifre kontrolü sonucu:', { isPasswordValid });

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı adı veya şifre' },
        { status: 401 }
      );
    }

    if (!user.aktif) {
      return NextResponse.json(
        { error: 'Hesabınız devre dışı bırakılmış' },
        { status: 401 }
      );
    }

    // Cookie'leri ayarla
    const cookieStore = cookies();
    cookieStore.set('auth', user.role);
    cookieStore.set('userId', user.id.toString());
    cookieStore.set('username', user.username);

    // Kullanıcı bilgilerini döndür (şifre hariç)
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error: any) {
    console.error('API Hatası:', {
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { error: 'Giriş sırasında bir hata oluştu: ' + error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 