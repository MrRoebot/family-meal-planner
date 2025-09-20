'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import RecipeCard from '@/components/RecipeCard';
import BulkRecipeImport from '@/components/BulkRecipeImport';
import { api as trpc } from '@/lib/trpc';
import { useAuth } from '@/lib/auth';

export default function RecipesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showImport, setShowImport] = useState(false);

  const householdId = user?.householdId || 'household-1';

  const {
    data: recipes = [],
    isLoading,
    refetch,
  } = trpc.recipes.getAll.useQuery({
    householdId,
    search: searchTerm || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
  });

  // Extract all unique tags from recipes
  const allTags = Array.from(
    new Set(recipes.flatMap((recipe) => recipe.tags))
  ).sort();

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
  };

  const handleImportSuccess = () => {
    setShowImport(false);
    refetch();
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (showImport) {
    return (
      <AppLayout>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Import Recipes</h1>
            <button
              onClick={() => setShowImport(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              ✕ Cancel
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <BulkRecipeImport
              householdId={householdId}
              onSuccess={handleImportSuccess}
            />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Recipes</h1>
          <button
            onClick={() => setShowImport(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            + Import Recipes
          </button>
        </div>

        {recipes.length > 0 ? (
          <>
            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search recipes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Tags Filter */}
              {allTags.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Filter by tags:</span>
                    {(selectedTags.length > 0 || searchTerm) && (
                      <button
                        onClick={clearFilters}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag: string) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                          selectedTags.includes(tag)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600 hover:text-blue-600'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Results Summary */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} found
                {(searchTerm || selectedTags.length > 0) && (
                  <span className="ml-1">
                    {searchTerm && `for "${searchTerm}"`}
                    {selectedTags.length > 0 && (
                      <span>
                        {searchTerm ? ' with tags: ' : 'with tags: '}
                        {selectedTags.join(', ')}
                      </span>
                    )}
                  </span>
                )}
              </p>
            </div>

            {/* Recipes Grid */}
            <div className="grid gap-4">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  currentUserId={user?.uid || ''}
                  householdId={householdId}
                  onLikeToggle={refetch}
                />
              ))}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📖</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No recipes yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start by importing your family&apos;s favorite recipes
              </p>
              <button
                onClick={() => setShowImport(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
              >
                + Import Your First Recipes
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
