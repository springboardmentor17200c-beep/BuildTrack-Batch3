export interface Equipment {
  id: number;
  name: string;
  category: string;
  status: 'Available' | 'Assigned' | 'Maintenance';
  operator: string;
  serialNumber: string;
  projectId?: number;
  quantity?: number;
}

export interface ResourceAllocation {
  id: number;
  assetName: string;
  project: string;
  operator: string;
  startDate: string;
  status: 'In Use' | 'Standby' | 'Under Maintenance';
}

