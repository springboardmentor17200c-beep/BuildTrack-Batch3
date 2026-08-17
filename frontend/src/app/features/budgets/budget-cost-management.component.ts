import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProjectService } from '../../core/services/project.service';
import { BudgetCostService } from '../../core/services/budget-cost.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { Project } from '../../core/interfaces/project.interface';
import { Budget, CostEstimation, Expense, CostCategory } from '../../core/interfaces/budget-cost.interface';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-budget-cost-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatIconModule, MatButtonModule, ToastComponent],
  template: `
    <div class="container-fluid">
      <!-- Page Header & Project Context Selector -->
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 class="h2 fw-bold mb-1 text-slate-800">Budget & Cost Management</h1>
          <p class="text-muted mb-0">Plan project budgets, estimate cost segments, and track operational expenses</p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <label class="fw-semibold text-slate-700 text-sm mb-0">Active Project Site:</label>
          <select class="form-select bt-form-control py-2" style="width: 250px;" [(ngModel)]="selectedProjectId" (change)="onProjectChange()">
            <option *ngFor="let p of projects" [value]="p.id">{{ p.name }}</option>
          </select>
        </div>
      </div>

      <div *ngIf="loading" class="d-flex justify-content-center align-items-center py-5">
        <div class="spinner-border text-warning" role="status">
          <span class="visually-hidden">Loading project financial workspace...</span>
        </div>
      </div>

      <div *ngIf="!loading && activeProject" class="fade-in">
        <!-- KPI Summary Cards -->
        <div class="row g-4 mb-4">
          <!-- Total Budget -->
          <div class="col-12 col-md-6 col-lg-3">
            <div class="bt-card py-3 px-4 h-100 d-flex flex-column justify-content-between position-relative">
              <div>
                <div class="d-flex justify-content-between align-items-start">
                  <span class="text-muted text-xs text-uppercase tracking-wider fw-bold">Total Budget Cap</span>
                  <div class="kpi-icon-container bg-opacity-warning">
                    <mat-icon style="color: #ff7a00;">account_balance</mat-icon>
                  </div>
                </div>
                <h3 class="fw-bold mt-2 mb-0 text-slate-800">{{ currentBudget.totalBudget | currency }}</h3>
              </div>
              <button class="btn btn-link text-warning text-xs p-0 mt-3 text-start fw-semibold d-flex align-items-center gap-1" (click)="openBudgetEditModal()">
                <mat-icon style="font-size: 14px; width: 14px; height: 14px;">edit</mat-icon>
                <span>Edit Budget Cap</span>
              </button>
            </div>
          </div>

          <!-- Estimated Cost -->
          <div class="col-12 col-md-6 col-lg-3">
            <div class="bt-card py-3 px-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <div class="d-flex justify-content-between align-items-start">
                  <span class="text-muted text-xs text-uppercase tracking-wider fw-bold">Estimated Cost</span>
                  <div class="kpi-icon-container bg-opacity-info">
                    <mat-icon style="color: #06b6d4;">calculate</mat-icon>
                  </div>
                </div>
                <h3 class="fw-bold mt-2 mb-0 text-slate-800">{{ totalEstimatedCost | currency }}</h3>
              </div>
              <span class="text-xxs text-muted mt-3">From {{ estimations.length }} Planned Estimations</span>
            </div>
          </div>

          <!-- Actual Expense -->
          <div class="col-12 col-md-6 col-lg-3">
            <div class="bt-card py-3 px-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <div class="d-flex justify-content-between align-items-start">
                  <span class="text-muted text-xs text-uppercase tracking-wider fw-bold">Actual Expenses</span>
                  <div class="kpi-icon-container bg-opacity-danger">
                    <mat-icon style="color: #ef4444;">payments</mat-icon>
                  </div>
                </div>
                <h3 class="fw-bold mt-2 mb-0 text-slate-800">{{ totalExpenses | currency }}</h3>
              </div>
              <span class="text-xxs text-muted mt-3">Recorded Operations Outlays</span>
            </div>
          </div>

          <!-- Remaining Budget -->
          <div class="col-12 col-md-6 col-lg-3">
            <div class="bt-card py-3 px-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <div class="d-flex justify-content-between align-items-start">
                  <span class="text-muted text-xs text-uppercase tracking-wider fw-bold">Remaining Budget</span>
                  <div class="kpi-icon-container" [ngClass]="remainingBudget >= 0 ? 'bg-opacity-success' : 'bg-opacity-danger'">
                    <mat-icon [style.color]="remainingBudget >= 0 ? '#10b981' : '#ef4444'">
                      {{ remainingBudget >= 0 ? 'check_circle' : 'warning' }}
                    </mat-icon>
                  </div>
                </div>
                <h3 class="fw-bold mt-2 mb-0" [ngClass]="remainingBudget >= 0 ? 'text-success' : 'text-danger'">
                  {{ remainingBudget | currency }}
                </h3>
              </div>
              <span class="badge text-xxs mt-3 align-self-start px-2 py-1" [ngClass]="remainingBudget >= 0 ? 'bg-success text-white' : 'bg-danger text-white'">
                {{ remainingBudget >= 0 ? 'Within Limits' : 'Over Budget Cap' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Budget Utilization Monitor -->
        <div class="bt-card p-4 mb-4">
          <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
            <div>
              <h5 class="fw-bold mb-0">Live Budget Burn & Utilization Rate</h5>
              <p class="text-muted text-xs mb-0">Compares allocated total budget with actual accumulated expenses</p>
            </div>
            <div class="text-end">
              <span class="fs-4 fw-bold text-slate-800">{{ utilizationPercentage | number:'1.0-1' }}%</span>
              <span class="text-xs text-muted block">Utilized</span>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="progress mb-3" style="height: 12px;">
            <div class="progress-bar" role="progressbar" [style.width]="utilizationPercentage + '%'" [ngClass]="getProgressBarClass()"></div>
          </div>

          <div class="d-flex justify-content-between text-xs text-muted">
            <span>YTD Spent: {{ totalExpenses | currency }}</span>
            <span class="fw-semibold" [ngClass]="remainingBudget >= 0 ? 'text-success' : 'text-danger'">
              {{ remainingBudget >= 0 ? 'Remaining Funds: ' : 'Deficit Amount: ' }}{{ abs(remainingBudget) | currency }}
            </span>
            <span>Total Cap: {{ currentBudget.totalBudget | currency }}</span>
          </div>
        </div>

        <!-- Main Workspace Tabs -->
        <div class="row g-4">
          <!-- Left Column: Cost Estimations & Breakdown -->
          <div class="col-12 col-lg-5">
            <!-- Cost estimations CRUD -->
            <div class="bt-card mb-4">
              <div class="bt-card-header d-flex justify-content-between align-items-center">
                <h5 class="fw-bold mb-0">Cost Projections Estimations</h5>
                <button class="btn btn-xs btn-outline-warning d-flex align-items-center gap-1 py-1" (click)="openEstimationModal()">
                  <mat-icon style="font-size: 14px; width: 14px; height: 14px;">add</mat-icon>
                  <span>Add Estimate</span>
                </button>
              </div>
              <div class="table-responsive" style="max-height: 300px;">
                <table class="table align-middle text-sm mb-0">
                  <thead class="table-light text-muted uppercase text-xs">
                    <tr>
                      <th>Cost Category</th>
                      <th>Estimate</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let est of estimations" class="hover-row">
                      <td>
                        <div class="d-flex flex-column">
                          <span class="fw-semibold text-slate-800">{{ est.category }}</span>
                          <span class="text-xxs text-muted text-truncate" style="max-width: 150px;">{{ est.description }}</span>
                        </div>
                      </td>
                      <td class="fw-semibold">{{ est.estimatedCost | currency }}</td>
                      <td class="text-end">
                        <div class="d-flex justify-content-end gap-1">
                          <button class="btn btn-link text-warning p-1" (click)="openEstimationModal(est)">
                            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">edit</mat-icon>
                          </button>
                          <button class="btn btn-link text-danger p-1" (click)="deleteEstimation(est.id)">
                            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">delete</mat-icon>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr *ngIf="estimations.length === 0">
                      <td colspan="3" class="text-center py-4 text-muted">No cost projections defined. Click 'Add Estimate' to add one.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Cost categories comparison breakdown -->
            <div class="bt-card">
              <div class="bt-card-header">
                <h5 class="fw-bold mb-0">Category Allocation Breakout</h5>
              </div>
              <div class="p-3">
                <div *ngFor="let cat of costCategories" class="mb-3">
                  <div class="d-flex justify-content-between text-xs mb-1">
                    <span class="fw-semibold text-slate-700">{{ cat }}</span>
                    <span class="text-muted">
                      Spent: <strong class="text-danger">{{ getCategoryExpenses(cat) | currency }}</strong> 
                      / Est: <strong>{{ getCategoryEstimates(cat) | currency }}</strong>
                    </span>
                  </div>
                  <div class="progress" style="height: 6px;">
                    <div class="progress-bar bg-warning" role="progressbar" 
                         [style.width]="getCategorySpentPercentage(cat) + '%'"
                         [ngClass]="getCategoryExpenses(cat) > getCategoryEstimates(cat) ? 'bg-danger' : 'bg-warning'"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Expense Tracker Table -->
          <div class="col-12 col-lg-7">
            <div class="bt-card h-100 d-flex flex-column">
              <div class="bt-card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h5 class="fw-bold mb-0">Expense Ledger & Logs</h5>
                <button class="btn btn-bt-primary btn-sm d-flex align-items-center gap-1" (click)="openExpenseModal()">
                  <mat-icon>add</mat-icon>
                  <span>Add Expense</span>
                </button>
              </div>

              <!-- Search and filter filters bar -->
              <div class="p-3 bg-light border-bottom border-light d-flex flex-column flex-sm-row gap-2">
                <div class="input-group input-group-sm flex-grow-1">
                  <span class="input-group-text bg-white border-end-0 text-muted">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">search</mat-icon>
                  </span>
                  <input type="text" class="form-control border-start-0" placeholder="Search expenses by description..." [(ngModel)]="searchQuery">
                </div>
                <select class="form-select form-select-sm" style="width: 180px;" [(ngModel)]="selectedCategoryFilter">
                  <option value="ALL">All Categories</option>
                  <option *ngFor="let cat of costCategories" [value]="cat">{{ cat }}</option>
                </select>
              </div>

              <div class="table-responsive flex-grow-1">
                <table class="table align-middle text-sm mb-0">
                  <thead class="table-light text-muted uppercase text-xs">
                    <tr>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let exp of filteredExpenses()" class="hover-row">
                      <td class="text-nowrap">{{ exp.date }}</td>
                      <td>
                        <span class="badge bg-light text-dark border border-secondary border-opacity-10 text-xxs">
                          {{ exp.category }}
                        </span>
                      </td>
                      <td class="text-truncate" style="max-width: 150px;">{{ exp.description }}</td>
                      <td class="fw-bold text-danger">{{ exp.amount | currency }}</td>
                      <td class="text-end">
                        <div class="d-flex justify-content-end gap-1">
                          <button class="btn btn-link text-warning p-1" (click)="openExpenseModal(exp)">
                            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">edit</mat-icon>
                          </button>
                          <button class="btn btn-link text-danger p-1" (click)="deleteExpense(exp.id)">
                            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">delete</mat-icon>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr *ngIf="filteredExpenses().length === 0">
                      <td colspan="5" class="text-center py-4 text-muted">No expenses recorded matching filters.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Financial Summary Report Section -->
        <div class="bt-card mt-4 p-4 d-print-block">
          <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-light">
            <div>
              <h5 class="fw-bold mb-0">Audited Financial Summary Report</h5>
              <span class="text-xxs text-muted text-uppercase fw-bold tracking-wide">Project Site: {{ activeProject.name }}</span>
            </div>
            <button class="btn btn-xs btn-outline-secondary d-print-none d-flex align-items-center gap-1" (click)="printReport()">
              <mat-icon style="font-size: 14px; width: 14px; height: 14px;">print</mat-icon>
              <span>Print Report</span>
            </button>
          </div>
          <div class="row g-4 mb-4">
            <div class="col-12 col-md-6">
              <table class="table table-sm table-borderless text-sm mb-0">
                <tbody>
                  <tr>
                    <td class="text-muted">Total Project Budget:</td>
                    <td class="fw-bold text-end">{{ currentBudget.totalBudget | currency }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted">Estimated Total Cost:</td>
                    <td class="fw-bold text-end">{{ totalEstimatedCost | currency }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted">Actual Operational Spent:</td>
                    <td class="fw-bold text-end text-danger">{{ totalExpenses | currency }}</td>
                  </tr>
                  <tr class="border-top border-light">
                    <td class="text-muted">Remaining Balance:</td>
                    <td class="fw-bold text-end" [ngClass]="remainingBudget >= 0 ? 'text-success' : 'text-danger'">
                      {{ remainingBudget | currency }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="col-12 col-md-6">
              <table class="table table-sm table-borderless text-sm mb-0">
                <tbody>
                  <tr>
                    <td class="text-muted">Project ID:</td>
                    <td class="fw-bold text-end">BT-PROJ-00{{ activeProject.id }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted">Budget Utilization Ratio:</td>
                    <td class="fw-bold text-end">{{ utilizationPercentage | number:'1.0-1' }}%</td>
                  </tr>
                  <tr>
                    <td class="text-muted">Status:</td>
                    <td class="fw-bold text-end">
                      <span class="badge" [ngClass]="remainingBudget >= 0 ? 'bg-success' : 'bg-danger'">
                        {{ remainingBudget >= 0 ? 'Within Cap' : 'Deficit Limits' }}
                      </span>
                    </td>
                  </tr>
                  <tr class="border-top border-light">
                    <td class="text-muted">Audit Date:</td>
                    <td class="fw-semibold text-end">{{ todayDate }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <h6 class="fw-bold mb-2 text-xs text-uppercase tracking-wider text-muted">Category Cost Statement Breakout</h6>
          <div class="table-responsive">
            <table class="table table-bordered table-sm text-sm mb-0 text-center align-middle">
              <thead class="table-light text-muted uppercase text-xs">
                <tr>
                  <th>Cost Category</th>
                  <th>Estimated Cost</th>
                  <th>Actual Expenses</th>
                  <th>Status Variance</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let cat of costCategories">
                  <td class="text-start fw-semibold">{{ cat }}</td>
                  <td>{{ getCategoryEstimates(cat) | currency }}</td>
                  <td class="text-danger fw-semibold">{{ getCategoryExpenses(cat) | currency }}</td>
                  <td>
                    <span class="badge" [ngClass]="getCategoryExpenses(cat) <= getCategoryEstimates(cat) ? 'bg-success' : 'bg-danger'">
                      {{ getCategoryExpenses(cat) <= getCategoryEstimates(cat) ? 'Within Est' : 'Over Estimate' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals Layout overlays -->
    <!-- Edit Budget Modal -->
    <div *ngIf="showBudgetModal" class="modal-overlay d-flex align-items-center justify-content-center">
      <div class="modal-card bg-white p-4 rounded shadow-lg" style="width: 500px; max-width: 95%;">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bold mb-0 text-slate-800">Update Total Budget Cap</h5>
          <button type="button" class="btn-close-custom" (click)="showBudgetModal = false">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        <form [formGroup]="budgetForm" (ngSubmit)="saveBudget()">
          <div class="mb-3">
            <label class="bt-form-label">Total Allocated Budget Amount ($)</label>
            <input type="number" class="form-control bt-form-control" formControlName="totalBudget" min="1">
            <div *ngIf="budgetForm.get('totalBudget')?.touched && budgetForm.get('totalBudget')?.invalid" class="text-danger text-xs mt-1">
              Budget cap must be a valid amount greater than 0.
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-light">
            <button type="button" class="btn btn-bt-outline" (click)="showBudgetModal = false">Cancel</button>
            <button type="submit" class="btn btn-bt-primary" [disabled]="budgetForm.invalid">Save Budget</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add/Edit Cost Estimation Modal -->
    <div *ngIf="showEstimationModal" class="modal-overlay d-flex align-items-center justify-content-center">
      <div class="modal-card bg-white p-4 rounded shadow-lg" style="width: 500px; max-width: 95%;">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bold mb-0 text-slate-800">{{ editingEstimation ? 'Edit' : 'Add' }} Cost Estimation Projection</h5>
          <button type="button" class="btn-close-custom" (click)="showEstimationModal = false">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        <form [formGroup]="estimationForm" (ngSubmit)="saveEstimation()">
          <div class="mb-3">
            <label class="bt-form-label">Cost Category</label>
            <select class="form-select bt-form-control" formControlName="category">
              <option *ngFor="let cat of costCategories" [value]="cat">{{ cat }}</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="bt-form-label">Projected Estimated Amount ($)</label>
            <input type="number" class="form-control bt-form-control" formControlName="estimatedCost" min="1">
            <div *ngIf="estimationForm.get('estimatedCost')?.touched && estimationForm.get('estimatedCost')?.invalid" class="text-danger text-xs mt-1">
              Estimated cost must be greater than 0.
            </div>
          </div>
          <div class="mb-3">
            <label class="bt-form-label">Brief Description</label>
            <textarea class="form-control bt-form-control" formControlName="description" rows="2"></textarea>
            <div *ngIf="estimationForm.get('description')?.touched && estimationForm.get('description')?.invalid" class="text-danger text-xs mt-1">
              Description is required.
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-light">
            <button type="button" class="btn btn-bt-outline" (click)="showEstimationModal = false">Cancel</button>
            <button type="submit" class="btn btn-bt-primary" [disabled]="estimationForm.invalid">
              {{ editingEstimation ? 'Update' : 'Add' }} Estimate
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add/Edit Expense Modal -->
    <div *ngIf="showExpenseModal" class="modal-overlay d-flex align-items-center justify-content-center">
      <div class="modal-card bg-white p-4 rounded shadow-lg" style="width: 500px; max-width: 95%;">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bold mb-0 text-slate-800">{{ editingExpense ? 'Edit' : 'Record' }} Actual Expense Outlay</h5>
          <button type="button" class="btn-close-custom" (click)="showExpenseModal = false">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        <form [formGroup]="expenseForm" (ngSubmit)="saveExpense()">
          <div class="mb-3">
            <label class="bt-form-label">Cost Category</label>
            <select class="form-select bt-form-control" formControlName="category">
              <option *ngFor="let cat of costCategories" [value]="cat">{{ cat }}</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="bt-form-label">Expense Date</label>
            <input type="date" class="form-control bt-form-control" formControlName="date">
            <div *ngIf="expenseForm.get('date')?.touched && expenseForm.get('date')?.invalid" class="text-danger text-xs mt-1">
              Expense date is required.
            </div>
          </div>
          <div class="mb-3">
            <label class="bt-form-label">Expense Amount ($)</label>
            <input type="number" class="form-control bt-form-control" formControlName="amount" min="1">
            <div *ngIf="expenseForm.get('amount')?.touched && expenseForm.get('amount')?.invalid" class="text-danger text-xs mt-1">
              Amount must be a valid number greater than 0.
            </div>
          </div>
          <div class="mb-3">
            <label class="bt-form-label">Payment Description</label>
            <textarea class="form-control bt-form-control" formControlName="description" rows="2"></textarea>
            <div *ngIf="expenseForm.get('description')?.touched && expenseForm.get('description')?.invalid" class="text-danger text-xs mt-1">
              Payment description detail is required.
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-light">
            <button type="button" class="btn btn-bt-outline" (click)="showExpenseModal = false">Cancel</button>
            <button type="submit" class="btn btn-bt-primary" [disabled]="expenseForm.invalid">
              {{ editingExpense ? 'Update' : 'Record' }} Expense
            </button>
          </div>
        </form>
      </div>
    </div>

    <app-toast></app-toast>
  `,
  styles: [`
    .kpi-icon-container {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .bg-opacity-warning { background-color: rgba(255, 122, 0, 0.1); }
    .bg-opacity-success { background-color: rgba(16, 185, 129, 0.1); }
    .bg-opacity-info { background-color: rgba(6, 182, 212, 0.1); }
    .bg-opacity-danger { background-color: rgba(239, 68, 68, 0.1); }
    .text-warning-dark { color: #cc6200; }
    .text-xxs { font-size: 0.72rem; }
    .text-xs { font-size: 0.8rem; }
    .text-sm { font-size: 0.9rem; }
    .btn-xs { font-size: 0.75rem; }
    .hover-row:hover { background-color: rgba(0, 0, 0, 0.015); }
    .block { display: block; }
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 1050;
    }
    .modal-card {
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .btn-close-custom {
      background: transparent;
      border: none;
      color: var(--slate-400);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      border-radius: 50%;
      transition: background-color 0.2s;
    }
    .btn-close-custom:hover {
      background-color: var(--slate-100);
    }
  `]
})
export class BudgetCostManagementComponent implements OnInit {
  projects: Project[] = [];
  selectedProjectId!: number;
  activeProject: Project | null = null;
  loading = false;

