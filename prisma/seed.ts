import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding...');

  // 1. Cek apakah Super Admin sudah ada
  const existingAdmin = await prisma.user.findUnique({
    where: { username: 'admin' },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        name: 'Kepala IPCN',
        username: 'admin',
        passwordHash,
        role: 'SUPER_ADMIN',
      },
    });
    console.log(`Created SUPER_ADMIN user: ${admin.username} / admin123`);
  } else {
    console.log('SUPER_ADMIN already exists.');
  }

  // 2. Buat beberapa ruangan (Room) dasar
  const rooms = ['ICU', 'Melati', 'Mawar', 'UGD', 'Kamar Operasi (OK)'];
  for (const r of rooms) {
    const existing = await prisma.room.findUnique({ where: { name: r } });
    if (!existing) {
      await prisma.room.create({ data: { name: r } });
      console.log(`Created Room: ${r}`);
    }
  }

  // 3. Buat contoh Perawat
  const icu = await prisma.room.findUnique({ where: { name: 'ICU' } });
  if (icu) {
    const existingPerawat = await prisma.user.findUnique({ where: { username: 'perawat_icu' }});
    if (!existingPerawat) {
      const passwordHash = await bcrypt.hash('perawat123', 10);
      await prisma.user.create({
        data: {
          name: 'Perawat Jaga ICU',
          username: 'perawat_icu',
          passwordHash,
          role: 'USER_RUANGAN',
          roomId: icu.id
        }
      });
      console.log(`Created USER_RUANGAN: perawat_icu / perawat123`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
