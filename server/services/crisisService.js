const geminiService = require('./geminiService');

function calculateCrisisMode(deadline) {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const hoursRemaining = (deadlineDate - now) / (1000 * 60 * 60);

  if (hoursRemaining < 0) return { mode: 'OVERDUE', hoursRemaining: 0, color: '#6B7280' };
  if (hoursRemaining < 1) return { mode: 'SURVIVAL', hoursRemaining, color: '#991B1B' };
  if (hoursRemaining < 6) return { mode: 'EMERGENCY', hoursRemaining, color: '#DC2626' };
  if (hoursRemaining < 24) return { mode: 'CRUNCH', hoursRemaining, color: '#EF4444' };
  if (hoursRemaining < 48) return { mode: 'ACTIVE', hoursRemaining, color: '#F59E0B' };
  if (hoursRemaining < 72) return { mode: 'PLANNING', hoursRemaining, color: '#3B82F6' };
  return { mode: 'CALM', hoursRemaining, color: '#10B981' };
}

async function getEmergencyPlan(taskTitle, hoursRemaining) {
  return await geminiService.generateEmergencyPlan(taskTitle, hoursRemaining);
}

function calculatePoints(crisisMode) {
  switch (crisisMode) {
    case 'CALM': return 500;
    case 'PLANNING': return 300;
    case 'ACTIVE': return 150;
    case 'CRUNCH': return 50;
    case 'EMERGENCY': return 25;
    case 'SURVIVAL': return 10;
    default: return 0;
  }
}

module.exports = { calculateCrisisMode, getEmergencyPlan, calculatePoints };
