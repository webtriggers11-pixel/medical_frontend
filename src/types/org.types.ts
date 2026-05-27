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
  cityId: string;
  companyId: string;
  name: string;
  storeCode: string;
  address: string;
  storeHeadName: string;
  storeHeadMobile: string;
  email: string | null;
  status: StoreStatus;
  createdAt: string;
}

export interface CreateZoneInput { name: string; }
export interface CreateCityInput { zoneId: string; name: string; }
export interface CreateStoreInput {
  companyId: string; cityId: string; storeCode: string; name: string;
  address: string; storeHeadName: string; storeHeadMobile: string; email?: string;
}
