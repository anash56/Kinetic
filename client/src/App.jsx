import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { api } from './lib/api';

const AdminPage = lazy(() => import('./pages/AdminPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const HabitsPage = lazy(() => import('./pages/HabitsPage'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const WealthPage = lazy(() => import('./pages/WealthPage'));
import { AuthPage } from './pages/AuthPage';

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
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/admin" element={user?.role === 'ADMIN' ? <AdminPage user={user} /> : <Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  </AppShell>;
}

function Application() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  const reload = async () => {
    try {
      const [dashboard, transactionList] = await Promise.all([api('/dashboard'), api('/transactions')]);
      setData(dashboard); setTransactions(transactionList);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => {
    api('/auth/me')
      .then(({ user: savedUser }) => {
        setUser(savedUser);
        if (location.pathname === '/login' || location.pathname === '/') {
          navigate('/dashboard', { replace: true });
        }
        return reload();
      })
      .catch(() => {
        setUser(null);
        setData(null);
        if (location.pathname !== '/login') navigate('/login', { replace: true });
      })
      .finally(() => setCheckingSession(false));
  }, []);

  if (checkingSession) return <div className="loading">Checking your session…</div>;
  if (!user) return location.pathname === '/login'
    ? <AuthPage onAuth={(authenticatedUser) => {
      setUser(authenticatedUser);
      setError('');
      navigate('/dashboard', { replace: true });
      reload();
    }} />
    : <Navigate to="/login" replace />;
  if (!data) return <div className="loading">Loading your financial workspace…</div>;

  const logout = async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null); setData(null);
    setTransactions([]);
    navigate('/login', { replace: true });
  };
  return <AuthenticatedApp user={user} data={data} transactions={transactions} reload={reload} error={error} onLogout={logout} />;
}

export default function App() {
  return <BrowserRouter><Application /></BrowserRouter>;
}
