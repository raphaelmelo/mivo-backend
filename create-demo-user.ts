import { User } from './src/models';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function createDemoUser() {
    try {
        const email = 'd@d.com';
        const password = 'demo';
        const name = 'Demo User';

        // Check if user already exists
        const existing = await User.findOne({ where: { email } });
        if (existing) {
            console.log('✅ User already exists:', { id: existing.id, email: existing.email });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
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

        console.log('✅ Demo user created successfully!');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('User ID:', user.id);

    } catch (error) {
        console.error('❌ Error creating user:', error);
    }
}

createDemoUser();
