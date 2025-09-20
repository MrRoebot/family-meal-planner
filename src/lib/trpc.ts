import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import { type AppRouter } from '@/server/api/root';
import superjson from 'superjson';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export const api = createTRPCReact<AppRouter>();

// Export client for manual configuration
export const trpcClient = api.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers() {
        // Get auth token from client - only run on client side
        if (typeof window !== 'undefined') {
          try {
            const token = localStorage.getItem('authToken');
            return token ? { authorization: `Bearer ${token}` } : {};
          } catch (error) {
            console.error('Error accessing localStorage:', error);
            return {};
          }
        }
        return {};
      },
    }),
  ],
});
