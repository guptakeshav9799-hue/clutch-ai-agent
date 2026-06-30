const express = require('express');
const router = express.Router();
const firebase = require('../config/firebase-admin');

// POST /api/auth/verify — verify Firebase token
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Demo mode
    if (!firebase.auth) {
      return res.json({
        uid: 'demo-user-001',
        email: 'demo@clutch.app',
        name: 'Demo User',
        verified: true,
      });
    }

    const decodedToken = await firebase.auth.verifyIdToken(token);

    // Check if user exists in Firestore, create if not
    const userRef = firebase.db.collection('users').doc(decodedToken.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        displayName: decodedToken.name || decodedToken.email,
        email: decodedToken.email,
        photoURL: decodedToken.picture || null,
        gmailConnected: false,
        calendarConnected: false,
        createdAt: new Date().toISOString(),
        clutchPoints: 250, // Welcome bonus
        currentStreak: 0,
        longestStreak: 0,
        unlockedFeatures: [],
        lastShadowAgentRun: null,
      });
    }

    res.json({
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      verified: true,
    });
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Store OAuth tokens
router.post('/tokens', async (req, res) => {
  try {
    const { accessToken, refreshToken } = req.body;
    const userId = req.user?.uid || 'demo-user-001';

    if (firebase.db) {
      await firebase.db.collection('users').doc(userId).update({
        oauthAccessToken: accessToken,
        oauthRefreshToken: refreshToken || null,
        gmailConnected: true,
        calendarConnected: true,
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Token storage error:', error.message);
    res.status(500).json({ error: 'Failed to store tokens' });
  }
});

module.exports = router;
