import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const dbUrl = process.env.DATABASE_URL || '';
const dbUrlWithParams = dbUrl.includes('?') 
  ? `${dbUrl}&statement_cache_size=0&pool_timeout=0` 
  : `${dbUrl}?statement_cache_size=0&pool_timeout=0`;

const prismaOptions = {
  datasources: {
    db: {
      url: dbUrlWithParams,
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