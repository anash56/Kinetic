import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';

const tokenFor = (user) => jwt.sign(
  { id: user.id, name: user.name, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' },
);

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const register = async ({ name, email, password }) => {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return null;

  const user = await prisma.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 12) },
  });
  return { token: tokenFor(user), user: publicUser(user) };
};

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return null;
  return { token: tokenFor(user), user: publicUser(user) };
};

export const findUser = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? publicUser(user) : null;
};