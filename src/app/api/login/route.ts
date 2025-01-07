import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre gerekli' },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 401 }
      );
    }

    // Şifreyi kontrol et
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Geçersiz şifre' },
        { status: 401 }
      );
    }

    // Kullanıcı aktif değilse giriş yapmasına izin verme
    if (!user.aktif) {
      return NextResponse.json(
        { error: 'Hesabınız pasif durumda' },
        { status: 403 }
      );
    }

    // Giriş başarılı
    return NextResponse.json({
      id: user.id,
      username: user.username,
      role: user.role,
      ad: user.ad,
      soyad: user.soyad
    });
  } catch (error) {
    console.error('Login hatası:', error);
    return NextResponse.json(
      { error: 'Giriş sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 