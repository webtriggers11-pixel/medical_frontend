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
  clientPricing?: ClientPanelPricing[];
}

export interface ClientPanelPricing {
  id: string;
  clientId: string;
  panelId: string;
  costToClient: number;
  discountAfterN: number;
  discountedPrice: number;
  client?: { id: string; name: string | null; email: string };
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

export interface SetClientPricingInput {
  clientId: string;
  costToClient: number;
  discountAfterN?: number;
  discountedPrice?: number;
}
