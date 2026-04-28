import 'dotenv/config';
import { Role } from '@attendance-tracker/shared-types';
import { hashPassword } from './utils/password.util.js';
import prisma from './lib/prisma.js';

async function seed() {
  console.info('Seeding database...');

  const superAdminEmail = process.env['SUPER_ADMIN_EMAIL'] ?? 'superadmin@attendance.app';
  const superAdminPassword = process.env['SUPER_ADMIN_PASSWORD'] ?? 'SuperAdmin@123';

  const existing = await prisma.user.findUnique({ where: { email: superAdminEmail } });

  if (existing) {
    console.info(`Super admin already exists: ${superAdminEmail}`);
  } else {
    const hashed = await hashPassword(superAdminPassword);
    await prisma.user.create({
      data: {
        email: superAdminEmail,
        password: hashed,
        name: 'Super Admin',
        role: Role.SUPER_ADMIN,
      },
    });
    console.info(`Super admin created: ${superAdminEmail}`);
  }

  console.info('Seeding complete.');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
