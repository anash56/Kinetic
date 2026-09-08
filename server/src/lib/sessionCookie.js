import { parseCookie, stringifySetCookie } from 'cookie';

export const SESSION_COOKIE = 'kinetic_session';

const isProduction = process.env.NODE_ENV === 'production';

const baseOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60,
};

export const setSessionCookie = (res, token) => {
  const cookie = stringifySetCookie({
    name: SESSION_COOKIE,
    value: token,
    ...baseOptions,
  });

  // Temporary debugging — token is deliberately hidden.
  console.log(
    'SET-COOKIE:',
    cookie.replace(token, '[REDACTED]')
  );

  res.setHeader('Set-Cookie', cookie);
};

export const clearSessionCookie = (res) => {
  const cookie = stringifySetCookie({
    name: SESSION_COOKIE,
    value: '',
    ...baseOptions,
    maxAge: 0,
  });

  res.setHeader('Set-Cookie', cookie);
};

export const sessionTokenFromRequest = (req) => {
  const cookies = parseCookie(req.headers.cookie || '');

  return (
    cookies[SESSION_COOKIE] ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '') ||
    null
  );
};