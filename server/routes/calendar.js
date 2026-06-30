const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { createCalendarEvents, checkCalendarStatus } = require('../services/calendarService');

// POST /api/calendar/block
router.post('/block', authMiddleware, async (req, res) => {
  try {
    const { accessToken, taskTitle, suggestedSchedule } = req.body;

    if (!accessToken) {
      return res.json({
        success: true,
        eventIds: ['demo-event-1', 'demo-event-2'],
        message: 'Calendar events created (demo mode)',
      });
    }

    const eventIds = await createCalendarEvents(accessToken, taskTitle, suggestedSchedule);
    res.json({ success: true, eventIds, message: `Created ${eventIds.length} calendar events` });
  } catch (error) {
    console.error('Calendar block error:', error.message);
    res.status(500).json({ error: 'Failed to create calendar events' });
  }
});

// GET /api/calendar/status
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const { accessToken } = req.query;
    if (!accessToken) {
      return res.json({ connected: true, demo: true });
    }
    const status = await checkCalendarStatus(accessToken);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check calendar status' });
  }
});

module.exports = router;
