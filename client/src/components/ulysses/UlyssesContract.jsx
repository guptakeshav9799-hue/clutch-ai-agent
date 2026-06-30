import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, Plus, X, Check, AlertTriangle, Trophy, Clock } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const CONSEQUENCE_OPTIONS = [
  { id: 'study_group', label: 'Send a confession message to my study group', type: 'message' },
  { id: 'no_social', label: 'No social media for 24 hours', type: 'action' },
  { id: 'chai', label: 'I owe a friend a chai', type: 'action' },
  { id: 'custom', label: 'Custom consequence...', type: 'custom' },
];

const REWARD_OPTIONS = [
  { id: 'netflix', label: '🎬 Unlock 2 hours guilt-free Netflix' },
  { id: 'food', label: '🍕 Treat myself to my favorite food' },
  { id: 'custom', label: '✏️ Custom reward...' },
];

export default function UlyssesContract({ taskId, taskTitle, existingContract, onSave, onClose }) {
  const [selectedConsequence, setSelectedConsequence] = useState(existingContract?.consequence || '');
  const [selectedReward, setSelectedReward] = useState(existingContract?.reward || '');
  const [consequenceMessage, setConsequenceMessage] = useState(existingContract?.consequenceMessage || '');
  const [customConsequence, setCustomConsequence] = useState('');
  const [customReward, setCustomReward] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const consequence = selectedConsequence === 'custom' ? customConsequence : selectedConsequence;
    const reward = selectedReward === 'custom' ? customReward : selectedReward;

    if (!consequence || !reward) return;

    setSaving(true);
    await onSave({ taskId, consequence, reward, consequenceMessage });
    setSaving(false);
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(167,139,250,0.05))',
        border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: 12,
        padding: '0.85rem 1rem',
        marginBottom: '1.25rem',
        display: 'flex', alignItems: 'center', gap: '0.65rem',
      }}>
        <ScrollText size={20} color="#A78BFA" />
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#A78BFA' }}>ULYSSES CONTRACT</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            "{taskTitle}"
          </div>
        </div>
      </div>

      {/* Consequence section */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
          <AlertTriangle size={15} color="#EF4444" />
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#EF4444' }}>
            IF I DON'T FINISH ON TIME...
          </label>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {CONSEQUENCE_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setSelectedConsequence(opt.id)}
              style={{
                background: selectedConsequence === opt.id ? 'rgba(239,68,68,0.1)' : 'var(--bg-primary)',
                border: `1px solid ${selectedConsequence === opt.id ? 'rgba(239,68,68,0.4)' : 'var(--border-color)'}`,
                borderRadius: 10,
                padding: '0.65rem 0.85rem',
                color: selectedConsequence === opt.id ? '#FCA5A5' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              {opt.label}
              {selectedConsequence === opt.id && <Check size={14} color="#EF4444" />}
            </button>
          ))}
          {selectedConsequence === 'custom' && (
            <input
              className="input-field"
              placeholder="Describe your consequence..."
              value={customConsequence}
              onChange={e => setCustomConsequence(e.target.value)}
            />
          )}
        </div>
        {(selectedConsequence === 'study_group') && (
          <div style={{ marginTop: '0.5rem' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
              Message to send (you'll be shown this on deadline breach):
            </label>
            <textarea
              className="input-field"
              style={{ resize: 'vertical', minHeight: 80 }}
              placeholder="Hey everyone, I didn't finish [task] on time. I take full responsibility..."
              value={consequenceMessage}
              onChange={e => setConsequenceMessage(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Reward section */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
          <Trophy size={15} color="#F59E0B" />
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F59E0B' }}>
            IF I FINISH 12+ HOURS EARLY...
          </label>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {REWARD_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setSelectedReward(opt.id)}
              style={{
                background: selectedReward === opt.id ? 'rgba(245,158,11,0.1)' : 'var(--bg-primary)',
                border: `1px solid ${selectedReward === opt.id ? 'rgba(245,158,11,0.4)' : 'var(--border-color)'}`,
                borderRadius: 10,
                padding: '0.65rem 0.85rem',
                color: selectedReward === opt.id ? '#FCD34D' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              {opt.label}
              {selectedReward === opt.id && <Check size={14} color="#F59E0B" />}
            </button>
          ))}
          {selectedReward === 'custom' && (
            <input
              className="input-field"
              placeholder="Describe your reward..."
              value={customReward}
              onChange={e => setCustomReward(e.target.value)}
            />
          )}
        </div>
      </div>

      {/* Contract footer text */}
      <div style={{
        background: 'rgba(124,58,237,0.05)',
        border: '1px solid rgba(124,58,237,0.1)',
        borderRadius: 10,
        padding: '0.65rem',
        fontSize: '0.7rem',
        color: 'var(--text-secondary)',
        marginBottom: '1.25rem',
        fontStyle: 'italic',
        lineHeight: 1.5,
      }}>
        By activating this contract, I commit to completing "{taskTitle}" before the deadline.
        I understand and accept the stated consequence if I fail.
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          loading={saving}
          disabled={!selectedConsequence || !selectedReward}
          style={{ flex: 1 }}
        >
          <ScrollText size={16} /> Activate Contract
        </Button>
      </div>
    </div>
  );
}
