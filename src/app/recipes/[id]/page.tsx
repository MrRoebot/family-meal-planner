'use client';

import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { api as trpc } from '@/lib/trpc';
import { useAuth } from '@/lib/auth';

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const recipeId = params.id as string;
  const householdId = user?.householdId || 'household-1';

  const { data: recipe, isLoading, error } = trpc.recipes.getById.useQuery({
    householdId,
    recipeId,
  });

  const toggleLikeMutation = trpc.recipes.toggleLike.useMutation();

  const handleLike = async () => {
    if (!recipe) return;
    
    try {
      await toggleLikeMutation.mutateAsync({
        householdId,
        recipeId: recipe.id,
      });
      // Refetch the recipe to update likes
      // Note: In a real app, you'd want to optimistically update
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-4">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-gray-200 rounded w-24"></div>
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !recipe) {
    return (
      <AppLayout>
        <div className="p-4">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Recipe not found
            </h3>
            <p className="text-gray-500 mb-4">
              The recipe you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isLiked = recipe.likes.includes(user?.uid || '');
  const likesCount = recipe.likes.length;

  return (
    <AppLayout>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Recipes
          </button>

          <button
            onClick={handleLike}
            disabled={toggleLikeMutation.isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isLiked 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg 
              className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} 
              fill={isLiked ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {isLiked ? 'Liked' : 'Like'} ({likesCount})
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Recipe Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{recipe.title}</h1>
            
            {recipe.description && (
              <p className="text-gray-600 text-lg mb-4">{recipe.description}</p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              {recipe.estimatedTime && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formatTime(recipe.estimatedTime)}</span>
                </div>
              )}
              
              {recipe.servings && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Serves {recipe.servings}</span>
                </div>
              )}

              {recipe.timesPlanned > 0 && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Planned {recipe.timesPlanned} time{recipe.timesPlanned !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {recipe.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Source URL */}
            {recipe.sourceUrl && (
              <div className="mt-4">
                <a
                  href={recipe.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Original Recipe
                </a>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-0">
            {/* Ingredients */}
            <div className="p-6 border-r border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Ingredients ({recipe.ingredients.length})
              </h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient: any, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 border border-gray-300 rounded mt-0.5 flex-shrink-0"></div>
                    <div className="flex-1">
                      <span className="text-gray-900">
                        {ingredient.amount && (
                          <span className="font-medium">{ingredient.amount} </span>
                        )}
                        {ingredient.name}
                      </span>
                      {ingredient.category && (
                        <span className="block text-xs text-gray-500 mt-1">
                          {ingredient.category}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Directions */}
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Directions ({recipe.directions.length} steps)
              </h2>
              <ol className="space-y-4">
                {recipe.directions.map((direction: string, index: number) => (
                  <li key={index} className="flex gap-4">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-sm font-medium rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <p className="text-gray-900 leading-relaxed pt-0.5">{direction}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-4">
              <button className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                + Add to Weekly Plan
              </button>
              <button className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Share Recipe
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
