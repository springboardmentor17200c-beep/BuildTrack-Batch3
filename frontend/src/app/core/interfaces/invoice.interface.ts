export interface InvoiceRecord {
  id: number;
  invoiceNo: string;
  vendorId: number;
  vendorName?: string;
  purchaseOrderId: number;
  poNumber?: string;
  amount: number;
  gst: number;
  invoiceDate: string;
  paymentStatus: 'Pending' | 'Approved' | 'Paid';
}
