import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { type NextRequest } from 'next/server';

import { appRouter } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';
import { isBuildTime, isFirebaseConfigured } from '@/lib/build-safe';

const handler = async (req: NextRequest) => {
  // During build time, return a simple 200 response to allow page data collection
  if (isBuildTime()) {
    return new Response(
      JSON.stringify({ result: { data: null } }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // During runtime, check Firebase config
  if (!isFirebaseConfigured() && process.env.NODE_ENV === 'production') {
    return new Response(
      JSON.stringify({ 
        error: { 
          message: 'Firebase not configured',
          code: -32603,
          data: { code: 'INTERNAL_SERVER_ERROR' }
        }
      }), 
      { 
        status: 200, // tRPC expects 200 status for error responses
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
