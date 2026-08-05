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
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h5 class="fw-bold mb-0">Project Milestone Roadmap</h5>
              <button class="btn btn-bt-primary btn-sm d-flex align-items-center gap-1" (click)="showAddMilestoneModal = true">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">add</mat-icon>
                <span>Add Milestone</span>
              </button>
            </div>
            
            <!-- Reusable Stepper Child Component -->
            <app-milestone-stepper 
              [milestones]="project.milestones"
              (statusChange)="onMilestoneStatusUpdate($event)"
              (deleteMilestone)="onDeleteMilestone($event)">
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
                              placeholder="e.g. Completed concrete slab pouring for Ground Level."
                              [class.is-invalid]="submitted && f['action'].errors"></textarea>
                  </div>
                  <button type="submit" class="btn btn-bt-primary w-100">Post Activity Update</button>
                </form>
              </div>
            </div>

            <!-- Right: Activity feed -->
            <div class="col-12 col-lg-7">
              <h6 class="fw-bold mb-3">Recent Site Updates</h6>
              <div class="d-flex flex-column gap-3">
                <div *ngFor="let log of logs" class="d-flex gap-3 align-items-start border-bottom pb-3">
                  <div class="rounded-circle bg-warning text-white d-flex align-items-center justify-content-center fw-bold"
                       style="width: 36px; height: 36px; min-width: 36px; font-size: 0.8rem;">
                    {{ getInitials(log.author) }}
                  </div>
                  <div>
                    <div class="d-flex align-items-center gap-2 mb-1">
                      <span class="fw-bold text-slate-800 text-sm">{{ log.author }}</span>
                      <span class="text-xxs text-muted">• {{ log.time }}</span>
                    </div>
                    <p class="text-sm text-muted mb-0">{{ log.action }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Budget & Cost Breakdown Tab -->
        <mat-tab label="Financial Expenditure">
          <div class="p-3">
            <h5 class="fw-bold mb-4">Cost Distribution by Phase</h5>
            <div class="table-responsive">
              <table class="table align-middle text-sm mb-0">
                <thead class="table-light text-muted uppercase text-xs">
                  <tr>
                    <th>Category</th>
                    <th>Allocated Budget</th>
                    <th>Actual Spent</th>
                    <th>Remaining</th>
                    <th>Burn Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let b of budgetItems">
                    <td class="fw-semibold text-slate-800">{{ b.category }}</td>
                    <td>{{ b.budget }}</td>
                    <td class="text-danger fw-semibold">{{ b.spent }}</td>
                    <td class="text-success fw-semibold">{{ b.remaining }}</td>
                    <td>
                      <div class="d-flex align-items-center gap-2" style="width: 140px;">
                        <div class="progress flex-grow-1" style="height: 6px;">
                          <div class="progress-bar" [class.bg-success]="b.burn < 85" [class.bg-warning]="b.burn >= 85" [style.width]="b.burn + '%'"></div>
                        </div>
                        <span class="text-xxs fw-bold">{{ b.burn }}%</span>
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

    <!-- Add Milestone Modal Overlay -->
    <div *ngIf="showAddMilestoneModal" class="modal-backdrop fade show" style="background-color: rgba(0,0,0,0.5);"></div>
    <div *ngIf="showAddMilestoneModal" class="modal d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">Register New Project Milestone</h5>
            <button type="button" class="btn-close" (click)="showAddMilestoneModal = false"></button>
          </div>
          <form [formGroup]="milestoneForm" (ngSubmit)="onAddMilestone()">
            <div class="modal-body">
              <div class="mb-3">
                <label class="bt-form-label">Milestone Title</label>
                <input type="text" class="form-control bt-form-control" formControlName="milestoneName" placeholder="e.g. Ground Foundation Slab Pouring">
              </div>
              <div class="mb-3">
                <label class="bt-form-label">Target Completion Date</label>
                <input type="date" class="form-control bt-form-control" formControlName="dueDate">
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="showAddMilestoneModal = false">Cancel</button>
              <button type="submit" class="btn btn-bt-primary" [disabled]="milestoneForm.invalid || isSubmittingMilestone">
                <span *ngIf="isSubmittingMilestone" class="spinner-border spinner-border-sm me-1"></span>
                <span>Add Milestone</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <app-toast></app-toast>
  `,
  styles: [`
    .hover-underline:hover { text-decoration: underline !important; }
    .text-xxs { font-size: 0.72rem; }
    .text-xs { font-size: 0.8rem; }
    .text-sm { font-size: 0.9rem; }
  `]
})
export class ProjectDetailsComponent implements OnInit {
  project?: Project;
  logForm!: FormGroup;
  milestoneForm!: FormGroup;
  submitted = false;
  showAddMilestoneModal = false;
  isSubmittingMilestone = false;

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
      this.loadProject(id);
    }

    this.logForm = this.formBuilder.group({
      action: ['', Validators.required]
    });

    const todayStr = new Date().toISOString().slice(0, 10);
    this.milestoneForm = this.formBuilder.group({
      milestoneName: ['', Validators.required],
      dueDate: [todayStr, Validators.required]
    });
  }

  loadProject(id: number): void {
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

  onAddMilestone(): void {
    if (this.milestoneForm.invalid || !this.project) return;

    this.isSubmittingMilestone = true;
    const formVal = this.milestoneForm.value;

    this.projectService.createMilestone(
      this.project.id,
      formVal.milestoneName,
      formVal.dueDate
    ).subscribe({
      next: (updatedProj) => {
        this.isSubmittingMilestone = false;
        this.showAddMilestoneModal = false;
        this.milestoneForm.reset({ dueDate: new Date().toISOString().slice(0, 10) });
        if (updatedProj) {
          this.project = updatedProj;
        }
        this.toastService.showSuccess('New milestone added successfully!');
      },
      error: () => {
        this.isSubmittingMilestone = false;
        this.toastService.showError('Failed to add milestone.');
      }
    });
  }

  onMilestoneStatusUpdate(event: { milestoneId: number, status: 'Completed' | 'In Progress' | 'Pending' }): void {
    if (this.project) {
      this.projectService.updateMilestone(this.project.id, event.milestoneId, event.status).subscribe({
        next: (p) => {
          if (p) {
            this.project = p;
            this.toastService.showSuccess('Project milestone and progress updated.');
          }
        },
        error: () => {
          this.toastService.showError('Failed to save milestone change.');
        }
      });
    }
  }

  onDeleteMilestone(milestoneId: number): void {
    if (this.project && confirm('Are you sure you want to delete this milestone?')) {
      this.projectService.deleteMilestone(this.project.id, milestoneId).subscribe({
        next: (p) => {
          if (p) {
            this.project = p;
          }
          this.toastService.showSuccess('Milestone deleted successfully.');
        },
        error: () => {
          this.toastService.showError('Failed to delete milestone.');
        }
      });
    }
  }
}
