import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { adminDb } from '@/lib/firebase-admin';

export const authRouter = createTRPCRouter({
  // Get current user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    if (!adminDb) {
      throw new Error('Database not configured');
    }
    const userDoc = await adminDb!.collection('users').doc(ctx.user.id).get();
    
    if (!userDoc.exists) {
      // Create user if doesn't exist
      const newUser = {
        id: ctx.user.id,
        email: ctx.user.email,
        name: ctx.user.name,
        householdId: '', // Will be set when joining/creating household
        role: 'parent' as const, // Default to parent
        createdAt: new Date(),
        lastActiveAt: new Date(),
      };
      
      await adminDb!.collection('users').doc(ctx.user.id).set(newUser);
      return newUser;
    }
    
    // Update last active
    await adminDb!.collection('users').doc(ctx.user.id).update({
      lastActiveAt: new Date(),
    });
    
    return userDoc.data();
  }),

  // Create household
  createHousehold: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      timezone: z.string().default('America/New_York'),
      weekStartsOn: z.enum(['sunday', 'monday']).default('sunday'),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!adminDb) {
        throw new Error('Database not configured');
      }
      const householdId = adminDb!.collection('households').doc().id;
      
      const household = {
        id: householdId,
        name: input.name,
        createdBy: ctx.user.id,
        members: [ctx.user.id],
        genAiRequestsUsed: 0,
        genAiRequestLimit: 10,
        createdAt: new Date(),
        settings: {
          timezone: input.timezone,
          weekStartsOn: input.weekStartsOn,
        },
      };
      
      // Create household and update user
      await Promise.all([
        adminDb!.collection('households').doc(householdId).set(household),
        adminDb!.collection('users').doc(ctx.user.id).update({
          householdId,
        }),
      ]);
      
      return household;
    }),
});
