import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const existingSuperAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'admin@healthpath.com' },
        { role: UserRole.SUPER_ADMIN },
      ],
    },
  });

  if (existingSuperAdmin) {
    console.log('Default Super Admin already exists.');
    return;
  }

  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  await prisma.user.create({
    data: {
      fullName: 'Super Admin',
      email: 'admin@healthpath.com',
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
    },
  });

  console.log('Default Super Admin created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
