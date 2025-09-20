'use client';

import { useState } from 'react';
import { api as trpc } from '@/lib/trpc';

interface ParsedRecipe {
  title: string;
  description?: string;
  ingredients: { name: string; amount?: string; category?: string }[];
  directions: string[];
  tags: string[];
  estimatedTime?: number;
  servings?: number;
}

export default function BulkRecipeImport({ 
  householdId, 
  onSuccess 
}: { 
  householdId: string; 
  onSuccess: () => void;
}) {
  const [importText, setImportText] = useState('');
  const [parsedRecipes, setParsedRecipes] = useState<ParsedRecipe[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const createRecipeMutation = trpc.recipes.create.useMutation();

  const parseRecipes = (text: string): ParsedRecipe[] => {
    const recipes: ParsedRecipe[] = [];
    const recipeBlocks = text.split(/^---$/m).filter(block => block.trim());

    for (const block of recipeBlocks) {
      const lines = block.trim().split('\n').map(line => line.trim()).filter(line => line);
      const recipe: ParsedRecipe = {
        title: '',
        ingredients: [],
        directions: [],
        tags: [],
      };

      let currentSection = '';
      
      for (const line of lines) {
        // Check for section headers
        if (line.toLowerCase().startsWith('title:')) {
          recipe.title = line.substring(6).trim();
        } else if (line.toLowerCase().startsWith('description:')) {
          recipe.description = line.substring(12).trim();
        } else if (line.toLowerCase().startsWith('time:') || line.toLowerCase().startsWith('estimated time:')) {
          const timeText = line.split(':')[1]?.trim();
          const timeMatch = timeText?.match(/(\d+)/);
          if (timeMatch) {
            recipe.estimatedTime = parseInt(timeMatch[1]);
          }
        } else if (line.toLowerCase().startsWith('servings:') || line.toLowerCase().startsWith('serves:')) {
          const servingsText = line.split(':')[1]?.trim();
          const servingsMatch = servingsText?.match(/(\d+)/);
          if (servingsMatch) {
            recipe.servings = parseInt(servingsMatch[1]);
          }
        } else if (line.toLowerCase().startsWith('tags:')) {
          const tagsText = line.substring(5).trim();
          recipe.tags = tagsText.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
        } else if (line.toLowerCase() === 'ingredients:') {
          currentSection = 'ingredients';
        } else if (line.toLowerCase() === 'directions:' || line.toLowerCase() === 'instructions:') {
          currentSection = 'directions';
        } else if (line.startsWith('-') && currentSection === 'ingredients') {
          // Parse ingredient line
          const ingredientText = line.substring(1).trim();
          const ingredient = parseIngredient(ingredientText);
          recipe.ingredients.push(ingredient);
        } else if ((line.match(/^\d+\./) || line.startsWith('-')) && currentSection === 'directions') {
          // Parse direction line
          const directionText = line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim();
          if (directionText) {
            recipe.directions.push(directionText);
          }
        } else if (currentSection === 'directions' && line && !line.match(/^(title|description|time|servings|tags|ingredients|directions):/i)) {
          // Continuation of previous direction
          recipe.directions.push(line);
        }
      }

      // If no explicit title found, use first non-empty line
      if (!recipe.title && lines.length > 0) {
        recipe.title = lines[0];
      }

      if (recipe.title && recipe.ingredients.length > 0) {
        recipes.push(recipe);
      }
    }

    return recipes;
  };

  const parseIngredient = (text: string): { name: string; amount?: string; category?: string } => {
    // Try to separate amount from ingredient name
    const amountPatterns = [
      /^(\d+\/?\d*\s*(?:cups?|tbsp?|tsp?|lbs?|pounds?|oz|ounces?|grams?|kg|ml|liters?|cloves?|pieces?|slices?|medium|large|small))\s+(.+)$/i,
      /^(\d+\.?\d*)\s+(.+)$/,
      /^(\d+\/\d+)\s+(.+)$/,
      /^(a\s+(?:few|little|pinch|dash))\s+(.+)$/i,
    ];

    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          name: match[2].trim(),
          amount: match[1].trim(),
          category: categorizeIngredient(match[2].trim()),
        };
      }
    }

    // No amount found, treat entire text as ingredient name
    return {
      name: text,
      category: categorizeIngredient(text),
    };
  };

  const categorizeIngredient = (name: string): string => {
    const lowerName = name.toLowerCase();
    
    // Produce
    if (lowerName.match(/\b(tomato|onion|garlic|pepper|carrot|celery|lettuce|spinach|broccoli|potato|apple|banana|lemon|lime|orange|herbs?|parsley|cilantro|basil|oregano|thyme)\b/)) {
      return 'produce';
    }
    
    // Meat & Seafood
    if (lowerName.match(/\b(chicken|beef|pork|turkey|salmon|tuna|shrimp|fish|meat|ground|steak|chops?)\b/)) {
      return 'meat & seafood';
    }
    
    // Dairy
    if (lowerName.match(/\b(milk|cheese|butter|cream|eggs?|yogurt|sour cream)\b/)) {
      return 'dairy';
    }
    
    // Pantry
    if (lowerName.match(/\b(flour|sugar|salt|pepper|oil|vinegar|rice|pasta|beans?|spices?|sauce|stock|broth)\b/)) {
      return 'pantry';
    }
    
    // Default to pantry for unknown items
    return 'pantry';
  };

  const handlePreview = () => {
    const parsed = parseRecipes(importText);
    setParsedRecipes(parsed);
    setIsPreview(true);
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      for (const recipe of parsedRecipes) {
        await createRecipeMutation.mutateAsync({
          householdId,
          ...recipe,
        });
      }
      setImportText('');
      setParsedRecipes([]);
      setIsPreview(false);
      onSuccess();
    } catch (error) {
      console.error('Failed to import recipes:', error);
    } finally {
      setIsImporting(false);
    }
  };

  if (isPreview) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Preview Import ({parsedRecipes.length} recipes)</h3>
          <button
            onClick={() => setIsPreview(false)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            ← Back to Edit
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-3">
          {parsedRecipes.map((recipe, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900">{recipe.title}</h4>
              {recipe.description && (
                <p className="text-sm text-gray-600 mt-1">{recipe.description}</p>
              )}
              <div className="mt-2 text-sm text-gray-500">
                {recipe.ingredients.length} ingredients • {recipe.directions.length} steps
                {recipe.estimatedTime && ` • ${recipe.estimatedTime} min`}
                {recipe.servings && ` • Serves ${recipe.servings}`}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isImporting ? 'Importing...' : `Import ${parsedRecipes.length} Recipes`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="import-text" className="block text-sm font-medium text-gray-700 mb-2">
          Paste your recipes here
        </label>
        <textarea
          id="import-text"
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Paste recipes in this format:

Title: Spaghetti Bolognese
Description: Classic Italian pasta dish
Time: 30 minutes
Servings: 4
Tags: italian, pasta, dinner

Ingredients:
- 1 lb ground beef
- 1 onion, diced
- 2 cloves garlic, minced
- 1 can tomato sauce
- 1 lb spaghetti

Directions:
1. Cook the spaghetti according to package directions
2. Brown the ground beef in a large pan
3. Add onion and garlic, cook until soft
4. Add tomato sauce and simmer

---

[Next recipe...]"
          className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none text-sm"
        />
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>Format tips:</strong></p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li>Separate multiple recipes with &ldquo;---&rdquo;</li>
          <li>Use &ldquo;Title:&rdquo;, &ldquo;Ingredients:&rdquo;, &ldquo;Directions:&rdquo; as section headers</li>
          <li>List ingredients with &ldquo;-&rdquo; (amounts will be auto-parsed)</li>
          <li>Number directions or use &ldquo;-&rdquo;</li>
          <li>Optional fields: Description, Time, Servings, Tags</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handlePreview}
          disabled={!importText.trim()}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          Preview Import
        </button>
      </div>
    </div>
  );
}
