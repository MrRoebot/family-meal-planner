import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { auth } from '@/lib/firebase';
import { adminAuth } from '@/lib/firebase-admin';

/**
 * 1. CONTEXT
 * This is the context you want to use with your API.
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  // Get the session from the authorization header
  const getUser = async () => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
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
    res,
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
