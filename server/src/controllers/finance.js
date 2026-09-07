import { z } from 'zod';
import * as financeService from '../services/finance.js';

const uid = (req) => req.user.id;
const transactionSchema = z.object({ amount: z.coerce.number().positive(), type: z.enum(['INCOME', 'EXPENSE']), category: z.string().min(2), note: z.string().max(200).optional(), date: z.coerce.date().optional(), sourceId: z.string().optional() });
const sourceSchema = z.object({ name: z.string().min(2), amount: z.coerce.number().positive(), frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'ANNUAL']) });
const goalSchema = z.object({ name: z.string().min(2), targetAmount: z.coerce.number().positive(), currentAmount: z.coerce.number().min(0).default(0), targetDate: z.coerce.date().optional(), icon: z.string().max(4).default('🎯') });
const goalUpdateSchema = goalSchema.partial();
const habitSchema = z.object({ name: z.string().min(2), frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']), reminderTime: z.string().optional() });
const assetSchema = z.object({ name: z.string().min(2), type: z.string().min(2), category: z.string().min(2).optional(), value: z.coerce.number().positive() });
const feedbackSchema = z.object({ message: z.string().min(3).max(500) });

export const getCategories = (req, res) => res.json(financeService.categories);

export const listTransactions = async (req, res) => {
  try { res.json(await financeService.listTransactions(uid(req))); }
  catch (e) { res.status(500).json({ message: 'Failed to load transactions.' }); }
};
export const createTransaction = async (req, res, next) => {
  try {
    const { sourceId, ...body } = transactionSchema.parse(req.body);
    const created = await financeService.createTransaction(uid(req), body, sourceId);
    if (!created) return res.status(400).json({ message: 'Invalid income source.' });
    res.status(201).json(created);
  } catch (e) { next(e); }
};
export const deleteTransaction = async (req, res, next) => { try { await financeService.deleteTransaction(uid(req), req.params.id); res.status(204).end(); } catch (e) { next(e); } };

export const listIncomeSources = async (req, res, next) => { try { res.json(await financeService.listIncomeSources(uid(req))); } catch (e) { next(e); } };
export const createIncomeSource = async (req, res, next) => { try { res.status(201).json(await financeService.createIncomeSource(uid(req), sourceSchema.parse(req.body))); } catch (e) { next(e); } };
export const deleteIncomeSource = async (req, res, next) => { try { await financeService.deleteIncomeSource(uid(req), req.params.id); res.status(204).end(); } catch (e) { next(e); } };
export const getMonthlyReport = async (req, res, next) => { try { res.json(await financeService.monthlyReport(uid(req))); } catch (e) { next(e); } };

export const listGoals = async (req, res, next) => { try { res.json(await financeService.listGoals(uid(req))); } catch (e) { next(e); } };
export const createGoal = async (req, res, next) => { try { res.status(201).json(await financeService.createGoal(uid(req), goalSchema.parse(req.body))); } catch (e) { next(e); } };
export const updateGoal = async (req, res, next) => { try { res.json(await financeService.updateGoal(uid(req), req.params.id, goalUpdateSchema.parse(req.body))); } catch (e) { next(e); } };
export const deleteGoal = async (req, res, next) => { try { await financeService.deleteGoal(uid(req), req.params.id); res.status(204).end(); } catch (e) { next(e); } };

export const listHabits = async (req, res, next) => { try { res.json(await financeService.listHabits(uid(req))); } catch (e) { next(e); } };
export const createHabit = async (req, res, next) => { try { res.status(201).json(await financeService.createHabit(uid(req), habitSchema.parse(req.body))); } catch (e) { next(e); } };
export const completeHabit = async (req, res, next) => {
  try {
    const habit = await financeService.findHabit(uid(req), req.params.id);
    if (!habit) return res.status(404).json({ message: 'Habit not found.' });
    const requestedDate = req.body?.completedOn || new Date().toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
      return res.status(400).json({ message: 'Invalid completion date.' });
    }
    const completedOn = new Date(`${requestedDate}T00:00:00.000Z`);
    completedOn.setUTCHours(0, 0, 0, 0);
    const existing = await financeService.hasHabitCompletionInPeriod(habit.id, habit.frequency, completedOn);
    if (existing) {
      return res.status(409).json({ message: `This ${habit.frequency.toLowerCase()} habit is already completed for this period.` });
    }
    await financeService.completeHabit(habit.id, completedOn);
    res.json({ message: 'Habit completed!' });
  } catch (e) { next(e); }
};
export const deleteHabit = async (req, res, next) => { try { await financeService.deleteHabit(uid(req), req.params.id); res.status(204).end(); } catch (e) { next(e); } };

export const listAssets = async (req, res, next) => { try { res.json(await financeService.listAssets(uid(req))); } catch (e) { next(e); } };
export const createAsset = async (req, res, next) => { try { res.status(201).json(await financeService.createAsset(uid(req), assetSchema.parse(req.body))); } catch (e) { next(e); } };
export const deleteAsset = async (req, res, next) => { try { await financeService.deleteAsset(uid(req), req.params.id); res.status(204).end(); } catch (e) { next(e); } };
export const createFeedback = async (req, res, next) => { try { res.status(201).json(await financeService.createFeedback(uid(req), feedbackSchema.parse(req.body))); } catch (e) { next(e); } };
export const getDashboard = async (req, res, next) => { try { res.json(await financeService.dashboard(uid(req))); } catch (e) { next(e); } };