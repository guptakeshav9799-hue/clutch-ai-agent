import { motion } from 'framer-motion';
import { Bot, FileText, Calendar, Mail, ExternalLink } from 'lucide-react';
import { formatRelativeTime } from '../../utils/deadlineParser';

const ACTION_ICONS = {
  generated_breakdown: { icon: Bot, color: '#A78BFA', label: 'Generated task breakdown' },
  created_doc: { icon: FileText, color: '#10B981', label: 'Created starter document' },
  blocked_calendar: { icon: Calendar, color: '#3B82F6', label: 'Blocked time in calendar' },
  scanned_gmail: { icon: Mail, color: '#F59E0B', label: 'Scanned Gmail for deadlines' },
};

export default function ProofOfWorkCard({ activity, lastRunTime }) {
  const recentActions = activity.slice(0, 3);

  return (
    <motion.div
      className="card-surface"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'rgba(124,58,237,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Bot size={18} color="#A78BFA" />
        </div>
        <div>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>What Clutch Did For You</h3>
          {lastRunTime && (
            <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
              Last run: {formatRelativeTime(lastRunTime)}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {recentActions.map((act, i) => (
          <div key={act.id || i}>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '0.35rem',
            }}>
              {act.taskTitle}
            </div>
            {act.actions.map((action, j) => {
              const info = ACTION_ICONS[action] || ACTION_ICONS.generated_breakdown;
              const Icon = info.icon;
              return (
                <div key={j} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.3rem 0',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                }}>
                  <Icon size={14} color={info.color} />
                  <span>{info.label}</span>
                  <span style={{ color: '#10B981' }}>✓</span>
                </div>
              );
            })}
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
                  marginTop: '0.25rem',
                }}
              >
                Open Doc <ExternalLink size={10} />
              </a>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
