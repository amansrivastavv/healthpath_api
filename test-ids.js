const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.provider.findFirst();
  const s = await prisma.specialization.findFirst();
  console.log('---');
  console.log('Valid Provider ID to use: ' + (p ? p.id : 'NONE FOUND'));
  console.log('Valid Specialization ID to use: ' + (s ? s.id : 'NONE FOUND'));
  console.log('---');
  await prisma.$disconnect();
}
main();
