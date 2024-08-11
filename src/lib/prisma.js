import { PrismaClient } from '@prisma/client';

let prisma;

if (!global.prisma) {
  prisma = new PrismaClient({
    log: ['query'],
  });
  global.prisma = prisma;
} else {
  prisma = global.prisma;
}

export default prisma;
