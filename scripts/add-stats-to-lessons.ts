import fs from 'fs';
import path from 'path';

const jsonPath = path.join(__dirname, '../bd_lessons/nova-jornada-part1.json');
const lessonsData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// Stats distribution templates based on option quality
const statsTemplates = {
    // When option A is ideal (high risk/benefit gap)
    idealA: { a: 52, b: 28, c: 12, d: 8 },
    // When options A and B are both good
    balanced: { a: 42, b: 38, c: 12, d: 8 },
    // When there's a clear progression
    progressive: { a: 48, b: 30, c: 15, d: 7 },
};

function getStatsForLesson(lesson: any) {
    const options = lesson.content.options;
    if (!options || options.length !== 4) return statsTemplates.idealA;

    // Check if option A is marked as ideal in feedback
    const feedback = lesson.content.expertFeedback?.feedback || '';
    if (feedback.includes('Opção A é a ideal') || feedback.includes('Ideal:')) {
        return statsTemplates.idealA;
    } else if (feedback.includes('ambas') || feedback.includes('A e B')) {
        return statsTemplates.balanced;
    }

    return statsTemplates.progressive;
}

let modifiedCount = 0;

for (const lesson of lessonsData) {
    if (lesson.type === 'real_world_challenge' && !lesson.content.stats) {
        lesson.content.stats = getStatsForLesson(lesson);
        modifiedCount++;
        console.log(`✅ Added stats to: ${lesson.title}`);
    }
}

fs.writeFileSync(jsonPath, JSON.stringify(lessonsData, null, 4), 'utf-8');
console.log(`\n🎉 Modified ${modifiedCount} lessons`);
