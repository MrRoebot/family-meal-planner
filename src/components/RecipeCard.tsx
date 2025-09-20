'use client';

import Link from 'next/link';
import { Recipe } from '@/types';
import { api as trpc } from '@/lib/trpc';

interface RecipeCardProps {
  recipe: Recipe;
  currentUserId: string;
  householdId: string;
  onLikeToggle?: () => void;
}

export default function RecipeCard({ 
  recipe, 
  currentUserId, 
  householdId,
  onLikeToggle 
}: RecipeCardProps) {
  const toggleLikeMutation = trpc.recipes.toggleLike.useMutation();
  
  const isLiked = recipe.likes.includes(currentUserId);
  const likesCount = recipe.likes.length;

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking like button
    e.stopPropagation();
    
    try {
      await toggleLikeMutation.mutateAsync({
        householdId,
        recipeId: recipe.id,
      });
      onLikeToggle?.();
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

  return (
    <Link href={`/recipes/${recipe.id}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-lg leading-tight truncate">
              {recipe.title}
            </h3>
            {recipe.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {recipe.description}
              </p>
            )}
          </div>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          {recipe.estimatedTime && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(recipe.estimatedTime)}
            </span>
          )}
          
          {recipe.servings && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Serves {recipe.servings}
            </span>
          )}

          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {recipe.ingredients.length} ingredients
          </span>
        </div>

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {recipe.tags.slice(0, 3).map((tag: string) => (
              <span
                key={tag}
                className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
            {recipe.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{recipe.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              disabled={toggleLikeMutation.isPending}
              className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                isLiked 
                  ? 'text-red-600 hover:text-red-700' 
                  : 'text-gray-500 hover:text-red-600'
              }`}
            >
              <svg 
                className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} 
                fill={isLiked ? 'currentColor' : 'none'} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {likesCount}
            </button>

            {recipe.timesPlanned > 0 && (
              <span className="text-sm text-gray-500">
                Planned {recipe.timesPlanned} time{recipe.timesPlanned !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View Recipe →
          </button>
        </div>
      </div>
    </Link>
  );
}
