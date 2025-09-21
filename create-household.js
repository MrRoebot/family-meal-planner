const admin = require('firebase-admin');

// Initialize Firebase Admin without the app checking (since it might already be initialized)
function initFirebase() {
  if (admin.apps.length === 0) {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    };
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  return admin.firestore();
}

async function createHousehold() {
  console.log('🏠 Creating household document...');
  
  try {
    const db = initFirebase();
    
    const householdData = {
      id: 'household-1',
      name: 'Test Family',
      members: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      settings: {
        defaultMealPlanDuration: 7,
        timezone: 'America/New_York'
      }
    };
    
    await db.collection('households').doc('household-1').set(householdData);
    console.log('✅ Successfully created household-1');
    
    // Verify creation
    const doc = await db.collection('households').doc('household-1').get();
    if (doc.exists) {
      console.log('✅ Verification successful - Household data:', doc.data());
    } else {
      console.log('❌ Verification failed - Document not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createHousehold().then(() => process.exit(0));
