import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database with sample products...');

    const products = [
        {
            name: 'Wireless Noise-Canceling Headphones',
            sku: 'AUDIO-HP-001',
            section: 'Electronics',
            price: 12999.00,
            gstPercent: 18,
            discountPercent: 10,
            stockQuantity: 50,
        },
        {
            name: 'Ergonomic Office Chair',
            sku: 'FURN-CHR-002',
            section: 'Furniture',
            price: 8500.00,
            gstPercent: 18,
            discountPercent: 5,
            stockQuantity: 25,
        },
        {
            name: 'Mechanical Gaming Keyboard',
            sku: 'COMP-KB-003',
            section: 'Computers',
            price: 4500.00,
            gstPercent: 18,
            discountPercent: 15,
            stockQuantity: 100,
        },
        {
            name: 'USB-C Fast Charging Cable 2m',
            sku: 'ACC-CBL-004',
            section: 'Accessories',
            price: 499.00,
            gstPercent: 12,
            discountPercent: 0,
            stockQuantity: 200,
        },
        {
            name: 'Smart Home Security Camera',
            sku: 'SMART-CAM-005',
            section: 'Electronics',
            price: 3299.00,
            gstPercent: 18,
            discountPercent: 20,
            stockQuantity: 30,
        }
    ];

    for (const product of products) {
        const p = await prisma.product.upsert({
            where: { sku: product.sku },
            update: {},
            create: product,
        });
        console.log(`Created product with sku: ${p.sku}`);
    }

    console.log('Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
