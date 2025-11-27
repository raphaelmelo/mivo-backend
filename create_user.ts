import { User } from './src/models';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const email = process.argv[2];
const password = process.argv[3] || 'test1234';
const name = process.argv[4] || 'TestUser';

if (!email) {
    console.error('Usage: node create_user.js <email> [password] [name]');
    process.exit(1);
}

(async () => {
    try {
        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({
            email,
            password: hashed,
            name,
            xp: 0,
            level: 1,
            streak: 0,
            isPremium: false,
            lessonsCompleted: 0
        });
        console.log('Created user:', { id: user.id, email: user.email, name: user.name });
    } catch (err) {
        console.error('Error creating user:', err);
    }
})();
