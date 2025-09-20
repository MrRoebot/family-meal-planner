import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { adminDb } from '@/lib/firebase-admin';

export const planningRouter = createTRPCRouter({
  // Get weekly plan
  getWeeklyPlan: protectedProcedure
    .input(z.object({
      householdId: z.string(),
      weekStartDate: z.string(), // ISO date string
    }))
    .query(async ({ input }) => {
      if (!adminDb!) {
        throw new Error('Database not configured');
      }
      const snapshot = await adminDb!
        .collection('households')
        .doc(input.householdId)
        .collection('weeklyPlans')
        .where('weekStartDate', '==', new Date(input.weekStartDate))
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }),

  // Assign meal to day
  assignMealToDay: protectedProcedure
    .input(z.object({
      householdId: z.string(),
      weekStartDate: z.string(),
      day: z.string(),
      recipeId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!adminDb!) {
        throw new Error('Database not configured');
      }
      const weekDate = new Date(input.weekStartDate);
      
      // First, try to find existing plan
      const existingPlanSnapshot = await adminDb!
        .collection('households')
        .doc(input.householdId)
        .collection('weeklyPlans')
        .where('weekStartDate', '==', weekDate)
        .limit(1)
        .get();

      if (!existingPlanSnapshot.empty) {
        // Update existing plan
        const planDoc = existingPlanSnapshot.docs[0];
        const planData = planDoc.data();
        const updatedMeals = {
          ...planData.meals,
          [input.day]: input.recipeId,
        };

        await planDoc.ref.update({
          meals: updatedMeals,
          lastModified: new Date(),
        });

        return { id: planDoc.id, ...planData, meals: updatedMeals };
      } else {
        // Create new plan
        const planId = adminDb!
          .collection('households')
          .doc(input.householdId)
          .collection('weeklyPlans')
          .doc().id;

        const newPlan = {
          id: planId,
          householdId: input.householdId,
          weekStartDate: weekDate,
          meals: {
            [input.day]: input.recipeId,
          },
          createdBy: ctx.user.id,
          lastModified: new Date(),
        };

        await adminDb!
          .collection('households')
          .doc(input.householdId)
          .collection('weeklyPlans')
          .doc(planId)
          .set(newPlan);

        return newPlan;
      }
    }),

  // Remove meal from day
  removeMealFromDay: protectedProcedure
    .input(z.object({
      householdId: z.string(),
      weekStartDate: z.string(),
      day: z.string(),
    }))
    .mutation(async ({ input }) => {
      if (!adminDb!) {
        throw new Error('Database not configured');
      }
      const snapshot = await adminDb!
        .collection('households')
        .doc(input.householdId)
        .collection('weeklyPlans')
        .where('weekStartDate', '==', new Date(input.weekStartDate))
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const planDoc = snapshot.docs[0];
        const planData = planDoc.data();
        const updatedMeals = { ...planData.meals };
        delete updatedMeals[input.day];

        await planDoc.ref.update({
          meals: updatedMeals,
          lastModified: new Date(),
        });

        return { success: true };
      }

      return { success: false };
    }),
});
