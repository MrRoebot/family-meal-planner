import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';
import { adminDb } from '@/lib/firebase-admin';

export const usersRouter = createTRPCRouter({
  // Initialize user and household on first sign-in
  initializeUser: publicProcedure
    .input(z.object({
      uid: z.string(),
      email: z.string(),
      name: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      if (!adminDb) {
        throw new Error('Database not configured');
      }

      const { uid, email, name } = input;

      // Check if user already exists
      const userDoc = await adminDb.collection('users').doc(uid).get();
      
      if (userDoc.exists) {
        // User exists, return their data
        const userData = userDoc.data();
        return {
          user: userData,
          household: await adminDb.collection('households').doc(userData?.householdId).get().then(doc => doc.data()),
        };
      }

      // User doesn't exist, create new user and household
      const householdId = `household-${uid}`;
      
      // Create household document
      const householdData = {
        id: householdId,
        name: name ? `${name}'s Family` : 'My Family',
        members: [uid],
        createdAt: new Date(),
        createdBy: uid,
        settings: {
          defaultMealPlanDuration: 7,
          timezone: 'America/New_York',
        },
      };

      // Create user document
      const userData = {
        id: uid,
        uid,
        email,
        name: name || email.split('@')[0],
        householdId,
        role: 'parent',
        createdAt: new Date(),
        preferences: {
          notifications: true,
          theme: 'light',
        },
      };

      // Create both documents in a batch
      const batch = adminDb.batch();
      batch.set(adminDb.collection('households').doc(householdId), householdData);
      batch.set(adminDb.collection('users').doc(uid), userData);
      
      await batch.commit();

      return {
        user: userData,
        household: householdData,
      };
    }),

  // Get user profile and household data
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      if (!adminDb) {
        throw new Error('Database not configured');
      }

      const userDoc = await adminDb.collection('users').doc(ctx.user.id).get();
      
      if (!userDoc.exists) {
        throw new Error('User profile not found');
      }

      const userData = userDoc.data();
      const householdDoc = await adminDb.collection('households').doc(userData?.householdId).get();
      
      return {
        user: userData,
        household: householdDoc.exists ? householdDoc.data() : null,
      };
    }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      preferences: z.object({
        notifications: z.boolean().optional(),
        theme: z.enum(['light', 'dark']).optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!adminDb) {
        throw new Error('Database not configured');
      }

      const updateData = {
        ...input,
        updatedAt: new Date(),
      };

      await adminDb.collection('users').doc(ctx.user.id).update(updateData);

      return { success: true };
    }),
});
