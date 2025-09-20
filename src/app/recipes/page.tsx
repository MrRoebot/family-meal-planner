'use client';

import AppLayout from '@/components/AppLayout';

export default function RecipesPage() {
  return (
    <AppLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Recipes</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-4">
            Manage your family&apos;s favorite recipes
          </p>
          
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No recipes yet
            </h3>
            <p className="text-gray-500 mb-4">
              Start by adding your family&apos;s favorite recipes
            </p>
            <button
              disabled
              className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed"
            >
              + Add Recipe (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
