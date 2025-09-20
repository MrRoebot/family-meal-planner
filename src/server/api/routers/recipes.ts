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
      if (!adminDb) {
        throw new Error('Database not configured');
      }
      
      const query = adminDb
        .collection('households')
        .doc(input.householdId)
        .collection('recipes')
        .orderBy('createdAt', 'desc');

      const snapshot = await query.get();
      let recipes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as any));

      // Apply search filter
      if (input.search) {
        const searchLower = input.search.toLowerCase();
        recipes = recipes.filter((recipe: any) =>
          recipe.title?.toLowerCase().includes(searchLower) ||
          recipe.description?.toLowerCase().includes(searchLower) ||
          recipe.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower)) ||
          recipe.ingredients?.some((ing: any) => ing.name?.toLowerCase().includes(searchLower))
        );
      }

      // Apply tags filter
      if (input.tags && input.tags.length > 0) {
        recipes = recipes.filter((recipe: any) =>
          input.tags!.some(tag => recipe.tags?.includes(tag))
        );
      }

      return recipes;
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
      if (!adminDb) {
        throw new Error('Database not configured');
      }
      const { householdId, ...recipeData } = input;
      const recipeRef = adminDb
        .collection('households')
        .doc(householdId)
        .collection('recipes')
        .doc();

      const recipe = {
        id: recipeRef.id,
        ...recipeData,
        householdId,
        createdBy: ctx.user.id,
        createdAt: new Date(),
        likes: [],
        timesPlanned: 0,
      };

      await recipeRef.set(recipe);

      return recipe;
    }),

  // Get single recipe by ID
  getById: protectedProcedure
    .input(z.object({
      householdId: z.string(),
      recipeId: z.string(),
    }))
    .query(async ({ input }) => {
      if (!adminDb) {
        throw new Error('Database not configured');
      }
      const recipeDoc = await adminDb
        .collection('households')
        .doc(input.householdId)
        .collection('recipes')
        .doc(input.recipeId)
        .get();

      if (!recipeDoc.exists) {
        throw new Error('Recipe not found');
      }

      return { id: recipeDoc.id, ...recipeDoc.data() } as any;
    }),

  // Toggle like on recipe
  toggleLike: protectedProcedure
    .input(z.object({
      householdId: z.string(),
      recipeId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!adminDb) {
        throw new Error('Database not configured');
      }
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
