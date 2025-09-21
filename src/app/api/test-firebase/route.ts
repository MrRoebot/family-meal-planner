import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export async function GET() {
  try {
    // Get private key
    const getPrivateKey = (): string => {
      const base64Key = process.env.FIREBASE_PRIVATE_KEY_BASE64;
      if (base64Key) {
        return Buffer.from(base64Key, 'base64').toString('utf8');
      }
      return (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    };

    const firebaseAdminConfig = {
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: getPrivateKey(),
      }),
    };

    // Initialize Firebase Admin
    const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Test Firestore access
    const testCollection = db.collection('test');
    const snapshot = await testCollection.limit(1).get();

    return NextResponse.json({
      success: true,
      message: 'Firebase Admin initialized successfully',
      firestoreTest: `Found ${snapshot.size} documents`,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
