import { motion } from 'framer-motion';
import ProgressRing from '../ui/ProgressRing';
import { Brain, TrendingUp, TrendingDown, Clock, Zap, Target } from 'lucide-react';

const DNA_TYPES = {
  'Last-Minute Hero': { emoji: '⚡', color: '#F59E0B', desc: 'You work best under pressure' },
  'Chronic Avoider': { emoji: '😅', color: '#EF4444', desc: 'Avoidance is your default mode' },
  'Anxious Planner': { emoji: '📋', color: '#3B82F6', desc: 'You plan but struggle to execute' },
  'Balanced Worker': { emoji: '🎯', color: '#10B981', desc: 'You have healthy work habits' },
};

export default function ProcrastinationDNA({ profile, completedTasks }) {
  if (completedTasks < 5) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 20,
          padding: '3rem 2rem',
          textAlign: 'center',
        }}
      >
        <Brain size={56} style={{ margin: '0 auto 1rem', color: 'var(--text-secondary)', opacity: 0.4 }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Your DNA is Forming
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Complete {5 - completedTasks} more task{5 - completedTasks !== 1 ? 's' : ''} to unlock your Procrastination DNA
        </p>
        <div style={{
          background: 'var(--bg-elevated)',
          borderRadius: 100,
          height: 8,
          overflow: 'hidden',
          maxWidth: 200,
          margin: '0 auto',
        }}>
          <div style={{
            height: '100%',
            width: `${(completedTasks / 5) * 100}%`,
            background: 'linear-gradient(90deg, #7C3AED, #A78BFA)',
            borderRadius: 100,
            transition: 'width 0.5s ease',
          }} />
        </div>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          {completedTasks} / 5 tasks completed
        </p>
      </motion.div>
    );
  }

  const typeInfo = DNA_TYPES[profile?.procrastination_type] || DNA_TYPES['Last-Minute Hero'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* DNA Score + Type */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(167,139,250,0.05))',
          border: '1px solid rgba(124,58,237,0.2)',
          borderRadius: 20,
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <ProgressRing
          value={profile?.dna_score || 0}
          size={110}
          strokeWidth={9}
          label="DNA Score"
        />
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: `${typeInfo.color}20`,
            padding: '0.35rem 0.75rem',
            borderRadius: 100,
            marginBottom: '0.65rem',
          }}>
            <span>{typeInfo.emoji}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: typeInfo.color }}>
              {profile?.procrastination_type}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            {typeInfo.desc}
          </p>
          <div style={{
            background: 'rgba(124,58,237,0.1)',
            borderRadius: 10,
            padding: '0.5rem 0.75rem',
            fontSize: '0.75rem',
            color: '#A78BFA',
            lineHeight: 1.4,
            fontStyle: 'italic',
          }}>
            "{profile?.personalized_tip}"
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
        {[
          { icon: Clock, label: 'Avg. Start Delay', value: `${profile?.average_start_delay_hours || 0}h`, color: '#F59E0B' },
          { icon: Zap, label: 'Best Time', value: profile?.best_performance_time || 'Evening', color: '#10B981' },
          { icon: TrendingUp, label: 'Strongest At', value: profile?.strongest_task_type || 'Assignments', color: '#3B82F6' },
          { icon: TrendingDown, label: 'Struggles With', value: profile?.weakest_task_type || 'Exams', color: '#EF4444' },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 14,
              padding: '1rem',
            }}
          >
            <Icon size={18} color={color} style={{ marginBottom: '0.4rem' }} />
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
              {label}
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'capitalize' }}>
              {value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Prediction */}
      {profile?.prediction && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(245,158,11,0.05))',
            border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: 14,
            padding: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <Target size={16} color="#EF4444" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#EF4444' }}>
              CLUTCH PREDICTION
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
            {profile.prediction}
          </p>
          <p style={{ fontSize: '0.75rem', color: '#A78BFA', marginTop: '0.5rem' }}>
            ✨ I've already prepared for it.
          </p>
        </motion.div>
      )}
    </div>
  );
}
