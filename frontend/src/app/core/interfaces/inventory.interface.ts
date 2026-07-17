export interface Material {
  id: number;
  name: string;
  category: 'Raw Materials' | 'Structural Metal' | 'Masonry Blocks' | 'Aggregates' | 'Electrical' | 'Plumbing';
  quantity: string;
  capacityLimit: number;
  currentLevel: number; // percentage
  unit: string;
}

export interface MaterialRequest {
  id: number;
  item: string;
  qty: string;
  project: string;
  requestedBy: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  vendor?: string;
  requiredDate?: string;
}
