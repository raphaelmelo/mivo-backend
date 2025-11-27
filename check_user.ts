import { User } from './src/models';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const email = process.argv[2];
const testPassword = process.argv[3];

if (!email || !testPassword) {
    console.error('Usage: node check_user.js <email> <password>');
    process.exit(1);
}

(async () => {
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('User not found');
            return;
        }
        console.log('Stored hash:', user.password);
        const match = await bcrypt.compare(testPassword, user.password);
        console.log('Password match?', match);
    } catch (err) {
        console.error('Error:', err);
    }
})();
