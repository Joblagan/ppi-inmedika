const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const parameters = [
    { nama: 'TOTAL PASIEN (HARI RAWAT)', kategori: 'TINDAKAN', isBaseDenominator: true },
    { nama: 'VENTILATOR (VAP)', kategori: 'DEVICE', isBaseDenominator: false },
    { nama: 'VENA SENTRAL (IAD)', kategori: 'DEVICE', isBaseDenominator: false },
    { nama: 'INFUS (PHLEBITIS)', kategori: 'DEVICE', isBaseDenominator: false },
    { nama: 'KATETER URINE (ISK)', kategori: 'DEVICE', isBaseDenominator: false },
    { nama: 'DAWER KATETER', kategori: 'DEVICE', isBaseDenominator: false },
    { nama: 'LUKA OPERASI (IDO)', kategori: 'TINDAKAN', isBaseDenominator: false },
  ];

  for (const p of parameters) {
    await prisma.masterParameter.upsert({
      where: { nama: p.nama },
      update: {},
      create: p,
    });
  }
  
  console.log('Seeding parameters completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
