import type { Role } from './auth.types';

export interface UserRecord {
  id: string;
  clientId: string | null;
  email: string;
  name: string | null;
  mobile: string | null;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Creating a client creates a USER login.
export interface CreateClientInput {
  name?: string;
  email: string;
  password: string;
  mobile?: string;
}
