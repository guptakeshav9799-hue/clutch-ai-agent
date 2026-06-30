import { create } from 'zustand';
import { api } from '../services/api';
import { calculateCrisisMode } from '../utils/crisisCalculator';
import { showGmailScanNotification } from '../services/notifications';

// Demo tasks that match the server demo data
const DEMO_TASKS = [
  {
    id: 'demo-task-001',
    userId: 'demo-user-001',
    title: 'CS301 Data Structures Lab Report',
    deadline: new Date(Date.now() + 10 * 3600 * 1000).toISOString(),
    type: 'assignment',
    priority: 'critical',
    estimatedHours: 6,
    source: 'gmail_agent',
    status: 'pending',
    agentPrepared: true,
    docUrl: 'https://docs.google.com/document/d/demo-001/edit',
    calendarEventId: 'demo-cal-001',
    microSteps: [
      { step: 'Review lab experiment notes from weeks 1-6', duration_mins: 45, order: 1 },
      { step: 'Create report outline with required sections', duration_mins: 30, order: 2 },
      { step: 'Write introduction and methodology', duration_mins: 60, order: 3 },
      { step: 'Document results and create data tables', duration_mins: 45, order: 4 },
      { step: 'Write analysis and conclusion', duration_mins: 40, order: 5 },
      { step: 'Proofread and format for submission', duration_mins: 20, order: 6 },
    ],
    suggestedSchedule: [
      { date: new Date().toISOString().split('T')[0], hours: 3, focus: 'Outline and first draft' },
      { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], hours: 3, focus: 'Complete and review' },
    ],
    quickStartAction: 'Open your lab notebook and list all 6 experiments right now',
    context: 'Lab report covering experiments from weeks 1-6, due via university portal',
    ulyssesContract: null,
    completedAt: null,
    pointsEarned: 0,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'demo-task-002',
    userId: 'demo-user-001',
    title: 'Technical Interview Prep - TechCorp',
    deadline: new Date(Date.now() + 96 * 3600 * 1000).toISOString(),
    type: 'interview',
    priority: 'high',
    estimatedHours: 10,
    source: 'gmail_agent',
    status: 'pending',
    agentPrepared: true,
    docUrl: 'https://docs.google.com/document/d/demo-002/edit',
    calendarEventId: 'demo-cal-002',
    microSteps: [
      { step: 'Review common data structure questions', duration_mins: 60, order: 1 },
      { step: 'Practice 5 LeetCode medium problems', duration_mins: 120, order: 2 },
      { step: 'Study system design fundamentals', duration_mins: 90, order: 3 },
      { step: 'Mock interview with a friend', duration_mins: 60, order: 4 },
      { step: 'Review company-specific questions', duration_mins: 45, order: 5 },
    ],
    suggestedSchedule: [
      { date: new Date().toISOString().split('T')[0], hours: 2, focus: 'Data structures review' },
      { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], hours: 3, focus: 'LeetCode practice' },
      { date: new Date(Date.now() + 172800000).toISOString().split('T')[0], hours: 3, focus: 'System design' },
      { date: new Date(Date.now() + 259200000).toISOString().split('T')[0], hours: 2, focus: 'Mock interview' },
    ],
    quickStartAction: 'Open LeetCode and solve one easy array problem right now',
    context: 'Technical interview for Software Engineer Intern position',
    ulyssesContract: null,
    completedAt: null,
    pointsEarned: 0,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'demo-task-003',
    userId: 'demo-user-001',
    title: 'IEEE Research Paper Submission',
    deadline: new Date(Date.now() + 150 * 3600 * 1000).toISOString(),
    type: 'submission',
    priority: 'high',
    estimatedHours: 15,
    source: 'gmail_agent',
    status: 'pending',
    agentPrepared: true,
    docUrl: 'https://docs.google.com/document/d/demo-003/edit',
    calendarEventId: 'demo-cal-003',
    microSteps: [
      { step: 'Finalize research methodology section', duration_mins: 90, order: 1 },
      { step: 'Complete data analysis and create graphs', duration_mins: 120, order: 2 },
      { step: 'Write results and discussion', duration_mins: 120, order: 3 },
      { step: 'Draft abstract and introduction', duration_mins: 60, order: 4 },
      { step: 'Format paper in IEEE template', duration_mins: 45, order: 5 },
      { step: 'Get peer review from lab partner', duration_mins: 60, order: 6 },
      { step: 'Final revisions and submit', duration_mins: 45, order: 7 },
    ],
    suggestedSchedule: [
      { date: new Date().toISOString().split('T')[0], hours: 2, focus: 'Methodology finalization' },
      { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], hours: 3, focus: 'Data analysis' },
      { date: new Date(Date.now() + 172800000).toISOString().split('T')[0], hours: 3, focus: 'Writing results' },
    ],
    quickStartAction: 'Open your research data spreadsheet and identify key findings',
    context: 'IEEE conference paper following specific formatting guidelines',
    ulyssesContract: null,
    completedAt: null,
    pointsEarned: 0,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

