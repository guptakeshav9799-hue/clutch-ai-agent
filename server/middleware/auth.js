const firebase = require('../config/firebase-admin');

const DEMO_USER = {
  uid: 'demo-user-001',
  email: 'demo@clutch.app',
  name: 'Demo User',
  picture: null,
};

async function authMiddleware(req, res, next) {
  // Demo mode bypass
  if (process.env.NODE_ENV === 'demo' || !firebase.auth) {
    req.user = DEMO_USER;
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authentication token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await firebase.auth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email,
      picture: decodedToken.picture || null,
    };
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Token expired. Please re-authenticate.' });
    }
    
    return res.status(401).json({ error: 'Invalid authentication token' });
  }
}

module.exports = authMiddleware;
