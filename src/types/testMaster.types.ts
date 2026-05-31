export type TestMasterStatus = 'ACTIVE' | 'INACTIVE';

export interface TestMaster {
  id: string;
  name: string;
  description: string | null;
  status: TestMasterStatus;
  createdAt: string;
}

export interface CreateTestMasterInput {
  name: string;
  description?: string;
  status?: TestMasterStatus;
}

export interface UpdateTestMasterInput {
  name?: string;
  description?: string;
  status?: TestMasterStatus;
}
