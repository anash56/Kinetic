import { z } from 'zod';
import * as authService from '../services/auth.js';
import { clearSessionCookie, setSessionCookie } from '../lib/sessionCookie.js';

const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).optional().or(z.literal('').transform(() => undefined)),
});

export const register = async (req, res, next) => {
  try {
    const data = credentials.parse(req.body);
    if (!data.name) return res.status(400).json({ message: 'Name is required.' });
    const result = await authService.register(data);
    if (!result) return res.status(409).json({ message: 'An account already exists for this email.' });
    setSessionCookie(res, result.token);
    res.status(201).json({ user: result.user });
  } catch (e) { next(e); }
};

export const login = async (req, res, next) => {
  try {
    const data = credentials.parse(req.body);
    const result = await authService.login(data);
    if (!result) return res.status(401).json({ message: 'Invalid email or password.' });
    setSessionCookie(res, result.token);
    res.json({ user: result.user });
  } catch (e) { next(e); }
};

export const currentUser = async (req, res, next) => {
  try {
    const user = await authService.findUser(req.user.id);
    if (!user) return res.status(401).json({ message: 'Please log in again.' });
    res.json({ user });
  } catch (e) { next(e); }
};

export const logout = (req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
};