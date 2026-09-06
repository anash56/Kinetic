import { LogOut, Menu } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { navigation } from '../../constants/navigation';

export function AppShell({ user, onLogout, sidebarOpen, onToggleSidebar, children, error }) {
  const page = useLocation().pathname.split('/')[1] || 'dashboard';
  const visibleNavigation = navigation.filter(([id]) => id !== 'admin' || user?.role === 'ADMIN');
  const pageName = visibleNavigation.find(([id]) => id === page)?.[1] || 'Dashboard';
  return <div className="app"><aside className={sidebarOpen ? 'open' : ''}><span className="logo">↗ kinetic</span><div className="profile"><b>{user?.name || 'Your account'}</b><small>Personal account</small></div><nav>{visibleNavigation.map(([id, label, Icon]) => <NavLink key={id} to={`/${id}`} className={({ isActive }) => isActive ? 'active' : ''} onClick={() => onToggleSidebar(false)}><Icon />{label}</NavLink>)}</nav><button className="logout" onClick={onLogout}><LogOut /> Log out</button></aside><main><header className="top"><button className="hamburger" onClick={() => onToggleSidebar(!sidebarOpen)}><Menu /></button><span>Overview / <b>{pageName}</b></span><span className="avatar">{(user?.name || 'Y').slice(0, 2).toUpperCase()}</span></header><article>{children}</article></main>{error && <div className="error">{error}</div>}</div>;
}
