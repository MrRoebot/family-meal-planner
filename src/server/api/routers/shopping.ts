import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { adminDb } from '@/lib/firebase-admin';

export const shoppingRouter = createTRPCRouter({
  // Generate shopping list from weekly plan
  generateFromWeeklyPlan: protectedProcedure
    .input(z.object({
      householdId: z.string(),
      weeklyPlanId: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Get the weekly plan
      const planDoc = await adminDb
        .collection('households')
        .doc(input.householdId)
        .collection('weeklyPlans')
        .doc(input.weeklyPlanId)
        .get();

      if (!planDoc.exists) {
        throw new Error('Weekly plan not found');
      }

      const plan = planDoc.data();
      const recipeIds = Object.values(plan?.meals || {}) as string[];

      if (recipeIds.length === 0) {
        throw new Error('No meals planned for this week');
      }

      // Get all recipes for the week
      const recipePromises = recipeIds.map(id =>
        adminDb
          .collection('households')
          .doc(input.householdId)
          .collection('recipes')
          .doc(id)
          .get()
      );

      const recipeDocs = await Promise.all(recipePromises);
      const recipes = recipeDocs
        .filter(doc => doc.exists)
        .map(doc => ({ id: doc.id, ...doc.data() })) as Array<{
          id: string;
          title: string;
          ingredients?: Array<{ name: string; amount?: string; category?: string }>;
        }>;

      // Consolidate ingredients
      const ingredientMap = new Map();

      recipes.forEach((recipe) => {
        recipe.ingredients?.forEach((ingredient) => {
          const key = ingredient.name.toLowerCase();
          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key);
            existing.recipes.push(recipe.title);
            // For now, just combine amounts as strings
            if (ingredient.amount && existing.totalAmount) {
              existing.totalAmount += `, ${ingredient.amount}`;
            } else if (ingredient.amount) {
              existing.totalAmount = ingredient.amount;
            }
          } else {
            ingredientMap.set(key, {
              ingredient: ingredient.name,
              totalAmount: ingredient.amount || '1',
              category: ingredient.category || 'pantry',
              checked: false,
              recipes: [recipe.title],
            });
          }
        });
      });

      const items = Array.from(ingredientMap.values());

      // Create shopping list
      const shoppingListId = adminDb
        .collection('households')
        .doc(input.householdId)
        .collection('shoppingLists')
        .doc().id;

      const shoppingList = {
        id: shoppingListId,
        weeklyPlanId: input.weeklyPlanId,
        householdId: input.householdId,
        items,
        generatedAt: new Date(),
        userGenerated: true,
      };

      await adminDb
        .collection('households')
        .doc(input.householdId)
        .collection('shoppingLists')
        .doc(shoppingListId)
        .set(shoppingList);

      return shoppingList;
    }),

  // Get shopping list
  get: protectedProcedure
    .input(z.object({
      householdId: z.string(),
      shoppingListId: z.string(),
    }))
    .query(async ({ input }) => {
      const doc = await adminDb
        .collection('households')
        .doc(input.householdId)
        .collection('shoppingLists')
        .doc(input.shoppingListId)
        .get();

      if (!doc.exists) {
        return null;
      }

      return { id: doc.id, ...doc.data() };
    }),

  // Toggle item checked status
  toggleItemChecked: protectedProcedure
    .input(z.object({
      householdId: z.string(),
      shoppingListId: z.string(),
      itemIndex: z.number(),
    }))
    .mutation(async ({ input }) => {
      const listRef = adminDb
        .collection('households')
        .doc(input.householdId)
        .collection('shoppingLists')
        .doc(input.shoppingListId);

      const listDoc = await listRef.get();
      if (!listDoc.exists) {
        throw new Error('Shopping list not found');
      }

      const listData = listDoc.data();
      const items = [...(listData?.items || [])];
      
      if (input.itemIndex >= 0 && input.itemIndex < items.length) {
        items[input.itemIndex].checked = !items[input.itemIndex].checked;
        
        await listRef.update({ items });
      }

      return { success: true };
    }),
});
