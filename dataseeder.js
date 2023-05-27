const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seed() {
    try {
        // Step 1: Create dummy users
        const password1 = await bcrypt.hash('password1', 10);
        const password2 = await bcrypt.hash('password2', 10);
        const password3 = await bcrypt.hash('password3', 10);

        const users = await prisma.user.createMany({
            data: [
                {
                    first_name: 'John',
                    last_name: 'Doe',
                    password: password1,
                    email: 'john@example.com',
                    type: 'USER',
                    // Add other user properties
                },
                {
                    first_name: 'Jane',
                    last_name: 'Smith',
                    password: password2,
                    email: 'jane@example.com',
                    type: 'ADMINISTRATOR',
                    // Add other user properties
                },
                {
                    first_name: 'Carlos',
                    last_name: 'Smith',
                    password: password3,
                    email: 'carlos@example.com',
                    type: 'PROVIDER',
                    // Add other user properties
                },
                // Add more users as needed
            ],
            skipDuplicates: true,
        });

        console.log(`Seeded ${users.length} users`);

        // Step 2: Create dummy companies
        const companies = await prisma.company.createMany({
            data: [
                {
                    type: 'SUPPLIER',
                    name: 'Company A',
                    companyEmail: 'companya@example.com',
                    companyPhone: '123456789',
                    street: 'Street A',
                    city: 'City A',
                    country: 'Country A',
                    latitude: 1.234567,
                    longitude: 1.234567,
                    postalCode: '123456',
                    nif: '111111111',
                    // Add other company properties
                },
                {
                    type: 'MAINTENANCE',
                    name: 'Company B',
                    companyEmail: 'companyb@example.com',
                    companyPhone: '987654321',
                    street: 'Street B',
                    city: 'City B',
                    country: 'Country B',
                    latitude: 1.234567,
                    longitude: 1.234567,
                    postalCode: '234563',
                    nif: '222222222',
                    // Add other company properties
                },
                // Add more companies as needed
            ],
            skipDuplicates: true,
        });

        console.log(`Seeded ${companies.length} companies`);

        // Step 3: Create dummy providers
        const providers = await prisma.provider.createMany({
            data: [
                {
                    phone: '987654321',
                    userId: users[0].userId,
                    companyId: companies[0].companyId,
                    // Add other provider properties
                },
                {
                    phone: '123456789',
                    userId: users[1].userId,
                    companyId: companies[1].companyId,
                    // Add other provider properties
                },
                // Add more providers as needed
            ],
            skipDuplicates: true,
        });

        console.log(`Seeded ${providers.length} providers`);

        // Step 4: Create dummy machine models
        const machineModels = await prisma.machineModel.createMany({
            data: [
                {
                    model: 'Model A',
                    shelfQuantity: 12,
                    shelfCapacity: 16,
                },
                {
                    model: 'Model B',
                    shelfQuantity: 10,
                    shelfCapacity: 8,
                },
                // Add more machine models as needed
            ],
            skipDuplicates: true,
        });

        console.log(`Seeded ${machineModels.length} machine models`);

        // Step 5: Create dummy machines
        const machines = await prisma.machine.createMany({
            data: [
                {
                    modelId: machineModels[0].modelId,
                    type: 'COLD_DRINKS',
                    status: 'ACTIVE',
                    energy_mode: 'ECO',
                    location: 'Location A',
                },
                {
                    modelId: machineModels[1].modelId,
                    type: 'HEATED_DRINKS',
                    status: 'INACTIVE',
                    energy_mode: 'NORMAL',
                    location: 'Location B',
                },
                {
                    modelId: machineModels[1].modelId,
                    type: 'SNACKS',
                    status: 'MAINTENANCE',
                    energy_mode: 'MAX',
                    location: 'Location C',
                },
                // Add more machines based on different types
            ],
            skipDuplicates: true,
        });

        console.log(`Seeded ${machines.length} machines`);

        // Step 6: Create dummy shelves
        const shelves = await prisma.shelf.createMany({
            data: [
                {
                    machineId: machines[0].machineId,
                },
                {
                    machineId: machines[1].machineId,
                },
                {
                    machineId: machines[2].machineId,
                },
                // Add more shelves as needed for other machines
            ],
            skipDuplicates: true,
        });

        console.log(`Seeded ${shelves.length} shelves`);

        // Step 7: Create dummy product slots for each shelf
        const productSlots = await prisma.product_Shelf.createMany({
            data: [
                {
                    shelfId: shelves[0].shelfId,
                    productId: 1,
                    quantity_inSlot: 10,
                },
                {
                    shelfId: shelves[0].shelfId,
                    productId: 2,
                    quantity_inSlot: 5,
                },
                {
                    shelfId: shelves[1].shelfId,
                    productId: 3,
                    quantity_inSlot: 8,
                },
                {
                    shelfId: shelves[1].shelfId,
                    productId: 4,
                    quantity_inSlot: 2,
                },
                // Add more product slots as needed for other shelves
            ],
            skipDuplicates: true,
        });

        console.log(`Seeded ${productSlots.length} product slots`);

        // Step 8: Update shelves with product slot information
        const shelvesWithProductSlots = await prisma.shelf.updateMany({
            where: {
                OR: shelves.map((shelf) => ({
                    shelfId: shelf.shelfId,
                })),
            },
            data: {
                Product_Shelf: {
                    connect: productSlots.map((productSlot) => ({
                        product_shelfId: productSlot.product_shelfId,
                    })),
                },
            },
        });

        console.log(`Updated ${shelvesWithProductSlots.count} shelves with product slots`);

        // Step 9: Create dummy products
        const products = await prisma.product.createMany({
            data: [
                {
                    name: 'Cold Drink 1',
                    image_uri: 'https://example.com/cold-drink1.jpg',
                    description: 'Refreshing cold drink',
                    type: 'COLD_DRINK',
                    price: 2.99,
                },
                {
                    name: 'Hot Drink 1',
                    image_uri: 'https://example.com/hot-drink1.jpg',
                    description: 'Delicious hot drink',
                    type: 'HEATED_DRINK',
                    price: 1.99,
                },
                {
                    name: 'Snack 1',
                    image_uri: 'https://example.com/snack1.jpg',
                    description: 'Tasty snack',
                    type: 'SNACK',
                    price: 0.99,
                },
                // Add more products as needed
            ],
            skipDuplicates: true,
        });

        console.log(`Seeded ${products.length} products`);

        // Step 10: Create dummy reservations
        const reservations = await prisma.reservation.createMany({
            data: [
                {
                    status: 'Active',
                    userId: users[0].userId,
                    total_price: 29.99,
                    quantity: 2,
                    productId: products[0].productId,
                    machineId: machines[0].machineId,
                    shelfId: shelves[0].shelfId,
                    reservationCodeStatus: 'Unused',
                    reservationCode: 'ABC123',
                    // Add other reservation properties
                },
                {
                    status: 'Pending',
                    userId: users[1].userId,
                    total_price: 14.99,
                    quantity: 1,
                    productId: products[1].productId,
                    machineId: machines[1].machineId,
                    shelfId: shelves[1].shelfId,
                    reservationCodeStatus: 'Unused',
                    reservationCode: 'XYZ789',
                    // Add other reservation properties
                },
                // Add more reservations as needed
            ],
            skipDuplicates: true,
        });

        console.log(`Seeded ${reservations.length} reservations`);

        // Step 11: Add more seeding logic for other models if needed

        prisma.$disconnect();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

seed();
