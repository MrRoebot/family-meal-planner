import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { isBuildTime, isFirebaseConfigured, getEnvVar } from './build-safe';

let app: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;

// Helper function to get the correct private key format
const getPrivateKey = (): string => {
  // Check if we have a base64 encoded private key (for Vercel)
  const base64Key = process.env.FIREBASE_PRIVATE_KEY_BASE64;
  if (base64Key) {
    try {
      console.log('Using base64 encoded private key for Firebase Admin');
      return Buffer.from(base64Key, 'base64').toString('utf8');
    } catch (error) {
      console.error('Failed to decode base64 private key:', error);
      throw new Error('Invalid base64 private key format');
    }
  }
  
  // Fall back to regular private key with escape sequence replacement
  console.log('Using regular private key format for Firebase Admin');
  return getEnvVar('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');
};

// Only initialize Firebase if not in build time and properly configured
if (!isBuildTime() && isFirebaseConfigured()) {
  try {
    const firebaseAdminConfig = {
      credential: cert({
        projectId: getEnvVar('FIREBASE_PROJECT_ID'),
        clientEmail: getEnvVar('FIREBASE_CLIENT_EMAIL'),
        privateKey: getPrivateKey(),
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
