import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (prisma) => {
    const randomNumber = faker.number.int({ min: 1, max: 10 });

    await Promise.all(
      Array.from({ length: randomNumber }).map(async () => {
        await prisma.users.create({
          data: {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            phone_number: faker.phone.number(),
            address: faker.location.streetAddress(),
          },
        });
      }),
    );
  });
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
