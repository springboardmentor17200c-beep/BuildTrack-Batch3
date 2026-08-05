export type MaterialCategory =
  | 'Cement'
  | 'Steel'
  | 'Bricks'
  | 'Sand'
  | 'Concrete'
  | 'Electrical Materials'
  | 'Plumbing Materials';

export type ProcurementCategory =
  | 'Raw Materials'
  | 'Equipment'
  | 'Machinery'
  | 'Safety Equipment'
  | 'Office Supplies';

export interface Material {
  id: number;
  name: string;
  category: MaterialCategory;
  quantity: string | number;
  capacityLimit: number;
  currentLevel: number; // percentage
  unit: string;
  supplier?: string;
  minimumStock?: number;
  projectId?: number;
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

export interface MaterialProcurement {
  id: number;
  projectId: number;
  materialName: string;
  category?: ProcurementCategory | string;
  supplier: string;
  vendorContact?: string;
  invoiceNumber?: string;
  paymentStatus?: 'Pending' | 'Paid' | 'Unpaid' | string;
  quantity: number;
  totalCost: number;
  purchaseDate: string;
  status: string;
}
