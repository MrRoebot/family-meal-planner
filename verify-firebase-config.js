#!/usr/bin/env node

/**
 * Verify and show correct Firebase configuration
 */

console.log('🔥 Firebase Configuration Verification');
console.log('======================================\n');

// Correct Firebase Web SDK config from Firebase MCP
const correctWebConfig = {
  projectId: "family-meal-planner-470117",
  appId: "1:573391454381:web:0ed55de7f7b772c5f00624",
  storageBucket: "family-meal-planner-470117.firebasestorage.app",
  apiKey: "AIzaSyBW6QeRd4_BbTHTMqeSgcbTmOeZqPXKlOQ",
  authDomain: "family-meal-planner-470117.firebaseapp.com",
  messagingSenderId: "573391454381"
};

// Load current environment variables
require('dotenv').config({ path: '.env.local' });

console.log('📋 Required Environment Variables:\n');

console.log('CLIENT (Web SDK) Variables:');
console.log('NEXT_PUBLIC_FIREBASE_API_KEY=' + correctWebConfig.apiKey);
console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=' + correctWebConfig.authDomain);
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID=' + correctWebConfig.projectId);
console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=' + correctWebConfig.storageBucket);
console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=' + correctWebConfig.messagingSenderId);
console.log('NEXT_PUBLIC_FIREBASE_APP_ID=' + correctWebConfig.appId);

console.log('\nSERVER (Admin SDK) Variables:');
console.log('FIREBASE_PROJECT_ID=' + correctWebConfig.projectId);
console.log('FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@family-meal-planner-470117.iam.gserviceaccount.com');
console.log('FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----\\n"');

console.log('\n🔍 Current vs Expected Values:\n');

const checkVar = (envVar, expected, description) => {
  const current = process.env[envVar];
  const match = current === expected;
  console.log(`${match ? '✅' : '❌'} ${envVar}: ${match ? 'CORRECT' : 'INCORRECT'}`);
  if (!match && expected) {
    console.log(`   Expected: ${expected}`);
    console.log(`   Current:  ${current || 'NOT SET'}`);
  }
};

checkVar('NEXT_PUBLIC_FIREBASE_API_KEY', correctWebConfig.apiKey, 'Web API Key');
checkVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', correctWebConfig.authDomain, 'Auth Domain');
checkVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID', correctWebConfig.projectId, 'Project ID');
checkVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', correctWebConfig.storageBucket, 'Storage Bucket');
checkVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', correctWebConfig.messagingSenderId, 'Messaging Sender ID');
checkVar('NEXT_PUBLIC_FIREBASE_APP_ID', correctWebConfig.appId, 'App ID');

checkVar('FIREBASE_PROJECT_ID', correctWebConfig.projectId, 'Admin Project ID');

// Check admin email format
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const expectedEmailPattern = /firebase-adminsdk-.+@family-meal-planner-470117\.iam\.gserviceaccount\.com/;
const emailMatch = clientEmail && expectedEmailPattern.test(clientEmail);
console.log(`${emailMatch ? '✅' : '❌'} FIREBASE_CLIENT_EMAIL: ${emailMatch ? 'CORRECT FORMAT' : 'INCORRECT FORMAT'}`);
if (!emailMatch) {
  console.log(`   Expected pattern: firebase-adminsdk-xxxxx@family-meal-planner-470117.iam.gserviceaccount.com`);
  console.log(`   Current: ${clientEmail || 'NOT SET'}`);
}

// Check private key format
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const hasBeginEnd = privateKey && privateKey.includes('-----BEGIN PRIVATE KEY-----') && privateKey.includes('-----END PRIVATE KEY-----');
const hasEscapedNewlines = privateKey && privateKey.includes('\\n');
const isQuoted = privateKey && privateKey.startsWith('"') && privateKey.endsWith('"');

console.log(`${hasBeginEnd ? '✅' : '❌'} FIREBASE_PRIVATE_KEY: ${hasBeginEnd ? 'HAS BEGIN/END MARKERS' : 'MISSING BEGIN/END MARKERS'}`);
console.log(`${hasEscapedNewlines ? '✅' : '❌'} FIREBASE_PRIVATE_KEY: ${hasEscapedNewlines ? 'HAS ESCAPED NEWLINES' : 'MISSING ESCAPED NEWLINES'}`);
console.log(`${isQuoted ? '✅' : '❌'} FIREBASE_PRIVATE_KEY: ${isQuoted ? 'PROPERLY QUOTED' : 'NOT QUOTED'}`);

console.log('\n💡 Next Steps:');
if (!hasBeginEnd || !hasEscapedNewlines || !isQuoted) {
  console.log('1. Go to Firebase Console → Project Settings → Service Accounts');
  console.log('2. Click "Generate new private key"');
  console.log('3. Download the JSON file');
  console.log('4. Copy the ENTIRE private_key value (including quotes) to your .env.local');
  console.log('5. Make sure the private key includes the -----BEGIN/END----- markers');
}

// Check if Firebase can be initialized
console.log('\n🧪 Testing Firebase Initialization:');
try {
  const admin = require('firebase-admin');
  if (admin.apps.length === 0 && hasBeginEnd && hasEscapedNewlines) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    console.log('✅ Firebase Admin SDK initialization successful!');
  } else if (!hasBeginEnd || !hasEscapedNewlines) {
    console.log('❌ Cannot test - private key format issues');
  } else {
    console.log('✅ Firebase Admin already initialized');
  }
} catch (error) {
  console.log('❌ Firebase Admin initialization failed:', error.message);
}

console.log('\nCorrect .env.local format:');
console.log('# Copy this exact format to your .env.local file');
console.log(`NEXT_PUBLIC_FIREBASE_API_KEY=${correctWebConfig.apiKey}`);
console.log(`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${correctWebConfig.authDomain}`);
console.log(`NEXT_PUBLIC_FIREBASE_PROJECT_ID=${correctWebConfig.projectId}`);
console.log(`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${correctWebConfig.storageBucket}`);
console.log(`NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${correctWebConfig.messagingSenderId}`);
console.log(`NEXT_PUBLIC_FIREBASE_APP_ID=${correctWebConfig.appId}`);
console.log(`FIREBASE_PROJECT_ID=${correctWebConfig.projectId}`);
console.log('FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@family-meal-planner-470117.iam.gserviceaccount.com');
console.log('FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_CONTENT\\n-----END PRIVATE KEY-----\\n"');
