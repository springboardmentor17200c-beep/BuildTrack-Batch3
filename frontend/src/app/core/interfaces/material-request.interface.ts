export interface MaterialRequest {
  id: number;
  projectId: number;
  projectName?: string;
  materialName: string;
  quantity: number;
  requiredDate: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'Approved' | 'Rejected';
  comments?: string;
  requestedBy?: number;
  requesterName?: string;
  createdAt?: string;
}
