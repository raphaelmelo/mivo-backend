import { User } from './src/models';
import dotenv from 'dotenv';

dotenv.config();

const email = process.argv[2];
if (!email) {
    console.error('Please provide an email as argument');
    process.exit(1);
}

(async () => {
    try {
        const deleted = await User.destroy({ where: { email } });
        console.log(`Deleted ${deleted} user(s) with email ${email}`);
        process.exit(0);
    } catch (err) {
        console.error('Error deleting user:', err);
        process.exit(1);
    }
})();
