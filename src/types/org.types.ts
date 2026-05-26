// Org hierarchy (company → zone → city → store) — read-only types used by
// the candidate cascade.
export interface Zone {
  id: string;
  companyId: string;
  name: string;
}

export interface City {
  id: string;
  zoneId: string;
  companyId: string;
  name: string;
}

export interface Store {
  id: string;
  cityId: string;
  companyId: string;
  name: string;
  storeCode: string;
}
