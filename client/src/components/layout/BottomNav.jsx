import { Link, useLocation } from 'react-router-dom';
import { Home, ListTodo, Bot, Dna, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/tasks', icon: ListTodo, label: 'Tasks' },
  { path: '/agent', icon: Bot, label: 'Agent' },
  { path: '/dna', icon: Dna, label: 'DNA' },
  { path: '/settings', icon: Settings, label: 'More' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav" id="bottom-navigation">
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        maxWidth: 500,
        margin: '0 auto',
        padding: '0 0.5rem',
      }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                textDecoration: 'none',
                color: isActive ? '#7C3AED' : '#94A3B8',
                fontSize: '0.65rem',
                fontWeight: isActive ? 600 : 400,
                position: 'relative',
                padding: '0.25rem 0.75rem',
                transition: 'color 0.2s',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  style={{
                    position: 'absolute',
                    top: -1,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 24,
                    height: 3,
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, #7C3AED, #A78BFA)',
                  }}
                />
              )}
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
