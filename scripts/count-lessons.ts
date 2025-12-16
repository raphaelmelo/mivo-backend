import sequelize from '../src/config/database';
import Lesson from '../src/models/Lesson';

async function countLessons() {
    try {
        await sequelize.authenticate();
        const count = await Lesson.count();
        console.log(`Total lessons: ${count}`);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

countLessons();
