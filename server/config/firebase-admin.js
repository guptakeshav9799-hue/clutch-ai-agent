const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

let db;
let auth;

function initializeFirebase() {
  // In demo mode, use a mock or skip initialization
  if (process.env.NODE_ENV === 'demo' || !process.env.FIREBASE_PROJECT_ID) {
    console.log('⚠️  Running in DEMO mode — Firebase not connected');
    return { db: null, auth: null, admin: { firestore: { FieldValue: {} } } };
  }

  if (!getApps().length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  }

  db = getFirestore();
  auth = getAuth();
  
  const adminShim = {
    firestore: {
      FieldValue: FieldValue
    }
  };
  
  return { db, auth, admin: adminShim };
}

const firebase = initializeFirebase();

module.exports = firebase;
