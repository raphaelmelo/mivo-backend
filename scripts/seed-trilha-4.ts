import sequelize from '../src/config/database';
import Lesson from '../src/models/Lesson';
import fs from 'fs';
import path from 'path';

const lessonsPath = path.join(__dirname, '../bd_lessons/trilha-4.json');
const lessonsData = JSON.parse(fs.readFileSync(lessonsPath, 'utf-8')).slice(5);

async function seedTrilha4() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado ao banco');

        // Não limpar lições existentes, apenas adicionar as novas
        // await Lesson.destroy({ where: {}, force: true });

        let createdCount = 0;

        for (const lesson of lessonsData) {
            // Check if exists just in case to avoid unique constraint errors if any
            const exists = await Lesson.findOne({ where: { title: lesson.title } });
            if (!exists) {
                await Lesson.create(lesson);
                createdCount++;
            }
        }

        console.log(`✅ ${createdCount} lições da Trilha 4 inseridas`);

        // Verificar
        const count = await Lesson.count();
        console.log(`📊 Total de lições no banco: ${count}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

seedTrilha4();
