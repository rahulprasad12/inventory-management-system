const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

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
    console.log('SUCCESS: Admin user created:', admin.username);
    console.log('Username: admin');
    console.log('Password: Admin@Inv2024!');
}

main()
    .catch(e => { console.error('ERROR:', e.message); process.exit(1); })
    .finally(() => prisma.$disconnect());
