import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ReportService } from '../../core/services/report.service';
import { ProjectService } from '../../core/services/project.service';
import { ToastService } from '../../core/services/toast.service';
import { Report } from '../../core/interfaces/report.interface';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule, ToastComponent],
  template: `
    <div class="container-fluid">
      <!-- Title & Action -->
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h1 class="h2 fw-bold mb-1 text-slate-800">Business Intelligence & Analytics</h1>
          <p class="text-muted mb-0">Review project completion rates, raw material procurement statistics, and labor costs</p>
        </div>
        <button class="btn btn-bt-primary d-flex align-items-center gap-2" (click)="showGenerateModal = true">
          <mat-icon>assessment</mat-icon>
          <span>Generate New Report</span>
        </button>
      </div>

      <!-- Analytical Graphs Grid -->
      <div class="row g-4 mb-4">
        <!-- Budget vs Spent Bar Chart -->
        <div class="col-12 col-lg-6">
          <div class="bt-card">
            <div class="bt-card-header">
              <h5 class="fw-bold mb-0">Category Cost Analysis (Budget vs Spent)</h5>
              <mat-icon class="text-warning">bar_chart</mat-icon>
            </div>
            <div class="d-flex align-items-center justify-content-center py-3" style="height: 250px;">
              <canvas #barChart class="w-100 h-100"></canvas>
            </div>
            <div class="d-flex justify-content-center gap-3 text-xxs text-muted mt-2">
              <div class="d-flex align-items-center gap-1">
                <span style="width: 10px; height: 10px; background-color: #3b82f6; display: inline-block; border-radius: 2px;"></span>
                <span>Budget Allocated ($100k)</span>
              </div>
              <div class="d-flex align-items-center gap-1">
                <span style="width: 10px; height: 10px; background-color: #ef4444; display: inline-block; border-radius: 2px;"></span>
                <span>Actual Spent ($100k)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Workforce distribution chart -->
        <div class="col-12 col-lg-6">
          <div class="bt-card">
            <div class="bt-card-header">
              <h5 class="fw-bold mb-0">Workforce Resource Allocation</h5>
              <mat-icon class="text-info">donut_large</mat-icon>
            </div>
            <div class="d-flex align-items-center justify-content-center py-3" style="height: 250px;">
              <canvas #donutChart class="w-100 h-100"></canvas>
            </div>
            <div class="d-flex justify-content-center gap-3 text-xxs text-muted mt-2">
              <div class="d-flex align-items-center gap-1">
                <span style="width: 10px; height: 10px; background-color: #ff7a00; display: inline-block; border-radius: 2px;"></span>
                <span>Skilled Labor (45%)</span>
              </div>
              <div class="d-flex align-items-center gap-1">
                <span style="width: 10px; height: 10px; background-color: #10b981; display: inline-block; border-radius: 2px;"></span>
                <span>General Labor (35%)</span>
              </div>
              <div class="d-flex align-items-center gap-1">
                <span style="width: 10px; height: 10px; background-color: #06b6d4; display: inline-block; border-radius: 2px;"></span>
                <span>Supervisors/Eng (20%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Generated Reports Ledger -->
      <div class="bt-card mb-4">
        <div class="bt-card-header d-flex justify-content-between align-items-center">
          <h5 class="fw-bold mb-0">Generated Project Reports Ledger</h5>
          <span class="badge bg-light text-dark border border-secondary border-opacity-10 text-xs">Live Database Records</span>
        </div>

        <div class="table-responsive">
          <table class="table align-middle text-sm mb-0">
            <thead class="table-light text-muted uppercase text-xs">
              <tr>
                <th>Report Type</th>
                <th>Target Project</th>
                <th>Created Date</th>
                <th>Report File</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let rep of reports">
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <mat-icon class="text-primary">picture_as_pdf</mat-icon>
                    <span class="fw-semibold text-slate-800">{{ rep.reportType }}</span>
                  </div>
                </td>
                <td>{{ rep.projectName }}</td>
                <td>{{ rep.createdAt }}</td>
                <td>
                  <a [href]="rep.reportUrl" target="_blank" class="text-primary text-xs text-decoration-none d-inline-flex align-items-center gap-1">
                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;">download</mat-icon>
                    <span>Download PDF</span>
                  </a>
                </td>
                <td class="text-end">
                  <button class="btn btn-xs btn-outline-danger py-1 px-2 text-xxs" (click)="deleteReport(rep.id)">
                    Delete
                  </button>
                </td>
              </tr>
              <tr *ngIf="reports.length === 0">
                <td colspan="5" class="text-center py-4 text-muted">No generated reports in database ledger. Click 'Generate New Report' to generate one.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Financial Balance sheet breakout -->
      <div class="bt-card">
        <div class="bt-card-header">
          <h5 class="fw-bold mb-0">Financial Status Ledger</h5>
          <span class="badge bg-light text-dark border border-secondary border-opacity-10 text-xs">YTD Audited Summary</span>
        </div>
        
        <div class="table-responsive">
          <table class="table align-middle text-sm mb-0">
            <thead class="table-light text-muted uppercase text-xs">
              <tr>
                <th>Project Name</th>
                <th>Contract Value</th>
                <th>Total Spent</th>
                <th>Material Procurement</th>
                <th>Workforce Cost</th>
                <th>Performance Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let audit of audits">
                <td>
                  <span class="fw-semibold text-slate-800">{{ audit.name }}</span>
                </td>
                <td>{{ audit.contractValue }}</td>
                <td class="fw-semibold text-danger">{{ audit.spent }}</td>
                <td>{{ audit.materials }}</td>
                <td>{{ audit.labor }}</td>
                <td>
                  <span class="bt-badge" 
                        [class.bt-badge-success]="audit.efficiency === 'Optimal'" 
                        [class.bt-badge-warning]="audit.efficiency === 'Over-Budget 5%'" 
                        [class.bt-badge-danger]="audit.efficiency === 'Warning Over-run'">
                    {{ audit.efficiency }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Generate Report Modal Overlay -->
    <div *ngIf="showGenerateModal" class="modal-backdrop fade show" style="background-color: rgba(0,0,0,0.5);"></div>
    <div *ngIf="showGenerateModal" class="modal d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">Generate Project Analytical Report</h5>
            <button type="button" class="btn-close" (click)="showGenerateModal = false"></button>
          </div>
          <form [formGroup]="reportForm" (ngSubmit)="onGenerateReport()">
            <div class="modal-body">
              <div class="mb-3">
                <label class="bt-form-label">Report Type</label>
                <select class="form-select bt-form-control" formControlName="reportType">
                  <option value="Financial Audit Report">Financial Audit Report</option>
                  <option value="Material Utilization Report">Material Utilization Report</option>
                  <option value="Workforce Cost Summary">Workforce Cost Summary</option>
                  <option value="Project Milestone Summary">Project Milestone Summary</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="bt-form-label">Target Project Site</label>
                <select class="form-select bt-form-control" formControlName="projectId">
                  <option *ngFor="let p of projects" [value]="p.id">{{ p.name }}</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="showGenerateModal = false">Cancel</button>
              <button type="submit" class="btn btn-bt-primary" [disabled]="reportForm.invalid || isSubmitting">
                <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                <span>Generate Report</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <app-toast></app-toast>
  `,
  styles: [`
    .text-xxs { font-size: 0.72rem; }
    .text-xs { font-size: 0.8rem; }
    .text-sm { font-size: 0.9rem; }
    .btn-xs { font-size: 0.75rem; }
  `]
})
export class AnalyticsComponent implements OnInit, AfterViewInit {
  @ViewChild('barChart') barChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donutChart') donutChart!: ElementRef<HTMLCanvasElement>;

