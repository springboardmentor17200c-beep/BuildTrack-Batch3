import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Budget, CostEstimation, Expense, CostCategory } from '../interfaces/budget-cost.interface';
import { ProjectService } from './project.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BudgetCostService {
  private apiUrl = `${environment.apiUrl}`;

  private budgetsSubject = new BehaviorSubject<Budget[]>([]);
  budgets$ = this.budgetsSubject.asObservable();

  private estimationsSubject = new BehaviorSubject<CostEstimation[]>([]);
  estimations$ = this.estimationsSubject.asObservable();

  private expensesSubject = new BehaviorSubject<Expense[]>([]);
  expenses$ = this.expensesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private projectService: ProjectService
  ) {
    this.loadFromLocalStorage();
  }

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('bt_token') || localStorage.getItem('auth_token') || '';
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  private loadFromLocalStorage(): void {
    const budgets = localStorage.getItem('bt_budgets');
    const estimations = localStorage.getItem('bt_estimations');
    const expenses = localStorage.getItem('bt_expenses');

    if (budgets) {
      try { this.budgetsSubject.next(JSON.parse(budgets)); } catch (e) {}
    }
    if (estimations) {
      try { this.estimationsSubject.next(JSON.parse(estimations)); } catch (e) {}
    }
    if (expenses) {
      try { this.expensesSubject.next(JSON.parse(expenses)); } catch (e) {}
    }
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('bt_budgets', JSON.stringify(this.budgetsSubject.value));
    localStorage.setItem('bt_estimations', JSON.stringify(this.estimationsSubject.value));
    localStorage.setItem('bt_expenses', JSON.stringify(this.expensesSubject.value));
  }

  private parseBudgetNum(value: string | number | undefined): number {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    const cleaned = value.replace(/[$,\s]/g, '').toUpperCase();
    const multiplier = cleaned.endsWith('M') ? 1_000_000 : cleaned.endsWith('K') ? 1_000 : 1;
    const amount = Number.parseFloat(cleaned.replace(/[MK]$/, ''));
    return Number.isFinite(amount) ? amount * multiplier : 0;
  }

  // --- Budget CRUD Connected to Backend ---
  getBudgetByProject(projectId: number): Observable<Budget> {
    return this.http.get<any>(`${this.apiUrl}/budget/status/${projectId}`, this.getAuthHeaders()).pipe(
      map(status => {
        const b: Budget = {
          projectId: status.project_id,
          totalBudget: status.total_budget,
          allocated: status.total_spent,
          utilization: status.burn_rate_percentage
        };
        return b;
      }),
      catchError(() => {
        const existing = this.budgetsSubject.value.find(b => b.projectId === projectId);
        if (existing) return of(existing);

        return this.projectService.getProjectById(projectId).pipe(
          map((proj: any) => {
            const baseBudget = this.parseBudgetNum(proj ? proj.budget : 0);
            return {
              projectId,
              totalBudget: baseBudget || 0,
              allocated: 0,
              utilization: 0
            };
          }),
          catchError(() => of({ projectId, totalBudget: 0, allocated: 0, utilization: 0 }))
        );
      })
    );
  }

  saveBudget(budget: Budget): Observable<Budget> {
    const payload = {
      project_id: budget.projectId,
      total_budget: budget.totalBudget,
      labor_limit: budget.totalBudget * 0.3,
      material_limit: budget.totalBudget * 0.4,
      equipment_limit: budget.totalBudget * 0.15,
      transport_limit: budget.totalBudget * 0.05,
      maintenance_limit: budget.totalBudget * 0.05,
      admin_limit: budget.totalBudget * 0.05
    };

    return this.http.post<any>(`${this.apiUrl}/budget/plan`, payload, this.getAuthHeaders()).pipe(
      map(res => budget),
      tap(() => {
        const current = this.budgetsSubject.value;
        const index = current.findIndex(b => b.projectId === budget.projectId);
        if (index >= 0) current[index] = budget;
        else current.push(budget);
        this.budgetsSubject.next([...current]);
        this.saveToLocalStorage();
      }),
      catchError(() => {
        const current = this.budgetsSubject.value;
        const index = current.findIndex(b => b.projectId === budget.projectId);
        if (index >= 0) current[index] = budget;
        else current.push(budget);
        this.budgetsSubject.next([...current]);
        this.saveToLocalStorage();
        return of(budget);
      })
    );
  }

  // --- Cost Estimation CRUD ---
  getEstimationsByProject(projectId: number): Observable<CostEstimation[]> {
    const filtered = this.estimationsSubject.value.filter(e => e.projectId === projectId);
    return of(filtered);
  }

  addEstimation(est: Omit<CostEstimation, 'id' | 'createdAt'>): Observable<CostEstimation> {
    const current = this.estimationsSubject.value;
    const newEst: CostEstimation = {
      ...est,
      id: current.length > 0 ? Math.max(...current.map(c => c.id)) + 1 : 1,
      createdAt: new Date().toISOString().split('T')[0]
    };
    current.push(newEst);
    this.estimationsSubject.next([...current]);
    this.saveToLocalStorage();
    return of(newEst);
  }

  updateEstimation(est: CostEstimation): Observable<CostEstimation> {
    const current = this.estimationsSubject.value;
    const index = current.findIndex(e => e.id === est.id);
    if (index >= 0) {
      current[index] = est;
      this.estimationsSubject.next([...current]);
      this.saveToLocalStorage();
    }
    return of(est);
  }

  deleteEstimation(id: number): Observable<boolean> {
    const current = this.estimationsSubject.value;
    const filtered = current.filter(e => e.id !== id);
    this.estimationsSubject.next(filtered);
    this.saveToLocalStorage();
    return of(true);
  }

  // --- Expense CRUD Connected to Backend ---
  getExpensesByProject(projectId: number): Observable<Expense[]> {
    return this.http.get<any[]>(`${this.apiUrl}/expenses?project_id=${projectId}`, this.getAuthHeaders()).pipe(
      map(items => items.map(item => ({
        id: item.id,
        projectId: item.project_id,
        category: item.category as CostCategory,
        description: item.description || '',
        amount: item.amount,
        date: item.expense_date
      }))),
      tap(exps => {
        const otherExps = this.expensesSubject.value.filter(e => e.projectId !== projectId);
        this.expensesSubject.next([...otherExps, ...exps]);
        this.saveToLocalStorage();
      }),
      catchError(() => {
        const filtered = this.expensesSubject.value.filter(e => e.projectId === projectId);
        return of(filtered);
      })
    );
  }

  addExpense(exp: Omit<Expense, 'id'>): Observable<Expense> {
    const payload = {
      project_id: exp.projectId,
      category: exp.category,
      amount: exp.amount,
      description: exp.description,
      expense_date: exp.date
    };

    return this.http.post<any>(`${this.apiUrl}/expenses`, payload, this.getAuthHeaders()).pipe(
      map(res => ({
        id: res.id,
        projectId: res.project_id,
        category: res.category as CostCategory,
        description: res.description || '',
        amount: res.amount,
        date: res.expense_date
      })),
      tap(newExp => {
        const current = this.expensesSubject.value;
        current.push(newExp);
        this.expensesSubject.next([...current]);
        this.saveToLocalStorage();
      }),
      catchError(() => {
        const current = this.expensesSubject.value;
        const fallback: Expense = {
          ...exp,
          id: current.length > 0 ? Math.max(...current.map(c => c.id)) + 1 : 1
        };
        current.push(fallback);
        this.expensesSubject.next([...current]);
        this.saveToLocalStorage();
        return of(fallback);
      })
    );
  }

  updateExpense(exp: Expense): Observable<Expense> {
    const current = this.expensesSubject.value;
    const index = current.findIndex(e => e.id === exp.id);
    if (index >= 0) {
      current[index] = exp;
      this.expensesSubject.next([...current]);
      this.saveToLocalStorage();
    }
    return of(exp);
  }

  deleteExpense(id: number): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/expenses/${id}`, this.getAuthHeaders()).pipe(
      map(() => true),
      tap(() => {
        const current = this.expensesSubject.value;
        const filtered = current.filter(e => e.id !== id);
        this.expensesSubject.next(filtered);
        this.saveToLocalStorage();
      }),
      catchError(() => {
        const current = this.expensesSubject.value;
        const filtered = current.filter(e => e.id !== id);
        this.expensesSubject.next(filtered);
        this.saveToLocalStorage();
        return of(true);
      })
    );
  }
}
