import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Terminal, Clock } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useAgentStore from '../store/agentStore';
import ShadowAgentPanel from '../components/agents/ShadowAgentPanel';
import AgentActivityFeed from '../components/agents/AgentActivityFeed';
import { formatRelativeTime } from '../utils/deadlineParser';

export default function ShadowAgent() {
  const { isDemo, accessToken } = useAuthStore();
  const { activity, fetchActivity, isRunning, triggerAgent, lastRunTime } = useAgentStore();

  useEffect(() => {
    fetchActivity(isDemo);
  }, [isDemo]);

  const handleTrigger = async () => {
    await triggerAgent(accessToken);
    fetchActivity(isDemo);
  };

  return (
    <div className="page-container" style={{ background: 'var(--bg-primary)' }}>
      {/* Mission control header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '1.25rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Terminal size={18} color="#10B981" />
          <span className="font-mono" style={{ fontSize: '0.7rem', color: '#10B981', letterSpacing: '0.1em' }}>
            CLUTCH MISSION CONTROL
          </span>
        </div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
          Shadow Agent
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.25rem' }}>
          What Clutch did while you were away
        </p>
      </motion.div>

      {/* Agent control panel */}
      <div style={{ marginBottom: '1.5rem' }}>
        <ShadowAgentPanel
          isRunning={isRunning}
          onTrigger={handleTrigger}
          lastRunTime={lastRunTime}
        />
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.5rem', marginBottom: '1.5rem',
      }}>
        {[
          { label: 'Tasks Prepared', value: activity.length, color: '#A78BFA' },
          { label: 'Docs Created', value: activity.reduce((a, act) => a + (act.actions.includes('created_doc') ? 1 : 0), 0), color: '#10B981' },
          { label: 'Calendar Blocks', value: activity.reduce((a, act) => a + (act.calendarEventIds?.length || 0), 0), color: '#3B82F6' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 12, padding: '0.75rem',
            textAlign: 'center',
          }}>
            <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 800, color }}>
              {value}
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Activity feed header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        marginBottom: '1rem',
      }}>
        <Clock size={15} color="var(--text-secondary)" />
        <span className="font-mono" style={{
          fontSize: '0.65rem', color: 'var(--text-secondary)',
          textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          Activity Log
        </span>
      </div>

      {/* Feed */}
      <AgentActivityFeed activity={activity} />

      {/* Running state overlay */}
      {isRunning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'fixed', bottom: 80, left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(16,185,129,0.9)',
            padding: '0.75rem 1.5rem',
            borderRadius: 100, zIndex: 100,
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontSize: '0.85rem', fontWeight: 700, color: '#fff',
          }}
        >
          <Bot size={18} className="agent-running" />
          Agent is running...
        </motion.div>
      )}
    </div>
  );
}
