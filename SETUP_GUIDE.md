# Family Meal Planner - Setup Guide

## ✅ Completed Setup

- [x] Next.js 14 project with TypeScript and Tailwind CSS
- [x] tRPC configuration for type-safe APIs
- [x] Firebase client and admin SDK setup
- [x] Authentication system with role-based access
- [x] Responsive mobile-first layout with bottom navigation
- [x] Basic app structure with Plan, Recipes, Shop, and Family pages

## 🔧 Manual Setup Required

### 1. Firebase Project Setup

**Create Firebase Project:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name: `family-meal-planner` (or your preferred name)
4. Enable Google Analytics (optional)

**Configure Authentication:**
1. In Firebase Console → Authentication
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Save changes

**Set up Firestore Database:**
1. In Firebase Console → Firestore Database
2. Click "Create database"
3. Start in "Test mode" (we'll secure it later)
4. Choose your preferred location
5. Done

**Get Web App Configuration:**
1. In Firebase Console → Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click "Web" icon (</>) to add web app
4. App nickname: `family-meal-planner-web`
5. Copy the configuration object

**Generate Service Account Key:**
1. In Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file (keep it secure!)

### 2. Environment Configuration

Update `/Volumes/OWC Envoy/wfd/family-meal-planner/.env.local`:

```env
# From Firebase Web App Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# From Service Account JSON
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Generate a random secret
NEXTAUTH_SECRET=generate_a_random_string_here
NEXTAUTH_URL=http://localhost:3000
```

### 3. GitHub Repository Setup

```bash
cd /Volumes/OWC\ Envoy/wfd/family-meal-planner

# Initialize git if not already done
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: Family Meal Planner MVP setup"

# Create GitHub repository (via GitHub CLI or web interface)
# Then add remote and push
git remote add origin https://github.com/yourusername/family-meal-planner.git
git branch -M main
git push -u origin main
```

### 4. Vercel Deployment Setup

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables (same as `.env.local` but without NEXTAUTH_URL)
5. Deploy

**Vercel Environment Variables:**
- Copy all variables from `.env.local`
- Update `NEXTAUTH_URL` to your Vercel domain
- Make sure `FIREBASE_PRIVATE_KEY` is properly escaped

### 5. Test the Application

1. **Start Development Server:**
   ```bash
   cd /Volumes/OWC\ Envoy/wfd/family-meal-planner
   npm run dev
   ```

2. **Visit:** http://localhost:3000

3. **Test Authentication:**
   - Should redirect to `/login`
   - Create an account with email/password
   - Should redirect to `/plan` after successful login
   - Bottom navigation should work

4. **Verify Database:**
   - Check Firebase Console → Firestore
   - Should see `users` collection created after signup

## 🚀 Next Steps (Phase 1B)

After completing the manual setup, you're ready for Phase 1B implementation:

1. **Recipe Management System**
   - Bulk recipe import functionality
   - Recipe CRUD operations
   - Search and filtering

2. **Enhanced Planning Features**
   - Meal assignment to days
   - Weekly plan management

3. **Shopping List Generation**
   - Ingredient consolidation
   - Grocery store organization

## 📋 Verification Checklist

- [ ] Firebase project created and configured
- [ ] Authentication working (signup/login)
- [ ] Environment variables set correctly
- [ ] Development server running without errors
- [ ] GitHub repository created and pushed
- [ ] Vercel deployment successful (optional for now)
- [ ] User can navigate between pages using bottom navigation
- [ ] Responsive design working on mobile viewport

## 🛠️ Troubleshooting

**Common Issues:**

1. **Firebase Auth Errors:**
   - Check API key and auth domain
   - Verify email/password is enabled
   - Check browser console for specific errors

2. **Environment Variable Issues:**
   - Restart development server after changes
   - Check for typos in variable names
   - Ensure FIREBASE_PRIVATE_KEY is properly escaped

3. **Build/Runtime Errors:**
   - Check Next.js and React versions compatibility
   - Clear `.next` folder and restart: `rm -rf .next && npm run dev`

Your Family Meal Planner foundation is now complete! 🎉
