import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const templates = [
  {
    title: 'Glow Up 30 Days',
    slug: 'glow-up-30-days',
    category: 'Self Care',
    description: 'Transform your daily routine with healthy habits for a better you',
    durationDays: 30,
    isPremium: false,
    difficulty: 'beginner',
    xpPerHabit: 15,
    coverGradient: 'from-pink-500 to-rose-500',
    version: '1.0.0',
    changelog: 'Initial release',
    items: [
      { title: 'Drink 8 glasses of water', description: 'Stay hydrated throughout the day', order: 1, xp: 15 },
      { title: 'Skincare routine', description: 'Cleanse, tone, and moisturize', order: 2, xp: 15 },
      { title: 'Sleep by 11 PM', description: 'Get quality rest for better skin', order: 3, xp: 15 },
      { title: 'No sugar today', description: 'Avoid added sugars for glowing skin', order: 4, xp: 20 },
      { title: '30 min exercise', description: 'Move your body for better health', order: 5, xp: 20 },
    ],
  },
  {
    title: 'Healthy Starter',
    slug: 'healthy-starter',
    category: 'Health',
    description: 'Build foundational healthy habits for a sustainable lifestyle',
    durationDays: 30,
    isPremium: false,
    difficulty: 'beginner',
    xpPerHabit: 10,
    coverGradient: 'from-green-500 to-emerald-500',
    version: '1.0.0',
    changelog: 'Initial release',
    items: [
      { title: 'Morning stretch', description: '10 minutes of stretching', order: 1, xp: 10 },
      { title: 'Eat breakfast', description: 'Start your day with a nutritious meal', order: 2, xp: 10 },
      { title: 'Take vitamins', description: 'Daily supplement routine', order: 3, xp: 10 },
      { title: 'Walk 5000 steps', description: 'Get moving throughout the day', order: 4, xp: 15 },
      { title: 'Eat vegetables', description: 'Include veggies in every meal', order: 5, xp: 15 },
    ],
  },
  {
    title: 'Focus & Productivity',
    slug: 'focus-productivity',
    category: 'Productivity',
    description: 'Sharpen your focus and boost your daily productivity',
    durationDays: 30,
    isPremium: false,
    difficulty: 'intermediate',
    xpPerHabit: 15,
    coverGradient: 'from-blue-500 to-indigo-500',
    version: '1.0.0',
    changelog: 'Initial release',
    items: [
      { title: 'Plan your day', description: 'Write down top 3 priorities', order: 1, xp: 15 },
      { title: 'Pomodoro session', description: '25 min focused work block', order: 2, xp: 20 },
      { title: 'No social media', description: 'Stay focused on your goals', order: 3, xp: 15 },
      { title: 'Clear inbox', description: 'Process emails to zero', order: 4, xp: 15 },
      { title: 'Review progress', description: 'Reflect on accomplishments', order: 5, xp: 10 },
    ],
  },
  {
    title: 'Muslim Daily Routine',
    slug: 'muslim-daily-routine',
    category: 'Faith',
    description: 'Build a consistent Islamic daily routine',
    durationDays: 30,
    isPremium: false,
    difficulty: 'beginner',
    xpPerHabit: 20,
    coverGradient: 'from-teal-500 to-cyan-500',
    version: '1.0.0',
    changelog: 'Initial release',
    items: [
      { title: 'Fajr prayer on time', description: 'Start your day with Fajr', order: 1, xp: 25 },
      { title: 'Morning adhkar', description: 'Recite morning remembrances', order: 2, xp: 20 },
      { title: 'Read Quran', description: 'At least 1 page daily', order: 3, xp: 25 },
      { title: 'Dhuhr prayer on time', description: 'Midday prayer', order: 4, xp: 20 },
      { title: 'Asr prayer on time', description: 'Afternoon prayer', order: 5, xp: 20 },
      { title: 'Maghrib prayer on time', description: 'Sunset prayer', order: 6, xp: 20 },
      { title: 'Isha prayer on time', description: 'Night prayer', order: 7, xp: 20 },
      { title: 'Evening adhkar', description: 'Recite evening remembrances', order: 8, xp: 20 },
    ],
  },
  {
    title: 'Exam Mode',
    slug: 'exam-mode',
    category: 'Study',
    description: 'Maximize your study efficiency and ace your exams',
    durationDays: 30,
    isPremium: false,
    difficulty: 'intermediate',
    xpPerHabit: 20,
    coverGradient: 'from-purple-500 to-violet-500',
    version: '1.0.0',
    changelog: 'Initial release',
    items: [
      { title: 'Study session 1', description: '2 hours focused study', order: 1, xp: 25 },
      { title: 'Review notes', description: 'Consolidate what you learned', order: 2, xp: 20 },
      { title: 'Practice problems', description: 'Apply your knowledge', order: 3, xp: 25 },
      { title: 'Flashcard review', description: 'Active recall practice', order: 4, xp: 20 },
      { title: 'Teach someone', description: 'Explain a concept to others', order: 5, xp: 25 },
    ],
  },
  {
    title: 'Developer Growth',
    slug: 'developer-growth',
    category: 'Developer Growth',
    description: 'Level up your coding skills consistently',
    durationDays: 30,
    isPremium: false,
    difficulty: 'intermediate',
    xpPerHabit: 15,
    coverGradient: 'from-orange-500 to-amber-500',
    version: '1.0.0',
    changelog: 'Initial release',
    items: [
      { title: 'Code for 1 hour', description: 'Build or work on a project', order: 1, xp: 20 },
      { title: 'Read documentation', description: 'Learn new frameworks or tools', order: 2, xp: 15 },
      { title: 'Solve a coding challenge', description: 'Practice problem-solving', order: 3, xp: 20 },
      { title: 'Review code', description: 'Read and analyze open source', order: 4, xp: 15 },
      { title: 'Write technical content', description: 'Document what you learned', order: 5, xp: 15 },
    ],
  },
  {
    title: 'Financial Discipline',
    slug: 'financial-discipline',
    category: 'Finance',
    description: 'Build smart money habits for financial freedom',
    durationDays: 30,
    isPremium: false,
    difficulty: 'intermediate',
    xpPerHabit: 15,
    coverGradient: 'from-yellow-500 to-gold-500',
    version: '1.0.0',
    changelog: 'Initial release',
    items: [
      { title: 'Track expenses', description: 'Log every expense today', order: 1, xp: 15 },
      { title: 'No impulse buys', description: 'Stick to your budget', order: 2, xp: 20 },
      { title: 'Review goals', description: 'Check financial progress', order: 3, xp: 15 },
      { title: 'Learn about finance', description: 'Read or watch financial content', order: 4, xp: 15 },
      { title: 'Save money', description: 'Put aside some savings', order: 5, xp: 20 },
    ],
  },
  {
    title: 'Calm Mind Starter',
    slug: 'calm-mind-starter',
    category: 'Mental Wellness',
    description: 'Cultivate inner peace and mental clarity',
    durationDays: 30,
    isPremium: false,
    difficulty: 'beginner',
    xpPerHabit: 15,
    coverGradient: 'from-indigo-500 to-purple-500',
    version: '1.0.0',
    changelog: 'Initial release',
    items: [
      { title: 'Morning meditation', description: '10 minutes of mindfulness', order: 1, xp: 20 },
      { title: 'Gratitude journal', description: 'Write 3 things you\'re grateful for', order: 2, xp: 15 },
      { title: 'Deep breathing', description: '5 minutes of deep breathing exercises', order: 3, xp: 15 },
      { title: 'Digital detox', description: '1 hour without screens', order: 4, xp: 15 },
      { title: 'Nature walk', description: 'Spend time in nature', order: 5, xp: 20 },
    ],
  },
]

async function main() {
  console.log('Starting seed...')

  for (const template of templates) {
    const { items, ...templateData } = template

    const created = await prisma.habitTemplate.upsert({
      where: { slug: template.slug },
      update: {
        ...templateData,
        updatedAt: new Date(),
      },
      create: {
        ...templateData,
        items: {
          create: items,
        },
      },
      include: {
        items: true,
      },
    })

    if (created.items.length === 0) {
      for (const item of items) {
        await prisma.habitTemplateItem.upsert({
          where: {
            id: `${created.id}-${item.order}`,
          },
          update: item,
          create: {
            ...item,
            templateId: created.id,
          },
        })
      }
    }

    console.log(`✓ Seeded template: ${template.title}`)
  }

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
