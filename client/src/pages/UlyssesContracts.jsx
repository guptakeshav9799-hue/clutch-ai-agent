import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ScrollText, CheckCircle, AlertTriangle, Trophy } from 'lucide-react';
import useTaskStore from '../store/taskStore';
import UlyssesContract from '../components/ulysses/UlyssesContract';
import Modal from '../components/ui/Modal';
import { api } from '../services/api';

export default function UlyssesContracts() {
  const { tasks, updateTask } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const tasksWithContracts = tasks.filter(t => t.ulyssesContract?.isActive);
  const tasksWithoutContracts = tasks.filter(t => !t.ulyssesContract && t.status !== 'completed');

  const handleSave = async (contractData) => {
    await api.createContract(contractData).catch(() => {});
    updateTask(contractData.taskId, { ulyssesContract: { ...contractData, isActive: true } });
    setShowModal(false);
    setSelectedTask(null);
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
          Ulysses Contracts
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.25rem' }}>
          Psychological commitment devices for your deadlines
        </p>
      </motion.div>

      {/* Explanation card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(167,139,250,0.04))',
          border: '1px solid rgba(124,58,237,0.15)',
          borderRadius: 16, padding: '1.1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <ScrollText size={22} color="#A78BFA" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.3rem' }}>
              What is a Ulysses Contract?
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Inspired by Odysseus binding himself to the mast to resist the Sirens.
              Set a personal consequence before starting a task. The pre-committed stakes
              make it psychologically harder to back down when procrastination strikes.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Active contracts */}
      {tasksWithContracts.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{
            fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.07em',
            marginBottom: '0.75rem',
          }}>
            Active Contracts
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {tasksWithContracts.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid rgba(124,58,237,0.2)',
                  borderRadius: 16, padding: '1rem',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {/* Seal watermark */}
                <div style={{
                  position: 'absolute', right: -20, top: -20,
                  width: 80, height: 80,
                  borderRadius: '50%',
                  border: '3px solid rgba(124,58,237,0.08)',
                  fontSize: '1.5rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(124,58,237,0.1)',
                }}>
                  📜
                </div>

                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#A78BFA', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
                  CONTRACT ACTIVE
                </div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.65rem' }}>{task.title}</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'rgba(239,68,68,0.08)', borderRadius: 8, padding: '0.5rem 0.65rem',
                  }}>
                    <AlertTriangle size={14} color="#EF4444" />
                    <div>
                      <div style={{ fontSize: '0.6rem', color: '#EF4444', fontWeight: 700 }}>CONSEQUENCE</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', marginTop: 1 }}>
                        {task.ulyssesContract.consequence}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'rgba(245,158,11,0.08)', borderRadius: 8, padding: '0.5rem 0.65rem',
                  }}>
                    <Trophy size={14} color="#F59E0B" />
                    <div>
                      <div style={{ fontSize: '0.6rem', color: '#F59E0B', fontWeight: 700 }}>REWARD</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', marginTop: 1 }}>
                        {task.ulyssesContract.reward}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Add contract to tasks */}
      {tasksWithoutContracts.length > 0 && (
        <div>
          <h2 style={{
            fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.07em',
            marginBottom: '0.75rem',
          }}>
            Add Contract
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {tasksWithoutContracts.map((task, i) => (
              <motion.button
                key={task.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => { setSelectedTask(task); setShowModal(true); }}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 12, padding: '0.85rem 1rem',
                  cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{task.title}</span>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 600, color: '#A78BFA',
                  background: 'rgba(124,58,237,0.1)',
                  padding: '0.25rem 0.6rem', borderRadius: 8,
                }}>
                  + Contract
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <ScrollText size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p>Add some tasks first to create Ulysses Contracts</p>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="" maxWidth="520px">
        {selectedTask && (
          <UlyssesContract
            taskId={selectedTask.id}
            taskTitle={selectedTask.title}
            existingContract={selectedTask.ulyssesContract}
            onSave={handleSave}
            onClose={() => setShowModal(false)}
          />
        )}
      </Modal>
    </div>
  );
}
