'use client';

import { AuthProvider } from '@/lib/auth';
import { api } from '@/lib/trpc';

function AppProvidersInner({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

export default api.withTRPC(AppProvidersInner);
