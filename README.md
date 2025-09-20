# Family Meal Planner

A mobile-first app for quickly planning weekly family meals and generating shopping lists.

## Features (MVP)

- **Weekly Meal Planning**: One meal per day planning approach
- **Recipe Management**: Store and organize family recipes
- **Shopping List Generation**: Manual shopping list creation from meal plans
- **Family Management**: Multi-user households with parent/child roles
- **Mobile-First Design**: Optimized for touch interactions

## Tech Stack

- **Frontend**: Next.js 14 with App Router + TypeScript + Tailwind CSS
- **Backend**: tRPC for type-safe APIs
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Auth
- **Deployment**: Vercel

## Getting Started

### Prerequisites

1. Node.js 18+ and npm
2. Firebase account
3. Vercel account (for deployment)
4. GitHub account

### 1. Environment Setup

1. Copy `.env.example` to `.env.local`
2. Set up Firebase project (see Firebase Setup section below)
3. Update `.env.local` with your Firebase configuration

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication with Email/Password
4. Create Firestore database in test mode
5. Generate web app configuration
6. Generate service account key for admin SDK

**Firebase Configuration Steps:**

1. **Web App Config**: Project Settings → Your Apps → Web App
2. **Service Account**: Project Settings → Service Accounts → Generate New Private Key
3. **Authentication**: Authentication → Sign-in Method → Email/Password → Enable
4. **Firestore**: Firestore Database → Create Database → Start in Test Mode

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

```env
# Firebase Web Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
```

## Development Guidelines

### Mobile-First Design

- All interactions optimized for touch
- No drag-and-drop (use tap-to-select)
- Bottom navigation for easy thumb access
- Large touch targets (44px minimum)

### Data Architecture

- One meal per day planning
- Manual shopping list generation
- Household-scoped data isolation
- Real-time updates across family members

### Project Structure

```
src/
├── app/                 # Next.js 14 app router
│   ├── (auth)/         # Authentication pages
│   ├── plan/           # Weekly planning
│   ├── recipes/        # Recipe management
│   ├── shop/           # Shopping lists
│   └── family/         # Household management
├── components/         # Reusable UI components
├── lib/               # Utilities and configurations
├── server/            # tRPC routers and procedures
└── types/             # TypeScript type definitions
```

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### GitHub Setup

1. Create GitHub repository
2. Push initial code
3. Set up GitHub Actions (optional)

## Current Implementation Status

✅ **Phase 1A: Foundation Setup**
- [x] Next.js 14 + TypeScript + Tailwind CSS setup
- [x] tRPC setup for type-safe APIs
- [x] Basic authentication structure
- [x] Responsive layout with bottom navigation
- [ ] Firebase project configuration (requires manual setup)

🔄 **Next: Phase 1B - Recipe Management**
- [ ] Bulk recipe import parser
- [ ] Recipe listing and search
- [ ] Recipe detail views
- [ ] Like functionality

## Manual Setup Required

1. **Firebase Project**: Create and configure Firebase project
2. **Environment Variables**: Update `.env.local` with real Firebase values
3. **GitHub Repository**: Create and push to GitHub
4. **Vercel Project**: Connect GitHub repo to Vercel

## Support

For questions or issues, refer to the project documentation in the `docs/` folder or the development plan in `docs/final_development_plan.md`.