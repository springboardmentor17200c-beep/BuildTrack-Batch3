import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { ProjectService } from '../../core/services/project.service';
import { ToastService } from '../../core/services/toast.service';
import { Project } from '../../core/interfaces/project.interface';
import { MilestoneStepperComponent } from './milestone-stepper.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';

interface ActivityLog {
  time: string;
  author: string;
  action: string;
}

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MilestoneStepperComponent,
    ToastComponent
  ],
  template: `
    <div class="container-fluid" *ngIf="project">
      <!-- Back button & Header -->
      <div class="mb-4">
        <a routerLink="/projects" class="text-warning text-decoration-none text-sm fw-semibold d-inline-flex align-items-center gap-1 mb-2 hover-underline">
          <mat-icon style="font-size: 16px; width: 16px; height: 16px; vertical-align: middle;">arrow_back</mat-icon>
          <span>Back to Portfolio</span>
        </a>
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <div class="d-flex align-items-center gap-2">
              <h1 class="h2 fw-bold mb-0 text-slate-800">{{ project.name }}</h1>
              <span class="badge bg-light text-dark text-xs border border-secondary border-opacity-10">{{ project.category }}</span>
            </div>
            <p class="text-muted mb-0 mt-1">Project Workspace ID: BT-PROJ-00{{ project.id }}</p>
          </div>
          <span class="bt-badge py-2 px-3 fs-6" 
                [class.bt-badge-success]="project.status === 'On Track'" 
                [class.bt-badge-warning]="project.status === 'Delayed'" 
                [class.bt-badge-danger]="project.status === 'Critical'">
            {{ project.status }}
          </span>
        </div>
      </div>

      <!-- Quick Metrics row -->
      <div class="row g-4 mb-4">
        <div class="col-12 col-md-4">
          <div class="bt-card py-3 px-4">
            <span class="text-muted text-xs text-uppercase tracking-wider fw-bold">Overall Progress</span>
            <h3 class="fw-bold mt-1 mb-2">{{ project.progress }}%</h3>
            <div class="progress" style="height: 6px;">
              <div class="progress-bar bg-warning" role="progressbar" [style.width]="project.progress + '%'"></div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="bt-card py-3 px-4">
            <span class="text-muted text-xs text-uppercase tracking-wider fw-bold">Total Budget Cap</span>
            <h3 class="fw-bold mt-1 mb-2 text-dark">{{ project.budget }}</h3>
            <span class="text-xxs text-muted">Burn Rate: <strong>{{ project.spent }} Spent</strong></span>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="bt-card py-3 px-4">
            <span class="text-muted text-xs text-uppercase tracking-wider fw-bold">Active Staff</span>
            <h3 class="fw-bold mt-1 mb-2 text-info">24 Onsite</h3>
            <span class="text-xxs text-muted">Supervisors: <strong>3 Active</strong></span>
          </div>
        </div>
      </div>

      <!-- Main Tabs Section -->
      <mat-tab-group class="bg-white rounded shadow-sm p-3">
        <!-- Milestone Stepper Tab -->
        <mat-tab label="Milestones & Timeline">
          <div class="p-3">
            <h5 class="fw-bold mb-4">Project Milestone Roadmap</h5>
            
            <!-- Reusable Stepper Child Component -->
            <app-milestone-stepper 
              [milestones]="project.milestones"
              (statusChange)="onMilestoneStatusUpdate($event)">
            </app-milestone-stepper>
          </div>
        </mat-tab>

        <!-- Site Activity Log Tab -->
        <mat-tab label="Site Activity Logs">
          <div class="p-3 row g-4">
            <!-- Left: Add log form -->
            <div class="col-12 col-lg-5">
              <div class="border border-secondary border-opacity-10 rounded p-3 bg-light">
                <h6 class="fw-bold mb-3">Record Site Activity Log</h6>
                <form [formGroup]="logForm" (ngSubmit)="onSubmitLog()">
                  <div class="mb-3">
                    <label class="bt-form-label">Activity Description</label>
                    <textarea class="form-control bt-form-control" formControlName="action" rows="3"
                              placeholder="e.g. Received steel delivery, checked quality."></textarea>
                    <div *ngIf="submitted && f['action'].errors" class="text-danger text-xs mt-1">
                      <span>Action log details are required</span>
                    </div>
                  </div>
                  <button type="submit" class="btn btn-bt-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2">
                    <mat-icon>save</mat-icon>
                    <span>Record Activity</span>
                  </button>
                </form>
              </div>
            </div>

            <!-- Right: Activity logs stream -->
            <div class="col-12 col-lg-7">
              <h6 class="fw-bold mb-3">Recent Activity Stream</h6>
              <div class="activity-stream" style="max-height: 300px; overflow-y: auto;">
                <div *ngFor="let log of logs" class="d-flex gap-3 py-2 border-bottom border-light align-items-start">
                  <div class="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center" style="width: 28px; height: 28px; font-size: 12px; font-weight: bold;">
                    {{ getInitials(log.author) }}
                  </div>
                  <div>
                    <p class="text-xs mb-0"><strong class="text-slate-800">{{ log.author }}</strong>: {{ log.action }}</p>
                    <span class="text-muted text-xxs mt-1 d-block">{{ log.time }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Budget Outlay Tab -->
        <mat-tab label="Cost & Expenditures">
          <div class="p-3">
            <h5 class="fw-bold mb-3">Budget Breakout Ledger</h5>
            <div class="table-responsive">
              <table class="table align-middle text-sm mb-0">
                <thead class="table-light text-muted uppercase text-xs">
                  <tr>
                    <th>Cost Category</th>
                    <th>Allocation Limit</th>
                    <th>Spent YTD</th>
                    <th>Balance Remaining</th>
                    <th>Progress bar</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let cost of budgetItems">
                    <td class="fw-semibold text-slate-800">{{ cost.category }}</td>
                    <td>{{ cost.budget }}</td>
                    <td class="text-danger">{{ cost.spent }}</td>
                    <td class="text-success">{{ cost.remaining }}</td>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <div class="progress flex-grow-1" style="height: 6px; width: 100px;">
                          <div class="progress-bar bg-danger" role="progressbar" [style.width]="cost.burn + '%'"></div>
                        </div>
                        <span class="text-xxs fw-semibold">{{ cost.burn }}%</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>

    <!-- Fallback Loading spinner -->
    <div *ngIf="!project" class="d-flex flex-column align-items-center justify-content-center py-5">
      <span class="spinner-border text-warning mb-2" role="status"></span>
      <span class="text-muted text-sm">Resolving project workspace workspace...</span>
    </div>
    <app-toast></app-toast>
  `,
  styles: [`
    .text-xxs { font-size: 0.72rem; }
    .text-xs { font-size: 0.8rem; }
    .text-sm { font-size: 0.9rem; }
    .hover-underline:hover { text-decoration: underline !important; }
  `]
})
export class ProjectDetailsComponent implements OnInit {
  project: Project | null = null;
  logForm!: FormGroup;
  submitted = false;

