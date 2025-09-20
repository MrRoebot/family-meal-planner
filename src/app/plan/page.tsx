'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/lib/auth';

export default function PlanPage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <AppLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Weekly Plan</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Sign Out
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-4">
            Welcome, {user?.email}! 👋
          </p>
          
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">This Week&apos;s Meals</h2>
            
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <div key={day} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{day}</span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    + Add meal
                  </button>
                </div>
                <div className="mt-2 text-gray-500 text-sm">
                  No meal planned
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              disabled
              className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg cursor-not-allowed"
            >
              📝 Generate Shopping List (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
