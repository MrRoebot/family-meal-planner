import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { adminDb } from '@/lib/firebase-admin';

export const recipesRouter = createTRPCRouter({
  // Get all recipes for household
  getAll: protectedProcedure
    .input(z.object({
      householdId: z.string(),
      search: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }))
    .query(async ({ input }) => {
      const query = adminDb
        .collection('households')
        .doc(input.householdId)
        .collection('recipes')
        .orderBy('createdAt', 'desc');

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }),

  // Create new recipe
  create: protectedProcedure
    .input(z.object({
      householdId: z.string(),
      title: z.string().min(1),
      description: z.string().optional(),
      ingredients: z.array(z.object({
        name: z.string(),
        amount: z.string().optional(),
        category: z.string().optional(),
      })),
      directions: z.array(z.string()),
      tags: z.array(z.string()).default([]),
      estimatedTime: z.number().optional(),
      servings: z.number().optional(),
      sourceUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { householdId, ...recipeData } = input;
      const recipeId = adminDb
        .collection('households')
        .doc(householdId)
        .collection('recipes')
        .doc().id;

      const recipe = {
        id: recipeId,
        ...recipeData,
        householdId,
        createdBy: ctx.user.id,
        createdAt: new Date(),
        likes: [],
        timesPlanned: 0,
      };

      await adminDb
        .collection('households')
        .doc(householdId)
        .collection('recipes')
        .doc(recipeId)
        .set(recipe);

      return recipe;
    }),

  // Toggle like on recipe
  toggleLike: protectedProcedure
    .input(z.object({
      householdId: z.string(),
      recipeId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const recipeRef = adminDb
        .collection('households')
        .doc(input.householdId)
        .collection('recipes')
        .doc(input.recipeId);

      const recipeDoc = await recipeRef.get();
      if (!recipeDoc.exists) {
        throw new Error('Recipe not found');
      }

      const recipe = recipeDoc.data();
      const likes = recipe?.likes || [];
      const isLiked = likes.includes(ctx.user.id);

      const updatedLikes = isLiked
        ? likes.filter((id: string) => id !== ctx.user.id)
        : [...likes, ctx.user.id];

      await recipeRef.update({ likes: updatedLikes });

      return { liked: !isLiked };
    }),
});
