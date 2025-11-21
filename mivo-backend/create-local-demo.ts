import { User } from './src/models';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function createLocalDemoUser() {
    try {
        const email = 'demo@local.dev';
        const password = 'demo123';
        const name = 'Demo User';

        console.log('🔍 Checking for user:', email);

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if user already exists
        const existing = await User.findOne({ where: { email } });

        if (existing) {
            console.log('🔄 User exists. Updating password...');
            await existing.update({
                password: hashedPassword,
                name: name
            });
            console.log('✅ User updated successfully!');
        } else {
            console.log('➕ User does not exist. Creating...');
            const user = await User.create({
                email,
                password: hashedPassword,
                name,
                xp: 0,
                level: 1,
                streak: 0,
                isPremium: false,
                lessonsCompleted: 0
            });
            console.log('✅ User created successfully!', user.id);
        }

        console.log('\n🔑 Credentials:');
        console.log('Email:', email);
        console.log('Password:', password);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

createLocalDemoUser();
