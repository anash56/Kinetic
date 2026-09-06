import jwt from 'jsonwebtoken';
export function auth(requiredAdmin = false) {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const user = jwt.verify(token, process.env.JWT_SECRET);
      if (requiredAdmin && user.role !== 'ADMIN') return res.status(403).json({ message: 'Administrator access required.' });
      req.user = user; next();
    } catch { res.status(401).json({ message: 'Please log in again.' }); }
  };
}
