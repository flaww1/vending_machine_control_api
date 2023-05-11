import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const data = [
      { name: 'Kinder Bueno', description: 'Chocolate com recheio de avelã', price: '20' },
    ];

    const res = await prisma.produto.createMany({

      data,
      skipDuplicates: true,
    });

    console.log(res);
  } catch (err) {
    console.log(err);
  } finally {
    async () => {
      await prisma.$disconnect();
    };
  }
}
main();
