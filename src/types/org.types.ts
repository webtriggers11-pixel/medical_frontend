export type ZoneStatus = 'ACTIVE' | 'INACTIVE';
export type CityStatus = 'ACTIVE' | 'INACTIVE';
export type StoreStatus = 'ACTIVE' | 'INACTIVE';

export interface Zone {
  id: string;
  name: string;
  status: ZoneStatus;
  createdAt: string;
}

export interface City {
  id: string;
  zoneId: string;
  name: string;
  status: CityStatus;
  createdAt: string;
}

export interface Store {
  id: string;
  storeId: string | null;
  cityId: string;
  clientId: string;
  name: string;
  storeCode: string;
  address: string;
  storeHeadName: string;
  storeHeadMobile: string;
  storeContact: string | null;
  storeAsstHeadName: string | null;
  storeAsstHeadMobile: string | null;
  email: string | null;
  status: StoreStatus;
  createdAt: string;
}

// Store as returned by the list endpoint, enriched with its city + zone + client.
export interface StoreWithLocation extends Store {
  city?: {
    id: string;
    name: string;
    zoneId: string;
    zone: { id: string; name: string } | null;
  } | null;
  client?: { id: string; name: string | null; email: string } | null;
  _count?: { candidates: number };
}

export interface CreateZoneInput { name: string; }
export interface CreateCityInput { zoneId: string; name: string; }
export interface CreateStoreInput {
  clientId?: string;  // ADMIN only — omit when USER creates their own store
  cityId: string; storeCode: string; name: string;
  address: string; storeHeadName: string; storeHeadMobile: string; email?: string;
}
