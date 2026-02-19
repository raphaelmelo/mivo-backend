import sequelize from '../src/config/database';
import Post from '../src/models/Post';
import User from '../src/models/User';

const postsData = [
  {
    title: '👋 Bem-vindo à Comunidade MIVO!',
    content: `Olá PMs! Sejam muito bem-vindos ao nosso espaço oficial de troca e aprendizado.\n\nAqui na Comunidade MIVO, você pode:\n\n🚀 **Tirar dúvidas** sobre as aulas e desafios do dia a dia.\n💡 **Compartilhar experiências**, cases e aprendizados.\n🤝 **Fazer networking** com outros profissionais da área.\n\nEste espaço é de vocês. Aproveitem para conectar e crescer juntos!`,
    tags: ['Comunidade', 'Bem-vindo', 'Networking'],
    isPinned: true
  },
  {
    title: '📜 Regras de Convivência',
    content: `Para garantir um ambiente saudável, produtivo e seguro para todos, pedimos que sigam nossas regras:\n\n1. **Respeito é inegociável:** Trate todos com cordialidade e empatia. Divergências são normais, desrespeito não.\n2. **Conteúdo relevante:** Foque em temas relacionados a Produto, Carreira e Tecnologia. Evite spam ou autopromoção excessiva.\n3. **Feedback construtivo:** Ao criticar ou sugerir melhorias, faça com o intuito de ajudar.\n4. **Proteção de dados:** Não compartilhe informações sensíveis de sua empresa ou de terceiros.\n\nContamos com a colaboração de todos para fazer desta a melhor comunidade de Produto!`,
    tags: ['Regras', 'Importante'],
    isPinned: true
  },
  {
    title: '💬 Qual o seu maior desafio hoje?',
    content: `Queremos conhecer melhor vocês e entender o que tira o sono dos PMs da nossa comunidade.\n\nConta pra gente nos comentários:\n\n**Qual é o maior desafio que você enfrenta hoje na sua carreira ou produto?**\n\n🔹 Gestão de Stakeholders?\n🔹 Definição de estratégia?\n🔹 Discovery contínuo?\n🔹 Priorização?\n🔹 Outro?\n\nVamos trocar experiências e quem sabe você não encontra a solução aqui nos comentários! 👇`,
    tags: ['Discussão', 'Carreira', 'Desafios'],
    isPinned: true
  }
];

async function seedCommunityPosts() {
  try {
    console.log('🌱 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connection established.');

    // Sync to ensure isPinned column exists
    await sequelize.sync({ alter: true });
    console.log('✅ Database schema synced (alter: true).');

    // Find a user to be the author (MIVO Admin or first available)
    let author = await User.findOne({ where: { email: 'admin@mivo.com' } });
    
    if (!author) {
      console.log('⚠️ Admin user not found. Checking for any existing user...');
      author = await User.findOne();
      
      if (!author) {
          console.log('⚠️ No users found. Creating a System Admin user...');
          author = await User.create({
              name: 'Equipe MIVO',
              email: 'admin@mivo.com',
              password: 'admin_placeholder_password', // Should handle this securely in real app
              // Add required fields
              xp: 0,
              level: 99,
              streak: 0,
              lastActiveDate: new Date(),
              isPremium: true,
              lessonsCompleted: 0
          });
      }
    }

    console.log(`👤 Using author: ${author.name} (ID: ${author.id})`);

    // Create Posts
    for (const postData of postsData) {
        // Check if post already exists (by title) to avoid duplicates
        const existing = await Post.findOne({ where: { title: postData.title } });
        
        if (existing) {
            console.log(`⏭️  Post exists: "${postData.title}"`);
            existing.isPinned = true; // Ensure logic remains
            await existing.save();
        } else {
            await Post.create({
                ...postData,
                userId: author.id,
                votes: 10 // Start with some love
            });
            console.log(`✅ Created post: "${postData.title}"`);
        }
    }

    console.log('🎉 Community Seed Completed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedCommunityPosts();
