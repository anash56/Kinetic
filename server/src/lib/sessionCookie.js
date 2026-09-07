import { parseCookie, stringifySetCookie } from 'cookie';

export const SESSION_COOKIE = 'kinetic_session';

const isProduction = process.env.NODE_ENV === 'production';

const sameSite = isProduction ? 'none' : 'lax';

const baseOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite,
  path: '/',
  maxAge: 7 * 24 * 60 * 60,
};

export const setSessionCookie = (res, token) => {
  res.setHeader('Set-Cookie', stringifySetCookie({ name: SESSION_COOKIE, value: token, ...baseOptions }));
};

export const clearSessionCookie = (res) => {
  res.setHeader('Set-Cookie', stringifySetCookie({ name: SESSION_COOKIE, value: '', ...baseOptions, maxAge: 0 }));
};

export const sessionTokenFromRequest = (req) => {
  const cookies = parseCookie(req.headers.cookie || '');
  return cookies[SESSION_COOKIE] || req.headers.authorization?.replace('Bearer ', '');
};