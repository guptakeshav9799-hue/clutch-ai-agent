import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import useAuthStore from './store/authStore';
import Navbar from './components/layout/Navbar';
import BottomNav from './components/layout/BottomNav';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import ShadowAgent from './pages/ShadowAgent';
import ProcrastinationDNA from './pages/ProcrastinationDNA';
import UlyssesContracts from './pages/UlyssesContracts';
import Settings from './pages/Settings';
import { useTaskDetection } from './hooks/useTaskDetection';
import { requestNotificationPermission } from './services/notifications';

function LoadingSpinner() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '1rem',
      }}>
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 900, color: '#fff',
          }}
        >
          C
        </motion.div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Loading Clutch...
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppLayout({ children }) {
  const location = useLocation();
  const showNav = location.pathname !== '/';
  useTaskDetection();

  return (
    <>
      {showNav && <Navbar />}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
      {showNav && <BottomNav />}
    </>
  );
}

export default function App() {
  const { initAuth, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    const unsub = initAuth();
    return () => { if (typeof unsub === 'function') unsub(); };
  }, []);

  // Ask for notification permission after login
  useEffect(() => {
    if (isAuthenticated) {
      requestNotificationPermission();
    }
  }, [isAuthenticated]);

  // PWA Install prompt — show after 30 seconds on mobile
  useEffect(() => {
    let deferredPrompt = null;
    const handler = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      // Show install banner after 30 seconds
      setTimeout(() => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(() => { deferredPrompt = null; });
        }
      }, 30000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          <Route path="/agent" element={<ProtectedRoute><ShadowAgent /></ProtectedRoute>} />
          <Route path="/dna" element={<ProtectedRoute><ProcrastinationDNA /></ProtectedRoute>} />
          <Route path="/contracts" element={<ProtectedRoute><UlyssesContracts /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
