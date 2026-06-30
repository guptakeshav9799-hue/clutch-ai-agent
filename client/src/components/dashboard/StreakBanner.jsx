import { motion } from 'framer-motion';
import { Flame, Trophy } from 'lucide-react';

export default function StreakBanner({ currentStreak, longestStreak }) {
  if (currentStreak <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(239,68,68,0.05))',
        border: '1px solid rgba(245,158,11,0.2)',
        borderRadius: 14,
        padding: '0.85rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Flame size={24} color="#F59E0B" />
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#F59E0B' }}>
            {currentStreak} Day Streak
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            Keep completing tasks on time!
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
          <Trophy size={12} />
          Best: {longestStreak}
        </div>
      </div>
    </motion.div>
  );
}