const useTaskStore = create((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  gmailScanResult: null,

  fetchTasks: async (isDemo = false) => {
    set({ isLoading: true, error: null });
    try {
      if (isDemo) {
        const tasks = DEMO_TASKS.map(t => ({
          ...t,
          currentCrisisMode: calculateCrisisMode(t.deadline),
        }));
        set({ tasks, isLoading: false });
        return;
      }
      const data = await api.getTasks();
      set({ tasks: data.tasks || [], isLoading: false });
    } catch (error) {
      // Fallback to demo data on error
      const tasks = DEMO_TASKS.map(t => ({
        ...t,
        currentCrisisMode: calculateCrisisMode(t.deadline),
      }));
      set({ tasks, isLoading: false, error: null });
    }
  },

  createTask: async (taskData) => {
    try {
      const data = await api.createTask(taskData);
      set(state => ({
        tasks: [...state.tasks, { ...data.task, currentCrisisMode: calculateCrisisMode(data.task.deadline) }],
      }));
      return data.task;
    } catch (error) {
      // Create locally in demo mode
      const newTask = {
        id: `task-${Date.now()}`,
        ...taskData,
        source: 'manual',
        status: 'pending',
        agentPrepared: false,
        currentCrisisMode: calculateCrisisMode(taskData.deadline),
        createdAt: new Date().toISOString(),
      };
      set(state => ({ tasks: [...state.tasks, newTask] }));
      return newTask;
    }
  },

  completeTask: async (taskId) => {
    try {
      const data = await api.completeTask(taskId);
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: 'completed', pointsEarned: data.pointsEarned } : t),
      }));
      return data;
    } catch (error) {
      const task = get().tasks.find(t => t.id === taskId);
      const crisis = task ? calculateCrisisMode(task.deadline) : { mode: 'CALM' };
      const pointsMap = { CALM: 500, PLANNING: 300, ACTIVE: 150, CRUNCH: 50, EMERGENCY: 25, SURVIVAL: 10 };
      const points = pointsMap[crisis.mode] || 0;
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: 'completed', pointsEarned: points } : t),
      }));
      return { pointsEarned: points, crisisMode: crisis.mode };
    }
  },

  updateTask: async (taskId, updates) => {
    set(state => ({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t),
    }));
    try {
      await api.updateTask(taskId, updates);
    } catch (e) {
      // Keep local update
    }
  },

  scanGmail: async (accessToken) => {
    set({ isLoading: true });
    try {
      const data = await api.scanGmail(accessToken);
      set({ gmailScanResult: data, isLoading: false });
      if (data.tasks && data.tasks.length > 0) {
        set(state => ({
          tasks: [
            ...state.tasks,
            ...data.tasks.map(t => ({ ...t, currentCrisisMode: calculateCrisisMode(t.deadline) })),
          ],
        }));
        showGmailScanNotification(data.tasks.length);
      }
      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  refreshCrisisModes: () => {
    set(state => ({
      tasks: state.tasks.map(t => ({
        ...t,
        currentCrisisMode: calculateCrisisMode(t.deadline),
      })),
    }));
  },

  getTaskById: (id) => get().tasks.find(t => t.id === id),
}));

export default useTaskStore;
