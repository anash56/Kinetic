import { Router } from 'express';
import { currentUser, login, logout, register } from '../controllers/auth.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth(), currentUser);
router.post('/logout', logout);

export default router;