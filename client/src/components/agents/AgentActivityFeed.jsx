import { motion } from 'framer-motion';
import { Bot, FileText, Calendar, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { formatRelativeTime } from '../../utils/deadlineParser';

const ACTION_CONFIG = {
  generated_breakdown: { icon: Bot, color: '#A78BFA', label: 'Task breakdown generated' },
  created_doc: { icon: FileText, color: '#10B981', label: 'Starter document created' },
  blocked_calendar: { icon: Calendar, color: '#3B82F6', label: 'Calendar time blocked' },
};

export default function AgentActivityFeed({ activity }) {
  if (!activity || activity.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem 1rem',
        color: 'var(--text-secondary)',
      }}>
        <Bot size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
        <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>No agent activity yet</p>
        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
          Trigger the Shadow Agent to start preparing your tasks
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      {activity.map((act, i) => (
        <motion.div
          key={act.id || i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          style={{
            position: 'relative',
            paddingLeft: '1.75rem',
            paddingBottom: '1.25rem',
          }}
        >
          {/* Timeline line */}
          {i < activity.length - 1 && (
            <div style={{
              position: 'absolute',
              left: 7,
              top: 20,
              bottom: 0,
              width: 2,
              background: 'var(--border-color)',
            }} />
          )}

          {/* Timeline dot */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 4,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: act.status === 'completed' ? 'rgba(16,185,129,0.2)' : 'rgba(124,58,237,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: act.status === 'completed' ? '#10B981' : '#7C3AED',
            }} />
          </div>

          {/* Content */}
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-color)',
            borderRadius: 12,
            padding: '0.85rem',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '0.5rem',
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                {act.taskTitle}
              </span>
              <span className="font-mono" style={{
                fontSize: '0.6rem',
                color: 'var(--text-secondary)',
                flexShrink: 0,
                marginLeft: '0.5rem',
              }}>
                {formatRelativeTime(act.completedAt)}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {act.actions.map((action, j) => {
                const config = ACTION_CONFIG[action] || ACTION_CONFIG.generated_breakdown;
                const Icon = config.icon;
                return (
                  <div key={j} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.75rem',
                  }}>
                    <Icon size={13} color={config.color} />
                    <span style={{ color: 'var(--text-secondary)' }}>{config.label}</span>
                    <CheckCircle size={11} color="#10B981" />
                  </div>
                );
              })}
            </div>

            {act.docUrl && (
              <a
                href={act.docUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.7rem',
                  color: '#A78BFA',
                  textDecoration: 'none',
                  marginTop: '0.5rem',
                  padding: '0.3rem 0.6rem',
                  background: 'rgba(124,58,237,0.08)',
                  borderRadius: 6,
                }}
              >
                <FileText size={11} />
                Open Document
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
