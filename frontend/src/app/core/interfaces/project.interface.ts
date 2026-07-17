export interface Milestone {
  id: number;
  title: string;
  dueDate: string;
  status: 'Completed' | 'In Progress' | 'Pending';
  description: string;
  completionDate?: string;
}

export interface Project {
  id: number;
  name: string;
  category: 'Residential' | 'Commercial' | 'Industrial' | 'Infrastructure' | 'Government Projects';
  progress: number;
  budget: string;
  spent: string;
  startDate: string;
  endDate: string;
  status: 'On Track' | 'Delayed' | 'Critical' | 'Completed';
  milestones: Milestone[];
}
