'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/lib/auth';

export default function FamilyPage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <AppLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Family & Settings</h1>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Your Profile</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Email:</span> {user?.email}</p>
              <p><span className="font-medium">Role:</span> Parent</p>
              <p><span className="font-medium">Household:</span> Not set up yet</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Household Management</h2>
            <p className="text-gray-600 mb-4">
              Create or join a household to start meal planning
            </p>
            <button
              disabled
              className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed"
            >
              Create Household (Coming Soon)
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Account</h2>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