  // Domain state
  currentBudget!: Budget;
  estimations: CostEstimation[] = [];
  expenses: Expense[] = [];

  // Summary Metrics
  totalEstimatedCost = 0;
  totalExpenses = 0;
  remainingBudget = 0;
  utilizationPercentage = 0;

  // Cost Categories
  costCategories: CostCategory[] = [
    'Labor Cost',
    'Material Cost',
    'Equipment Cost',
    'Transportation Cost',
    'Maintenance Cost',
    'Administrative Cost'
  ];

  // Filters & Search
  searchQuery = '';
  selectedCategoryFilter = 'ALL';

  // Forms
  budgetForm!: FormGroup;
  estimationForm!: FormGroup;
  expenseForm!: FormGroup;

  // Modals Visibility
  showBudgetModal = false;
  showEstimationModal = false;
  showExpenseModal = false;

  // Editing references
  editingEstimation: CostEstimation | null = null;
  editingExpense: Expense | null = null;

  todayDate = new Date().toISOString().split('T')[0];

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private budgetCostService: BudgetCostService,
    private toastService: ToastService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadProjectsList();
  }

  private initForms(): void {
    this.budgetForm = this.fb.group({
      totalBudget: [0, [Validators.required, Validators.min(1)]]
    });

    this.estimationForm = this.fb.group({
      category: ['Labor Cost', Validators.required],
      estimatedCost: [0, [Validators.required, Validators.min(1)]],
      description: ['', Validators.required]
    });

    this.expenseForm = this.fb.group({
      category: ['Labor Cost', Validators.required],
      date: [this.todayDate, Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      description: ['', Validators.required]
    });
  }

  private loadProjectsList(): void {
    this.loading = true;
    this.projectService.getProjects().subscribe({
      next: (list) => {
        this.projects = list;
        if (list && list.length > 0) {
          this.selectedProjectId = list[0].id;
          this.loadProjectFinancials(list[0].id);
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Failed to fetch projects list.');
      }
    });
  }

  onProjectChange(): void {
    this.loadProjectFinancials(Number(this.selectedProjectId));
  }

  private loadProjectFinancials(projectId: number): void {
    this.loading = true;
    this.projectService.getProjectById(projectId).subscribe({
      next: (proj: any) => {
        this.activeProject = proj;

        // Fetch budget, cost estimations, and expenses in parallel
        forkJoin({
          budget: this.budgetCostService.getBudgetByProject(projectId),
          estimations: this.budgetCostService.getEstimationsByProject(projectId),
          expenses: this.budgetCostService.getExpensesByProject(projectId)
        }).subscribe({
          next: (res) => {
            this.currentBudget = res.budget;
            this.estimations = res.estimations;
            this.expenses = res.expenses;

            this.calculateFinancialMetrics();
            this.loading = false;
          },
          error: () => {
            this.loading = false;
            this.toastService.showError('Failed to load project financial workspace.');
          }
        });
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Failed to load project context.');
      }
    });
  }

  private calculateFinancialMetrics(): void {
    // Estimations Sum
    this.totalEstimatedCost = this.estimations.reduce((sum, e) => sum + e.estimatedCost, 0);

    // Expenses Sum
    this.totalExpenses = this.expenses.reduce((sum, e) => sum + e.amount, 0);

    // Remaining budget computation
    this.remainingBudget = this.currentBudget.totalBudget - this.totalExpenses;

    // Utilization ratio computation
    this.utilizationPercentage = this.currentBudget.totalBudget > 0 
      ? (this.totalExpenses / this.currentBudget.totalBudget) * 100 
      : 0;
  }

  // --- Budget Handling ---
  openBudgetEditModal(): void {
    this.budgetForm.patchValue({
      totalBudget: this.currentBudget.totalBudget
    });
    this.showBudgetModal = true;
  }

  saveBudget(): void {
    if (this.budgetForm.invalid) return;
    const formVal = this.budgetForm.value;

    const updatedBudget: Budget = {
      ...this.currentBudget,
      totalBudget: Number(formVal.totalBudget)
    };

    this.budgetCostService.saveBudget(updatedBudget).subscribe({
      next: (saved) => {
        this.currentBudget = saved;
        this.calculateFinancialMetrics();
        this.showBudgetModal = false;
        this.toastService.showSuccess('Project budget cap updated successfully.');
      },
      error: () => {
        this.toastService.showError('Failed to save budget settings.');
      }
    });
  }

  // --- Cost Estimations Handling ---
  openEstimationModal(est: CostEstimation | null = null): void {
    if (est) {
      this.editingEstimation = est;
      this.estimationForm.patchValue({
        category: est.category,
        estimatedCost: est.estimatedCost,
        description: est.description
      });
    } else {
      this.editingEstimation = null;
      this.estimationForm.reset({
        category: 'Labor Cost',
        estimatedCost: 0,
        description: ''
      });
    }
    this.showEstimationModal = true;
  }

  saveEstimation(): void {
    if (this.estimationForm.invalid) return;
    const formVal = this.estimationForm.value;

    if (this.editingEstimation) {
      const updated: CostEstimation = {
        ...this.editingEstimation,
        category: formVal.category as CostCategory,
        estimatedCost: Number(formVal.estimatedCost),
        description: formVal.description
      };
      this.budgetCostService.updateEstimation(updated).subscribe({
        next: () => {
          const idx = this.estimations.findIndex(e => e.id === updated.id);
          if (idx >= 0) this.estimations[idx] = updated;
          this.calculateFinancialMetrics();
          this.showEstimationModal = false;
          this.toastService.showSuccess('Cost estimation entry updated successfully.');
        }
      });
    } else {
      const payload = {
        projectId: Number(this.selectedProjectId),
        category: formVal.category as CostCategory,
        estimatedCost: Number(formVal.estimatedCost),
        description: formVal.description
      };
      this.budgetCostService.addEstimation(payload).subscribe({
        next: (created) => {
          this.estimations.push(created);
          this.calculateFinancialMetrics();
          this.showEstimationModal = false;
          this.toastService.showSuccess('Cost estimation added successfully.');
        }
      });
    }
  }

  deleteEstimation(id: number): void {
    if (confirm('Are you sure you want to delete this cost estimation projection?')) {
      this.budgetCostService.deleteEstimation(id).subscribe({
        next: () => {
          this.estimations = this.estimations.filter(e => e.id !== id);
          this.calculateFinancialMetrics();
          this.toastService.showSuccess('Cost estimation deleted successfully.');
        }
      });
    }
  }

  // --- Expenses Handling ---
  openExpenseModal(exp: Expense | null = null): void {
    if (exp) {
      this.editingExpense = exp;
      this.expenseForm.patchValue({
        category: exp.category,
        date: exp.date,
        amount: exp.amount,
        description: exp.description
      });
    } else {
      this.editingExpense = null;
      this.expenseForm.reset({
        category: 'Labor Cost',
        date: this.todayDate,
        amount: 0,
        description: ''
      });
    }
    this.showExpenseModal = true;
  }

  saveExpense(): void {
    if (this.expenseForm.invalid) return;
    const formVal = this.expenseForm.value;

    if (this.editingExpense) {
      const updated: Expense = {
        ...this.editingExpense,
        category: formVal.category as CostCategory,
        date: formVal.date,
        amount: Number(formVal.amount),
        description: formVal.description
      };
      this.budgetCostService.updateExpense(updated).subscribe({
        next: () => {
          const idx = this.expenses.findIndex(e => e.id === updated.id);
          if (idx >= 0) this.expenses[idx] = updated;
          this.calculateFinancialMetrics();
          this.showExpenseModal = false;
          this.toastService.showSuccess('Expense ledger entry updated successfully.');
        }
      });
    } else {
      const payload = {
        projectId: Number(this.selectedProjectId),
        category: formVal.category as CostCategory,
        date: formVal.date,
        amount: Number(formVal.amount),
        description: formVal.description
      };
      this.budgetCostService.addExpense(payload).subscribe({
        next: (created) => {
          this.expenses.push(created);
          this.calculateFinancialMetrics();
          this.showExpenseModal = false;
          this.toastService.showSuccess('Operation expense payment logged successfully.');
        }
      });
    }
  }

  deleteExpense(id: number): void {
    if (confirm('Are you sure you want to delete this recorded operational expense outlay?')) {
      this.budgetCostService.deleteExpense(id).subscribe({
        next: () => {
          this.expenses = this.expenses.filter(e => e.id !== id);
          this.calculateFinancialMetrics();
          this.toastService.showSuccess('Expense deleted successfully.');
        }
      });
    }
  }

  // --- Filtering & Breakdowns Helpers ---
  filteredExpenses(): Expense[] {
    return this.expenses.filter(e => {
      const matchesSearch = e.description.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                            e.category.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesCategory = this.selectedCategoryFilter === 'ALL' || e.category === this.selectedCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }

  getCategoryEstimates(category: CostCategory): number {
    return this.estimations
      .filter(e => e.category === category)
      .reduce((sum, e) => sum + e.estimatedCost, 0);
  }

  getCategoryExpenses(category: CostCategory): number {
    return this.expenses
      .filter(e => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);
  }

  getCategorySpentPercentage(category: CostCategory): number {
    const est = this.getCategoryEstimates(category);
    const spent = this.getCategoryExpenses(category);
    if (est === 0) return spent > 0 ? 100 : 0;
    return Math.min((spent / est) * 100, 100);
  }

  getProgressBarClass(): string {
    if (this.utilizationPercentage > 100) return 'bg-danger';
    if (this.utilizationPercentage >= 85) return 'bg-warning';
    return 'bg-success';
  }

  printReport(): void {
    window.print();
  }

  abs(val: number): number {
    return Math.abs(val);
  }

  @HostListener('window:keydown.escape', ['$event'])
  onEscapePressed(event: KeyboardEvent): void {
    this.showBudgetModal = false;
    this.showEstimationModal = false;
    this.showExpenseModal = false;
  }
}
