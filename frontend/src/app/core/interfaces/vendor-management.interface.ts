export interface VendorRecord {
  id: number;
  vendorName: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  materials?: string;
  rating?: number;
  isActive?: boolean;
}
