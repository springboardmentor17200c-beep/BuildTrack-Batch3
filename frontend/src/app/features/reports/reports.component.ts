import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ReportService } from '../../core/services/report.service';
import { environment } from '../../../environments/environment';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { Report } from '../../core/interfaces/report.interface';
import { Project } from '../../core/interfaces/project.interface';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatIconModule, ToastComponent],
  template: `
    <div class="container-fluid">
      <!-- Title -->
      <div class="mb-4">
        <h1 class="h2 fw-bold mb-1 text-slate-800">Site Quality & Inspection Reports</h1>
        <p class="text-muted mb-0">Generate digital site progress summaries, inspector quality reports, and export PDF sheets & Excel spreadsheets.</p>
      </div>

      <!-- Main Grid -->
      <div class="row g-4">
        <!-- Requisition / Generator Form -->
        <div class="col-12 col-lg-4" *ngIf="canManage">
          <div class="bt-card">
            <h5 class="fw-bold mb-3 text-slate-800">Generate PDF & Excel Reports</h5>
            <form [formGroup]="reportForm" (ngSubmit)="onSubmit()" class="d-flex flex-column gap-3">
              <div>
                <label class="bt-form-label">Project Association</label>
                <select class="form-select bt-form-control" formControlName="projectId">
                  <option value="" disabled selected>Select project...</option>
                  <option *ngFor="let proj of projects" [value]="proj.id">{{ proj.name }}</option>
                </select>
                <div *ngIf="submitted && f['projectId'].errors" class="text-danger text-xs mt-1">
                  Selecting a project is required.
                </div>
              </div>

              <div>
                <label class="bt-form-label">Report Type</label>
                <select class="form-select bt-form-control" formControlName="reportType">
                  <option value="Resource Utilization Report">Resource Utilization Report</option>
                  <option value="Budget & Financial Report">Budget & Financial Report</option>
                  <option value="Workforce & Payroll Report">Workforce & Payroll Report</option>
                  <option value="Procurement Summary Report">Procurement Summary Report</option>
                  <option value="Project Progress Report">Project Progress Report</option>
                  <option value="Daily Site Log">Daily Site Progress Log</option>
                  <option value="Material Quality Audit">Material Quality Audit Log</option>
                  <option value="Safety Inspection Sheet">Safety Inspection compliance sheet</option>
                </select>

              </div>

              <button type="submit" class="btn btn-bt-primary w-100 py-3 mt-2 d-flex align-items-center justify-content-center gap-2" [disabled]="loading">
                <span *ngIf="!loading">Compile PDF & Excel Reports</span>
                <span *ngIf="loading" class="spinner-border spinner-border-sm" role="status"></span>
                <mat-icon *ngIf="!loading">description</mat-icon>
              </button>
            </form>

          </div>
        </div>

        <!-- Ledger list -->
        <div class="col-12" [class.col-lg-8]="canManage">
          <div class="bt-card">
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
              <h5 class="fw-bold mb-0 text-slate-800">Reports Directory Ledger</h5>
              <div class="d-flex gap-2">
                <input type="text" class="form-control form-control-sm bt-search-input" placeholder="Search report types..." 
                       [(ngModel)]="searchQuery" (input)="filterReports()">
              </div>
            </div>

            <!-- Table -->
            <div class="table-responsive">
              <table class="table align-middle text-sm mb-0">
                <thead class="table-light text-muted uppercase text-xs">
                  <tr>
                    <th>Report ID</th>
                    <th>Report Classification</th>
                    <th>Associated Project</th>
                    <th>Compiled Date</th>
                    <th>Signature</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let report of filteredReports" class="hover-row">
                    <td><strong>#REP-00{{ report.id }}</strong></td>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <mat-icon class="text-danger">picture_as_pdf</mat-icon>
                        <span class="fw-semibold text-slate-800">{{ report.reportType }}</span>
                      </div>
                    </td>
                    <td><span>{{ report.projectName }}</span></td>
                    <td>{{ report.createdAt }}</td>
                    <td>
                      <span class="badge bg-success-subtle text-success px-2 py-1 text-xxs">
                        Verified Signature
                      </span>
                    </td>
                    <td class="text-end">
                      <div class="d-flex justify-content-end gap-1">
                        <a [href]="report.reportUrl.startsWith('http') ? report.reportUrl : apiUrl + report.reportUrl" target="_blank" class="btn btn-xs btn-outline-danger py-1 px-2 text-xxs d-flex align-items-center gap-1">
                          <mat-icon style="font-size: 14px; width: 14px; height: 14px;">picture_as_pdf</mat-icon>
                          <span>PDF</span>
                        </a>
                        <a [href]="(report.excelUrl && report.excelUrl.startsWith('http')) ? report.excelUrl : apiUrl + (report.excelUrl || report.reportUrl.replace('.pdf', '.csv'))" target="_blank" class="btn btn-xs btn-outline-success py-1 px-2 text-xxs d-flex align-items-center gap-1">
                          <mat-icon style="font-size: 14px; width: 14px; height: 14px;">table_chart</mat-icon>
                          <span>Excel</span>
                        </a>
                        <button class="btn btn-link text-danger p-1" (click)="deleteReport(report.id)" *ngIf="isAdmin">
                          <mat-icon style="font-size: 18px; width: 18px; height: 18px;">delete</mat-icon>
                        </button>
                      </div>
                    </td>

                  </tr>
                  <tr *ngIf="filteredReports.length === 0">
                    <td colspan="6" class="text-center py-4 text-muted">No quality reports logged.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <app-toast></app-toast>
  `,
  styles: [`
    .text-xs { font-size: 0.8rem; }
    .text-xxs { font-size: 0.72rem; }
    .text-sm { font-size: 0.9rem; }
    .hover-row:hover { background-color: rgba(0, 0, 0, 0.015); }
    .btn-xs { font-size: 0.75rem; }
  `]
})
export class ReportsComponent implements OnInit {
  apiUrl = environment.apiUrl;
  reports: Report[] = [];
  filteredReports: Report[] = [];
  projects: Project[] = [];
  reportForm!: FormGroup;
  submitted = false;
  loading = false;

