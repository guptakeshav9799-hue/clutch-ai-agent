import { getIdToken } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || '/api';

async function apiRequest(endpoint, options = {}) {
  const token = await getIdToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `API error: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    if (error.message.includes('Token expired')) {
      // Handle token expiry gracefully
      window.dispatchEvent(new CustomEvent('auth-expired'));
    }
    throw error;
  }
}

export const api = {
  // Auth
  verifyToken: (token) => apiRequest('/auth/verify', { method: 'POST', body: JSON.stringify({ token }) }),
  storeTokens: (accessToken, refreshToken) => apiRequest('/auth/tokens', { method: 'POST', body: JSON.stringify({ accessToken, refreshToken }) }),

  // Tasks
  getTasks: () => apiRequest('/tasks'),
  createTask: (task) => apiRequest('/tasks', { method: 'POST', body: JSON.stringify(task) }),
  updateTask: (id, updates) => apiRequest(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  completeTask: (id) => apiRequest(`/tasks/${id}/complete`, { method: 'POST' }),

  // Gmail
  scanGmail: (accessToken) => apiRequest('/gmail/scan', { method: 'POST', body: JSON.stringify({ accessToken }) }),
  gmailStatus: () => apiRequest('/gmail/status'),

  // Agent
  runAgent: (accessToken) => apiRequest('/agent/run', { method: 'POST', body: JSON.stringify({ accessToken }) }),
  runAgentForTask: (taskId, accessToken) => apiRequest(`/agent/run/${taskId}`, { method: 'POST', body: JSON.stringify({ accessToken }) }),
  getActivity: () => apiRequest('/agent/activity'),

  // Calendar
  blockCalendar: (accessToken, taskTitle, schedule) => apiRequest('/calendar/block', { method: 'POST', body: JSON.stringify({ accessToken, taskTitle, suggestedSchedule: schedule }) }),
  calendarStatus: () => apiRequest('/calendar/status'),

  // Docs
  createDoc: (accessToken, taskTitle, taskType, context) => apiRequest('/docs/create', { method: 'POST', body: JSON.stringify({ accessToken, taskTitle, taskType, context }) }),

  // DNA
  getDNAProfile: () => apiRequest('/dna/profile'),
  logDNAEvent: (event, taskId, metadata) => apiRequest('/dna/log', { method: 'POST', body: JSON.stringify({ event, taskId, metadata }) }),

  // Contracts
  createContract: (data) => apiRequest('/contracts/create', { method: 'POST', body: JSON.stringify(data) }),
  triggerContract: (id, result) => apiRequest(`/contracts/${id}/trigger`, { method: 'PUT', body: JSON.stringify({ result }) }),

  // Points
  getPoints: () => apiRequest('/points/balance'),
  unlockFeature: (featureId, cost) => apiRequest('/points/unlock', { method: 'POST', body: JSON.stringify({ featureId, cost }) }),

  // Crisis
  getEmergencyPlan: (taskTitle, hoursRemaining) => apiRequest('/crisis/emergency-plan', { method: 'POST', body: JSON.stringify({ taskTitle, hoursRemaining }) }),
};
