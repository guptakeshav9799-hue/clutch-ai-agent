import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { auth, db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';

let messaging = null;

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || null;

async function initMessaging(app) {
  try {
    if (!app) return null;
    messaging = getMessaging(app);
    return messaging;
  } catch (e) {
    console.warn('FCM not available:', e.message);
    return null;
  }
}

export async function requestNotificationPermission(firebaseApp) {
  if (!('Notification' in window)) return;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  try {
    if (!messaging && firebaseApp) {
      await initMessaging(firebaseApp);
    }
    if (!messaging || !VAPID_KEY) {
      // Fallback: just use browser notifications
      return;
    }

    const fcmToken = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (fcmToken && auth?.currentUser && db) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { fcmToken, fcmUpdatedAt: new Date().toISOString() });
    }
  } catch (e) {
    console.warn('FCM token error:', e.message);
  }
}

export function showNotification(title, options = {}) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [200, 100, 200],
      ...options,
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    return notification;
  }
}

export function showCrisisNotification(taskTitle, mode) {
  const messages = {
    CRUNCH: `⚠️ "${taskTitle}" enters CRUNCH MODE — less than 24 hours left!`,
    EMERGENCY: `🚨 EMERGENCY: "${taskTitle}" due in less than 6 hours!`,
    SURVIVAL: `💀 SURVIVAL MODE: "${taskTitle}" deadline is NOW!`,
  };

  if (messages[mode]) {
    showNotification('Clutch Crisis Alert 🔥', {
      body: messages[mode],
      tag: `crisis-${taskTitle}`,
      requireInteraction: mode === 'EMERGENCY' || mode === 'SURVIVAL',
    });
  }
}

export function showAgentCompleteNotification(tasksProcessed) {
  showNotification('Clutch Shadow Agent ✅', {
    body: `Agent finished! Prepared ${tasksProcessed} task${tasksProcessed !== 1 ? 's' : ''} — docs created & calendar blocked.`,
    tag: 'agent-complete',
  });
}

export function showGmailScanNotification(count) {
  showNotification('Clutch Gmail Scan 📬', {
    body: `Found ${count} new deadline${count !== 1 ? 's' : ''} in your inbox! Check your Tasks page.`,
    tag: 'gmail-scan',
  });
}

// Listen for foreground FCM messages
export function setupFCMForegroundListener(onMessageReceived) {
  if (!messaging) return;
  onMessage(messaging, (payload) => {
    const { title, body } = payload.notification || {};
    if (title) {
      showNotification(title, { body });
      onMessageReceived?.(payload);
    }
  });
}
