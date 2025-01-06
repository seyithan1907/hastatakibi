const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const password = 'hsy190778';
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      username: 'seyithan1907',
      password: hashedPassword,
      role: 'admin',
      ad: 'Seyithan',
      soyad: 'Yalçın',
      email: 'seyithan@example.com',
      aktif: true
    }
  });

  console.log('Admin kullanıcısı oluşturuldu:', {
    ...admin,
    password: '***'
  });
}

main()
  .catch(e => {
    console.error('Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 