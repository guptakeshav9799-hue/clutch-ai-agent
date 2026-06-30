const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const firebase = require('../config/firebase-admin');
const { calculateCrisisMode, calculatePoints } = require('../services/crisisService');

// Demo tasks data
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
      { date: new Date(Date.now() + 259200000).toISOString().split('T')[0], hours: 3, focus: 'Introduction and abstract' },
      { date: new Date(Date.now() + 345600000).toISOString().split('T')[0], hours: 2, focus: 'Formatting and review' },
      { date: new Date(Date.now() + 432000000).toISOString().split('T')[0], hours: 2, focus: 'Submit' },
    ],
    quickStartAction: 'Open your research data spreadsheet and identify key findings',
    context: 'IEEE conference paper following specific formatting guidelines',
    ulyssesContract: null,
    completedAt: null,
    pointsEarned: 0,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

// GET /api/tasks
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;

    if (!firebase.db) {
      // Demo mode — return demo tasks with recalculated crisis modes
      const tasks = DEMO_TASKS.map(t => ({
        ...t,
        currentCrisisMode: calculateCrisisMode(t.deadline),
      }));
      return res.json({ tasks });
    }

    const snapshot = await firebase.db
      .collection('tasks')
      .where('userId', '==', userId)
      .orderBy('deadline', 'asc')
      .get();

    const tasks = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        currentCrisisMode: calculateCrisisMode(data.deadline),
      };
    });

    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error.message);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { title, deadline, type, priority, estimatedHours } = req.body;

    if (!title || !deadline) {
      return res.status(400).json({ error: 'Title and deadline are required' });
    }

    const taskData = {
      userId,
      title,
      deadline,
      type: type || 'other',
      priority: priority || 'medium',
      estimatedHours: estimatedHours || 4,
      source: 'manual',
      status: 'pending',
      currentCrisisMode: calculateCrisisMode(deadline).mode,
      agentPrepared: false,
      docUrl: null,
      calendarEventId: null,
      microSteps: [],
      suggestedSchedule: [],
      quickStartAction: null,
      ulyssesContract: null,
      completedAt: null,
      pointsEarned: 0,
      createdAt: new Date().toISOString(),
    };

    if (!firebase.db) {
      const newTask = { id: `task-${Date.now()}`, ...taskData };
      return res.json({ task: newTask });
    }

    const docRef = await firebase.db.collection('tasks').add(taskData);
    res.json({ task: { id: docRef.id, ...taskData } });
  } catch (error) {
    console.error('Create task error:', error.message);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!firebase.db) {
      return res.json({ success: true, id, updates });
    }

    await firebase.db.collection('tasks').doc(id).update(updates);
    res.json({ success: true, id });
  } catch (error) {
    console.error('Update task error:', error.message);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// POST /api/tasks/:id/complete
router.post('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    if (!firebase.db) {
      const task = DEMO_TASKS.find(t => t.id === id) || DEMO_TASKS[0];
      const crisisInfo = calculateCrisisMode(task.deadline);
      const points = calculatePoints(crisisInfo.mode);
      return res.json({
        success: true,
        pointsEarned: points,
        crisisMode: crisisInfo.mode,
        task: { ...task, status: 'completed', pointsEarned: points },
      });
    }

    const taskRef = firebase.db.collection('tasks').doc(id);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = taskDoc.data();
    const crisisInfo = calculateCrisisMode(task.deadline);
    const points = calculatePoints(crisisInfo.mode);

    await taskRef.update({
      status: 'completed',
      completedAt: new Date().toISOString(),
      pointsEarned: points,
    });

    // Update user points and streak
    const userRef = firebase.db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    const newPoints = (userData.clutchPoints || 0) + points;
    const newStreak = (userData.currentStreak || 0) + 1;

    await userRef.update({
      clutchPoints: newPoints,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, userData.longestStreak || 0),
    });

    // Log procrastination data
    await firebase.db.collection('procrastinationData').doc(userId).set({
      completionHistory: firebase.admin.firestore.FieldValue.arrayUnion({
        taskId: id,
        taskType: task.type,
        crisisMode: crisisInfo.mode,
        hoursBeforeDeadline: crisisInfo.hoursRemaining,
        completedAt: new Date().toISOString(),
      }),
      lastAnalyzed: null,
    }, { merge: true });

    res.json({
      success: true,
      pointsEarned: points,
      crisisMode: crisisInfo.mode,
      totalPoints: newPoints,
      streak: newStreak,
    });
  } catch (error) {
    console.error('Complete task error:', error.message);
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

module.exports = router;
