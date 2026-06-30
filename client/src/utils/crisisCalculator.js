export function calculateCrisisMode(deadline) {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const hoursRemaining = (deadlineDate - now) / (1000 * 60 * 60);

  if (hoursRemaining < 0) return { mode: 'OVERDUE', hoursRemaining: 0, color: '#6B7280', label: 'Overdue' };
  if (hoursRemaining < 1) return { mode: 'SURVIVAL', hoursRemaining, color: '#991B1B', label: 'Survival' };
  if (hoursRemaining < 6) return { mode: 'EMERGENCY', hoursRemaining, color: '#DC2626', label: 'Emergency' };
  if (hoursRemaining < 24) return { mode: 'CRUNCH', hoursRemaining, color: '#EF4444', label: 'Crunch' };
  if (hoursRemaining < 48) return { mode: 'ACTIVE', hoursRemaining, color: '#F59E0B', label: 'Active' };
  if (hoursRemaining < 72) return { mode: 'PLANNING', hoursRemaining, color: '#3B82F6', label: 'Planning' };
  return { mode: 'CALM', hoursRemaining, color: '#10B981', label: 'Calm' };
}

export function getCrisisClass(mode) {
  switch (mode) {
    case 'CRUNCH': return 'crisis-crunch';
    case 'EMERGENCY': return 'crisis-emergency';
    case 'ACTIVE': return 'crisis-active';
    default: return '';
  }
}

export function getBadgeClass(mode) {
  switch (mode) {
    case 'CALM': return 'badge-calm';
    case 'PLANNING': return 'badge-planning';
    case 'ACTIVE': return 'badge-active';
    case 'CRUNCH': return 'badge-crunch';
    case 'EMERGENCY': return 'badge-emergency';
    case 'SURVIVAL': return 'badge-survival';
    default: return 'badge-calm';
  }
}
