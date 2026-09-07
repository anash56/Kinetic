import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';
import { sessionTokenFromRequest } from '../lib/sessionCookie.js';

export function auth(requiredAdmin = false) {
  return async (req, res, next) => {
    try {
      const token = sessionTokenFromRequest(req);
      const user = jwt.verify(token, process.env.JWT_SECRET);
      if (requiredAdmin) {
        const currentUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        if (!currentUser || currentUser.role !== 'ADMIN') {
          return res.status(403).json({ message: 'Administrator access required.' });
        }
      }
      req.user = user; next();
    } catch { res.status(401).json({ message: 'Please log in again.' }); }
  };
}
