import fs from 'fs';
import path from 'path';

const sourcePath = path.join(__dirname, '../bd_lessons/Trilha-4');
const outputPath = path.join(__dirname, '../bd_lessons/trilha-4.json');

// Types based on Lesson model and seed
interface LessonJSON {
    title: string;
    description: string;
    type: string;
    difficulty: string;
    xpReward: number;
    estimatedMinutes: number;
    isPremium: boolean;
    order: number;
    isPublished: boolean;
    content: any;
}

function parseFile() {
    const content = fs.readFileSync(sourcePath, 'utf-8');
    const lines = content.split('\n');

    const lessons: LessonJSON[] = [];
    let currentJornada = '';
    let currentLesson: Partial<LessonJSON> | null = null;
    let currentBlock: string[] = [];
    let globalOrder = 1;

    // Regex patterns
    const jornadaRegex = /^Jornada (\d+): (.+)/;
    const lessonStartRegex = /^(\d+)\. (Concept Builder|Real World Challenger|Decision Maker|Peer Review|Community Quest)/;

    // Helper to process a block when a new one starts
    const processBlock = (block: string[], jornadaTitle: string) => {
        if (block.length === 0) return;

        const fullText = block.join('\n');
        const firstLine = block[0];
        const match = firstLine.match(lessonStartRegex);

        if (!match) return;

        const lessonNum = match[1];
        const rawType = match[2];

        // Map raw type to enum
        let type = '';
        if (rawType.includes('Concept Builder')) type = 'concept_builder';
        else if (rawType.includes('Real World Challenger')) type = 'real_world_challenge';
        else if (rawType.includes('Decision Maker')) type = 'decision_maker';
        else if (rawType.includes('Peer Review')) type = 'peer_review';
        else if (rawType.includes('Community Quest')) type = 'community_quest';

        // Extract Theme and Context
        // Looking for "Tema: ... Contexto: ..." or separate lines
        let theme = '';
        let context = '';

        // Simple extraction strategy: iterate lines
        let question = '';
        let options: any[] = [];
        let justification = '';

        let mode = 'meta'; // meta, question, options, justification

        for (let i = 1; i < block.length; i++) {
            const line = block[i].trim();
            if (!line) continue;

            if (line.startsWith('Tema:')) {
                const parts = line.split('Contexto:');
                theme = parts[0].replace('Tema:', '').trim();
                if (parts[1]) context = parts[1].trim();
            } else if (line.startsWith('Contexto:')) {
                context = line.replace('Contexto:', '').trim();
            } else if (line.startsWith('Pergunta:')) {
                mode = 'question';
                question = line.replace('Pergunta:', '').trim();
            } else if (line.startsWith('●')) {
                mode = 'options';
                // Parse option
                // ● A) (Correta) Text...
                const optMatch = line.match(/● ([A-Z])\) \((.+?)\) (.+)/);
                if (optMatch) {
                    options.push({
                        id: optMatch[1].toLowerCase(),
                        status: optMatch[2], // Correta, Incorreta, Ideal, Aceitável
                        text: optMatch[3]
                    });
                } else {
                    // Try simpler format if match fails
                    const optMatchSimple = line.match(/● ([A-Z])\) (.+)/);
                    if (optMatchSimple) {
                        options.push({
                            id: optMatchSimple[1].toLowerCase(),
                            status: 'unknown',
                            text: optMatchSimple[2]
                        });
                    }
                }
            } else if (line.match(/^\d+\. \[/)) {
                mode = 'options';
                // Community Quest format: 1. [ ] Text
                const cqMatch = line.match(/^(\d+)\. \[(x| )\] (.+)/);
                if (cqMatch) {
                    options.push({
                        id: cqMatch[1],
                        correct: cqMatch[2] === 'x',
                        text: cqMatch[3],
                        status: cqMatch[2] === 'x' ? 'Correta' : 'Incorreta'
                    });
                }
            } else if (line.startsWith('Justificativa:') || line.startsWith('Justificativa das Corretas:')) {
                mode = 'justification';
                justification = line.replace(/Justificativa.*:/, '').trim();
            } else {
                // Continuation lines
                if (mode === 'question') question += ' ' + line;
                if (mode === 'justification') justification += ' ' + line;
                if (mode === 'meta' && !theme) {
                    // Maybe theme/context is on multiple lines or formatted differently
                    if (line.includes('Tema:')) {
                        const parts = line.split('Contexto:');
                        theme = parts[0].replace('Tema:', '').trim();
                        if (parts[1]) context = parts[1].trim();
                    }
                }
                // Handle multi-line options
                if (mode === 'options' && options.length > 0) {
                    // If it doesn't look like a new option start
                    if (!line.startsWith('●') && !line.match(/^\d+\. \[/)) {
                        options[options.length - 1].text += ' ' + line;
                    }
                }
            }
        }

        // Helper to check correctness
        const isCorrect = (status: string) => {
            const s = status.toLowerCase();
            if (s.includes('incorreta')) return false;
            if (s.includes('correta')) return true;
            if (s.includes('ideal')) return true;
            return false;
        };

        // Construct JSON based on type
        const lesson: LessonJSON = {
            title: theme || `Lesson ${lessonNum}`,
            description: context || `Lesson about ${theme}`,
            type: type,
            difficulty: 'intermediate',
            xpReward: 50,
            estimatedMinutes: 5,
            isPremium: false,
            order: globalOrder++,
            isPublished: true,
            content: {}
        };

        if (type === 'concept_builder') {
            lesson.content = {
                concept: {
                    emoji: '💡',
                    title: theme,
                    explanation: context,
                    example: ''
                },
                questions: [{
                    id: 'q1',
                    question: question,
                    options: options.map(o => ({
                        id: o.id,
                        text: o.text,
                        correct: isCorrect(o.status)
                    })),
                    explanation: justification
                }]
            };
        } else if (type === 'real_world_challenge') {
            lesson.content = {
                context: {
                    role: 'Product Marketing Manager',
                    team: 'Marketing Team',
                    sprint: 'Go-to-Market',
                    currentWork: context
                },
                trigger: {
                    from: 'Stakeholder',
                    message: question,
                    urgency: 'high'
                },
                options: options.map(o => ({
                    id: o.id,
                    text: o.text,
                    risk: o.status.toLowerCase().includes('incorreta') ? 'High risk' : 'Low risk',
                    benefit: o.status.toLowerCase().includes('ideal') ? 'High benefit' : 'Low benefit'
                })),
                expertFeedback: {
                    name: 'Expert',
                    role: 'Senior PMM',
                    feedback: justification
                }
            };
        } else if (type === 'decision_maker') {
            lesson.content = {
                setup: {
                    role: 'PMM',
                    context: context
                },
                rounds: [{
                    name: 'Round 1',
                    number: 1,
                    question: question,
                    options: options.map(o => ({
                        id: o.id,
                        text: o.text,
                        impact: { stakeholders: 0, users: 0, revenue: 0 } // Dummy values
                    }))
                }],
                results: {
                    perfect: justification,
                    good: justification,
                    bad: justification
                }
            };
        } else if (type === 'peer_review') {
            lesson.content = {
                intro: {
                    persona: 'Colleague',
                    role: 'PMM',
                    scenario: context
                },
                analyze: {
                    artifact: {
                        type: 'document',
                        title: theme,
                        sections: [{ title: 'Content', content: question }]
                    }
                },
                problems: options.map(o => ({
                    id: o.id,
                    text: o.text,
                    correct: isCorrect(o.status)
                })),
                expertFeedback: {
                    name: 'Expert',
                    role: 'Senior PMM',
                    feedback: justification
                }
            };
        } else if (type === 'community_quest') {
            lesson.content = {
                intro: {
                    mission: theme,
                    goal: context
                },
                challenge: {
                    day1: {
                        topic: theme,
                        question: question,
                        options: options.map(o => ({
                            id: o.id,
                            text: o.text
                        }))
                    }
                },
                results: {
                    success: justification,
                    feedback: justification
                }
            };
        }

        lessons.push(lesson);
    };

    for (const line of lines) {
        if (line.match(jornadaRegex)) {
            // New Jornada
            const match = line.match(jornadaRegex);
            if (match) currentJornada = match[2];
            // Don't reset globalOrder if we want continuous ordering across jornadas, 
            // but maybe we want to group them? The user said "Trilha-4", so maybe it's one big track.
        } else if (line.match(lessonStartRegex)) {
            // Process previous block
            if (currentBlock.length > 0) {
                processBlock(currentBlock, currentJornada);
            }
            currentBlock = [line];
        } else {
            if (currentBlock.length > 0) {
                currentBlock.push(line);
            }
        }
    }

    // Process last block
    if (currentBlock.length > 0) {
        processBlock(currentBlock, currentJornada);
    }

    console.log(`Parsed ${lessons.length} lessons.`);
    fs.writeFileSync(outputPath, JSON.stringify(lessons, null, 2));
    console.log(`Saved to ${outputPath}`);
}

parseFile();
