import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

// Handle missing Firebase config during build time
const isFirebaseConfigured = () => {
  return !!(
    process.env.FIREBASE_PROJECT_ID && 
    process.env.FIREBASE_CLIENT_EMAIL && 
    process.env.FIREBASE_PRIVATE_KEY
  );
};

let app: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;

if (isFirebaseConfigured()) {
  const firebaseAdminConfig = {
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  };

  // Initialize Firebase Admin
  app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];
  adminAuth = getAuth(app);
  adminDb = getFirestore(app);
} else if (process.env.NODE_ENV !== 'development') {
  console.warn('Firebase Admin credentials not configured. Some features may not work.');
}

// Export with null checks for build safety
export { adminAuth, adminDb };
export default app;
