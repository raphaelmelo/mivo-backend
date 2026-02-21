import { User, Post, Comment, sequelize } from './src/models';
import bcrypt from 'bcryptjs';

async function seedPosts() {
    try {
        console.log('🔄 Conectando ao banco de dados...');
        await sequelize.authenticate();

        // 1. Encontrar ou criar o usuário admin/oficial
        const adminEmail = 'mivo.oficial@mivo.com.br';
        let admin = await User.findOne({ where: { email: adminEmail } });

        if (!admin) {
            console.log('👥 Criando usuário oficial Mivo...');
            const adminPassword = process.env.ADMIN_SEED_PASSWORD;
            if (!adminPassword) {
                console.error('❌ Erro: ADMIN_SEED_PASSWORD não definida no ambiente.');
                process.exit(1);
            }
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            admin = await User.create({
                email: adminEmail,
                password: hashedPassword,
                name: 'Mivo Oficial 🚀',
                xp: 10000,
                level: 10,
                streak: 365,
                isPremium: true,
                lessonsCompleted: 100,
                goal: 'aprender',
                currentLevel: 'senior'
            });
        }

        // 2. Criar posts iniciais
        console.log('📝 Criando posts iniciais...');

        const postsData = [
            {
                title: '📜 Regras da Comunidade Mivo: Onde o Respeito Encontra o Crescimento',
                content: 'Para mantermos um ambiente produtivo e acolhedor, aqui vão nossas diretrizes básicas:\n\n1. **Troca Generosa:** Ajude quando puder, pergunte sem medo.\n2. **Sem Spam:** Foco em conteúdo relevante de Produto e Carreira.\n3. **Debate, não Ataque:** Critique ideias, nunca pessoas.\n4. **Confidencialidade:** Respeite o que é compartilhado aqui.\n\nEste é o nosso porto seguro para errar, aprender e evoluir. Alguma dúvida sobre o que pode ou não?',
                userId: admin.id,
                isPinned: true,
                tags: ['Regras', 'Cultura', 'Comunidade'],
                votes: 50,
                views: 200
            },
            {
                title: '🚀 Qual foi a sua "Pequena Vitória" de hoje? Compartilhe aqui!',
                content: 'Em Produto, as grandes entregas demoram, mas as pequenas vitórias acontecem todo dia. \n\nConseguiu alinhar aquele stakeholder difícil? Escreveu um PRD matador? Aprendeu uma métrica nova? \n\n**Comente abaixo sua vitória de hoje!** Vamos celebrar os micropassos que nos tornam grandes PMs.',
                userId: admin.id,
                tags: ['Engajamento', 'Crescimento', 'Mindset'],
                votes: 85,
                views: 310
            },
            {
                title: '💡 O seu conhecimento é o seu maior ativo (e merece ser visto!)',
                content: 'Muitos PMs talentosos guardam o que sabem para si por síndrome do impostor. Aqui no Mivo, acreditamos que **ensinar é o novo aprender**.\n\nQuando você compartilha um discovery que deu certo ou uma lição que aprendeu no erro, você não só ajuda a comunidade, mas consolida sua autoridade no mercado.\n\n**Desafio:** Compartilhe um link de um artigo que você escreveu ou uma reflexão sobre seu último projeto. Vamos dar visibilidade ao seu talento!',
                userId: admin.id,
                tags: ['Empoderamento', 'Compartilhamento', 'Carreira'],
                votes: 120,
                views: 450
            }
        ];

        for (const postData of postsData) {
            const existingPost = await Post.findOne({ where: { title: postData.title } });
            if (!existingPost) {
                const post = await Post.create(postData);
                console.log(`✅ Post criado: ${post.title}`);

                // Adicionar alguns comentários fake
                if (post.title.includes('Bem-vindo')) {
                    await Comment.create({
                        content: 'Fala galera! Sou o Raphael, de SP. Atuando como PM Jr e amando os conteúdos aqui!',
                        userId: admin.id, // Em prod isso seria outros usuários, mas para seed inicial usamos o mesmo ou criamos mais
                        postId: post.id,
                        votes: 5
                    });
                }
            } else {
                console.log(`ℹ️ Post já existe: ${postData.title}`);
            }
        }

        console.log('\n🎉 Seed de posts concluído com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro no seed de posts:', error);
        process.exit(1);
    }
}

seedPosts();
