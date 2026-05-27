export type PanelStatus = 'ACTIVE' | 'INACTIVE';

export interface Panel {
  id: string;
  labId: string;
  bundledTestId: string;
  name: string;
  timing: string | null;
  mrp: number;
  costToVendor: number;
  labContact: string | null;
  status: PanelStatus;
  createdAt: string;
  lab?: { id: string; name: string; serviceCities: string[] };
  bundledTest?: { id: string; name: string; testsIncluded: string[] };
  companyPricing?: CompanyPanelPricing[];
}

export interface CompanyPanelPricing {
  id: string;
  companyId: string;
  panelId: string;
  costToClient: number;
  discountAfterN: number;
  discountedPrice: number;
  company?: { id: string; name: string };
}

export interface CreatePanelInput {
  labId: string;
  bundledTestId: string;
  name: string;
  timing?: string;
  mrp: number;
  costToVendor: number;
  labContact?: string;
}

export interface UpdatePanelInput {
  name?: string;
  timing?: string;
  mrp?: number;
  costToVendor?: number;
  labContact?: string;
  status?: PanelStatus;
}

export interface SetCompanyPricingInput {
  companyId: string;
  costToClient: number;
  discountAfterN?: number;
  discountedPrice?: number;
}
