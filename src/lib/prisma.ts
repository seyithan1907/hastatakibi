import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaOptions = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
};

const prisma = global.prisma || new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export { prisma }; 