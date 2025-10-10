// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpar banco (cuidado: apaga tudo!)
  await prisma.flashcardReview.deleteMany();
  await prisma.flashcard.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.note.deleteMany();
  await prisma.taskConcept.deleteMany();
  await prisma.task.deleteMany();
  await prisma.concept.deleteMany();
  await prisma.studyGoal.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.techStack.deleteMany();
  await prisma.userProfile.deleteMany();

  console.log('🗑️  Banco limpo');

  // ============================================
  // 1. CRIAR PERFIL DO USUÁRIO
  // ============================================
  const profile = await prisma.userProfile.create({
    data: {
      name: 'Matheus',
      email: 'matheus@example.com',
      yearsOfExperience: 3,
      currentRole: 'Pleno',
      professionalGoal: 'Me tornar Tech Lead e dominar arquitetura de software moderna',
      workHoursStart: '09:00',
      workHoursEnd: '18:00',
      pomodoroMinutes: 25,
      breakMinutes: 5,
    }
  });

  console.log('✅ Perfil criado:', profile.name);

  // ============================================
  // 2. CRIAR TECH STACK
  // ============================================
  const techStack = await prisma.techStack.createMany({
    data: [
      { 
        technology: 'React', 
        category: 'frontend', 
        proficiencyLevel: 'advanced',
        userProfileId: profile.id 
      },
      { 
        technology: 'Next.js', 
        category: 'frontend', 
        proficiencyLevel: 'intermediate',
        userProfileId: profile.id 
      },
      { 
        technology: 'TypeScript', 
        category: 'frontend', 
        proficiencyLevel: 'advanced',
        userProfileId: profile.id 
      },
      { 
        technology: 'Node.js', 
        category: 'backend', 
        proficiencyLevel: 'intermediate',
        userProfileId: profile.id 
      },
      { 
        technology: 'PostgreSQL', 
        category: 'database', 
        proficiencyLevel: 'intermediate',
        userProfileId: profile.id 
      },
      { 
        technology: 'Rust', 
        category: 'backend', 
        proficiencyLevel: 'learning',
        userProfileId: profile.id 
      },
      { 
        technology: 'Docker', 
        category: 'devops', 
        proficiencyLevel: 'intermediate',
        userProfileId: profile.id 
      },
    ]
  });

  console.log('✅ Tech Stack criada:', techStack.count, 'tecnologias');

  // ============================================
  // 3. CRIAR TAGS
  // ============================================
  const tags = await prisma.tag.createMany({
    data: [
      { name: 'urgente', color: '#EF4444' },
      { name: 'bug', color: '#DC2626' },
      { name: 'feature', color: '#3B82F6' },
      { name: 'estudo', color: '#8B5CF6' },
      { name: 'performance', color: '#F59E0B' },
      { name: 'arquitetura', color: '#10B981' },
      { name: 'react', color: '#06B6D4' },
      { name: 'backend', color: '#6366F1' },
    ]
  });

  console.log('✅ Tags criadas:', tags.count);

  // ============================================
  // 4. CRIAR METAS DE ESTUDO
  // ============================================
  const goalNextjs = await prisma.studyGoal.create({
    data: {
      title: 'Dominar Next.js App Router',
      description: 'Entender profundamente SSR, SSG, ISR e Server Components',
      targetDate: new Date('2025-06-30'),
      status: 'active',
      userProfileId: profile.id,
    }
  });

  const goalRust = await prisma.studyGoal.create({
    data: {
      title: 'Aprender Rust para Backend',
      description: 'Construir APIs performáticas com Rust e Actix',
      targetDate: new Date('2025-12-31'),
      status: 'active',
      userProfileId: profile.id,
    }
  });

  console.log('✅ Metas de estudo criadas');

  // ============================================
  // 5. CRIAR CONCEITOS
  // ============================================
  const conceptSSR = await prisma.concept.create({
    data: {
      name: 'Server-Side Rendering',
      description: 'Renderização de páginas no servidor para melhor SEO e performance inicial',
      category: 'react',
      studyGoalId: goalNextjs.id,
    }
  });

  const conceptHooks = await prisma.concept.create({
    data: {
      name: 'React Hooks Avançados',
      description: 'useCallback, useMemo, useReducer e custom hooks',
      category: 'react',
      studyGoalId: goalNextjs.id,
    }
  });

  const conceptOwnership = await prisma.concept.create({
    data: {
      name: 'Ownership em Rust',
      description: 'Sistema de gerenciamento de memória do Rust',
      category: 'rust',
      studyGoalId: goalRust.id,
    }
  });

  const conceptJWT = await prisma.concept.create({
    data: {
      name: 'JWT Authentication',
      description: 'Autenticação stateless com JSON Web Tokens',
      category: 'backend',
    }
  });

  console.log('✅ Conceitos criados');

  // ============================================
  // 6. CRIAR RESOURCES
  // ============================================
  await prisma.resource.createMany({
    data: [
      {
        url: 'https://nextjs.org/docs/app/building-your-application/rendering/server-components',
        title: 'Next.js Server Components',
        type: 'documentation',
        conceptId: conceptSSR.id,
      },
      {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'SSR Explained',
        type: 'video',
        conceptId: conceptSSR.id,
      },
      {
        url: 'https://react.dev/reference/react',
        title: 'React Hooks Reference',
        type: 'documentation',
        conceptId: conceptHooks.id,
      },
      {
        url: 'https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html',
        title: 'Understanding Ownership',
        type: 'documentation',
        conceptId: conceptOwnership.id,
      },
    ]
  });

  console.log('✅ Resources criados');

  // ============================================
  // 7. CRIAR TASKS DE TRABALHO
  // ============================================
  const taskBlog = await prisma.task.create({
    data: {
      title: 'Implementar SSR no blog da empresa',
      description: 'Migrar páginas estáticas para SSR para melhorar SEO e tempo de carregamento inicial',
      type: 'work',
      status: 'doing',
      priority: 'high',
      dueDate: new Date('2025-10-20'),
      userProfileId: profile.id,
      studyGoalId: goalNextjs.id,
    }
  });

  const taskAuth = await prisma.task.create({
    data: {
      title: 'Refatorar sistema de autenticação',
      description: 'Implementar JWT e refresh tokens',
      type: 'work',
      status: 'todo',
      priority: 'high',
      dueDate: new Date('2025-10-25'),
      userProfileId: profile.id,
    }
  });

  const taskPerformance = await prisma.task.create({
    data: {
      title: 'Otimizar performance do dashboard',
      description: 'Reduzir re-renders desnecessários com useMemo e useCallback',
      type: 'work',
      status: 'todo',
      priority: 'medium',
      userProfileId: profile.id,
    }
  });

  // ============================================
  // 8. CRIAR TASKS DE ESTUDO
  // ============================================
  const taskStudyRust = await prisma.task.create({
    data: {
      title: 'Estudar Ownership em Rust',
      description: 'Fazer exercícios do Rust Book capítulo 4',
      type: 'study',
      status: 'todo',
      priority: 'medium',
      userProfileId: profile.id,
      studyGoalId: goalRust.id,
    }
  });

  const taskStudyHooks = await prisma.task.create({
    data: {
      title: 'Praticar React Hooks avançados',
      description: 'Criar exemplos práticos de useCallback e useMemo',
      type: 'study',
      status: 'done',
      priority: 'low',
      completedAt: new Date(),
      userProfileId: profile.id,
      studyGoalId: goalNextjs.id,
    }
  });

  console.log('✅ Tasks criadas');

  // ============================================
  // 9. RELACIONAR TASKS COM CONCEITOS
  // ============================================
  await prisma.taskConcept.createMany({
    data: [
      { taskId: taskBlog.id, conceptId: conceptSSR.id, relevance: 'high' },
      { taskId: taskAuth.id, conceptId: conceptJWT.id, relevance: 'high' },
      { taskId: taskPerformance.id, conceptId: conceptHooks.id, relevance: 'high' },
      { taskId: taskStudyRust.id, conceptId: conceptOwnership.id, relevance: 'high' },
      { taskId: taskStudyHooks.id, conceptId: conceptHooks.id, relevance: 'high' },
    ]
  });

  console.log('✅ Conceitos vinculados às tasks');

  // ============================================
  // 10. CRIAR FLASHCARDS
  // ============================================
  const flashcard1 = await prisma.flashcard.create({
    data: {
      question: 'O que é Server-Side Rendering (SSR)?',
      answer: 'SSR é uma técnica onde o HTML da página é gerado no servidor a cada requisição, permitindo melhor SEO e tempo de carregamento inicial mais rápido.',
      source: 'manual',
      taskId: taskBlog.id,
      conceptId: conceptSSR.id,
      nextReview: new Date(), // Disponível para revisão imediata
    }
  });

  const flashcard2 = await prisma.flashcard.create({
    data: {
      question: 'Quando usar useCallback vs useMemo?',
      answer: 'useCallback memoriza funções para evitar recriá-las. useMemo memoriza valores computados caros. Use useCallback para callbacks de componentes filhos e useMemo para cálculos pesados.',
      source: 'ai_generated',
      taskId: taskPerformance.id,
      conceptId: conceptHooks.id,
      nextReview: new Date(),
    }
  });

  const flashcard3 = await prisma.flashcard.create({
    data: {
      question: 'O que é Ownership em Rust?',
      answer: 'Ownership é o sistema de gerenciamento de memória do Rust onde cada valor tem um único dono. Quando o dono sai de escopo, o valor é desalocado automaticamente.',
      source: 'manual',
      taskId: taskStudyRust.id,
      conceptId: conceptOwnership.id,
      nextReview: new Date(),
    }
  });

  const flashcard4 = await prisma.flashcard.create({
    data: {
      question: 'O que é JWT e como funciona?',
      answer: 'JWT (JSON Web Token) é um padrão para autenticação stateless. Contém payload codificado em Base64 e assinatura para verificar integridade. Usado para autenticar requisições sem manter sessão no servidor.',
      source: 'manual',
      conceptId: conceptJWT.id,
      nextReview: new Date(),
    }
  });

  console.log('✅ Flashcards criados');

  // ============================================
  // 11. CRIAR HISTÓRICO DE REVISÕES
  // ============================================
  await prisma.flashcardReview.createMany({
    data: [
      { flashcardId: flashcard1.id, quality: 4, timeSpent: 15 },
      { flashcardId: flashcard1.id, quality: 5, timeSpent: 10 },
      { flashcardId: flashcard2.id, quality: 3, timeSpent: 20 },
    ]
  });

  console.log('✅ Histórico de revisões criado');

  // ============================================
  // 12. CRIAR SESSÕES DE ESTUDO
  // ============================================
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  await prisma.studySession.createMany({
    data: [
      // Ontem
      {
        type: 'study',
        duration: 45,
        taskId: taskStudyHooks.id,
        userProfileId: profile.id,
        focusScore: 8,
        notes: 'Bom progresso com hooks',
        createdAt: yesterday,
      },
      {
        type: 'work',
        duration: 90,
        taskId: taskBlog.id,
        userProfileId: profile.id,
        focusScore: 9,
        createdAt: yesterday,
      },
      {
        type: 'review',
        duration: 15,
        userProfileId: profile.id,
        focusScore: 7,
        notes: 'Revisão de flashcards',
        createdAt: yesterday,
      },
      // Hoje
      {
        type: 'work',
        duration: 60,
        taskId: taskBlog.id,
        userProfileId: profile.id,
        focusScore: 8,
        createdAt: today,
      },
    ]
  });

  console.log('✅ Sessões de estudo criadas');

  // ============================================
  // 13. CRIAR NOTAS
  // ============================================
  const tagUrgente = await prisma.tag.findUnique({ where: { name: 'urgente' } });
  const tagBug = await prisma.tag.findUnique({ where: { name: 'bug' } });
  const tagReact = await prisma.tag.findUnique({ where: { name: 'react' } });

  const note1 = await prisma.note.create({
    data: {
      title: 'Problema com hydration no SSR',
      content: 'Encontrei um bug de hydration mismatch ao usar SSR. Solução: garantir que o HTML do servidor seja idêntico ao do cliente.',
      userProfileId: profile.id,
      taskId: taskBlog.id,
    }
  });

  const note2 = await prisma.note.create({
    data: {
      title: 'Insights sobre useCallback',
      content: 'Descobri que useCallback só faz sentido quando passando callback para componente filho memorizado com React.memo.',
      userProfileId: profile.id,
      taskId: taskPerformance.id,
    }
  });

  // Vincular tags às notas
  if (tagUrgente && tagBug && tagReact) {
    await prisma.noteTag.createMany({
      data: [
        { noteId: note1.id, tagId: tagUrgente.id },
        { noteId: note1.id, tagId: tagBug.id },
        { noteId: note1.id, tagId: tagReact.id },
        { noteId: note2.id, tagId: tagReact.id },
      ]
    });
  }

  console.log('✅ Notas criadas');

  // ============================================
  // RESUMO FINAL
  // ============================================
  console.log('\n🎉 Seed concluído com sucesso!\n');
  console.log('📊 Resumo:');
  console.log(`   • 1 perfil de usuário`);
  console.log(`   • 7 tecnologias na stack`);
  console.log(`   • 2 metas de estudo`);
  console.log(`   • 4 conceitos`);
  console.log(`   • 4 resources`);
  console.log(`   • 5 tasks (3 trabalho, 2 estudo)`);
  console.log(`   • 4 flashcards`);
  console.log(`   • 4 sessões de estudo`);
  console.log(`   • 2 notas com tags`);
  console.log(`   • 8 tags disponíveis\n`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });