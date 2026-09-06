import { useState } from 'react';
import { api } from '../lib/api';

export function AuthPage({ onAuth }) {
  const [register, setRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const credentials = register ? form : { email: form.email, password: form.password };
      const data = await api(`/auth/${register ? 'register' : 'login'}`, { method: 'POST', body: JSON.stringify(credentials) });
      localStorage.token = data.token; onAuth(data.user);
    }
    catch (requestError) { setError(requestError.message); } finally { setBusy(false); }
  };
  return <div className="auth"><section className="hero"><span className="logo light">↗ kinetic</span><div><small>YOUR MONEY, IN MOTION</small><h1>Small habits.<br /><i>Big momentum.</i></h1><p>Build a healthier relationship with money through simple daily actions and a clear view of your progress.</p></div><q>The secret of getting ahead is getting started.</q></section><main className="authbox"><span className="logo">↗ kinetic</span><small>WELCOME {register ? 'TO KINETIC' : 'BACK'}</small><h2>{register ? 'Start your financial journey.' : 'Take control of your financial future.'}</h2><p>{register ? 'Create your free account in a few seconds.' : 'Log in to continue your journey.'}</p><form onSubmit={submit}>{register && <label>Full name<input name="name" required value={form.name} onChange={update} placeholder="Alex Morgan" /></label>}<label>Email address<input name="email" type="email" required value={form.email} onChange={update} placeholder="you@example.com" /></label><label>Password<input name="password" type="password" required minLength="6" value={form.password} onChange={update} placeholder="At least 6 characters" /></label>{error && <div className="error">{error}</div>}<button className="primary" disabled={busy}>{busy ? 'Please wait…' : register ? 'Create account →' : 'Log in →'}</button></form><p className="switch">{register ? 'Already have an account?' : 'New to Kinetic?'} <button onClick={() => setRegister(!register)}>{register ? 'Log in' : 'Create one'}</button></p><footer>⌁ Your financial data is private and secure</footer></main></div>;
}
