import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';

const router = Router();
const uid = (req) => req.user.id;

const monthKey = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return `${String(d.getFullYear())}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const groupByMonth = (transactions) => {
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

// ---------- Categories ----------
const CATEGORIES = [
  'Food', 'Transport', 'Rent', 'Utilities', 'Entertainment', 'Shopping',
  'Healthcare', 'Education', 'Savings', 'Investments', 'Subscriptions', 'Other',
];

router.get('/categories', (req, res) => res.json(CATEGORIES));

// ---------- Transactions ----------
const transactionSchema = z.object({
  amount: z.coerce.number().positive(),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(2),
  note: z.string().max(200).optional(),
  date: z.coerce.date().optional(),
  sourceId: z.string().optional(),
});

router.get('/transactions', async (req, res) => {
  try {
    const items = await prisma.transaction.findMany({
      where: { userId: uid(req) },
      orderBy: { date: 'desc' },
      include: { source: { select: { id: true, name: true } } },
    });
    res.json(items);
  } catch (e) { res.status(500).json({ message: 'Failed to load transactions.' }); }
});

router.post('/transactions', async (req, res, next) => {
  try {
    const { sourceId, ...body } = transactionSchema.parse(req.body);
    const data = { ...body, userId: uid(req) };
    if (sourceId) {
      const source = await prisma.incomeSource.findFirst({ where: { id: sourceId, userId: uid(req) } });
      if (!source) return res.status(400).json({ message: 'Invalid income source.' });
      data.sourceId = source.id;
    }
    const created = await prisma.transaction.create({ data, include: { source: { select: { id: true, name: true } } } });
    res.status(201).json(created);
  } catch (e) { next(e); }
});

router.delete('/transactions/:id', async (req, res, next) => {
  try {
    await prisma.transaction.deleteMany({ where: { id: req.params.id, userId: uid(req) } });
    res.status(204).end();
  } catch (e) { next(e); }
});

// ---------- Income sources ----------
const sourceSchema = z.object({
  name: z.string().min(2),
  amount: z.coerce.number().positive(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'ANNUAL']),
});

router.get('/income-sources', async (req, res, next) => {
  try {
    const items = await prisma.incomeSource.findMany({ where: { userId: uid(req) }, orderBy: { createdAt: 'desc' } });
    res.json(items);
  } catch (e) { next(e); }
});

router.post('/income-sources', async (req, res, next) => {
  try {
    const item = await prisma.incomeSource.create({ data: { ...sourceSchema.parse(req.body), userId: uid(req) } });
    res.status(201).json(item);
  } catch (e) { next(e); }
});

router.delete('/income-sources/:id', async (req, res, next) => {
  try {
    await prisma.incomeSource.deleteMany({ where: { id: req.params.id, userId: uid(req) } });
    res.status(204).end();
  } catch (e) { next(e); }
});

// ---------- Monthly spending report ----------
router.get('/reports/monthly', async (req, res, next) => {
  try {
    const transactions = await prisma.transaction.findMany({ where: { userId: uid(req) } });
    const monthly = groupByMonth(transactions);
    res.json(monthly.map((m) => {
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
    }));
  } catch (e) { next(e); }
});

// ---------- Goals ----------
const goalBase = z.object({
  name: z.string().min(2),
  targetAmount: z.coerce.number().positive(),
  currentAmount: z.coerce.number().min(0).default(0),
  targetDate: z.coerce.date().optional(),
  icon: z.string().max(4).default('🎯'),
});
const goalSchema = goalBase;
const goalUpdateSchema = goalBase.partial();

router.get('/goals', async (req, res, next) => {
  try {
    res.json(await prisma.goal.findMany({ where: { userId: uid(req) }, orderBy: { createdAt: 'desc' } }));
  } catch (e) { next(e); }
});
router.post('/goals', async (req, res, next) => {
  try {
    const created = await prisma.goal.create({ data: { ...goalSchema.parse(req.body), userId: uid(req) } });
    res.status(201).json(created);
  } catch (e) { next(e); }
});
router.patch('/goals/:id', async (req, res, next) => {
  try {
    const data = goalUpdateSchema.parse(req.body);
    const updated = await prisma.goal.updateMany({ where: { id: req.params.id, userId: uid(req) }, data });
    res.json(updated);
  } catch (e) { next(e); }
});
router.delete('/goals/:id', async (req, res, next) => {
  try {
    await prisma.goal.deleteMany({ where: { id: req.params.id, userId: uid(req) } });
    res.status(204).end();
  } catch (e) { next(e); }
});

// ---------- Habits ----------
const habitSchema = z.object({
  name: z.string().min(2),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  reminderTime: z.string().optional(),
});

router.get('/habits', async (req, res, next) => {
  try {
    res.json(await prisma.habit.findMany({
      where: { userId: uid(req) },
      include: { completions: { orderBy: { completedOn: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    }));
  } catch (e) { next(e); }
});
router.post('/habits', async (req, res, next) => {
  try {
    res.status(201).json(await prisma.habit.create({ data: { ...habitSchema.parse(req.body), userId: uid(req) } }));
  } catch (e) { next(e); }
});
router.post('/habits/:id/complete', async (req, res, next) => {
  try {
    const habit = await prisma.habit.findFirst({ where: { id: req.params.id, userId: uid(req) } });
    if (!habit) return res.status(404).json({ message: 'Habit not found.' });
    const completedOn = new Date();
    completedOn.setHours(0, 0, 0, 0);
    await prisma.habitCompletion.upsert({
      where: { habitId_completedOn: { habitId: habit.id, completedOn } },
      create: { habitId: habit.id, completedOn },
      update: {},
    });
    res.json({ message: 'Habit completed!' });
  } catch (e) { next(e); }
});
router.delete('/habits/:id', async (req, res, next) => {
  try {
    await prisma.habit.deleteMany({ where: { id: req.params.id, userId: uid(req) } });
    res.status(204).end();
  } catch (e) { next(e); }
});

// ---------- Assets ----------
const assetSchema = z.object({
  name: z.string().min(2),
  type: z.string().min(2),
  category: z.string().min(2).optional(),
  value: z.coerce.number().positive(),
});

router.get('/assets', async (req, res, next) => {
  try {
    res.json(await prisma.asset.findMany({ where: { userId: uid(req) }, orderBy: { updatedAt: 'desc' } }));
  } catch (e) { next(e); }
});
router.post('/assets', async (req, res, next) => {
  try {
    res.status(201).json(await prisma.asset.create({ data: { ...assetSchema.parse(req.body), userId: uid(req) } }));
  } catch (e) { next(e); }
});
router.delete('/assets/:id', async (req, res, next) => {
  try {
    await prisma.asset.deleteMany({ where: { id: req.params.id, userId: uid(req) } });
    res.status(204).end();
  } catch (e) { next(e); }
});

// ---------- Feedback ----------
const feedbackSchema = z.object({ message: z.string().min(3).max(500) });

router.post('/feedback', async (req, res, next) => {
  try {
    const created = await prisma.feedback.create({ data: { ...feedbackSchema.parse(req.body), userId: uid(req) } });
    res.status(201).json(created);
  } catch (e) { next(e); }
});

// ---------- Dashboard ----------
router.get('/dashboard', async (req, res, next) => {
  try {
    const [transactions, goals, assets, habits] = await Promise.all([
      prisma.transaction.findMany({ where: { userId: uid(req) }, orderBy: { date: 'asc' } }),
      prisma.goal.findMany({ where: { userId: uid(req) } }),
      prisma.asset.findMany({ where: { userId: uid(req) } }),
      prisma.habit.findMany({ where: { userId: uid(req) }, include: { completions: true } }),
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

    res.json({
      income, expenses, savings, assetValue, netWorth,
      savingsRate,
      goals, habits, assets,
      wealthHistory,
      monthly: groupByMonth(transactions).slice(-6),
      recentTransactions: transactions.slice(-5).reverse(),
    });
  } catch (e) { next(e); }
});

export default router;