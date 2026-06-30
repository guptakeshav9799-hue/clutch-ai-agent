import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import TaskCard from './TaskCard';

export default function CrisisCard({ tasks }) {
  const crisisTasks = tasks.filter(t =>
    t.status !== 'completed' &&
    t.currentCrisisMode &&
    ['CRUNCH', 'EMERGENCY', 'SURVIVAL'].includes(t.currentCrisisMode.mode)
  );

  if (crisisTasks.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.75rem',
      }}>
        <AlertTriangle size={18} color="#EF4444" />
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#EF4444' }}>
          Tasks in Crisis
        </h2>
        <span style={{
          background: 'rgba(239,68,68,0.15)',
          color: '#EF4444',
          fontSize: '0.7rem',
          fontWeight: 700,
          padding: '0.15rem 0.5rem',
          borderRadius: 100,
        }}>
          {crisisTasks.length}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {crisisTasks.map((task, i) => (
          <TaskCard key={task.id} task={task} index={i} />
        ))}
      </div>
    </motion.div>
  );
}
