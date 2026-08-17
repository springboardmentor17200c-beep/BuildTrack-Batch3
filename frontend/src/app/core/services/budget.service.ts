import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Expense {
  id: number;
  project_id: number;
  category: string;
  amount: number;
  description?: string;
  vendor_id?: number;
  expense_date: string;
  created_at: string;
}

export interface BudgetPlan {
  id: number;
  project_id: number;
  total_budget: number;
  labor_limit: number;
  material_limit: number;
  equipment_limit: number;
  transport_limit: number;
  maintenance_limit: number;
  admin_limit: number;
  created_at: string;
}

export interface CategoryCostBreakdown {
  category: string;
  allocated_limit: number;
  actual_spent: number;
  remaining_balance: number;
  burn_rate_percentage: number;
}

export interface BudgetStatus {
  project_id: number;
  project_name: string;
  total_budget: number;
  total_spent: number;
  remaining_balance: number;
  burn_rate_percentage: number;
  categories: CategoryCostBreakdown[];
}

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('bt_token') || localStorage.getItem('auth_token') || '';
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  setBudgetPlan(plan: {
    project_id: number;
    total_budget: number;
    labor_limit?: number;
    material_limit?: number;
    equipment_limit?: number;
    transport_limit?: number;
    maintenance_limit?: number;
    admin_limit?: number;
  }): Observable<BudgetPlan> {
    return this.http.post<BudgetPlan>(`${this.apiUrl}/budget/plan`, plan, this.getAuthHeaders());
  }

  getBudgetPlan(projectId: number): Observable<BudgetPlan> {
    return this.http.get<BudgetPlan>(`${this.apiUrl}/budget/plan/${projectId}`, this.getAuthHeaders());
  }

  getBudgetStatus(projectId: number): Observable<BudgetStatus> {
    return this.http.get<BudgetStatus>(`${this.apiUrl}/budget/status/${projectId}`, this.getAuthHeaders());
  }

  createExpense(expense: {
    project_id: number;
    category: string;
    amount: number;
    description?: string;
    vendor_id?: number;
    expense_date?: string;
  }): Observable<Expense> {
    return this.http.post<Expense>(`${this.apiUrl}/expenses`, expense, this.getAuthHeaders());
  }

  getExpenses(projectId?: number, category?: string): Observable<Expense[]> {
    let url = `${this.apiUrl}/expenses`;
    const params: string[] = [];
    if (projectId) params.push(`project_id=${projectId}`);
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    return this.http.get<Expense[]>(url, this.getAuthHeaders());
  }

  deleteExpense(expenseId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/expenses/${expenseId}`, this.getAuthHeaders());
  }
}
