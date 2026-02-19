
import sequelize from '../src/config/database';
import Journey from '../src/models/Journey';
import Lesson from '../src/models/Lesson';

async function verifySeed() {
try {
    await sequelize.authenticate();
    console.log('✅ Connected.');

    const journeys = await Journey.findAll();
    console.log(`\n📚 Total Journeys: ${journeys.length}`);
    journeys.forEach(j => console.log(`   - ID: ${j.id}, Name: ${j.name}`));

    if (journeys.length !== 1) {
        console.error('❌ Expected exactly 1 journey.');
    } else if (journeys[0].id !== 1) {
        console.error('❌ Expected Journey ID to be 1.');
    } else {
        console.log('✅ Journey count and ID correct.');
    }

    const lessons = await Lesson.findAll({ order: [['order', 'ASC']] });
    console.log(`\n📖 Total Lessons: ${lessons.length}`);
    
    let orderCorrect = true;
    let journeyCorrect = true;

    lessons.forEach((l, index) => {
        if (l.journeyId !== 1) journeyCorrect = false;
        if (l.order !== index + 1) orderCorrect = false;
        // console.log(`   - Order: ${l.order}, Journey: ${l.journeyId}, Title: ${l.title}`);
    });

    if (journeyCorrect) {
        console.log('✅ All lessons belong to Journey ID 1.');
    } else {
        console.error('❌ Some lessons have incorrect Journey ID.');
    }

    if (orderCorrect) {
        console.log('✅ All lessons have sequential order.');
    } else {
        console.error('❌ Lesson order is not sequential.');
    }

    process.exit(0);
} catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
}
}

verifySeed();
