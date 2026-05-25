export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  users: {
    all: ['users'] as const,
    byId: (id: string) => ['users', id] as const,
  },
};
