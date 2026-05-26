import type { Role } from './auth.types';

export interface UserRecord {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  isDeleted: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
