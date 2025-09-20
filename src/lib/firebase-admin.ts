import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { isBuildTime, isFirebaseConfigured, getEnvVar } from './build-safe';

let app: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;

// Only initialize Firebase if not in build time and properly configured
if (!isBuildTime() && isFirebaseConfigured()) {
  try {
    const firebaseAdminConfig = {
      credential: cert({
        projectId: getEnvVar('FIREBASE_PROJECT_ID'),
        clientEmail: getEnvVar('FIREBASE_CLIENT_EMAIL'),
        privateKey: getEnvVar('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
      }),
    };

    // Initialize Firebase Admin
    app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];
    adminAuth = getAuth(app);
    adminDb = getFirestore(app);
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
} else if (isBuildTime()) {
  console.log('Skipping Firebase initialization during build time');
} else {
  console.warn('Firebase Admin credentials not configured. Some features may not work.');
}

// Export with null checks for build safety
export { adminAuth, adminDb };
export default app;
