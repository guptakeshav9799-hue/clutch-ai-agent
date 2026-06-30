import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter, CheckCircle, ListTodo, Zap, X } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useTaskStore from '../store/taskStore';
import useAgentStore from '../store/agentStore';
import TaskCard from '../components/dashboard/TaskCard';
import CrisisMode from '../components/crisis/CrisisMode';
import UlyssesContract from '../components/ulysses/UlyssesContract';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { api } from '../services/api';

const TASK_TYPES = ['assignment', 'exam', 'meeting', 'payment', 'interview', 'submission', 'other'];
const PRIORITIES = ['critical', 'high', 'medium', 'low'];

export default function Tasks() {
  const { isDemo, accessToken } = useAuthStore();
  const { tasks, fetchTasks, createTask, completeTask, updateTask, isLoading } = useTaskStore();
  const { addPoints, triggerAgent } = useAgentStore();
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [crisisTask, setCrisisTask] = useState(null);
  const [completing, setCompleting] = useState(null);
  const [celebratePoints, setCelebratePoints] = useState(null);

  const [form, setForm] = useState({
    title: '', deadline: '', type: 'assignment', priority: 'medium', estimatedHours: 4,
  });

  useEffect(() => {
    fetchTasks(isDemo);
  }, [isDemo]);

  const handleCreate = async () => {
    if (!form.title || !form.deadline) return;
    await createTask(form);
    setShowAddModal(false);
    setForm({ title: '', deadline: '', type: 'assignment', priority: 'medium', estimatedHours: 4 });
  };

  const handleComplete = async (task) => {
    setCompleting(task.id);
    const result = await completeTask(task.id);
    addPoints(result.pointsEarned || 0);
    setCelebratePoints(result.pointsEarned || 0);
    setCompleting(null);
    setTimeout(() => setCelebratePoints(null), 3000);
  };

  const handleContract = async (contractData) => {
    await api.createContract(contractData).catch(() => {});
    updateTask(contractData.taskId, { ulyssesContract: contractData });
    setShowContractModal(false);
    setSelectedTask(null);
  };

  const handleAgentRun = async (taskId) => {
    try {
      await api.runAgentForTask(taskId, accessToken);
      updateTask(taskId, { agentPrepared: true });
    } catch (e) {
      updateTask(taskId, { agentPrepared: true }); // Optimistic in demo
    }
  };

  const pending = tasks.filter(t => t.status !== 'completed');
  const completed = tasks.filter(t => t.status === 'completed');

  const filtered = filter === 'completed' ? completed
    : filter === 'pending' ? pending
    : tasks;

  // Check for emergency tasks
  useEffect(() => {
    const emergency = pending.find(t =>
      t.currentCrisisMode && ['EMERGENCY', 'SURVIVAL'].includes(t.currentCrisisMode.mode)
    );
    if (emergency && !crisisTask) {
      setCrisisTask(emergency);
    }
  }, [tasks]);

  return (
    <div className="page-container">
      {/* Crisis overlay */}
      <AnimatePresence>
        {crisisTask && (
          <CrisisMode task={crisisTask} onDismiss={() => setCrisisTask(null)} />
        )}
      </AnimatePresence>

      {/* Points celebration */}
      <AnimatePresence>
        {celebratePoints !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            style={{
              position: 'fixed', bottom: 100, left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
              padding: '0.85rem 1.5rem',
              borderRadius: 100, zIndex: 300,
              fontSize: '1rem', fontWeight: 800, color: '#fff',
              boxShadow: '0 10px 30px rgba(124,58,237,0.5)',
            }}
          >
            🎉 +{celebratePoints} Clutch Points!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '1.25rem',
      }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Tasks</h1>
        <Button icon={Plus} onClick={() => setShowAddModal(true)} style={{ fontSize: '0.85rem', padding: '0.6rem 1rem' }}>
          Add Task
        </Button>
      </div>

      {/* Filter tabs */}
      <div style={{
        display: 'flex', gap: '0.4rem',
        marginBottom: '1.25rem',
        background: 'var(--bg-surface)',
        borderRadius: 12, padding: '0.25rem',
        border: '1px solid var(--border-color)',
      }}>
        {[['all', 'All', tasks.length], ['pending', 'Pending', pending.length], ['completed', 'Done', completed.length]].map(([val, label, count]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            style={{
              flex: 1, padding: '0.5rem',
              borderRadius: 10, border: 'none',
              background: filter === val ? 'rgba(124,58,237,0.15)' : 'transparent',
              color: filter === val ? '#A78BFA' : 'var(--text-secondary)',
              fontWeight: filter === val ? 700 : 400,
              cursor: 'pointer', fontSize: '0.8rem',
              transition: 'all 0.2s',
            }}
          >
            {label} <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>({count})</span>
          </button>
        ))}
      </div>

      {/* Task list */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <ListTodo size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p style={{ fontSize: '0.9rem' }}>No tasks here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((task, i) => (
            <div key={task.id}>
              {task.status === 'completed' ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 16, padding: '1rem',
                    opacity: 0.5,
                    display: 'flex', alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <CheckCircle size={20} color="#10B981" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, textDecoration: 'line-through', color: 'var(--text-secondary)' }}>
                      {task.title}
                    </div>
                    {task.pointsEarned > 0 && (
                      <div style={{ fontSize: '0.7rem', color: '#A78BFA' }}>+{task.pointsEarned} CP earned</div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div>
                  <TaskCard task={task} index={i} />
                  {/* Task action buttons */}
                  <div style={{
                    display: 'flex', gap: '0.4rem',
                    marginTop: '0.4rem', paddingLeft: '0.25rem',
                  }}>
                    <button
                      onClick={() => handleComplete(task)}
                      disabled={completing === task.id}
                      style={{
                        background: 'rgba(16,185,129,0.1)',
                        border: '1px solid rgba(16,185,129,0.2)',
                        color: '#10B981', padding: '0.3rem 0.7rem',
                        borderRadius: 8, cursor: 'pointer',
                        fontSize: '0.7rem', fontWeight: 600,
                      }}
                    >
                      {completing === task.id ? '...' : '✓ Done'}
                    </button>
                    <button
                      onClick={() => { setSelectedTask(task); setShowContractModal(true); }}
                      style={{
                        background: 'rgba(124,58,237,0.1)',
                        border: '1px solid rgba(124,58,237,0.2)',
                        color: '#A78BFA', padding: '0.3rem 0.7rem',
                        borderRadius: 8, cursor: 'pointer',
                        fontSize: '0.7rem', fontWeight: 600,
                      }}
                    >
                      📜 Contract
                    </button>
                    {!task.agentPrepared && (
                      <button
                        onClick={() => handleAgentRun(task.id)}
                        style={{
                          background: 'rgba(6,182,212,0.1)',
                          border: '1px solid rgba(6,182,212,0.2)',
                          color: '#06B6D4', padding: '0.3rem 0.7rem',
                          borderRadius: 8, cursor: 'pointer',
                          fontSize: '0.7rem', fontWeight: 600,
                        }}
                      >
                        🤖 Prepare
                      </button>
                    )}
                    {task.currentCrisisMode?.mode === 'EMERGENCY' && (
                      <button
                        onClick={() => setCrisisTask(task)}
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          color: '#EF4444', padding: '0.3rem 0.7rem',
                          borderRadius: 8, cursor: 'pointer',
                          fontSize: '0.7rem', fontWeight: 700,
                        }}
                      >
                        🚨 Emergency Plan
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Task">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Task Name
            </label>
            <input
              className="input-field"
              placeholder="e.g. CS301 Lab Report"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Deadline
            </label>
            <input
              className="input-field"
              type="datetime-local"
              value={form.deadline}
              onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Type
              </label>
              <select
                className="input-field"
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              >
                {TASK_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Priority
              </label>
              <select
                className="input-field"
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
              >
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Estimated Hours: {form.estimatedHours}h
            </label>
            <input
              type="range" min="1" max="20"
              value={form.estimatedHours}
              onChange={e => setForm(f => ({ ...f, estimatedHours: parseInt(e.target.value) }))}
              style={{ width: '100%', accentColor: '#7C3AED' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
            <Button variant="secondary" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.title || !form.deadline} style={{ flex: 1 }}>
              Create Task
            </Button>
          </div>
        </div>
      </Modal>

      {/* Contract Modal */}
      <Modal isOpen={showContractModal} onClose={() => setShowContractModal(false)} title="" maxWidth="520px">
        {selectedTask && (
          <UlyssesContract
            taskId={selectedTask.id}
            taskTitle={selectedTask.title}
            existingContract={selectedTask.ulyssesContract}
            onSave={handleContract}
            onClose={() => setShowContractModal(false)}
          />
        )}
      </Modal>
    </div>
  );
}
