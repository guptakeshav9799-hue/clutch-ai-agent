const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { gmailLimiter } = require('../middleware/rateLimiter');
const firebase = require('../config/firebase-admin');
const { scanEmails, getDemoEmails } = require('../services/gmailService');
const geminiService = require('../services/geminiService');
const { calculateCrisisMode } = require('../services/crisisService');

// POST /api/gmail/scan — trigger Gmail scan agent
router.post('/scan', authMiddleware, gmailLimiter, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { accessToken } = req.body;

    let emails;
    if (!accessToken || !firebase.db) {
      // Demo mode
      emails = getDemoEmails();
    } else {
      emails = await scanEmails(accessToken);
    }

    if (!emails || emails.length === 0) {
      return res.json({ tasks: [], message: 'No new deadlines found' });
    }

    const detectedTasks = [];

    for (const email of emails) {
      try {
        const result = await geminiService.detectDeadlines(email.subject, email.snippet);
        if (result && result.task_title) {
          detectedTasks.push({
            ...result,
            emailId: email.id,
            source: 'gmail_agent',
            status: 'pending',
            agentPrepared: false,
            userId,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error('Error processing email:', err.message);
      }
    }

    // Deduplicate and save to Firestore
    const savedTasks = [];
    for (const task of detectedTasks) {
      if (firebase.db) {
        // Check for duplicates
        const existing = await firebase.db
          .collection('tasks')
          .where('userId', '==', userId)
          .where('title', '==', task.task_title)
          .get();

        if (existing.empty) {
          const taskData = {
            userId,
            title: task.task_title,
            deadline: task.deadline_date,
            type: task.task_type,
            priority: task.priority,
            estimatedHours: task.estimated_hours,
            context: task.context,
            source: 'gmail_agent',
            status: 'pending',
            currentCrisisMode: calculateCrisisMode(task.deadline_date).mode,
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

          const docRef = await firebase.db.collection('tasks').add(taskData);
          savedTasks.push({ id: docRef.id, ...taskData });
        }
      } else {
        savedTasks.push({
          id: `gmail-task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          title: task.task_title,
          deadline: task.deadline_date,
          type: task.task_type,
          priority: task.priority,
          estimatedHours: task.estimated_hours,
          context: task.context,
          source: 'gmail_agent',
          status: 'pending',
          agentPrepared: false,
          currentCrisisMode: calculateCrisisMode(task.deadline_date),
        });
      }
    }

    res.json({
      tasks: savedTasks,
      message: `Found ${savedTasks.length} new deadline(s) in your inbox`,
      totalEmailsScanned: emails.length,
    });
  } catch (error) {
    console.error('Gmail scan error:', error.message);
    res.status(500).json({ error: 'Failed to scan Gmail' });
  }
});

// GET /api/gmail/status
router.get('/status', authMiddleware, async (req, res) => {
  try {
    if (!firebase.db) {
      return res.json({ connected: true, demo: true });
    }

    const userDoc = await firebase.db.collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    res.json({
      connected: userData?.gmailConnected || false,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check Gmail status' });
  }
});

module.exports = router;
