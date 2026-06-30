import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, Bot, AlertTriangle, ScrollText, ArrowRight, ExternalLink, Star } from 'lucide-react';
import useAuthStore from '../store/authStore';

const features = [
  {
    icon: '📬',
    title: 'Gmail Scans Your Inbox',
    desc: 'AI reads your emails and automatically detects deadlines, assignments, meetings, and exams — without you typing a single word.',
    color: '#3B82F6',
  },
  {
    icon: '🤖',
    title: 'Shadow Agent Starts Work',
    desc: 'While you sleep, Clutch creates your Google Doc, breaks down the task, and blocks your calendar. You wake up to work already done.',
    color: '#7C3AED',
  },
  {
    icon: '🚨',
    title: 'Crisis Mode Kicks In',
    desc: 'From calm green to emergency red — every task has a graduated alert level that escalates automatically as the deadline approaches.',
    color: '#EF4444',
  },
  {
    icon: '📜',
    title: 'Ulysses Contracts',
    desc: 'Set a personal consequence if you miss a deadline. The psychological pressure is scientifically proven to improve follow-through.',
    color: '#F59E0B',
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const { login, loginDemo, logout, isLoading, isAuthenticated, isDemo, error } = useAuthStore();

  const handleGoogleSignIn = async () => {
    // Clear any stale demo session so Firebase popup is not bypassed
    sessionStorage.removeItem('clutch_demo');
    try {
      await login();
      // login() updates the store — check final state
      const state = useAuthStore.getState();
      if (state.isAuthenticated) {
        navigate('/dashboard');
      } else if (state.error) {
        // error is rendered in the UI below
        console.error('Sign-in error:', state.error);
      }
    } catch (err) {
      console.error('Sign-in failed:', err.message);
    }
  };

  const handleDemoMode = () => {
    loginDemo();
    sessionStorage.setItem('clutch_demo', '1');
    navigate('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.25rem 1.5rem',
        maxWidth: 1100, margin: '0 auto',
      }}>
        <span style={{
          fontSize: '1.5rem', fontWeight: 900,
          background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Clutch
        </span>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {isAuthenticated || isDemo ? (
            <>
              <button
                onClick={() => {
                  logout();
                  sessionStorage.removeItem('clutch_demo');
                }}
                style={{
                  background: 'transparent',
                  color: 'var(--text-secondary)', padding: '0.5rem 1rem',
                  border: 'none', cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: 600,
                }}
              >
                Sign Out
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  background: 'rgba(124,58,237,0.1)',
                  border: '1px solid rgba(124,58,237,0.3)',
                  color: '#A78BFA', padding: '0.5rem 1rem',
                  borderRadius: 10, cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: 600,
                }}
              >
                Go to Dashboard
              </button>
            </>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              style={{
                background: 'rgba(124,58,237,0.1)',
                border: '1px solid rgba(124,58,237,0.3)',
                color: '#A78BFA', padding: '0.5rem 1rem',
                borderRadius: 10, cursor: 'pointer',
                fontSize: '0.85rem', fontWeight: 600,
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        padding: '4rem 1.5rem 3rem',
        textAlign: 'center',
        maxWidth: 700, margin: '0 auto',
        position: 'relative',
      }}>
        {/* Background glow */}
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 400,
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.12), transparent 70%)',
          pointerEvents: 'none',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.2)',
            padding: '0.35rem 0.85rem',
            borderRadius: 100, marginBottom: '1.5rem',
            fontSize: '0.75rem', fontWeight: 600, color: '#A78BFA',
          }}>
            <Zap size={13} /> The AI that does the work for you — not just another to-do list.
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            fontWeight: 900, lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem',
          }}>
            Stop Being{' '}
            <span style={{
              background: 'linear-gradient(135deg, #7C3AED, #A78BFA, #06B6D4)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Reminded.
            </span>
            <br />
            Start Getting Things Done.
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.7, marginBottom: '2rem',
            maxWidth: 520, margin: '0 auto 2rem',
          }}>
            Clutch is the AI agent that works on your tasks while you sleep.
            Open it to see what's already done — not a list of scary pending tasks.
          </p>

          <div style={{
            display: 'flex', flexDirection: 'column', gap: '0.75rem',
            alignItems: 'center',
          }}>
            <motion.button
              id="google-signin-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                color: '#fff', border: 'none',
                padding: '0.9rem 2rem',
                borderRadius: 14, cursor: 'pointer',
                fontSize: '1rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '0.65rem',
                boxShadow: '0 8px 32px rgba(124,58,237,0.35)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
              </svg>
              Sign in with Google — It's Free
            </motion.button>

            <button
              id="demo-mode-btn"
              onClick={handleDemoMode}
              style={{
                background: 'transparent', border: 'none',
                color: 'var(--text-secondary)', cursor: 'pointer',
                fontSize: '0.85rem', textDecoration: 'underline',
              }}
            >
              Try Demo Mode (no sign-in required)
            </button>
          </div>

            {/* Auth error display */}
            {error && (
              <div style={{
                marginTop: '0.75rem',
                padding: '0.6rem 1rem',
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.35)',
                borderRadius: 10,
                color: '#FCA5A5',
                fontSize: '0.85rem',
                maxWidth: 400,
                textAlign: 'center',
              }}>
                ⚠️ {error}
              </div>
            )}
        </motion.div>
      </section>

      {/* Dashboard mockup */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        style={{
          maxWidth: 700, margin: '0 auto 4rem',
          padding: '0 1.5rem',
        }}
      >
        <motion.div 
          whileHover={{ y: -10, boxShadow: '0 50px 100px rgba(124,58,237,0.3)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 20,
          padding: '1.5rem',
          boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Glow overlay */}
          <div style={{
            position: 'absolute', top: -50, left: -50, right: -50,
            height: 150,
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.08), transparent)',
          }} />

          {/* Mock dashboard content */}
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Good morning, Keshav. Clutch has been busy.
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 100 }}>
              ✅ Created 2 docs
            </span>
            <span style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 100 }}>
              📅 Blocked 6 hours
            </span>
            <span style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 100 }}>
              📬 Found 3 deadlines
            </span>
          </div>
          {/* Mock task cards */}
          {[
            { title: 'CS301 Lab Report', time: '10h 23m', mode: 'CRUNCH', color: '#EF4444' },
            { title: 'Technical Interview Prep', time: '4d 0h', mode: 'CALM', color: '#10B981' },
          ].map((t, i) => (
            <div key={i} style={{
              background: 'var(--bg-elevated)',
              border: `1px solid ${t.color}33`,
              borderLeft: `3px solid ${t.color}`,
              borderRadius: 10, padding: '0.65rem 0.85rem',
              marginBottom: '0.5rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{t.title}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{t.time}</span>
                <span style={{ background: `${t.color}22`, color: t.color, fontSize: '0.6rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: 6 }}>
                  {t.mode}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* PWA Section */}
      <section style={{
        maxWidth: 800, margin: '0 auto 4rem', padding: '0 1.5rem',
        textAlign: 'center',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(16,185,129,0.05))',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: 24, padding: '2.5rem',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📱</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem', color: '#fff' }}>
            Install Clutch on Your Phone
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem', maxWidth: 500, margin: '0 auto 1.5rem' }}>
            Clutch is a Progressive Web App (PWA). You can install it directly to your home screen and get real-time crisis notifications without going through the App Store.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'left', maxWidth: 600, margin: '0 auto' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: 16 }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#3B82F6' }}>For iOS (Safari)</div>
              <ol style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                <li>Tap the <strong>Share</strong> button at the bottom.</li>
                <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                <li>Launch Clutch from your home screen.</li>
              </ol>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: 16 }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#10B981' }}>For Android (Chrome)</div>
              <ol style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                <li>Tap the <strong>Menu</strong> (three dots) top right.</li>
                <li>Tap <strong>Install app</strong> or <strong>Add to Home Screen</strong>.</li>
                <li>Launch Clutch from your app drawer.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        <h2 style={{
          textAlign: 'center', fontSize: '1.8rem', fontWeight: 800,
          marginBottom: '0.5rem', letterSpacing: '-0.02em',
        }}>
          How Clutch Works
        </h2>
        <p style={{
          textAlign: 'center', color: 'var(--text-secondary)',
          fontSize: '0.9rem', marginBottom: '2.5rem',
        }}>
          Four AI-powered systems working together so you don't have to
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section style={{
        maxWidth: 700, margin: '0 auto 4rem', padding: '0 1.5rem',
        textAlign: 'center',
      }}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 16, padding: '1.5rem',
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎓</div>
          <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            "Used by 500+ engineering students at IIT & BITS — now in public beta"
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={16} color="#F59E0B" fill="#F59E0B" />)}
          </div>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            * Demo data for hackathon preview
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '2rem 1.5rem',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '0.8rem',
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{
              fontWeight: 800, fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Clutch
            </span>
          </div>
          <div>Powered by Google Gemini 2.5 Flash · Built with Firebase & Cloud Run</div>
          <div style={{ marginTop: '0.5rem' }}>
            &copy; 2026 Clutch AI. All rights reserved. · Hackathon 2026 ·{' '}
            <a href="https://github.com" style={{ color: '#A78BFA', textDecoration: 'none', fontWeight: 600 }}>GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
