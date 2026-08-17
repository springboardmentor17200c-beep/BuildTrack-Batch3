import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AnalyticsComponent } from './analytics.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ReportService } from '../../core/services/report.service';
import { ProjectService } from '../../core/services/project.service';
import { WorkforceService } from '../../core/services/workforce.service';
import { InventoryService } from '../../core/services/inventory.service';
import { PurchaseOrderService } from '../../core/services/purchase-order.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { ToastService } from '../../core/services/toast.service';

describe('AnalyticsComponent', () => {
  let component: AnalyticsComponent;
  let fixture: ComponentFixture<AnalyticsComponent>;

  const mockReportService = {
    getReports: () => of([]),
    generateReport: () => of({ id: 1, reportType: 'Financial Audit Report', projectId: 1, reportUrl: '/test.pdf', created_at: '2026-08-16' }),
    deleteReport: () => of({ success: true })
  };

  const mockProjectService = {
    getProjects: () => of([
      { id: 1, name: 'Oakridge Housing', budget: '$150,000', progress: 40, status: 'On Track', startDate: '2026-01-01', endDate: '2026-12-31', milestones: [] }
    ])
  };

  const mockWorkforceService = {
    getWorkers: () => of([
      { id: 1, name: 'Alice Smith', category: 'Supervisor', salary: 5000, project_id: 1 },
      { id: 2, name: 'Bob Jones', category: 'helper', salary: 2000, project_id: 1 }
    ])
  };

  const mockInventoryService = {
    getMaterials: () => of([])
  };

  const mockPOService = {
    getPurchaseOrders: () => of([])
  };

  const mockInvoiceService = {
    getInvoices: () => of([])
  };

  const mockToastService = {
    toast$: of(null),
    showSuccess: () => {},
    showError: () => {},
    clear: () => {}
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AnalyticsComponent,
        HttpClientTestingModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ReportService, useValue: mockReportService },
        { provide: ProjectService, useValue: mockProjectService },
        { provide: WorkforceService, useValue: mockWorkforceService },
        { provide: InventoryService, useValue: mockInventoryService },
        { provide: PurchaseOrderService, useValue: mockPOService },
        { provide: InvoiceService, useValue: mockInvoiceService },
        { provide: ToastService, useValue: mockToastService },
        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should calculate workforce percentages correctly', () => {
    fixture.detectChanges();
    // Alice (Supervisor) => 1, Bob (helper/General) => 1 => Total 2.
    // Skilled: 0, General: 1 (50%), Supervisor: 1 (50%)
    expect(component.generalPct).toBe(50);
    expect(component.supervisorPct).toBe(50);
    expect(component.skilledPct).toBe(0);
  });

  it('should invalidate report form when empty', () => {
    fixture.detectChanges();
    component.reportForm.controls['projectId'].setValue('');
    component.reportForm.controls['reportType'].setValue('');
    expect(component.reportForm.invalid).toBeTrue();
  });

  it('should validate report form when filled correctly', () => {
    fixture.detectChanges();
    component.reportForm.controls['projectId'].setValue(1);
    component.reportForm.controls['reportType'].setValue('Financial Audit Report');
    expect(component.reportForm.valid).toBeTrue();
  });

  it('should render canvas empty states if there are no records', () => {
    component.realProjects = [];
    component.realWorkers = [];
    
    const mockCanvas = document.createElement('canvas');
    component.barChart = { nativeElement: mockCanvas } as any;
    component.donutChart = { nativeElement: mockCanvas } as any;
    
    spyOn(component, 'drawEmptyState').and.callThrough();
    component.drawBarChart();
    component.drawDonutChart();
    
    expect(component.drawEmptyState).toHaveBeenCalled();
  });
});
