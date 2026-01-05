
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    try {
        const email = 'test_verify@example.com';

        // Cleanup first
        await prisma.user.deleteMany({ where: { email } });

        console.log(`Creating user: ${email}`);
        const hash = await bcrypt.hash('password123', 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hash,
                name: 'Test Verify',
                // picture is optional/null
            }
        });
        console.log('User created:', user);

        // Verify fetching
        const fetched = await prisma.user.findUnique({ where: { email } });
        console.log('User fetched back:', fetched);

    } catch (e) {
        console.error('ERROR:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
