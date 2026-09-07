import { prisma } from '../prisma.js';

export const categories = [
  'Food', 'Transport', 'Rent', 'Utilities', 'Entertainment', 'Shopping',
  'Healthcare', 'Education', 'Savings', 'Investments', 'Subscriptions', 'Other',
];

const monthKey = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return `${String(d.getFullYear())}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const groupByMonth = (transactions) => {
  const map = new Map();
  for (const t of transactions) {
    const key = monthKey(t.date);
    const entry = map.get(key) || { income: 0, expenses: 0, count: 0, net: 0 };
    if (t.type === 'INCOME') entry.income += Number(t.amount);
    else entry.expenses += Number(t.amount);
    entry.net += t.type === 'INCOME' ? Number(t.amount) : -Number(t.amount);
    entry.count += 1;
    map.set(key, entry);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, v]) => ({ month, ...v }));
};

const sum = (items) => items.reduce((acc, item) => acc + Number(item), 0);

export const listTransactions = (userId) => prisma.transaction.findMany({
  where: { userId },
  orderBy: { date: 'desc' },
  include: { source: { select: { id: true, name: true } } },
});

export const createTransaction = async (userId, data, sourceId) => {
  const transaction = { ...data, userId };
  if (sourceId) {
    const source = await prisma.incomeSource.findFirst({ where: { id: sourceId, userId } });
    if (!source) return null;
    transaction.sourceId = source.id;
  }
  return prisma.transaction.create({
    data: transaction,
    include: { source: { select: { id: true, name: true } } },
  });
};

export const deleteTransaction = (userId, id) => prisma.transaction.deleteMany({ where: { id, userId } });

export const listIncomeSources = (userId) => prisma.incomeSource.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });

export const createIncomeSource = (userId, data) => prisma.incomeSource.create({ data: { ...data, userId } });

export const deleteIncomeSource = (userId, id) => prisma.incomeSource.deleteMany({ where: { id, userId } });

export const monthlyReport = async (userId) => {
  const transactions = await prisma.transaction.findMany({ where: { userId } });
  const monthly = groupByMonth(transactions);
  return monthly.map((m) => {
    const byCategory = {};
    const monthItems = transactions.filter((t) => monthKey(t.date) === m.month);
    for (const t of monthItems) {
      if (t.type === 'EXPENSE') byCategory[t.category] = (byCategory[t.category] || 0) + Number(t.amount);
    }
    return {
      ...m,
      topCategory: Object.entries(byCategory).sort(([, a], [, b]) => b - a)[0]?.[0] || null,
      categories: Object.entries(byCategory).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount),
    };
  });
};

export const listGoals = (userId) => prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
export const createGoal = (userId, data) => prisma.goal.create({ data: { ...data, userId } });
export const updateGoal = (userId, id, data) => prisma.goal.updateMany({ where: { id, userId }, data });
export const deleteGoal = (userId, id) => prisma.goal.deleteMany({ where: { id, userId } });

export const listHabits = (userId) => prisma.habit.findMany({
  where: { userId },
  include: { completions: { orderBy: { completedOn: 'desc' } } },
  orderBy: { createdAt: 'desc' },
});
export const createHabit = (userId, data) => prisma.habit.create({ data: { ...data, userId } });
export const findHabit = (userId, id) => prisma.habit.findFirst({ where: { id, userId } });
const periodBounds = (frequency, completedOn) => {
  const start = new Date(completedOn);
  const end = new Date(completedOn);
  if (frequency === 'WEEKLY') {
    const daysFromMonday = (start.getUTCDay() + 6) % 7;
    start.setUTCDate(start.getUTCDate() - daysFromMonday);
    end.setUTCDate(start.getUTCDate() + 6);
  } else if (frequency === 'MONTHLY') {
    start.setUTCDate(1);
    end.setUTCMonth(end.getUTCMonth() + 1, 0);
  }
  start.setUTCHours(0, 0, 0, 0);
  end.setUTCHours(23, 59, 59, 999);
  return { gte: start, lte: end };
};

export const hasHabitCompletionInPeriod = (habitId, frequency, completedOn) => prisma.habitCompletion.findFirst({
  where: { habitId, completedOn: periodBounds(frequency, completedOn) },
});
export const completeHabit = (habitId, completedOn) => prisma.habitCompletion.upsert({
  where: { habitId_completedOn: { habitId, completedOn } },
  create: { habitId, completedOn },
  update: {},
});
export const deleteHabit = (userId, id) => prisma.habit.deleteMany({ where: { id, userId } });

export const listAssets = (userId) => prisma.asset.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } });
export const createAsset = (userId, data) => prisma.asset.create({ data: { ...data, userId } });
export const deleteAsset = (userId, id) => prisma.asset.deleteMany({ where: { id, userId } });

export const createFeedback = (userId, data) => prisma.feedback.create({ data: { ...data, userId } });

export const dashboard = async (userId) => {
  const [transactions, goals, assets, habits] = await Promise.all([
    prisma.transaction.findMany({ where: { userId }, orderBy: { date: 'asc' } }),
    prisma.goal.findMany({ where: { userId } }),
    prisma.asset.findMany({ where: { userId } }),
    prisma.habit.findMany({ where: { userId }, include: { completions: true } }),
  ]);

  const income = sum(transactions.filter((t) => t.type === 'INCOME').map((t) => t.amount));
  const expenses = sum(transactions.filter((t) => t.type === 'EXPENSE').map((t) => t.amount));
  const assetValue = sum(assets.map((t) => t.value));
  const savings = income - expenses;
  const netWorth = savings + assetValue;
  let balance = 0;
  const wealthHistory = transactions.map((t) => {
    balance += t.type === 'INCOME' ? Number(t.amount) : -Number(t.amount);
    return { date: t.date, value: Number(balance.toFixed(2)) };
  });
  const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;

  return {
    income, expenses, savings, assetValue, netWorth,
    savingsRate,
    goals, habits, assets,
    wealthHistory,
    monthly: groupByMonth(transactions).slice(-6),
    recentTransactions: transactions.slice(-5).reverse(),
  };
};