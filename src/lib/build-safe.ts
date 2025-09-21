/**
 * Build-safe utilities for Vercel deployment
 * Handles cases where environment variables or services aren't available during build time
 */

// Check if we're in a build environment
export const isBuildTime = () => {
  return (
    process.env.NODE_ENV === 'production' && 
    !process.env.VERCEL_ENV && 
    process.env.CI === '1'
  ) || process.env.NEXT_PHASE === 'phase-production-build';
};

// Check if Firebase Admin SDK is properly configured (server-side only)
export const isFirebaseConfigured = () => {
  return !!(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    (process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY_BASE64)
  );
};

// Safe environment getter with fallbacks
export const getEnvVar = (key: string, fallback: string = '') => {
  if (isBuildTime() && !process.env[key]) {
    console.warn(`Environment variable ${key} not available during build, using fallback`);
    return fallback;
  }
  return process.env[key] || fallback;
};

// Build-safe async wrapper
export const buildSafeAsync = async <T>(
  fn: () => Promise<T>,
  fallback: T,
  errorMessage?: string
): Promise<T> => {
  if (isBuildTime()) {
    console.warn(errorMessage || 'Async operation skipped during build');
    return fallback;
  }
  
  try {
    return await fn();
  } catch (error) {
    console.error('Build-safe async operation failed:', error);
    return fallback;
  }
};
