import * as adminService from '../services/admin.js';

export const getOverview = async (req, res) => res.json(await adminService.overview());
export const getUsers = async (req, res) => res.json(await adminService.listUsers());

export const updateUser = async (req, res, next) => {
  const { role } = req.body || {};
  if (!['USER', 'ADMIN'].includes(role)) return res.status(400).json({ message: 'Invalid role.' });
  try {
    const target = await adminService.findUser(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found.' });
    if (target.id === req.user.id) return res.status(400).json({ message: 'You cannot change your own role.' });
    const updated = await adminService.updateUserRole(req.params.id, role);
    res.json({ id: updated.id, email: updated.email, role: updated.role });
  } catch (e) { next(e); }
};

export const deleteUser = async (req, res, next) => {
  try {
    const target = await adminService.findUser(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found.' });
    if (target.id === req.user.id) return res.status(400).json({ message: 'You cannot delete your own account.' });
    await adminService.deleteUser(req.params.id);
    res.status(204).end();
  } catch (e) { next(e); }
};

export const getAnalytics = async (req, res) => res.json(await adminService.analytics());
export const getFeedback = async (req, res) => res.json(await adminService.listFeedback());

export const updateFeedback = async (req, res, next) => {
  const { status } = req.body || {};
  if (!['OPEN', 'RESOLVED', 'IGNORED'].includes(status)) return res.status(400).json({ message: 'Invalid feedback status.' });
  try { res.json(await adminService.updateFeedbackStatus(req.params.id, status)); } catch (e) { next(e); }
};