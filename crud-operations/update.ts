import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const product = { name: 'Kinder Bueno', description: 'Chocolate com recheio de avelã', price: 20 };

    const res = await prisma.product.update({
      where: {
        id: 1,
      },
      data: {
        name: 'Ferrero Rocher',

      },
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
