import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'],
    errorFormat: 'minimal',
  });
} else {
  // @ts-ignore
  if (!global.prisma) {
    // @ts-ignore
    global.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
      errorFormat: 'pretty',
    });
  }
  // @ts-ignore
  prisma = global.prisma;
}

export { prisma }; 