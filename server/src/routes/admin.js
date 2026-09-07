import { Router } from 'express';
import {
  deleteUser,
  getAnalytics,
  getFeedback,
  getOverview,
  getUsers,
  updateFeedback,
  updateUser,
} from '../controllers/admin.js';

const router = Router();

router.get('/overview', getOverview);
router.get('/users', getUsers);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/analytics', getAnalytics);
router.get('/feedback', getFeedback);
router.patch('/feedback/:id', updateFeedback);

export default router;