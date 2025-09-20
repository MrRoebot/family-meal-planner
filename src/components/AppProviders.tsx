'use client';

import { ReactQueryProvider } from '@/lib/react-query';
import { AuthProvider } from '@/lib/auth';

interface AppProvidersProps {
  children: React.ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ReactQueryProvider>
  );
}
