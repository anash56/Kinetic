import { Router } from 'express';
import {
  completeHabit,
  createAsset,
  createFeedback,
  createGoal,
  createHabit,
  createIncomeSource,
  createTransaction,
  deleteAsset,
  deleteGoal,
  deleteHabit,
  deleteIncomeSource,
  deleteTransaction,
  getCategories,
  getDashboard,
  getMonthlyReport,
  listAssets,
  listGoals,
  listHabits,
  listIncomeSources,
  listTransactions,
  updateGoal,
} from '../controllers/finance.js';

const router = Router();

router.get('/categories', getCategories);
router.get('/transactions', listTransactions);
router.post('/transactions', createTransaction);
router.delete('/transactions/:id', deleteTransaction);
router.get('/income-sources', listIncomeSources);
router.post('/income-sources', createIncomeSource);
router.delete('/income-sources/:id', deleteIncomeSource);
router.get('/reports/monthly', getMonthlyReport);
router.get('/goals', listGoals);
router.post('/goals', createGoal);
router.patch('/goals/:id', updateGoal);
router.delete('/goals/:id', deleteGoal);
router.get('/habits', listHabits);
router.post('/habits', createHabit);
router.post('/habits/:id/complete', completeHabit);
router.delete('/habits/:id', deleteHabit);
router.get('/assets', listAssets);
router.post('/assets', createAsset);
router.delete('/assets/:id', deleteAsset);
router.post('/feedback', createFeedback);
router.get('/dashboard', getDashboard);

export default router;