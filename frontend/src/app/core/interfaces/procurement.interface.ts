export interface ProcurementItem {
  id: number;
  projectId: number;
  projectName?: string;
  materialName: string;
  category: string;
  supplier: string;
  vendorContact?: string;
  invoiceNumber?: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  quantity: number;
  totalCost: number;
  purchaseDate: string;
  status: 'Pending' | 'Approved' | 'Ordered' | 'Delivered' | 'Cancelled';
  createdAt?: string;
}
