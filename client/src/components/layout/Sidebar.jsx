import { NavLink } from 'react-router-dom';
import { Home, ListTodo, Bot, Dna, ScrollText, Settings, Zap, LogOut } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const links = [
  { path: '/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/tasks', icon: ListTodo, label: 'Tasks' },
  { path: '/agent', icon: Bot, label: 'Shadow Agent' },
  { path: '/dna', icon: Dna, label: 'Procrastination DNA' },
  { path: '/contracts', icon: ScrollText, label: 'Ulysses Contracts' },
  { path: '/settings', icon: Settings, label: 'Settings & Points' },
];

export default function Sidebar() {
  const { logout, user } = useAuthStore();

  return (
    <aside style={{
      display: 'none',
      width: 260,
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-color)',
      padding: '1.5rem 1rem',
      flexDirection: 'column',
      zIndex: 40,
    }}
    className="md:flex"
    >
      <div style={{ marginBottom: '2rem', padding: '0 0.5rem' }}>
        <span style={{
          fontSize: '1.5rem',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Clutch
        </span>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>
          AI Deadline Agent
        </div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {links.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.75rem',
              borderRadius: 10,
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#A78BFA' : 'var(--text-secondary)',
              background: isActive ? 'rgba(124,58,237,0.1)' : 'transparent',
              transition: 'all 0.2s',
            })}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}>
        {user && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '0 0.5rem' }}>
            {user.displayName || user.email}
          </div>
        )}
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.65rem 0.75rem',
            borderRadius: 10,
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            width: '100%',
            textAlign: 'left',
          }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
