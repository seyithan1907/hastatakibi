import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  const password = 'hsy190778';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const admin = await prisma.user.create({
      data: {
        username: 'seyithan1907',
        password: hashedPassword,
        role: 'admin',
        ad: 'Hüseyin Seyithan',
        soyad: 'Yaşar',
        email: 'seyithan1996@gmail.com',
        aktif: true
      }
    });

    console.log('Admin kullanıcısı oluşturuldu:', admin);
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin(); 