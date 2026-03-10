import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_PASSWORD = 'Admin@Inv2024!';

async function main() {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: { password: hashedPassword },
        create: {
            username: 'admin',
            password: hashedPassword,
            role: 'admin',
        },
    });

    console.log('✅ Admin user created/updated:', admin.username);
    console.log('📋 Credentials:');
    console.log('   Username: admin');
    console.log(`   Password: ${ADMIN_PASSWORD}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
