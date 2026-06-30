import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCrisisMode } from '../../hooks/useCrisisMode';
import { getCrisisClass, getBadgeClass } from '../../utils/crisisCalculator';
import { AlertTriangle, Zap, Play, FileText, ExternalLink, Clock } from 'lucide-react';
import Badge from '../ui/Badge';

export default function TaskCard({ task, index = 0, compact = false }) {
  const navigate = useNavigate();
  const { mode, countdown, color } = useCrisisMode(task.deadline);

  if (task.status === 'completed') return null;

  const handleClick = () => {
    if (mode === 'EMERGENCY' || mode === 'SURVIVAL') {
      navigate('/crisis', { state: { task } });
    } else {
      navigate('/tasks', { state: { selectedTaskId: task.id } });
    }
  };

  const modeEmoji = {
    CALM: '🟢', PLANNING: '🔵', ACTIVE: '🟠',
    CRUNCH: '🔴', EMERGENCY: '🚨', SURVIVAL: '💀',
  };

  const isCrunch = mode === 'CRUNCH';
  const isEmergency = mode === 'EMERGENCY' || mode === 'SURVIVAL';

  return (
    <>
      {/* EMERGENCY / SURVIVAL: full-screen red overlay */}
      <AnimatePresence>
        {isEmergency && !compact && (
          <motion.div
            key="emergency-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 10,
              background: 'radial-gradient(ellipse at center, rgba(239,68,68,0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{
          opacity: 1, y: 0,
          // CRUNCH: pulsing red box-shadow every 2s
          boxShadow: isCrunch
            ? ['0 0 0px rgba(239,68,68,0)', '0 0 20px rgba(239,68,68,0.5)', '0 0 0px rgba(239,68,68,0)']
            : isEmergency
              ? ['0 0 0px rgba(239,68,68,0)', '0 0 35px rgba(239,68,68,0.7)', '0 0 0px rgba(239,68,68,0)']
              : '0 0 0px transparent',
        }}
        transition={{
          y: { delay: index * 0.05, duration: 0.3 },
          boxShadow: isCrunch || isEmergency
            ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
            : {},
        }}
        className={`card-surface ${getCrisisClass(mode)}`}
        onClick={handleClick}
        style={{
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          border: isEmergency
            ? '1px solid rgba(239,68,68,0.6)'
            : isCrunch
              ? '1px solid rgba(239,68,68,0.3)'
              : undefined,
        }}
      >
        {/* EMERGENCY: animated background gradient */}
        {isEmergency && (
          <motion.div
            animate={{ opacity: [0.05, 0.12, 0.05] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(153,27,27,0.1))',
              borderRadius: 'inherit',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Color accent bar */}
        <div style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: 3,
          background: color,
          borderRadius: '4px 0 0 4px',
        }} />

        <div style={{ paddingLeft: '0.5rem' }}>
          {/* Header row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '0.5rem',
          }}>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: compact ? '0.85rem' : '0.95rem',
                fontWeight: 700,
                marginBottom: '0.25rem',
                lineHeight: 1.3,
              }}>
                {isEmergency && '🚨 '}{task.title}
              </h3>
              <Badge variant={mode.toLowerCase()}>
                {modeEmoji[mode]} {mode}
              </Badge>
            </div>

            {/* Real-time countdown — updates every second */}
            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '0.75rem' }}>
              <motion.div
                animate={isEmergency ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
                className="font-mono"
                style={{
                  fontSize: mode === 'CRUNCH' || isEmergency ? '1.1rem' : '0.85rem',
                  fontWeight: 800,
                  color,
                  letterSpacing: '0.02em',
                }}
              >
                {countdown}
              </motion.div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                remaining
              </div>
            </div>
          </div>

          {/* Quick action */}
          {!compact && task.quickStartAction && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(124,58,237,0.08)',
              padding: '0.5rem 0.65rem',
              borderRadius: 8,
              marginTop: '0.5rem',
              fontSize: '0.75rem',
              color: '#A78BFA',
            }}>
              <Zap size={14} />
              <span style={{ fontWeight: 500 }}>{task.quickStartAction}</span>
            </div>
          )}

          {/* Footer */}
          {!compact && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginTop: '0.65rem',
              fontSize: '0.7rem',
              color: 'var(--text-secondary)',
            }}>
              {task.agentPrepared && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#10B981' }}>
                  <FileText size={12} /> Prepared
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <Clock size={12} /> {task.estimatedHours}h estimated
              </span>
              {task.docUrl && !task.docUrl.includes('demo-') && (
                <a
                  href={task.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#A78BFA', textDecoration: 'none' }}
                >
                  <ExternalLink size={12} /> Doc
                </a>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
