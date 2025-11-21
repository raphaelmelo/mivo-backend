import fs from 'fs';
import path from 'path';

const seedDir = path.join(__dirname, '../lessons-seed');
const types = ['concept-builder', 'real-world-challenge', 'decision-maker', 'peer-review', 'community-quest'];

let totalErrors = 0;
let totalFiles = 0;

console.log('🔍 Starting QA on lesson files...\n');

types.forEach(type => {
    const typeDir = path.join(seedDir, type);
    if (!fs.existsSync(typeDir)) {
        console.log(`⚠️  Directory missing: ${type}`);
        return;
    }

    const files = fs.readdirSync(typeDir).filter(f => f.endsWith('.json'));

    if (files.length > 0) {
        console.log(`Checking ${type} (${files.length} files):`);
    }

    files.forEach(file => {
        totalFiles++;
        const filePath = path.join(typeDir, file);
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const json = JSON.parse(content);

            const errors = [];

            // Basic validation
            if (!json.title) errors.push('Missing title');
            if (!json.type) errors.push('Missing type');
            if (json.type !== type.replace(/-/g, '_')) errors.push(`Type mismatch: expected ${type.replace(/-/g, '_')}, got ${json.type}`);
            if (!json.content) errors.push('Missing content object');

            // Type specific validation
            if (json.type === 'concept_builder') {
                if (!json.content.concept) errors.push('Missing content.concept');
                if (!json.content.questions || !Array.isArray(json.content.questions)) errors.push('Missing content.questions array');
            } else if (json.type === 'real_world_challenge') {
                if (!json.content.context) errors.push('Missing content.context');
                if (!json.content.options || !Array.isArray(json.content.options)) errors.push('Missing content.options array');
            } else if (json.type === 'decision_maker') {
                if (!json.content.rounds || !Array.isArray(json.content.rounds)) errors.push('Missing content.rounds array');
            }

            if (errors.length > 0) {
                console.log(`  ❌ ${file}:`);
                errors.forEach(e => console.log(`     - ${e}`));
                totalErrors++;
            } else {
                console.log(`  ✅ ${file}`);
            }

        } catch (e: any) {
            console.log(`  ❌ ${file}: Invalid JSON syntax`);
            console.log(`     ${e.message}`);
            totalErrors++;
        }
    });
    console.log('');
});

console.log('----------------------------------------');
console.log(`QA Complete.`);
console.log(`Files checked: ${totalFiles}`);
console.log(`Errors found: ${totalErrors}`);

if (totalErrors === 0) {
    console.log('\n✨ All files passed validation!');
    process.exit(0);
} else {
    console.log('\n⚠️  Fix errors before importing.');
    process.exit(1);
}
