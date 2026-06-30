import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, RefreshCw } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useAgentStore from '../store/agentStore';
import ProcrastinationDNA from '../components/dna/ProcrastinationDNA';
import useTaskStore from '../store/taskStore';

export default function ProcrastinationDNAPage() {
  const { isDemo } = useAuthStore();
  const { dnaProfile, isLoadingDNA, fetchDNA } = useAgentStore();
  const { tasks } = useTaskStore();

  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  useEffect(() => {
    fetchDNA(isDemo);
  }, [isDemo]);

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '1.5rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{
              fontSize: '1.4rem', fontWeight: 900,
              background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}>
              Your DNA
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.25rem' }}>
              Your personal procrastination profile
            </p>
          </div>
          <button
            onClick={() => fetchDNA(isDemo)}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-secondary)', cursor: 'pointer',
              padding: '0.5rem',
            }}
          >
            <RefreshCw size={18} className={isLoadingDNA ? 'animate-spin' : ''} />
          </button>
        </div>
      </motion.div>

      {isLoadingDNA ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="skeleton" style={{ height: 160, borderRadius: 20 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}
          </div>
        </div>
      ) : (
        <ProcrastinationDNA
          profile={dnaProfile}
          completedTasks={isDemo ? 8 : completedTasks}
        />
      )}
    </div>
  );
}
