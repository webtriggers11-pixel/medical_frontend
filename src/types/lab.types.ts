export type LabStatus = 'ACTIVE' | 'INACTIVE';

export interface Lab {
  id: string;
  name: string;
  contactName: string;
  contactMobile: string;
  email: string;
  serviceCities: string[];
  status: LabStatus;
  createdAt: string;
}

export interface CreateLabInput {
  name: string;
  contactName: string;
  contactMobile: string;
  email: string;
  serviceCities?: string[];
}

export interface UpdateLabInput {
  name?: string;
  contactName?: string;
  contactMobile?: string;
  email?: string;
  serviceCities?: string[];
  status?: LabStatus;
}

export interface BundledTest {
  id: string;
  labId: string;
  name: string;
  testsIncluded: string[];
  defaultTiming: string | null;
  suggestedMrp: number;
  createdAt: string;
  lab?: { id: string; name: string };
}

export interface CreateBundledTestInput {
  labId: string;
  name: string;
  testsIncluded: string[];
  defaultTiming?: string;
  suggestedMrp: number;
}

export interface UpdateBundledTestInput {
  name?: string;
  testsIncluded?: string[];
  defaultTiming?: string;
  suggestedMrp?: number;
}
