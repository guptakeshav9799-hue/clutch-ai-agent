import { create } from 'zustand';
import { api } from '../services/api';
import { showAgentCompleteNotification, showGmailScanNotification } from '../services/notifications';

const DEMO_ACTIVITY = [
  {
    id: 'demo-activity-001',
    userId: 'demo-user-001',
    taskId: 'demo-task-001',
    taskTitle: 'CS301 Data Structures Lab Report',
    actions: ['generated_breakdown', 'created_doc', 'blocked_calendar'],
    docUrl: 'https://docs.google.com/document/d/demo-001/edit',
    calendarEventIds: ['demo-cal-001a', 'demo-cal-001b'],
    completedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    status: 'completed',
  },
  {
    id: 'demo-activity-002',
    userId: 'demo-user-001',
    taskId: 'demo-task-002',
    taskTitle: 'Technical Interview Prep - TechCorp',
    actions: ['generated_breakdown', 'created_doc', 'blocked_calendar'],
    docUrl: 'https://docs.google.com/document/d/demo-002/edit',
    calendarEventIds: ['demo-cal-002a', 'demo-cal-002b', 'demo-cal-002c'],
    completedAt: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(),
    status: 'completed',
  },
  {
    id: 'demo-activity-003',
    userId: 'demo-user-001',
    taskId: 'demo-task-003',
    taskTitle: 'IEEE Research Paper Submission',
    actions: ['generated_breakdown', 'created_doc', 'blocked_calendar'],
    docUrl: 'https://docs.google.com/document/d/demo-003/edit',
    calendarEventIds: ['demo-cal-003a'],
    completedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    status: 'completed',
  },
];

const DEMO_POINTS = {
  clutchPoints: 1750,
  currentStreak: 5,
  longestStreak: 12,
  unlockedFeatures: ['deep_dive'],
};

const UNLOCKABLE_FEATURES = [
  { id: 'deep_dive', name: 'Deep Dive Mode', cost: 1000, icon: '🔬', description: 'AI generates a 10-page comprehensive research doc instead of basic outline' },
  { id: 'auto_pilot', name: 'Auto-Pilot Week', cost: 2500, icon: '✈️', description: 'AI schedules and time-blocks your entire next 7 days automatically' },
  { id: 'shadow_pro', name: 'Shadow Agent Pro', cost: 5000, icon: '🤖', description: 'Agent checks your Gmail every 4 hours instead of daily' },
  { id: 'dna_oracle', name: 'DNA Oracle', cost: 8000, icon: '🔮', description: 'Unlocks predictive warnings 7 days in advance instead of 3 days' },
  { id: 'clutch_legend', name: 'Clutch Legend', cost: 15000, icon: '👑', description: 'Legendary badge + profile flair' },
];

const useAgentStore = create((set, get) => ({
  activity: [],
  isRunning: false,
  lastRunTime: null,
  clutchPoints: 0,
  currentStreak: 0,
  longestStreak: 0,
  unlockedFeatures: [],
  features: UNLOCKABLE_FEATURES,
  dnaProfile: null,
  isLoadingDNA: false,
  error: null,

  fetchActivity: async (isDemo = false) => {
    try {
      if (isDemo) {
        set({ activity: DEMO_ACTIVITY, lastRunTime: DEMO_ACTIVITY[0]?.completedAt });
        return;
      }
      const data = await api.getActivity();
      set({
        activity: data.activity || [],
        lastRunTime: data.activity?.[0]?.completedAt || null,
      });
    } catch {
      set({ activity: DEMO_ACTIVITY, lastRunTime: DEMO_ACTIVITY[0]?.completedAt });
    }
  },

  triggerAgent: async (accessToken) => {
    set({ isRunning: true, error: null });
    try {
      const data = await api.runAgent(accessToken);
      const count = data.results?.length || data.tasksProcessed || 0;
      set({
        isRunning: false,
        lastRunTime: new Date().toISOString(),
        activity: data.results ? [...data.results, ...get().activity] : get().activity,
      });
      showAgentCompleteNotification(count);
      return data;
    } catch (error) {
      set({ isRunning: false, error: error.message });
      // Return demo data on error
      return {
        success: true,
        results: DEMO_ACTIVITY,
        tasksProcessed: 3,
      };
    }
  },

  fetchPoints: async (isDemo = false) => {
    try {
      if (isDemo) {
        set(DEMO_POINTS);
        return;
      }
      const data = await api.getPoints();
      set({
        clutchPoints: data.clutchPoints || 0,
        currentStreak: data.currentStreak || 0,
        longestStreak: data.longestStreak || 0,
        unlockedFeatures: data.unlockedFeatures || [],
      });
    } catch {
      set(DEMO_POINTS);
    }
  },

  addPoints: (amount) => {
    set(state => ({ clutchPoints: state.clutchPoints + amount }));
  },

  unlockFeature: async (featureId, cost) => {
    const { clutchPoints } = get();
    if (clutchPoints < cost) return false;
    
    try {
      await api.unlockFeature(featureId, cost);
    } catch {
      // Continue in demo mode
    }
    
    set(state => ({
      clutchPoints: state.clutchPoints - cost,
      unlockedFeatures: [...state.unlockedFeatures, featureId],
    }));
    return true;
  },

  fetchDNA: async (isDemo = false) => {
    set({ isLoadingDNA: true });
    try {
      if (isDemo) {
        set({
          dnaProfile: {
            procrastination_type: 'Last-Minute Hero',
            average_start_delay_hours: 36,
            best_performance_time: 'evening',
            strongest_task_type: 'assignment',
            weakest_task_type: 'exam',
            prediction: "You'll likely start panicking about your next task 8 hours before the deadline",
            personalized_tip: 'Try the 2-minute rule: commit to just 2 minutes of work. Once started, you usually keep going.',
            dna_score: 42,
          },
          isLoadingDNA: false,
        });
        return;
      }
      const data = await api.getDNAProfile();
      set({
        dnaProfile: data.profile,
        isLoadingDNA: false,
      });
    } catch {
      set({
        dnaProfile: {
          procrastination_type: 'Last-Minute Hero',
          average_start_delay_hours: 36,
          best_performance_time: 'evening',
          strongest_task_type: 'assignment',
          weakest_task_type: 'exam',
          prediction: "You'll likely start panicking about your next task 8 hours before the deadline",
          personalized_tip: 'Try the 2-minute rule: commit to just 2 minutes of work. Once started, you usually keep going.',
          dna_score: 42,
        },
        isLoadingDNA: false,
      });
    }
  },
}));

export default useAgentStore;
