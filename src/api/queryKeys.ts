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
    // All store queries live under ['org','stores']; invalidating that prefix
    // refreshes both the full list and any city-scoped (candidate cascade) list.
    storesAll: ['org', 'stores'] as const,
    stores: (cityId: string) => ['org', 'stores', cityId] as const,
  },
  labs: {
    all: ['labs'] as const,
    byId: (id: string) => ['labs', id] as const,
    bundledTests: (labId: string) => ['labs', labId, 'bundled-tests'] as const,
  },
  panels: {
    all: ['panels'] as const,
    byLabId: (labId: string) => ['panels', 'lab', labId] as const,
    byId: (id: string) => ['panels', id] as const,
    pricing: (panelId: string) => ['panels', panelId, 'pricing'] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    pending: ['bookings', 'pending'] as const,
    byStatus: (status: string) => ['bookings', 'status', status] as const,
    byId: (id: string) => ['bookings', id] as const,
  },
  reports: {
    byCandidate: (candidateId: string) => ['reports', 'candidate', candidateId] as const,
    byBooking: (bookingId: string) => ['reports', 'booking', bookingId] as const,
  },
};
