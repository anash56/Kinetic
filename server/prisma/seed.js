import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SEED_USER_EMAIL = 'demo@kinetic.app';
const SEED_USER_PASSWORD = 'demo1234';

const round2 = (n) => Math.round(n * 100) / 100;

// Realistic monthly income/expense pattern for a young professional in India
const months = [];
for (let i = 5; i >= 0; i--) {
  const d = new Date();
  d.setMonth(d.getMonth() - i);
  months.push(d);
}

const generateTransactions = () => {
  const tx = [];
  const today = new Date();

  for (const month of months) {
    const y = month.getFullYear();
    const m = month.getMonth();

    const incomeEntries = [
      { category: 'Salary', amount: 42000, note: 'Monthly salary credit' },
      { category: 'Freelance', amount: 6500, note: 'Design gig payment' },
    ];
    incomeEntries.forEach((item, idx) => {
      const day = idx === 0 ? 1 : 12;
      const date = new Date(y, m, day);
      if (date > today) return;
      tx.push({ type: 'INCOME', ...item, date });
    });

    const expenseEntries = [
      { category: 'Rent', amount: 12000, note: 'Apartment rent' },
      { category: 'Food', amount: 5200, note: 'Groceries & delivery' },
      { category: 'Transport', amount: 2100, note: 'Petrol + metro' },
      { category: 'Utilities', amount: 1450, note: 'Electricity & internet' },
      { category: 'Entertainment', amount: 1800, note: 'OTT + outings' },
      { category: 'Shopping', amount: 2400, note: 'Monthly purchases' },
      { category: 'Healthcare', amount: 900, note: 'Pharmacy' },
      { category: 'Subscriptions', amount: 650, note: 'Spotify, iCloud, gym' },
      { category: 'Savings', amount: 10000, note: 'Auto-transfer to RDs' },
    ];
    expenseEntries.forEach((item) => {
      const day = 2 + Math.floor(Math.random() * 16);
      const date = new Date(y, m, day);
      if (date > today) return;
      tx.push({ type: 'EXPENSE', ...item, date });
    });

    if (m === 0 || m === 6) {
      tx.push({ type: 'EXPENSE', category: 'Education', amount: 8000, note: 'Online course installment' });
    }
  }

  tx.sort((a, b) => a.date - b.date);
  return tx;
};

const generateHabits = () => [
  { name: 'Record today’s expenses', frequency: 'DAILY', reminderTime: '21:00' },
  { name: 'Save ₹100 daily', frequency: 'DAILY', reminderTime: '09:00' },
  { name: 'Track investments weekly', frequency: 'WEEKLY', reminderTime: '18:00' },
  { name: 'Review budget monthly', frequency: 'MONTHLY', reminderTime: '01:00' },
  { name: 'No-spend day', frequency: 'WEEKLY', reminderTime: '08:00' },
];

const generateCompletions = (habit) => {
  const comps = [];
  const today = new Date();
  for (let i = 1; i < 120; i++) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const skip = Math.random() > 0.55;
    if (skip) continue;
    const keys = day.toISOString().split('T')[0].split('-').filter(Boolean);
    const completedOn = new Date(`${keys[0]}-${keys[1]}-${keys[2]}T00:00:00.000Z`);
    comps.push(completedOn);
  }
  return comps;
};

const generateGoals = () => [
  { name: 'Emergency fund', targetAmount: 100000, currentAmount: 62000, icon: '🛡️', targetDate: new Date(new Date().setMonth(new Date().getMonth() + 8)) },
  { name: 'Japan trip 2026', targetAmount: 150000, currentAmount: 41000, icon: '✈️', targetDate: new Date(new Date().setMonth(new Date().getMonth() + 14)) },
  { name: 'New laptop', targetAmount: 95000, currentAmount: 27500, icon: '💻', targetDate: null },
];

const generateAssets = () => [
  { name: 'Nifty 50 Index Fund', type: 'Investment', category: 'Mutual fund', value: 145000 },
  { name: 'Fixed deposit', type: 'Cash', category: 'FD', value: 80000 },
  { name: 'Emergency savings account', type: 'Cash', category: 'Savings', value: 62000 },
  { name: 'Two-wheeler (market value)', type: 'Vehicle', category: 'Vehicle', value: 55000 },
];

const generateIncomeSources = () => [
  { name: 'Employer salary', amount: 42000, frequency: 'MONTHLY' },
  { name: 'Freelance design', amount: 6500, frequency: 'MONTHLY' },
];

const main = async () => {
  console.log('🌱 Seeding Kinetic with realistic demo data…');
  await prisma.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({ where: { email: SEED_USER_EMAIL } });
    let userId;
    if (existing) {
      console.log('→ Demo user already exists. Cleaning their data and reseeding…');
      await Promise.all([
        tx.transaction.deleteMany({ where: { userId: existing.id } }),
        tx.habit.deleteMany({ where: { userId: existing.id } }),
        tx.goal.deleteMany({ where: { userId: existing.id } }),
        tx.asset.deleteMany({ where: { userId: existing.id } }),
        tx.incomeSource.deleteMany({ where: { userId: existing.id } }),
        tx.feedback.deleteMany({ where: { userId: existing.id } }),
      ]);
      userId = existing.id;
    } else {
      const user = await tx.user.create({
        data: {
          name: 'Aarav Sharma',
          email: SEED_USER_EMAIL,
          passwordHash: await bcrypt.hash(SEED_USER_PASSWORD, 12),
          role: 'ADMIN',
        },
      });
      userId = user.id;
    }

    const incomeSources = [];
    for (const src of generateIncomeSources()) {
      incomeSources.push(await tx.incomeSource.create({ data: { ...src, userId } }));
    }

    const transactionsData = generateTransactions();
    for (const t of transactionsData) {
      await tx.transaction.create({ data: { ...t, userId } });
    }

    for (const g of generateGoals()) {
      await tx.goal.create({ data: { ...g, userId } });
    }

    for (const a of generateAssets()) {
      await tx.asset.create({ data: { ...a, userId } });
    }

    for (const h of generateHabits()) {
      const habit = await tx.habit.create({ data: { ...h, userId } });
      for (const completedOn of generateCompletions(habit)) {
        await tx.habitCompletion.create({ data: { habitId: habit.id, completedOn } });
      }
    }

    await tx.feedback.create({
      data: {
        userId,
        message: 'Really liking the habit reminders — they keep me consistent! Would love a dark mode.',
        status: 'OPEN',
      },
    });
    await tx.feedback.create({
      data: {
        userId,
        message: 'Monthly report is super clear. Could you add year-over-year comparison next?',
        status: 'RESOLVED',
      },
    });

    console.log(`✅ Seeded user: ${SEED_USER_EMAIL} / ${SEED_USER_PASSWORD}`);
    console.log(`   Transactions: ${transactionsData.length}`);
    console.log(`   Income sources: ${incomeSources.length}`);
    console.log(`   Goals: ${generateGoals().length} · Assets: ${generateAssets().length} · Habits: ${generateHabits().length}`);
  });
};

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });