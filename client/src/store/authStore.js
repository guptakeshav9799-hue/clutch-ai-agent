import { create } from 'zustand';
import { signInWithGoogle, checkRedirectResult, signOutUser, onAuthChange, getIdToken } from '../services/firebase';
import { api } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  isDemo: false,
  error: null,

  login: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await signInWithGoogle();
      
      // If we get here without redirecting, it might be demo mode
      if (result && result.user.uid === 'demo-user-001') {
        throw new Error('Firebase is not configured — check your environment variables.');
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  loginDemo: () => {
    sessionStorage.setItem('clutch_demo', '1');
    set({
      user: {
        uid: 'demo-user-001',
        email: 'demo@clutch.app',
        displayName: 'Keshav (Demo)',
        photoURL: null,
      },
      accessToken: null,
      isAuthenticated: true,
      isLoading: false,
      isDemo: true,
      error: null,
    });
  },

  logout: async () => {
    try {
      await signOutUser();
    } catch (e) {
      // ignore
    }
    sessionStorage.removeItem('clutch_demo');
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      isDemo: false,
      error: null,
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  initAuth: () => {
    // If we have a demo session, restore it immediately
    const demoSession = sessionStorage.getItem('clutch_demo');
    if (demoSession) {
      get().loginDemo();
      return () => {};
    }

    set({ isLoading: true });
    let unsubscribe = null;

    console.log("Checking for Firebase auth redirect result...");
    checkRedirectResult().then(async (result) => {
      console.log("getRedirectResult returned:", result);
      if (result && result.user) {
        // Real login: verify on server + store OAuth token
        const idToken = await getIdToken();
        if (idToken) {
          try {
            await api.verifyToken(idToken);
            if (result.accessToken) {
              await api.storeTokens(result.accessToken, null);
            }
          } catch (e) {
            console.warn('Backend verify failed, continuing client-side:', e.message);
          }
        }
      }

      // After redirect check completes, listen for regular auth state changes
      unsubscribe = onAuthChange(async (firebaseUser) => {
        if (firebaseUser) {
          const idToken = await getIdToken();
          try {
            if (idToken) await api.verifyToken(idToken);
          } catch (e) {
            // backend may be in demo mode
          }
          set({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            },
            isAuthenticated: true,
            isLoading: false,
            isDemo: false,
          });
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false, isDemo: false });
        }
      });
    }).catch((error) => {
      console.error("Redirect check failed:", error);
      set({ error: error.message, isLoading: false });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  },
}));

export default useAuthStore;
