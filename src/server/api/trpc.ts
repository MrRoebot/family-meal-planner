import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
// Firebase auth is handled client-side
import { adminAuth } from '@/lib/firebase-admin';

interface CreateContextOptions {
  req: Request;
}

/**
 * 1. CONTEXT
 * This is the context you want to use with your API.
 */
export const createTRPCContext = async (opts: CreateContextOptions) => {
  const { req } = opts;

  // Get the session from the authorization header
  const getUser = async () => {
    try {
      const authHeader = req.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');
      if (!token) return null;

      const decodedToken = await adminAuth.verifyIdToken(token);
      return {
        id: decodedToken.uid,
        email: decodedToken.email || '',
        name: decodedToken.name || '',
      };
    } catch (error) {
      console.error('Error verifying token:', error);
      return null;
    }
  };

  const user = await getUser();

  return {
    req,
    user,
  };
};

/**
 * 2. INITIALIZATION
 * This is where the tRPC API is initialized, connecting the context and transformer.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE HELPERS
 * These are reusable "base" procedures that enforce certain security guarantees.
 */
export const createTRPCRouter = t.router;

/** 
 * Public (unauthenticated) procedure
 */
export const publicProcedure = t.procedure;

/**
 * Protected (authenticated) procedure
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
