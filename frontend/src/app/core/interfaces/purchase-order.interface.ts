export interface PurchaseOrderRecord {
  id: number;
  poNumber: string;
  vendorId: number;
  vendorName?: string;
  requestId?: number;
  projectId: number;
  projectName?: string;
  materialName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  expectedDeliveryDate?: string;
  status: 'Created' | 'Sent' | 'Accepted' | 'Rejected' | 'Delivered' | 'Received' | 'Cancelled';

  createdAt?: string;
}
