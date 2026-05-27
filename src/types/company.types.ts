export type CompanyStatus = 'ACTIVE' | 'INACTIVE';
export type CheckupFrequency = 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY';

export interface Company {
  id: string;
  name: string;
  code: string;
  industryType: string;
  gstNumber: string | null;
  contactName: string;
  contactMobile: string;
  billingEmail: string;
  checkupFrequency: CheckupFrequency;
  status: CompanyStatus;
  createdAt: string;
}

export interface CreateCompanyInput {
  name: string;
  code?: string;
  industryType: string;
  gstNumber?: string;
  contactName: string;
  contactMobile: string;
  billingEmail: string;
  checkupFrequency: CheckupFrequency;
}

export interface UpdateCompanyInput {
  name?: string;
  industryType?: string;
  gstNumber?: string;
  contactName?: string;
  contactMobile?: string;
  billingEmail?: string;
  checkupFrequency?: CheckupFrequency;
  status?: CompanyStatus;
}
