import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase client config is PUBLIC — safe to hardcode in frontend code.
// These are the same values visible to anyone who visits the site.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'your-firebase-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'clutch-500813.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'clutch-500813',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'clutch-500813.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '299652595285',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:299652595285:web:523572ba0841ae4561dedc',
};

// isDemo only if all env vars are missing AND no hardcoded fallback (should never happen now)
const isDemo = false;

let app;
let auth;
let db;
let googleProvider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  // Request all Google API scopes upfront
  googleProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');
  googleProvider.addScope('https://www.googleapis.com/auth/calendar');
  googleProvider.addScope('https://www.googleapis.com/auth/documents');
  googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
  // Force Google to show account selection every time
  googleProvider.setCustomParameters({ prompt: 'consent', access_type: 'offline' });
} catch (error) {
  console.error('Firebase initialization error:', error.message);
}

export async function signInWithGoogle() {
  if (!auth) {
    throw new Error('Firebase is not configured. Please check your environment variables.');
  }

  if (isDemo) {
    return {
      user: {
        uid: 'demo-user-001',
        email: 'demo@clutch.app',
        displayName: 'Demo User',
        photoURL: null,
      },
      accessToken: null,
    };
  }

  try {
    await signInWithRedirect(auth, googleProvider);
    // Page will redirect, code below won't execute normally
  } catch (error) {
    throw error;
  }
}

export async function checkRedirectResult() {
  if (!auth) return null;
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      return {
        user: result.user,
        accessToken: credential?.accessToken || null,
      };
    }
    return null;
  } catch (error) {
    console.error("Redirect auth error:", error);
    throw error;
  }
}

export async function signOutUser() {
  if (auth) await signOut(auth);
}

export async function getIdToken(forceRefresh = false) {
  if (!auth?.currentUser) return null;
  try {
    return await auth.currentUser.getIdToken(forceRefresh);
  } catch {
    return null;
  }
}

// Listen to Firebase auth state changes and return unsubscribe function
export function onAuthChange(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export { auth, db };
