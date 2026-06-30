import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Mail, ClipboardList, Zap, Copy, Check, X } from 'lucide-react';
import { useCrisisMode } from '../../hooks/useCrisisMode';
import { useGemini } from '../../hooks/useGemini';
import Button from '../ui/Button';

export default function CrisisMode({ task, onDismiss }) {
  const { mode, hoursRemaining, countdown } = useCrisisMode(task.deadline);
  const { getEmergencyPlan, isLoading } = useGemini();
  const [plan, setPlan] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (mode === 'EMERGENCY' || mode === 'SURVIVAL') {
      getEmergencyPlan(task.title, Math.round(hoursRemaining)).then(setPlan);
    }
  }, [mode]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (mode === 'SURVIVAL') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: 'fixed', inset: 0,
          background: 'linear-gradient(135deg, #450a0a, #7f1d1d, #450a0a)',
          zIndex: 200,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div className="glitch-text" style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>💀</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#FEE2E2', marginBottom: '0.5rem' }}>
          SURVIVAL MODE
        </h1>
        <p style={{ color: '#FCA5A5', marginBottom: '2rem', maxWidth: 300 }}>
          Done is better than perfect. Focus on minimum viable submission.
        </p>
        <div className="font-mono" style={{
          fontSize: '3rem', fontWeight: 900, color: '#fff',
          marginBottom: '2rem',
          textShadow: '0 0 30px rgba(239,68,68,0.8)',
        }}>
          {countdown}
        </div>
        {plan && (
          <div style={{ maxWidth: 400, width: '100%', textAlign: 'left' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 14, padding: '1rem', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FCA5A5', marginBottom: '0.5rem' }}>
                MINIMUM VIABLE SUBMISSION
              </p>
              <p style={{ fontSize: '0.85rem', color: '#FEE2E2', lineHeight: 1.5 }}>
                {plan.mvs_description}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {plan.survival_steps.map((step, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: 10, padding: '0.65rem',
                }}>
                  <span style={{ color: '#FCA5A5', fontWeight: 800, flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ fontSize: '0.8rem', color: '#FEE2E2' }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <button onClick={onDismiss} style={{
          marginTop: '2rem', background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#FEE2E2', padding: '0.75rem 2rem',
          borderRadius: 12, cursor: 'pointer', fontSize: '0.9rem',
        }}>
          I understand — let me work
        </button>
      </motion.div>
    );
  }

  if (mode === 'EMERGENCY') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: 'fixed', inset: 0,
          background: 'linear-gradient(135deg, #450a0a, #7f1d1d)',
          backgroundSize: '400% 400%',
          zIndex: 200,
          display: 'flex', flexDirection: 'column',
          padding: '1.5rem',
          overflowY: 'auto',
        }}
        className="crisis-emergency"
      >
        <button
          onClick={onDismiss}
          style={{
            alignSelf: 'flex-end', background: 'rgba(255,255,255,0.1)',
            border: 'none', color: '#FEE2E2', cursor: 'pointer',
            borderRadius: 8, padding: '0.4rem',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ maxWidth: 500, margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <AlertTriangle size={48} color="#FCA5A5" style={{ margin: '0 auto 0.75rem' }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FEE2E2' }}>
              EMERGENCY MODE
            </h1>
            <p style={{ color: '#FCA5A5', fontSize: '0.85rem' }}>{task.title}</p>
            <div className="font-mono" style={{
              fontSize: '2.5rem', fontWeight: 900, color: '#fff',
              margin: '0.75rem 0',
              textShadow: '0 0 20px rgba(239,68,68,0.6)',
            }}>
              {countdown}
            </div>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', color: '#FCA5A5' }}>
              <div className="agent-running" style={{ fontSize: '0.9rem' }}>
                AI is generating your emergency plan...
              </div>
            </div>
          ) : plan ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Extension Email */}
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 14, padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Mail size={16} color="#FCA5A5" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FCA5A5' }}>
                      EXTENSION REQUEST EMAIL (AI-Drafted)
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(plan.extension_email)}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none', color: '#FEE2E2',
                      cursor: 'pointer', borderRadius: 6,
                      padding: '0.3rem 0.6rem',
                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                      fontSize: '0.7rem',
                    }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre style={{
                  fontSize: '0.75rem', color: '#FEE2E2',
                  whiteSpace: 'pre-wrap', lineHeight: 1.6,
                  fontFamily: 'Inter, sans-serif',
                }}>
                  {plan.extension_email}
                </pre>
              </div>

              {/* MVS */}
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 14, padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <ClipboardList size={16} color="#FCA5A5" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FCA5A5' }}>
                    MINIMUM VIABLE SUBMISSION
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#FEE2E2', lineHeight: 1.5 }}>
                  {plan.mvs_description}
                </p>
              </div>

              {/* Survival Steps */}
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 14, padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
                  <Zap size={16} color="#FCA5A5" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FCA5A5' }}>
                    SURVIVAL PLAN
                  </span>
                </div>
                {plan.survival_steps.map((step, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
                    marginBottom: '0.5rem',
                  }}>
                    <span style={{ color: '#EF4444', fontWeight: 800, flexShrink: 0 }}>{i + 1}.</span>
                    <span style={{ fontSize: '0.8rem', color: '#FEE2E2', lineHeight: 1.4 }}>{step}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={onDismiss}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#FEE2E2', padding: '0.85rem',
                  borderRadius: 12, cursor: 'pointer',
                  fontSize: '0.9rem', fontWeight: 600,
                }}
              >
                ✊ I'm on it — Go to task
              </button>
            </div>
          ) : null}
        </div>
      </motion.div>
    );
  }

  return null;
}