  logs: ActivityLog[] = [
    { time: '10 mins ago', author: 'Alex Rivera', action: 'Uploaded daily inspector report for Level 2 beams.' },
    { time: '2 hours ago', author: 'Sarah Jenkins', action: 'Approved budget request adjustment for additional steel supply.' },
    { time: '1 day ago', author: 'Marcus Vance', action: 'Received concrete delivery truck #4. Grade check passed.' }
  ];

  budgetItems = [
    { category: 'Foundation & Earthworks', budget: '$350,000', spent: '$320,000', remaining: '$30,000', burn: 91 },
    { category: 'Steel & Structural framing', budget: '$600,000', spent: '$480,000', remaining: '$120,000', burn: 80 },
    { category: 'Machinery Hire Allocation', budget: '$250,000', spent: '$210,000', remaining: '$40,000', burn: 84 },
    { category: 'Administrative & Permits', budget: '$100,000', spent: '$95,000', remaining: '$5,000', burn: 95 }
  ];

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private projectService: ProjectService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.projectService.getProjectById(id).subscribe({
        next: (p) => {
          if (p) {
            this.project = p;
          } else {
            this.toastService.showError('Project matching ID was not found.');
          }
        },
        error: () => {
          this.toastService.showError('Unable to retrieve project workspace.');
        }
      });
    }

    this.logForm = this.formBuilder.group({
      action: ['', Validators.required]
    });
  }

  get f() { return this.logForm.controls; }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  onSubmitLog(): void {
    this.submitted = true;

    if (this.logForm.invalid) {
      return;
    }

    const newLog: ActivityLog = {
      time: 'Just Now',
      author: 'Sarah Jenkins',
      action: this.logForm.value.action
    };

    this.logs.unshift(newLog);
    this.logForm.reset();
    this.submitted = false;
    this.toastService.showSuccess('Site activity log uploaded successfully.');
  }

  onMilestoneStatusUpdate(event: { milestoneId: number, status: 'Completed' | 'In Progress' | 'Pending' }): void {
    if (this.project) {
      this.projectService.updateMilestone(this.project.id, event.milestoneId, event.status).subscribe({
        next: (p) => {
          if (p) {
            this.project = p;
            this.toastService.showSuccess('Project milestones and progress updated.');
          }
        },
        error: () => {
          this.toastService.showError('Failed to save milestone change.');
        }
      });
    }
  }
}
