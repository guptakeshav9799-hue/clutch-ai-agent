const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { createTaskDocument } = require('../services/docsService');
const geminiService = require('../services/geminiService');

// POST /api/docs/create
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { accessToken, taskTitle, taskType, context } = req.body;

    const docContent = await geminiService.generateDocContent(taskTitle, taskType, context);

    if (!accessToken) {
      return res.json({
        success: true,
        docUrl: `https://docs.google.com/document/d/demo-${Date.now()}/edit`,
        content: docContent,
        message: 'Document created (demo mode)',
      });
    }

    const result = await createTaskDocument(accessToken, taskTitle, docContent);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Doc creation error:', error.message);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

module.exports = router;
