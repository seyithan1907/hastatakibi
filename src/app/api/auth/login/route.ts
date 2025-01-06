export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Gelen giriş bilgileri:', {
      username: body.username,
      password: '***'
    });

    const user = await prisma.user.findUnique({
      where: { username: body.username },
    });

    console.log('Bulunan kullanıcı:', user ? {
      ...user,
      password: '***'
    } : null);

    if (!user) {
      console.log('Kullanıcı bulunamadı');
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı adı veya şifre' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    console.log('Şifre kontrolü:', { isPasswordValid });

    if (!isPasswordValid) {
      console.log('Şifre geçersiz');
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı adı veya şifre' },
        { status: 401 }
      );
    }

    if (!user.aktif) {
      console.log('Kullanıcı aktif değil');
      return NextResponse.json(
        { error: 'Hesabınız devre dışı bırakılmış' },
        { status: 401 }
      );
    }

    // Cookie'leri ayarla
    const cookieStore = await cookies();
    await cookieStore.set({
      name: 'auth',
      value: user.role,
      httpOnly: false
    });
    await cookieStore.set({
      name: 'userId',
      value: user.id.toString(),
      httpOnly: false
    });
    await cookieStore.set({
      name: 'username',
      value: user.username,
      httpOnly: false
    });

    // Kullanıcı bilgilerini döndür (şifre hariç)
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Giriş hatası:', error);
    return NextResponse.json(
      { error: 'Giriş sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 