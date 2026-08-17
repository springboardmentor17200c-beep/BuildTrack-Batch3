import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Budget, CostEstimation, Expense, CostCategory } from '../interfaces/budget-cost.interface';
import { ProjectService } from './project.service';

@Injectable({
  providedIn: 'root'
})
export class BudgetCostService {
  private budgetsSubject = new BehaviorSubject<Budget[]>([]);
  budgets$ = this.budgetsSubject.asObservable();

  private estimationsSubject = new BehaviorSubject<CostEstimation[]>([]);
  estimations$ = this.estimationsSubject.asObservable();

  private expensesSubject = new BehaviorSubject<Expense[]>([]);
  expenses$ = this.expensesSubject.asObservable();

  constructor(private projectService: ProjectService) {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    const budgets = localStorage.getItem('bt_budgets');
    const estimations = localStorage.getItem('bt_estimations');
    const expenses = localStorage.getItem('bt_expenses');

    if (budgets) {
      try {
        this.budgetsSubject.next(JSON.parse(budgets));
      } catch (e) {
        console.error('Error parsing budgets from localStorage', e);
      }
    }
    if (estimations) {
      try {
        this.estimationsSubject.next(JSON.parse(estimations));
      } catch (e) {
        console.error('Error parsing estimations from localStorage', e);
      }
    }
    if (expenses) {
      try {
        this.expensesSubject.next(JSON.parse(expenses));
      } catch (e) {
        console.error('Error parsing expenses from localStorage', e);
      }
    }
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('bt_budgets', JSON.stringify(this.budgetsSubject.value));
    localStorage.setItem('bt_estimations', JSON.stringify(this.estimationsSubject.value));
    localStorage.setItem('bt_expenses', JSON.stringify(this.expensesSubject.value));
  }

  // --- Helpers ---
  private parseBudgetNum(value: string | number | undefined): number {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    const cleaned = value.replace(/[$,\s]/g, '').toUpperCase();
    const multiplier = cleaned.endsWith('M') ? 1_000_000 : cleaned.endsWith('K') ? 1_000 : 1;
    const amount = Number.parseFloat(cleaned.replace(/[MK]$/, ''));
    return Number.isFinite(amount) ? amount * multiplier : 0;
  }

  // --- Budget CRUD ---
  getBudgetByProject(projectId: number): Observable<Budget> {
    const existing = this.budgetsSubject.value.find(b => b.projectId === projectId);
    if (existing) {
      return of(existing);
    }

    return this.projectService.getProjectById(projectId).pipe(
      map((proj: any) => {
        const baseBudget = this.parseBudgetNum(proj ? proj.budget : 0);
        const newBudget: Budget = {
          projectId,
          totalBudget: baseBudget || 0,
          allocated: 0,
          utilization: 0
        };
        // Auto-save this initial default budget
        const current = this.budgetsSubject.value;
        current.push(newBudget);
        this.budgetsSubject.next([...current]);
        this.saveToLocalStorage();
        return newBudget;
      }),
      catchError(() => {
        // Fallback if ProjectService fails or project not found
        return of({
          projectId,
          totalBudget: 0,
          allocated: 0,
          utilization: 0
        });
      })
    );
  }

  saveBudget(budget: Budget): Observable<Budget> {
    const current = this.budgetsSubject.value;
    const index = current.findIndex(b => b.projectId === budget.projectId);
    if (index >= 0) {
      current[index] = budget;
    } else {
      current.push(budget);
    }
    this.budgetsSubject.next([...current]);
    this.saveToLocalStorage();
    return of(budget);
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

  // --- Expense CRUD ---
  getExpensesByProject(projectId: number): Observable<Expense[]> {
    const filtered = this.expensesSubject.value.filter(e => e.projectId === projectId);
    return of(filtered);
  }

  addExpense(exp: Omit<Expense, 'id'>): Observable<Expense> {
    const current = this.expensesSubject.value;
    const newExp: Expense = {
      ...exp,
      id: current.length > 0 ? Math.max(...current.map(c => c.id)) + 1 : 1
    };
    current.push(newExp);
    this.expensesSubject.next([...current]);
    this.saveToLocalStorage();
    return of(newExp);
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
    const current = this.expensesSubject.value;
    const filtered = current.filter(e => e.id !== id);
    this.expensesSubject.next(filtered);
    this.saveToLocalStorage();
    return of(true);
  }
}

import { catchError } from 'rxjs/operators';
