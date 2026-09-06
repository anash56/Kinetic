import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { api } from './lib/api';

const AdminPage = lazy(() => import('./pages/AdminPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const HabitsPage = lazy(() => import('./pages/HabitsPage'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const WealthPage = lazy(() => import('./pages/WealthPage'));
import { AuthPage } from './pages/AuthPage';

function readUserFromToken(token) {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

function AuthenticatedApp({ user, data, transactions, reload, error, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return <AppShell user={user} onLogout={onLogout} sidebarOpen={sidebarOpen} onToggleSidebar={setSidebarOpen} error={error}>
    <Suspense fallback={<div className="loading">Loading…</div>}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage data={data} onNavigate={(page) => navigate(`/${page}`)} />} />
        <Route path="/transactions" element={<TransactionsPage items={transactions} reload={reload} />} />
        <Route path="/habits" element={<HabitsPage habits={data.habits} reload={reload} />} />
        <Route path="/goals" element={<GoalsPage goals={data.goals} reload={reload} />} />
        <Route path="/wealth" element={<WealthPage data={data} reload={reload} />} />
        <Route path="/admin" element={user?.role === 'ADMIN' ? <AdminPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  </AppShell>;
}

function Application() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  const reload = async () => {
    try {
      const [dashboard, transactionList] = await Promise.all([api('/dashboard'), api('/transactions')]);
      setData(dashboard); setTransactions(transactionList);
    } catch (requestError) {
      localStorage.removeItem('token'); setUser(null); setError(requestError.message);
    }
  };

  useEffect(() => {
    if (!localStorage.token) return;
    const savedUser = readUserFromToken(localStorage.token);
    if (!savedUser) { localStorage.removeItem('token'); return; }
    setUser(savedUser); reload();
  }, []);

  if (!localStorage.token || (!user && !data)) {
    return <AuthPage onAuth={(authenticatedUser) => { setUser(authenticatedUser); reload(); }} />;
  }
  if (!data) return <div className="loading">Loading your financial workspace…</div>;

  const logout = () => { localStorage.removeItem('token'); setUser(null); setData(null); };
  return <AuthenticatedApp user={user} data={data} transactions={transactions} reload={reload} error={error} onLogout={logout} />;
}

export default function App() {
  return <BrowserRouter><Application /></BrowserRouter>;
}
