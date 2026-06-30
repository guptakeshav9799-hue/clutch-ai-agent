import { motion } from 'framer-motion';
import { Lock, Unlock, Zap, Star } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useAgentStore from '../store/agentStore';
import ProgressRing from '../components/ui/ProgressRing';

const POINT_RULES = [
  { label: 'Complete in CALM mode (>72h before)', points: '+500 CP', color: '#10B981' },
  { label: 'Complete in PLANNING mode (48-72h)', points: '+300 CP', color: '#3B82F6' },
  { label: 'Complete in ACTIVE mode (24-48h)', points: '+150 CP', color: '#F59E0B' },
  { label: 'Complete in CRUNCH mode (6-24h)', points: '+50 CP', color: '#EF4444' },
  { label: 'Honor Ulysses Contract (reward)', points: '+200 CP', color: '#A78BFA' },
  { label: '7-day completion streak', points: '+1000 CP', color: '#F59E0B' },
  { label: 'First task completed (Welcome!)', points: '+250 CP', color: '#10B981' },
];

export default function Settings() {
  const { user, logout, isDemo } = useAuthStore();
  const { clutchPoints, currentStreak, longestStreak, unlockedFeatures, features, unlockFeature } = useAgentStore();

  const nextFeature = features.find(f => !unlockedFeatures.includes(f.id));
  const progressToNext = nextFeature
    ? Math.min(100, (clutchPoints / nextFeature.cost) * 100)
    : 100;

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 900 }}>Settings & Points</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.25rem' }}>
          Your account & Clutch Points
        </p>
      </motion.div>

      {/* Points hero */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(167,139,250,0.08))',
          border: '1px solid rgba(124,58,237,0.2)',
          borderRadius: 20, padding: '1.5rem',
          marginBottom: '1.25rem',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
          <ProgressRing value={progressToNext} size={110} label="to next" />
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
          {clutchPoints.toLocaleString()}
          <span style={{ fontSize: '1rem', color: '#A78BFA', marginLeft: '0.4rem' }}>CP</span>
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
          Clutch Points Balance
        </div>
        {nextFeature && (
          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#A78BFA' }}>
            {nextFeature.cost - clutchPoints > 0
              ? `${(nextFeature.cost - clutchPoints).toLocaleString()} CP to unlock "${nextFeature.name}"`
              : `Ready to unlock "${nextFeature.name}"!`}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F59E0B' }}>🔥 {currentStreak}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Current Streak</div>
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#A78BFA' }}>🏆 {longestStreak}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Best Streak</div>
          </div>
        </div>
      </motion.div>

      {/* Unlockable features */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{
          fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)',
          textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem',
        }}>
          Unlock Superpowers
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {features.map((feature, i) => {
            const isUnlocked = unlockedFeatures.includes(feature.id);
            const canUnlock = clutchPoints >= feature.cost;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  background: 'var(--bg-surface)',
                  border: `1px solid ${isUnlocked ? 'rgba(16,185,129,0.3)' : 'var(--border-color)'}`,
                  borderRadius: 14, padding: '0.9rem',
                  display: 'flex', alignItems: 'center', gap: '0.85rem',
                  opacity: isUnlocked ? 1 : 0.85,
                }}
              >
                <div style={{ fontSize: '1.5rem' }}>{feature.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.85rem', fontWeight: 700,
                    color: isUnlocked ? '#10B981' : 'var(--text-primary)',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                  }}>
                    {feature.name}
                    {isUnlocked && <span style={{ fontSize: '0.65rem', background: 'rgba(16,185,129,0.1)', color: '#10B981', padding: '0.1rem 0.4rem', borderRadius: 6 }}>UNLOCKED</span>}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
                    {feature.description}
                  </div>
                </div>
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  {isUnlocked ? (
                    <Unlock size={18} color="#10B981" />
                  ) : (
                    <button
                      id={`unlock-${feature.id}`}
                      onClick={() => unlockFeature(feature.id, feature.cost)}
                      disabled={!canUnlock}
                      style={{
                        background: canUnlock ? 'linear-gradient(135deg, #7C3AED, #6D28D9)' : 'var(--bg-elevated)',
                        border: 'none', color: canUnlock ? '#fff' : 'var(--text-secondary)',
                        padding: '0.35rem 0.6rem',
                        borderRadius: 8, cursor: canUnlock ? 'pointer' : 'not-allowed',
                        fontSize: '0.7rem', fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {feature.cost.toLocaleString()} CP
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* How to earn */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{
          fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)',
          textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem',
        }}>
          How to Earn Points
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {POINT_RULES.map((rule, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 10, padding: '0.65rem 0.85rem',
            }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{rule.label}</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: rule.color }}>{rule.points}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Profile & Sign out */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 16, padding: '1rem',
        marginBottom: '1rem',
      }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
          Signed in as
        </div>
        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
          {user?.displayName || 'Demo User'}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          {user?.email || 'demo@clutch.app'}
        </div>
        {isDemo && (
          <div style={{
            marginTop: '0.5rem', fontSize: '0.7rem',
            color: '#F59E0B', fontWeight: 600,
          }}>
            ⚠️ Demo Mode — sign in with Google for full features
          </div>
        )}
      </div>

      <button
        id="sign-out-btn"
        onClick={logout}
        style={{
          width: '100%',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          color: '#EF4444',
          padding: '0.85rem',
          borderRadius: 14,
          cursor: 'pointer',
          fontSize: '0.9rem', fontWeight: 600,
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
