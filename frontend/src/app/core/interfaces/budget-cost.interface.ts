export type CostCategory =
  | 'Labor Cost'
  | 'Material Cost'
  | 'Equipment Cost'
  | 'Transportation Cost'
  | 'Maintenance Cost'
  | 'Administrative Cost';

export interface Budget {
  id?: number;
  projectId: number;
  totalBudget: number; // User-defined total budget
  allocated: number;   // Calculated from estimations
  utilization: number; // Utilization percentage
}

export interface CostEstimation {
  id: number;
  projectId: number;
  description: string;
  category: CostCategory;
  estimatedCost: number;
  createdAt: string;
}

export interface Expense {
  id: number;
  projectId: number;
  amount: number;
  date: string;
  description: string;
  category: CostCategory;
}
