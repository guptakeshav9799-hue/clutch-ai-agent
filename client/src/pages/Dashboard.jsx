import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useTaskStore from '../store/taskStore';
import useAgentStore from '../store/agentStore';
import TaskCard from '../components/dashboard/TaskCard';
import CrisisCard from '../components/dashboard/CrisisCard';
import ProofOfWorkCard from '../components/dashboard/ProofOfWorkCard';
import StreakBanner from '../components/dashboard/StreakBanner';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, accessToken, isDemo } = useAuthStore();
  const { tasks, fetchTasks, scanGmail, isLoading } = useTaskStore();
  const { activity, fetchActivity, fetchPoints, clutchPoints, currentStreak, longestStreak, triggerAgent } = useAgentStore();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    fetchTasks(isDemo);
    fetchActivity(isDemo);
    fetchPoints(isDemo);

    // Show onboarding for first-time users
    if (!localStorage.getItem('clutch_onboarded')) {
      setShowOnboarding(true);
    }
  }, [isDemo]);

  const handleGmailScan = async () => {
    setScanning(true);
    try {
      const result = await scanGmail(accessToken);
      setScanResult(result);
    } catch (e) {
      setScanResult({ tasks: [], message: 'Gmail scan failed. Running in demo mode.' });
    }
    setScanning(false);
  };

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const calTasks = pendingTasks.filter(t =>
    t.currentCrisisMode && !['CRUNCH', 'EMERGENCY', 'SURVIVAL'].includes(t.currentCrisisMode.mode)
  );
  const firstName = user?.displayName?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page-container">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '1.25rem' }}
      >
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          {greeting}, {firstName}. 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
          Clutch has been busy while you were away.
        </p>
        {isDemo && (
          <span style={{
            display: 'inline-block',
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.2)',
            color: '#F59E0B',
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: '0.2rem 0.6rem',
            borderRadius: 100,
            marginTop: '0.35rem',
          }}>
            DEMO MODE
          </span>
        )}
      </motion.div>

      {/* Streak */}
      {currentStreak > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <StreakBanner currentStreak={currentStreak} longestStreak={longestStreak} />
        </div>
      )}

      {/* Gmail Scan notification */}
      <AnimatePresence>
        {scanResult && scanResult.tasks?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 14, padding: '0.85rem 1rem',
              marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '0.65rem',
            }}
          >
            <CheckCircle size={18} color="#10B981" />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10B981' }}>
                Clutch found {scanResult.tasks.length} new task{scanResult.tasks.length !== 1 ? 's' : ''} in your inbox!
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Shadow Agent is preparing them now...
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proof of Work */}
      {activity.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <ProofOfWorkCard activity={activity} lastRunTime={activity[0]?.completedAt} />
          <button
            onClick={() => navigate('/agent')}
            style={{
              background: 'none', border: 'none',
              color: '#A78BFA', cursor: 'pointer',
              fontSize: '0.75rem', fontWeight: 600,
              marginTop: '0.5rem',
              display: 'flex', alignItems: 'center', gap: '0.25rem',
            }}
          >
            See full activity <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* Tasks in Crisis */}
      {pendingTasks.some(t => t.currentCrisisMode && ['CRUNCH', 'EMERGENCY', 'SURVIVAL'].includes(t.currentCrisisMode.mode)) && (
        <div style={{ marginBottom: '1.5rem' }}>
          <CrisisCard tasks={pendingTasks} />
        </div>
      )}

      {/* Gmail Scan CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ marginBottom: '1.5rem' }}
      >
        <button
          id="scan-gmail-btn"
          onClick={handleGmailScan}
          disabled={scanning}
          style={{
            width: '100%',
            background: scanning ? 'var(--bg-surface)' : 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(124,58,237,0.1))',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 14, padding: '1rem',
            cursor: scanning ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            transition: 'all 0.2s',
          }}
        >
          {scanning ? (
            <RefreshCw size={20} color="#3B82F6" style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <Mail size={20} color="#3B82F6" />
          )}
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#93C5FD' }}>
              {scanning ? 'Scanning your Gmail...' : 'Scan Gmail for Deadlines'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {scanning ? 'AI is reading your emails' : 'Let AI find tasks you might have missed'}
            </div>
          </div>
          {!scanning && <ArrowRight size={16} color="#3B82F6" style={{ marginLeft: 'auto' }} />}
        </button>
      </motion.div>

      {/* Upcoming Tasks */}
      {calTasks.length > 0 && (
        <div>
          <h2 style={{
            fontSize: '0.9rem', fontWeight: 700,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            marginBottom: '0.75rem',
          }}>
            Upcoming Tasks
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {calTasks.slice(0, 5).map((task, i) => (
              <TaskCard key={task.id} task={task} index={i} compact />
            ))}
          </div>
          {calTasks.length > 5 && (
            <button
              onClick={() => navigate('/tasks')}
              style={{
                background: 'none', border: 'none',
                color: '#A78BFA', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 600,
                marginTop: '0.75rem',
                display: 'flex', alignItems: 'center', gap: '0.25rem',
              }}
            >
              View all {calTasks.length} tasks <ArrowRight size={13} />
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {pendingTasks.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '4rem 1rem' }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            You're all caught up!
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            No pending tasks. Scan your Gmail or add a task manually.
          </p>
        </motion.div>
      )}

      {/* Onboarding tooltip */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed', bottom: 80, left: '1rem', right: '1rem',
              background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
              borderRadius: 16, padding: '1.25rem',
              zIndex: 90, maxWidth: 400, margin: '0 auto',
              boxShadow: '0 20px 50px rgba(124,58,237,0.4)',
            }}
          >
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              👋 Welcome to Clutch!
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Start by scanning your Gmail to let the AI find your deadlines. Then visit the Shadow Agent to see what Clutch has already prepared.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => { handleGmailScan(); setShowOnboarding(false); localStorage.setItem('clutch_onboarded', '1'); }}
                style={{
                  flex: 1, background: '#fff', color: '#7C3AED',
                  border: 'none', padding: '0.65rem',
                  borderRadius: 10, cursor: 'pointer',
                  fontSize: '0.82rem', fontWeight: 700,
                }}
              >
                Scan Gmail
              </button>
              <button
                onClick={() => { setShowOnboarding(false); localStorage.setItem('clutch_onboarded', '1'); }}
                style={{
                  background: 'rgba(255,255,255,0.15)', color: '#fff',
                  border: 'none', padding: '0.65rem 1rem',
                  borderRadius: 10, cursor: 'pointer',
                  fontSize: '0.82rem',
                }}
              >
                Skip
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
