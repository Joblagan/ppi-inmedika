const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const res = await prisma.sensusDetail.groupBy({
      by: ['parameterId'],
      _sum: { value: true },
      where: { 
        sensusHarian: { date: { gte: new Date(), lte: new Date() }, deletedAt: null }
      }
    });
    console.log("Success:", res);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
