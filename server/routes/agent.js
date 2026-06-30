const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const firebase = require('../config/firebase-admin');
const { runShadowAgent, runAgentForAllTasks } = require('../services/shadowAgentService');
const geminiService = require('../services/geminiService');

// Demo agent activity
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

// POST /api/agent/run — manually trigger shadow agent for all tasks
router.post('/run', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;

    if (!firebase.db) {
      // Demo mode — return pre-generated activity
      return res.json({
        success: true,
        message: 'Shadow Agent completed successfully',
        results: DEMO_ACTIVITY,
        tasksProcessed: 3,
      });
    }

    const results = await runAgentForAllTasks(userId, req.body.accessToken);

    res.json({
      success: true,
      message: `Shadow Agent processed ${results.length} tasks`,
      results,
      tasksProcessed: results.length,
    });
  } catch (error) {
    console.error('Agent run error:', error.message);
    res.status(500).json({ error: 'Shadow Agent encountered an error' });
  }
});

// POST /api/agent/run/:taskId — run agent for specific task
router.post('/run/:taskId', authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.uid;

    if (!firebase.db) {
      const demoTask = {
        title: 'Demo Task',
        deadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        type: 'assignment',
        estimatedHours: 6,
        context: 'Demo task for testing',
      };

      const breakdown = await geminiService.breakdownTask(
        demoTask.title,
        demoTask.deadline,
        demoTask.type,
        demoTask.estimatedHours
      );

      return res.json({
        success: true,
        activity: {
          taskId,
          taskTitle: demoTask.title,
          actions: ['generated_breakdown', 'created_doc', 'blocked_calendar'],
          docUrl: `https://docs.google.com/document/d/demo-${taskId}/edit`,
          completedAt: new Date().toISOString(),
          status: 'completed',
        },
        breakdown,
      });
    }

    const taskDoc = await firebase.db.collection('tasks').doc(taskId).get();
    if (!taskDoc.exists) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = taskDoc.data();
    const result = await runShadowAgent(userId, taskId, task, req.body.accessToken);

    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Agent run for task error:', error.message);
    res.status(500).json({ error: 'Shadow Agent failed for this task' });
  }
});

// GET /api/agent/activity — get agent activity feed
router.get('/activity', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;

    if (!firebase.db) {
      return res.json({ activity: DEMO_ACTIVITY });
    }

    const snapshot = await firebase.db
      .collection('agentActivity')
      .where('userId', '==', userId)
      .orderBy('completedAt', 'desc')
      .limit(50)
      .get();

    const activity = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ activity });
  } catch (error) {
    console.error('Get activity error:', error.message);
    res.status(500).json({ error: 'Failed to fetch agent activity' });
  }
});

module.exports = router;
