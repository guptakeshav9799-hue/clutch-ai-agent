import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Play, Radio, Shield, Cpu, Check, Loader, FileText, Calendar } from 'lucide-react';
import Button from '../ui/Button';

const AGENT_STEPS = [
  { id: 'scan', icon: Bot, label: 'Reading pending tasks from Firestore...', color: '#A78BFA' },
  { id: 'breakdown', icon: Cpu, label: 'Generating AI task breakdown with Gemini...', color: '#06B6D4' },
  { id: 'doc', icon: FileText, label: 'Creating Google Doc with task outline...', color: '#10B981' },
  { id: 'calendar', icon: Calendar, label: 'Blocking focus time on Google Calendar...', color: '#3B82F6' },
  { id: 'save', icon: Check, label: 'Saving activity to Firestore...', color: '#F59E0B' },
];

export default function ShadowAgentPanel({ isRunning, onTrigger, lastRunTime }) {
  const [runCount, setRunCount] = useState(0);
  const [currentStep, setCurrentStep] = useState(-1);

  const handleTrigger = async () => {
    setRunCount(c => c + 1);
    setCurrentStep(0);

    // Animate through steps as agent runs
    for (let i = 0; i < AGENT_STEPS.length; i++) {
      setCurrentStep(i);
      await new Promise(r => setTimeout(r, 1800));
    }

    await onTrigger();
    setCurrentStep(-1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.05), rgba(6,182,212,0.05))',
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: 16,
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Scan line effect when running */}
      {isRunning && (
        <div style={{
          position: 'absolute',
          left: 0, right: 0,
          height: 2,
          background: 'linear-gradient(90deg, transparent, #10B981, transparent)',
          animation: 'scan-line 2s linear infinite',
          zIndex: 1,
        }} />
      )}

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: currentStep >= 0 ? '1.25rem' : '1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div className={isRunning ? 'agent-running' : ''} style={{
            width: 40, height: 40, borderRadius: 12,
            background: isRunning
              ? 'linear-gradient(135deg, #10B981, #06B6D4)'
              : 'rgba(16,185,129,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bot size={22} color={isRunning ? '#fff' : '#10B981'} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
              Shadow Agent
            </h3>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              fontSize: '0.7rem',
              color: isRunning ? '#10B981' : 'var(--text-secondary)',
            }}>
              <Radio size={10} />
              {isRunning ? 'Agent is running...' : lastRunTime
                ? `Last run: ${new Date(lastRunTime).toLocaleTimeString()}`
                : 'Idle — Ready to deploy'}
            </div>
          </div>
        </div>

        <Button
          onClick={handleTrigger}
          disabled={isRunning || currentStep >= 0}
          loading={isRunning}
          icon={Play}
          style={{ fontSize: '0.8rem', padding: '0.6rem 1rem' }}
        >
          {isRunning || currentStep >= 0 ? 'Running...' : 'Deploy'}
        </Button>
      </div>

      {/* Real-time step progress */}
      <AnimatePresence>
        {currentStep >= 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: 12,
              padding: '1rem',
              marginBottom: '1rem',
              overflow: 'hidden',
            }}
          >
            <div className="font-mono" style={{ fontSize: '0.6rem', color: '#10B981', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>
              ▶ AGENT EXECUTION LOG
            </div>
            {AGENT_STEPS.map((step, i) => {
              const Icon = step.icon;
              const status = i < currentStep ? 'done' : i === currentStep ? 'running' : 'pending';
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: status === 'pending' ? 0.3 : 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    marginBottom: '0.4rem',
                    fontSize: '0.72rem',
                  }}
                >
                  {status === 'done' && <Check size={12} color="#10B981" />}
                  {status === 'running' && <Loader size={12} color={step.color} style={{ animation: 'spin 1s linear infinite' }} />}
                  {status === 'pending' && <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />}
                  <span style={{ color: status === 'running' ? step.color : status === 'done' ? '#10B981' : 'var(--text-secondary)' }}>
                    {step.label}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status indicators */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.75rem',
      }}>
        {[
          { icon: Shield, label: 'Gmail Watch', status: 'Active', color: '#10B981' },
          { icon: Cpu, label: 'Doc Generator', status: 'Ready', color: '#3B82F6' },
          { icon: Radio, label: 'Calendar Sync', status: 'Active', color: '#10B981' },
        ].map(({ icon: Icon, label, status, color }) => (
          <div key={label} style={{
            background: 'rgba(0,0,0,0.2)',
            borderRadius: 10,
            padding: '0.65rem',
            textAlign: 'center',
          }}>
            <Icon size={16} color={color} style={{ margin: '0 auto 0.35rem' }} />
            <div className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
              {label}
            </div>
            <div className="font-mono" style={{ fontSize: '0.65rem', color, fontWeight: 600 }}>
              {status}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
