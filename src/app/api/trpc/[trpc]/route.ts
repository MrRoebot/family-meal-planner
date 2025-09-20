import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { type NextRequest } from 'next/server';

import { appRouter } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';

// Handle missing Firebase config during build
const isFirebaseConfigured = () => {
  return !!(
    process.env.FIREBASE_PROJECT_ID && 
    process.env.FIREBASE_CLIENT_EMAIL && 
    process.env.FIREBASE_PRIVATE_KEY
  );
};

const handler = async (req: NextRequest) => {
  // During build time, return a simple response if Firebase isn't configured
  if (!isFirebaseConfigured() && process.env.NODE_ENV !== 'development') {
    return new Response(
      JSON.stringify({ error: 'Firebase not configured' }), 
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`,
            );
          }
        : undefined,
  });
};

export { handler as GET, handler as POST };
