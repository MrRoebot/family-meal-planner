
# Firebase Setup Guide

## Environment Variables Required

Create a `.env.local` file in the project root with these variables:

```bash
# Firebase Client Configuration (Next.js App)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin Configuration (Server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

## Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing one
3. Enable Authentication and Firestore Database
4. Get Web App configuration from Project Settings
5. Generate Admin SDK private key from Service Accounts

## Testing Without Firebase

For development and testing Phase 1B features, the app will run with mock data when Firebase is not configured. The authentication system will use a mock user context.

## Current Status

- ✅ Project structure set up for Firebase integration
- ✅ Build-safe utilities implemented for Vercel deployment
- ✅ Recipe management system ready for Firebase backend
- ⏳ Environment variables need to be configured
- ⏳ Firebase project needs to be created and configured
