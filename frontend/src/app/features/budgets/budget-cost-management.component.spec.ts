import { TestBed, ComponentFixture } from '@angular/core/testing';
import { BudgetCostManagementComponent } from './budget-cost-management.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { ProjectService } from '../../core/services/project.service';
import { BudgetCostService } from '../../core/services/budget-cost.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';

describe('BudgetCostManagementComponent', () => {
  let component: BudgetCostManagementComponent;
  let fixture: ComponentFixture<BudgetCostManagementComponent>;

  const mockProjectService = {
    getProjects: () => of([
      { id: 1, name: 'Oakridge Site', budget: '$150,000', progress: 40, status: 'On Track', startDate: '2026-01-01', endDate: '2026-12-31', milestones: [] }
    ]),
    getProjectById: (id: number) => of(
      { id: 1, name: 'Oakridge Site', budget: '$150,000', progress: 40, status: 'On Track', startDate: '2026-01-01', endDate: '2026-12-31', milestones: [] }
    )
  };

  const mockBudgetCostService = {
    getBudgetByProject: (projectId: number) => of({
      projectId,
      totalBudget: 150000,
      allocated: 0,
      utilization: 0
    }),
    saveBudget: (budget: any) => of(budget),
    getEstimationsByProject: (projectId: number) => of([
      { id: 1, projectId, category: 'Labor Cost', estimatedCost: 5000, description: 'Framing crews' }
    ]),
    addEstimation: (est: any) => of({ ...est, id: 2, createdAt: '2026-08-17' }),
    updateEstimation: (est: any) => of(est),
    deleteEstimation: (id: number) => of(true),
    getExpensesByProject: (projectId: number) => of([
      { id: 1, projectId, amount: 2000, date: '2026-08-17', description: 'Concrete foundation pour', category: 'Material Cost' }
    ]),
    addExpense: (exp: any) => of({ ...exp, id: 2 }),
    updateExpense: (exp: any) => of(exp),
    deleteExpense: (id: number) => of(true)
  };

  const mockToastService = {
    toast$: of(null),
    showSuccess: () => {},
    showError: () => {},
    clear: () => {}
  };

  const mockAuthService = {
    currentUser$: of({ name: 'Finance Agent', role: 'Finance' })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BudgetCostManagementComponent,
        HttpClientTestingModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ProjectService, useValue: mockProjectService },
        { provide: BudgetCostService, useValue: mockBudgetCostService },
        { provide: ToastService, useValue: mockToastService },
        { provide: AuthService, useValue: mockAuthService },
        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetCostManagementComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should switch project context and recalculate totals', () => {
    fixture.detectChanges();
    // Default mock project is 1, let's verify loaded financials
    expect(component.selectedProjectId).toBe(1);
    expect(component.currentBudget.totalBudget).toBe(150000);
    expect(component.totalEstimatedCost).toBe(5000);
    expect(component.totalExpenses).toBe(2000);
    expect(component.remainingBudget).toBe(148000);
    expect(component.utilizationPercentage).toBeCloseTo(1.33, 1);
  });

  it('should validate expense form rules', () => {
    fixture.detectChanges();
    // Pre-filled forms
    component.expenseForm.controls['amount'].setValue(0); // Invalid amount
    component.expenseForm.controls['description'].setValue(''); // Required
    expect(component.expenseForm.invalid).toBeTrue();

    component.expenseForm.controls['amount'].setValue(350);
    component.expenseForm.controls['description'].setValue('Nails and bolts');
    expect(component.expenseForm.valid).toBeTrue();
  });

  it('should detect over-budget thresholds correctly', () => {
    fixture.detectChanges();
    // Modify values manually
    component.currentBudget.totalBudget = 1000;
    component.expenses = [
      { id: 1, projectId: 1, amount: 1500, date: '2026-08-17', description: 'Heavy machinery hire', category: 'Equipment Cost' }
    ];
    (component as any).calculateFinancialMetrics();
    expect(component.remainingBudget).toBe(-500);
    expect(component.utilizationPercentage).toBe(150);
    expect(component.getProgressBarClass()).toBe('bg-danger');
  });

  it('should filter expense ledger lists by search query', () => {
    fixture.detectChanges();
    // Set search query
    component.searchQuery = 'concrete';
    const filtered = component.filteredExpenses();
    expect(filtered.length).toBe(1);

    component.searchQuery = 'unmatched-query';
    const emptyFiltered = component.filteredExpenses();
    expect(emptyFiltered.length).toBe(0);
  });
});
