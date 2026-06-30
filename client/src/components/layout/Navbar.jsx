import { useLocation, Link } from 'react-router-dom';
import useAgentStore from '../../store/agentStore';
import useAuthStore from '../../store/authStore';
import { Flame, Coins, Zap } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const { clutchPoints, currentStreak } = useAgentStore();
  const { user } = useAuthStore();

  // Don't show on landing page
  if (location.pathname === '/') return null;

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Dashboard';
      case '/tasks': return 'Tasks';
      case '/agent': return 'Shadow Agent';
      case '/dna': return 'Procrastination DNA';
      case '/contracts': return 'Ulysses Contracts';
      case '/crisis': return 'Crisis Mode';
      case '/settings': return 'Settings';
      default: return 'Clutch';
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      background: 'rgba(10,10,15,0.9)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-color)',
      zIndex: 50,
      padding: '0.75rem 1rem',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: 800,
        margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}>
              Clutch
            </span>
          </Link>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
            {getPageTitle()}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {currentStreak > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: 'rgba(245,158,11,0.1)',
              padding: '0.35rem 0.65rem',
              borderRadius: 100,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#F59E0B',
            }}>
              <Flame size={14} />
              {currentStreak}
            </div>
          )}
          <Link to="/settings" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'rgba(124,58,237,0.1)',
            padding: '0.35rem 0.65rem',
            borderRadius: 100,
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#A78BFA',
            textDecoration: 'none',
          }}>
            <Coins size={14} />
            {clutchPoints.toLocaleString()} CP
          </Link>
        </div>
      </div>
      {/* Powered by Gemini badge */}
      <div style={{
        textAlign: 'center',
        paddingBottom: '0.3rem',
        fontSize: '0.6rem',
        color: 'var(--text-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
      }}>
        <Zap size={9} color="#A78BFA" />
        <span>Powered by <strong style={{ color: '#A78BFA' }}>Google Gemini 2.5 Flash</strong></span>
      </div>
    </header>
  );
}
