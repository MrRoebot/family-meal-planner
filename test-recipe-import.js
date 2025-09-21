#!/usr/bin/env node

/**
 * Test script to import recipes directly via tRPC API
 */

const recipeText = `Title: Quesadillas
Ingredients:
-Monterey cheese
-Taco shell
-Avocado
-Tomato
-Black beans
-Protein
-Salsa
---
Title: Fried Chicken
Ingredients:
-1.5 lbs boneless chicken thighs
-Kentucky Colonel mix
-2 eggs
---
Title: Zemka
Ingredients:
-Hot roll mix
-1 lb Colby cheese
-2 eggs
---
Title: Chicken Fried Rice
Ingredients:
-Instant rice
-Fried rice packet
-Corn/pea canned mixture
-1 lb chicken thighs
-Corn starch
-Cashews
-Sliced water chestnuts
-Egg
-Soy sauce
---
Title: Pepperoni Bread
Ingredients:
-1 lb mozzarella cheese
-1 lb pizza blend cheese
-1 pizza dough
-1 cup pizza sauce
-Pepperoni`;

// Same parsing logic as in BulkRecipeImport.tsx
function parseRecipes(text) {
  const recipes = [];
  const recipeBlocks = text.split(/^---$/m).filter(block => block.trim());

  for (const block of recipeBlocks) {
    const lines = block.trim().split('\n').map(line => line.trim()).filter(line => line);
    const recipe = {
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
        recipe.tags = tagsText.split(',').map(tag => tag.trim()).filter(tag => tag);
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
}

function parseIngredient(text) {
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
}

function categorizeIngredient(name) {
  const lowerName = name.toLowerCase();
  
  // Produce
  if (lowerName.match(/\b(tomato|onion|garlic|pepper|carrot|celery|lettuce|spinach|broccoli|potato|apple|banana|lemon|lime|orange|herbs?|parsley|cilantro|basil|oregano|thyme|avocado)\b/)) {
    return 'produce';
  }
  
  // Meat & Seafood
  if (lowerName.match(/\b(chicken|beef|pork|turkey|salmon|tuna|shrimp|fish|meat|ground|steak|chops?|thighs?)\b/)) {
    return 'meat & seafood';
  }
  
  // Dairy
  if (lowerName.match(/\b(milk|cheese|butter|cream|eggs?|yogurt|sour cream|monterey|mozzarella|colby)\b/)) {
    return 'dairy';
  }
  
  // Pantry
  if (lowerName.match(/\b(flour|sugar|salt|pepper|oil|vinegar|rice|pasta|beans?|spices?|sauce|stock|broth|mix|packet|shell|starch|soy|cashews)\b/)) {
    return 'pantry';
  }
  
  // Default to pantry for unknown items
  return 'pantry';
}

async function testRecipeImport() {
  console.log('🧪 Testing Recipe Import API');
  console.log('============================\n');

  // Parse the recipes
  console.log('📋 Parsing recipes...');
  const parsedRecipes = parseRecipes(recipeText);
  console.log(`✅ Parsed ${parsedRecipes.length} recipes:\n`);

  parsedRecipes.forEach((recipe, index) => {
    console.log(`${index + 1}. ${recipe.title}`);
    console.log(`   - ${recipe.ingredients.length} ingredients`);
    console.log(`   - ${recipe.directions.length} directions`);
    console.log(`   - Tags: ${recipe.tags.join(', ') || 'none'}`);
    console.log('');
  });

  // Test API calls
  console.log('🚀 Testing API calls...\n');

  for (let i = 0; i < parsedRecipes.length; i++) {
    const recipe = parsedRecipes[i];
    console.log(`Testing recipe ${i + 1}: ${recipe.title}`);

    try {
      // Prepare the tRPC call data
      const payload = {
        json: {
          householdId: 'household-1',
          ...recipe
        }
      };

      const response = await fetch('http://localhost:3000/api/trpc/recipes.create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token' // Using mock token for now
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      console.log(`Status: ${response.status}`);
      console.log(`Response: ${responseText}\n`);

      if (!response.ok) {
        console.log(`❌ Failed to create recipe: ${recipe.title}`);
        break;
      } else {
        console.log(`✅ Successfully created recipe: ${recipe.title}`);
      }

    } catch (error) {
      console.log(`❌ Error creating recipe ${recipe.title}:`, error.message);
      break;
    }
  }
}

// Run the test
testRecipeImport().catch(console.error);
