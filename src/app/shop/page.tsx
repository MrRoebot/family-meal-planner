'use client';

import AppLayout from '@/components/AppLayout';

export default function ShopPage() {
  return (
    <AppLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping List</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-4">
            Your weekly shopping list
          </p>
          
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No shopping list
            </h3>
            <p className="text-gray-500 mb-4">
              Generate a shopping list from your weekly meal plan
            </p>
            <button
              disabled
              className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed"
            >
              Generate List (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
