export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  users: {
    all: ['users'] as const,
    byId: (id: string) => ['users', id] as const,
  },
  candidates: {
    all: ['candidates'] as const,
    byId: (id: string) => ['candidates', id] as const,
  },
  org: {
    zones: ['org', 'zones'] as const,
    cities: (zoneId: string) => ['org', 'cities', zoneId] as const,
    stores: (cityId: string) => ['org', 'stores', cityId] as const,
  },
};
