import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReportsComponent } from './reports.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { ReportService } from '../../core/services/report.service';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;

  const mockReportService = {
    getReports: () => of([]),
    generateReport: () => of({ id: 1, reportType: 'Daily Site Log', projectId: 1, reportUrl: '/test.pdf', created_at: '2026-08-16' }),
    deleteReport: () => of({ success: true })
  };

  const mockProjectService = {
    getProjects: () => of([
      { id: 1, name: 'SVS Housing Complex', budget: '$200,000', progress: 50, status: 'On Track', startDate: '2026-02-01', endDate: '2026-11-30', milestones: [] }
    ])
  };

  const mockAuthService = {
    currentUserSubject: of({ id: 1, name: 'John Admin', email: 'admin@buildtrack.com', role: 'Admin' })
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
        ReportsComponent,
        HttpClientTestingModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ReportService, useValue: mockReportService },
        { provide: ProjectService, useValue: mockProjectService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToastService },
        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
  });

  it('should create the reports component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should invalidate create form when missing fields', () => {
    fixture.detectChanges();
    component.reportForm.controls['projectId'].setValue('');
    component.reportForm.controls['reportType'].setValue('');
    expect(component.reportForm.invalid).toBeTrue();
  });

  it('should validate form and generate report', () => {
    fixture.detectChanges();
    component.reportForm.controls['projectId'].setValue(1);
    component.reportForm.controls['reportType'].setValue('Daily Site Log');
    expect(component.reportForm.valid).toBeTrue();

    spyOn(mockReportService, 'generateReport').and.callThrough();
    component.onSubmit();
    expect(mockReportService.generateReport).toHaveBeenCalled();
  });
});
