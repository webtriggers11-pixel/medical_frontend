export type PanelStatus = 'ACTIVE' | 'INACTIVE';

export interface PanelTest {
  id: string;
  panelId: string;
  testMasterId: string;
  testMaster?: { id: string; name: string; status: string };
}

export interface Panel {
  id: string;
  panelId: string | null;
  labId: string;
  bundledTestId: string | null;
  name: string;
  timing: string | null;
  mrp: number;
  costToVendor: number;
  labContact: string | null;
  status: PanelStatus;
  createdAt: string;
  lab?: { id: string; name: string; address: string | null; pincode: string | null; serviceCities: string[] };
  bundledTest?: { id: string; name: string; testsIncluded: string[] } | null;
  panelTests?: PanelTest[];
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
  testMasterIds: string[];
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
