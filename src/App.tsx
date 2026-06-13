import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import { AppRouter } from './routes/AppRouter';
import { getApiErrorMessage } from './lib/apiError';

// Mutation metadata used to drive global toasts (set per-hook via `meta`).
declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      /** Toast shown on success. */
      successMessage?: string;
      /** Skip the automatic error toast (e.g. forms that show errors inline). */
      skipErrorToast?: boolean;
    };
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60 * 1000 },
  },
  // One place to surface every mutation's outcome as a toast.
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      if (mutation.meta?.skipErrorToast) return;
      toast.error(getApiErrorMessage(error));
    },
    onSuccess: (_data, _vars, _ctx, mutation) => {
      if (mutation.meta?.successMessage) toast.success(mutation.meta.successMessage);
    },
  }),
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}

export default App;