  reports: Report[] = [];
  projects: { id: number; name: string }[] = [
    { id: 1, name: 'Oakridge housing' },
    { id: 2, name: 'SVS housing' }
  ];


  showGenerateModal = false;
  isSubmitting = false;
  reportForm!: FormGroup;

  audits: any[] = [];

  constructor(
    private reportService: ReportService,
    private projectService: ProjectService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.reportForm = this.fb.group({
      reportType: ['Financial Audit Report', Validators.required],
      projectId: [1, Validators.required]
    });
    this.loadProjects();
    this.loadReports();
  }

  loadReports(): void {
    this.reportService.getReports().subscribe(list => {
      this.reports = list.map(r => {
        const matchingProj = this.projects.find(p => p.id === r.projectId);
        return {
          ...r,
          projectName: matchingProj ? matchingProj.name : `Project #${r.projectId}`
        };
      });
    });
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (projList) => {
        if (projList && projList.length > 0) {
          this.projects = projList.map(p => ({ id: p.id, name: p.name }));
          if (this.reportForm) {
            this.reportForm.patchValue({ projectId: projList[0].id });
          }
          this.audits = projList.map(p => {
            const b = Number(p.budget) || 0;
            return {
              name: p.name,
              contractValue: `$${b.toLocaleString()}`,
              spent: `$${Math.round(b * 0.65).toLocaleString()}`,
              materials: `$${Math.round(b * 0.35).toLocaleString()}`,
              labor: `$${Math.round(b * 0.30).toLocaleString()}`,
              efficiency: p.status === 'Completed' ? 'Optimal' : 'Optimal'
            };
          });

          this.loadReports();
        }
      },
      error: () => {}
    });
  }


  onGenerateReport(): void {
    if (this.reportForm.invalid) return;

    this.isSubmitting = true;
    const formVal = this.reportForm.value;

    this.reportService.generateReport({
      projectId: Number(formVal.projectId),
      reportType: formVal.reportType
    }).subscribe({
      next: (created) => {
        this.isSubmitting = false;
        this.showGenerateModal = false;
        this.toastService.showSuccess(`Report "${created.reportType}" generated successfully!`);
        this.loadReports();
      },
      error: () => {
        this.isSubmitting = false;
        this.toastService.showError('Failed to generate report.');
      }
    });
  }

  deleteReport(id: number): void {
    if (confirm('Are you sure you want to delete this report?')) {
      this.reportService.deleteReport(id).subscribe({
        next: () => {
          this.toastService.showSuccess('Report deleted successfully.');
          this.loadReports();
        },
        error: () => {
          this.toastService.showError('Failed to delete report.');
        }
      });
    }
  }

  ngAfterViewInit(): void {
    this.drawBarChart();
    this.drawDonutChart();
  }

  drawBarChart(): void {
    const canvas = this.barChart.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    const paddingLeft = 35;
    const paddingRight = 15;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const categories = ['Found.', 'Struct.', 'Machin.', 'Admin.'];
    const allocated = [35, 60, 25, 10];
    const spent = [32, 48, 21, 9.5];

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = paddingTop + (chartHeight * i) / 4;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px Outfit';
      ctx.textAlign = 'right';
      ctx.fillText((80 - (i * 80) / 4).toString(), paddingLeft - 8, y + 3);
    }

    const barWidth = 18;
    const groupWidth = chartWidth / categories.length;

    categories.forEach((cat, i) => {
      const startX = paddingLeft + i * groupWidth + (groupWidth - barWidth * 2 - 6) / 2;

      ctx.fillStyle = '#3b82f6';
      const allocatedHeight = chartHeight * (allocated[i] / 80);
      const allocatedY = paddingTop + chartHeight - allocatedHeight;
      ctx.fillRect(startX, allocatedY, barWidth, allocatedHeight);

      ctx.fillStyle = '#ef4444';
      const spentHeight = chartHeight * (spent[i] / 80);
      const spentY = paddingTop + chartHeight - spentHeight;
      ctx.fillRect(startX + barWidth + 4, spentY, barWidth, spentHeight);

      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(cat, paddingLeft + i * groupWidth + groupWidth / 2, height - paddingBottom + 15);
    });
  }

  drawDonutChart(): void {
    const canvas = this.donutChart.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 25;

    ctx.clearRect(0, 0, width, height);

    const values = [0.45, 0.35, 0.20];
    const colors = ['#ff7a00', '#10b981', '#06b6d4'];

    let currentAngle = -Math.PI / 2;

    values.forEach((val, i) => {
      const segmentAngle = val * Math.PI * 2;
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + segmentAngle);
      ctx.closePath();
      ctx.fill();
      currentAngle += segmentAngle;
    });

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 16px Outfit';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('184', centerX, centerY - 6);

    ctx.fillStyle = '#64748b';
    ctx.font = '10px Outfit';
    ctx.fillText('Total Staff', centerX, centerY + 10);
  }
}
