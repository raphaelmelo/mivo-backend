import sequelize from '../src/config/database';
import Lesson from '../src/models/Lesson';
import { Op } from 'sequelize';

async function checkDuplicates() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado ao banco');

        // 1. Find duplicates by Title and JourneyId
        console.log('\n🔍 Buscando duplicatas por Título e JourneyId...');
        const duplicatesByTitleAndJourney = await sequelize.query(`
            SELECT title, "journeyId", COUNT(*) 
            FROM lessons 
            GROUP BY title, "journeyId" 
            HAVING COUNT(*) > 1
        `, { type: 'SELECT' });

        if (duplicatesByTitleAndJourney.length > 0) {
            console.log(`⚠️ Encontradas ${duplicatesByTitleAndJourney.length} combinações de Título/JourneyId duplicadas:`);
            console.table(duplicatesByTitleAndJourney);
        } else {
            console.log('✅ Nenhuma duplicata exata (Título + JourneyId) encontrada.');
        }

        // 2. Find lessons with same title across DIFFERENT journeys
        console.log('\n🔍 Buscando lições com mesmo título em jornadas DIFERENTES...');
        const sameTitleDifferentJourney = await sequelize.query(`
            SELECT title, COUNT(DISTINCT "journeyId") as journey_count, array_agg("journeyId") as journey_ids
            FROM lessons 
            GROUP BY title 
            HAVING COUNT(DISTINCT "journeyId") > 1
        `, { type: 'SELECT' });

        if (sameTitleDifferentJourney.length > 0) {
            console.log(`ℹ️ Encontradas ${sameTitleDifferentJourney.length} lições com o mesmo título em múltiplas jornadas:`);
            console.table(sameTitleDifferentJourney);
        } else {
            console.log('✅ Nenhuma lição com título repetido em jornadas diferentes.');
        }

        // 3. Total count
        const totalLessons = await Lesson.count();
        console.log(`\n📊 Total de lições no banco: ${totalLessons}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

checkDuplicates();
