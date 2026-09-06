import { Router } from 'express';
import { prisma } from '../prisma.js';

const router = Router();

router.get('/overview', async (req, res) => {
  const [users, transactions, habits, goals, assets, feedback, income] = await Promise.all([
    prisma.user.count(),
    prisma.transaction.count(),
    prisma.habit.count(),
    prisma.goal.count(),
    prisma.asset.count(),
    prisma.feedback.count(),
    prisma.incomeSource.count(),
  ]);
  res.json({ users, transactions, habits, goals, assets, feedback, income });
});

router.get('/users', async (req, res) => {
  res.json(await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true, createdAt: true,
      _count: { select: { transactions: true, habits: true, goals: true } },
    },
    orderBy: { createdAt: 'desc' },
  }));
});

router.get('/analytics', async (req, res) => {
  const [transactions, habits, completions, users] = await Promise.all([
    prisma.transaction.findMany({ select: { type: true, amount: true, category: true, date: true } }),
    prisma.habit.findMany({ select: { id: true, completions: { select: { id: true } } } }),
    prisma.habitCompletion.count(),
    prisma.user.findMany({ select: { createdAt: true } }),
  ]);

  const totalIncome = transactions.filter((t) => t.type === 'INCOME').reduce((a, t) => a + Number(t.amount), 0);
  const totalExpenses = transactions.filter((t) => t.type === 'EXPENSE').reduce((a, t) => a + Number(t.amount), 0);
  const totalAssets = await prisma.asset.aggregate({ _sum: { value: true } });

  const categoryMap = {};
  for (const t of transactions) {
    if (t.type === 'EXPENSE') categoryMap[t.category] = (categoryMap[t.category] || 0) + Number(t.amount);
  }
  const topCategories = Object.entries(categoryMap)
    .map(([category, amount]) => ({ category, amount: Number(amount.toFixed(2)) }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const habitCompletionRate = habits.length
    ? Math.round((completions / habits.length / 30) * 100)
    : 0;
  const activeUsers = users.filter((u) => {
    const age = (Date.now() - new Date(u.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365);
    return age < 0.75;
  }).length;

  res.json({
    totalIncome,
    totalExpenses,
    totalAssetsValue: totalAssets._sum.value || 0,
    netPlatformWorth: Number(totalIncome) - Number(totalExpenses) + Number(totalAssets._sum.value || 0),
    topCategories,
    habitCompletionRate,
    activeUsers,
  });
});

router.get('/feedback', async (req, res) => {
  res.json(await prisma.feedback.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  }));
});

router.patch('/feedback/:id', async (req, res, next) => {
  const { status } = req.body || {};
  const valid = ['OPEN', 'RESOLVED', 'IGNORED'];
  if (!valid.includes(status)) return res.status(400).json({ message: 'Invalid feedback status.' });
  try {
    const updated = await prisma.feedback.update({ where: { id: req.params.id }, data: { status } });
    res.json(updated);
  } catch (e) { next(e); }
});

export default router;