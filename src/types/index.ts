// User types
export interface User {
  id: string;
  email: string;
  name: string;
  householdId: string;
  role: 'parent' | 'child';
  createdAt: Date;
  lastActiveAt: Date;
}

// Household types
export interface Household {
  id: string;
  name: string;
  createdBy: string;
  members: string[];
  genAiRequestsUsed: number;
  genAiRequestLimit: number;
  createdAt: Date;
  settings: {
    timezone: string;
    weekStartsOn: 'sunday' | 'monday';
  };
}

// Recipe types
export interface Ingredient {
  name: string;
  amount?: string;
  category?: string;
}

export interface Recipe {
  id: string;
  householdId: string;
  title: string;
  description?: string;
  ingredients: Ingredient[];
  directions: string[];
  tags: string[];
  estimatedTime?: number;
  servings?: number;
  sourceUrl?: string;
  createdBy: string;
  createdAt: Date;
  likes: string[];
  timesPlanned: number;
}

// Weekly Plan types
export interface WeeklyPlan {
  id: string;
  householdId: string;
  weekStartDate: Date;
  meals: {
    [day: string]: string; // day -> recipeId (one meal per day)
  };
  createdBy: string;
  lastModified: Date;
}

// Shopping List types
export interface ShoppingItem {
  ingredient: string;
  totalAmount: string;
  category: string;
  checked: boolean;
  recipes: string[];
}

export interface ShoppingList {
  id: string;
  weeklyPlanId: string;
  householdId: string;
  items: ShoppingItem[];
  generatedAt: Date;
  userGenerated: boolean;
  completedAt?: Date;
}

// Meal Request types (Future feature)
export interface MealRequest {
  id: string;
  householdId: string;
  requestedBy: string;
  recipeId?: string;
  customMealName?: string;
  preferredDay?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

// Grocery categories
export const GROCERY_CATEGORIES = [
  'produce',
  'meat & seafood',
  'dairy',
  'deli',
  'bakery',
  'frozen',
  'pantry',
  'beverages',
  'household',
] as const;

export type GroceryCategory = typeof GROCERY_CATEGORIES[number];