  // Search
  searchQuery = '';

  // Roles
  canManage = false;
  isAdmin = false;

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private projectService: ProjectService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const role = this.authService.currentUserValue?.role || '';
    this.isAdmin = role === 'Admin';
    this.canManage = role === 'Admin' || role === 'Project Manager' || role === 'Site Engineer';

    this.initForm();
    this.loadData();
  }

  initForm(): void {
    this.reportForm = this.fb.group({
      projectId: ['', Validators.required],
      reportType: ['Project Progress Report', Validators.required]
    });
  }


  get f() { return this.reportForm.controls; }

  loadData(): void {
    this.reportService.getReports().subscribe(reports => {
      this.reports = reports;
      this.filterReports();
    });

    this.projectService.getProjects().subscribe(projects => {
      this.projects = projects;
    });
  }

  filterReports(): void {
    this.filteredReports = this.reports.filter(r => {
      return r.reportType.toLowerCase().includes(this.searchQuery.toLowerCase());
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.reportForm.invalid) {
      return;
    }

    this.loading = true;
    const val = this.reportForm.value;

    const payload = {
      projectId: Number(val.projectId),
      generatedBy: this.authService.currentUserValue?.id || 1,
      reportType: val.reportType
    };

    this.reportService.generateReport(payload).subscribe({
      next: () => {
        this.loading = false;
        this.submitted = false;
        this.toastService.showSuccess('PDF compiled and saved successfully!');
        this.reportForm.reset({
          reportType: 'Daily Site Log'
        });
        this.loadData();
      },
      error: (err) => {
        this.loading = false;
        this.toastService.showError(err.message || 'Failed to generate inspection report.');
      }
    });
  }

  deleteReport(id: number): void {
    if (confirm(`Are you sure you want to delete report #REP-00${id}?`)) {
      this.reportService.deleteReport(id).subscribe(success => {
        if (success) {
          this.toastService.showSuccess(`Report #REP-00${id} deleted.`);
          this.loadData();
        } else {
          this.toastService.showError('Failed to delete report.');
        }
      });
    }
  }
}
