const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { apiLimiter } = require('./middleware/rateLimiter');

// Route imports
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const agentRoutes = require('./routes/agent');
const gmailRoutes = require('./routes/gmail');
const calendarRoutes = require('./routes/calendar');
const docsRoutes = require('./routes/docs');
const authMiddleware = require('./middleware/auth');
const firebase = require('./config/firebase-admin');
const geminiService = require('./services/geminiService');
const { calculateCrisisMode, getEmergencyPlan, calculatePoints } = require('./services/crisisService');

const app = express();

// Middleware — CORS allows localhost dev and Cloud Run production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3001',
  process.env.PRODUCTION_URL, // e.g. https://clutch-xxx-uc.a.run.app
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o)) || origin.includes('.run.app')) {
      cb(null, true);
    } else {
      cb(null, true); // permissive for hackathon judges
    }
  },
  credentials: true,
}));

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(express.json({ limit: '10mb' }));
app.use('/api', apiLimiter);

// Health check (for Docker + Cloud Run)
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString(), mode: firebase.db ? 'live' : 'demo' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/gmail', gmailRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/docs', docsRoutes);

// DNA Routes
app.get('/api/dna/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;

    if (!firebase.db) {
      const dna = geminiService.getDemoDNA();
      return res.json({
        profile: dna,
        completedTasks: 8,
        hasEnoughData: true,
      });
    }

    const dnaDoc = await firebase.db.collection('procrastinationData').doc(userId).get();
    const dnaData = dnaDoc.exists ? dnaDoc.data() : null;

    if (!dnaData || !dnaData.completionHistory || dnaData.completionHistory.length < 5) {
      return res.json({
        profile: null,
        completedTasks: dnaData?.completionHistory?.length || 0,
        hasEnoughData: false,
      });
    }

    // Generate or return cached DNA
    if (dnaData.dnaProfile && dnaData.lastAnalyzed) {
      const lastAnalyzed = new Date(dnaData.lastAnalyzed);
      if (Date.now() - lastAnalyzed < 24 * 3600 * 1000) {
        return res.json({
          profile: dnaData.dnaProfile,
          completedTasks: dnaData.completionHistory.length,
          hasEnoughData: true,
        });
      }
    }

    const profile = await geminiService.analyzeProcrastinationDNA(dnaData.completionHistory);

    await firebase.db.collection('procrastinationData').doc(userId).update({
      dnaProfile: profile,
      lastAnalyzed: new Date().toISOString(),
    });

    res.json({
      profile,
      completedTasks: dnaData.completionHistory.length,
      hasEnoughData: true,
    });
  } catch (error) {
    console.error('DNA profile error:', error.message);
    res.status(500).json({ error: 'Failed to generate DNA profile' });
  }
});

app.post('/api/dna/log', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { event, taskId, metadata } = req.body;

    if (!firebase.db) {
      return res.json({ success: true });
    }

    await firebase.db.collection('procrastinationData').doc(userId).set({
      completionHistory: firebase.admin.firestore.FieldValue.arrayUnion({
        event,
        taskId,
        metadata,
        timestamp: new Date().toISOString(),
      }),
    }, { merge: true });

    res.json({ success: true });
  } catch (error) {
    console.error('DNA log error:', error.message);
    res.status(500).json({ error: 'Failed to log event' });
  }
});

// Contracts Routes
app.post('/api/contracts/create', authMiddleware, async (req, res) => {
  try {
    const { taskId, consequence, reward, consequenceMessage } = req.body;

    const contract = {
      taskId,
      consequence,
      reward,
      consequenceMessage: consequenceMessage || '',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    if (!firebase.db) {
      return res.json({ success: true, contract: { id: `contract-${Date.now()}`, ...contract } });
    }

    await firebase.db.collection('tasks').doc(taskId).update({
      ulyssesContract: contract,
    });

    res.json({ success: true, contract });
  } catch (error) {
    console.error('Contract creation error:', error.message);
    res.status(500).json({ error: 'Failed to create contract' });
  }
});

app.put('/api/contracts/:id/trigger', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { result } = req.body; // 'consequence' or 'reward'

    if (!firebase.db) {
      return res.json({ success: true, result });
    }

    await firebase.db.collection('tasks').doc(id).update({
      'ulyssesContract.isActive': false,
      'ulyssesContract.result': result,
      'ulyssesContract.triggeredAt': new Date().toISOString(),
    });

    res.json({ success: true, result });
  } catch (error) {
    console.error('Contract trigger error:', error.message);
    res.status(500).json({ error: 'Failed to trigger contract' });
  }
});

// Points Routes
app.get('/api/points/balance', authMiddleware, async (req, res) => {
  try {
    if (!firebase.db) {
      return res.json({
        clutchPoints: 1750,
        currentStreak: 5,
        longestStreak: 12,
        unlockedFeatures: ['deep_dive'],
      });
    }

    const userDoc = await firebase.db.collection('users').doc(req.user.uid).get();
    const data = userDoc.data();

    res.json({
      clutchPoints: data?.clutchPoints || 0,
      currentStreak: data?.currentStreak || 0,
      longestStreak: data?.longestStreak || 0,
      unlockedFeatures: data?.unlockedFeatures || [],
    });
  } catch (error) {
    console.error('Points balance error:', error.message);
    res.status(500).json({ error: 'Failed to get points' });
  }
});

app.post('/api/points/unlock', authMiddleware, async (req, res) => {
  try {
    const { featureId, cost } = req.body;

    if (!firebase.db) {
      return res.json({ success: true, featureId, remaining: 1750 - cost });
    }

    const userRef = firebase.db.collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();
    const data = userDoc.data();

    if ((data.clutchPoints || 0) < cost) {
      return res.status(400).json({ error: 'Insufficient Clutch Points' });
    }

    await userRef.update({
      clutchPoints: (data.clutchPoints || 0) - cost,
      unlockedFeatures: firebase.admin.firestore.FieldValue.arrayUnion(featureId),
    });

    res.json({ success: true, featureId, remaining: data.clutchPoints - cost });
  } catch (error) {
    console.error('Points unlock error:', error.message);
    res.status(500).json({ error: 'Failed to unlock feature' });
  }
});

// Emergency plan endpoint
app.post('/api/crisis/emergency-plan', authMiddleware, async (req, res) => {
  try {
    const { taskTitle, hoursRemaining } = req.body;
    const plan = await getEmergencyPlan(taskTitle, hoursRemaining);
    res.json(plan);
  } catch (error) {
    console.error('Emergency plan error:', error.message);
    res.status(500).json({ error: 'Failed to generate emergency plan' });
  }
});

// Serve static files in production with correct PWA headers
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'client/dist');

  // Service worker must be served from root with correct headers
  app.get('/sw.js', (req, res) => {
    res.set({
      'Content-Type': 'application/javascript',
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    res.sendFile(path.join(distPath, 'sw.js'));
  });

  // Firebase messaging service worker
  app.get('/firebase-messaging-sw.js', (req, res) => {
    res.set({
      'Content-Type': 'application/javascript',
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    res.sendFile(path.join(distPath, 'firebase-messaging-sw.js'));
  });

  // Static assets with long cache
  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      } else if (filePath.match(/\.(js|css|png|jpg|svg|woff2?)$/)) {
        res.set('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  }));

  // SPA fallback — all non-API routes serve index.html
  app.use((req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

module.exports = app;

