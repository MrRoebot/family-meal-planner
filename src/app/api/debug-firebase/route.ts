import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { isFirebaseConfigured, isBuildTime, getEnvVar } from '@/lib/build-safe';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export async function GET() {
  const debug = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      CI: process.env.CI,
      NEXT_PHASE: process.env.NEXT_PHASE,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? 'SET' : 'NOT_SET',
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? 'SET' : 'NOT_SET',
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? 'SET' : 'NOT_SET',
      FIREBASE_PRIVATE_KEY_BASE64: process.env.FIREBASE_PRIVATE_KEY_BASE64 ? 'SET' : 'NOT_SET',
    },
    checks: {
      isBuildTime: isBuildTime(),
      isFirebaseConfigured: isFirebaseConfigured(),
    },
    firebase: {
      adminDb: adminDb ? 'INITIALIZED' : 'NOT_INITIALIZED',
      adminAuth: adminAuth ? 'INITIALIZED' : 'NOT_INITIALIZED',
    },
    test: {
      canAccessFirestore: false,
      error: null as string | null,
      directInitSuccess: false,
      directInitError: null as string | null,
    }
  };

  // Test Firestore access
  if (adminDb) {
    try {
      await adminDb.collection('test').limit(1).get();
      debug.test.canAccessFirestore = true;
    } catch (error) {
      debug.test.error = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  // Test direct Firebase Admin initialization
  let directInitError = null;
  try {
    const getPrivateKey = (): string => {
      const base64Key = process.env.FIREBASE_PRIVATE_KEY_BASE64;
      if (base64Key) {
        return Buffer.from(base64Key, 'base64').toString('utf8');
      }
      return getEnvVar('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');
    };

    const firebaseAdminConfig = {
      credential: cert({
        projectId: getEnvVar('FIREBASE_PROJECT_ID'),
        clientEmail: getEnvVar('FIREBASE_CLIENT_EMAIL'),
        privateKey: getPrivateKey(),
      }),
    };

    const testApp = initializeApp(firebaseAdminConfig, 'test-app');
    const testAuth = getAuth(testApp);
    const testDb = getFirestore(testApp);
    
    // Test a simple operation
    await testDb.collection('test').limit(1).get();
    
    debug.test.directInitSuccess = true;
  } catch (error) {
    directInitError = error instanceof Error ? error.message : 'Unknown error';
    debug.test.directInitError = directInitError;
  }

  return NextResponse.json(debug);
}
