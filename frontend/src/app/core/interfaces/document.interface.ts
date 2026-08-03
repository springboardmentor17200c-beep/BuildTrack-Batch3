export interface DocumentItem {
  id: number;
  projectId: number;
  projectName?: string;
  uploadedBy: number;
  uploaderName?: string;
  fileName: string;
  fileType: string;
  filePath: string;
  description?: string;
  createdAt?: string;
}
