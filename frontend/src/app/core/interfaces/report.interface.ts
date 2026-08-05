export interface Report {
  id: number;
  projectId: number;
  generatedBy: number;
  reportType: 'Financial Audit Report' | 'Material Utilization Report' | 'Workforce Cost Summary' | 'Project Milestone Summary' | string;
  reportUrl: string;
  createdAt: string;
  projectName?: string;
  generatedByName?: string;
}
