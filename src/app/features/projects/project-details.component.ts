import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';

interface Milestone {
  title: string;
  dueDate: string;
  status: 'Completed' | 'In Progress' | 'Pending';
  description: string;
}

interface ActivityLog {
  time: string;
  author: string;
  action: string;
}

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatIconModule, MatButtonModule, MatTabsModule],
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
            <p class="text-muted mb-0 mt-1">Project Workspace Workspace ID: BT-PROJ-00{{ project.id }}</p>
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
            <span class="text-xxs text-muted">Burn Rate: <strong>81% of allocation</strong></span>
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
            <div class="timeline-container px-3">
              <div *ngFor="let ms of milestones; let i = index" class="timeline-item d-flex gap-4 mb-4 position-relative">
                <div class="connector-line" *ngIf="i < milestones.length - 1"></div>
                <div class="timeline-node rounded-circle d-flex align-items-center justify-content-center"
                     [ngClass]="getNodeClass(ms.status)">
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">{{ getNodeIcon(ms.status) }}</mat-icon>
                </div>
                <div class="timeline-content border border-secondary border-opacity-10 rounded p-3 bg-light flex-grow-1">
                  <div class="d-flex justify-content-between align-items-start">
                    <h6 class="fw-bold text-slate-800 mb-1">{{ ms.title }}</h6>
                    <span class="badge text-xs" 
                          [class.bg-success]="ms.status === 'Completed'" 
                          [class.bg-warning]="ms.status === 'In Progress'" 
                          [class.bg-secondary]="ms.status === 'Pending'">
                      {{ ms.status }}
                    </span>
                  </div>
                  <p class="text-muted text-xs mb-2">{{ ms.description }}</p>
                  <span class="text-xxs text-muted fw-semibold">Target Completion: {{ ms.dueDate }}</span>
                </div>
              </div>
            </div>
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
  `,
  styles: [`
    .timeline-container { position: relative; }
    .timeline-item { position: relative; }
    .connector-line {
      position: absolute;
      top: 36px;
      left: 18px;
      width: 2px;
      height: calc(100% - 12px);
      background-color: var(--slate-200);
      z-index: 1;
    }
    .timeline-node {
      width: 38px;
      height: 38px;
      min-width: 38px;
      z-index: 2;
    }
    .bg-node-completed { background-color: #d1fae5; color: #10b981; border: 2px solid #10b981; }
    .bg-node-active { background-color: #ecfeff; color: #06b6d4; border: 2px solid #06b6d4; }
    .bg-node-pending { background-color: #f1f5f9; color: #94a3b8; border: 2px solid #cbd5e1; }
    .text-xxs { font-size: 0.72rem; }
    .text-xs { font-size: 0.8rem; }
    .text-sm { font-size: 0.9rem; }
    .hover-underline:hover { text-decoration: underline !important; }
  `]
})
export class ProjectDetailsComponent implements OnInit {
  project: any = null;
  logForm!: FormGroup;
  submitted = false;

  milestones: Milestone[] = [
    { title: 'Earthmoving & Grading Phase', dueDate: '2026-05-15', status: 'Completed', description: 'Heavy levelling machinery operations, drainage conduits framing.' },
    { title: 'Substructure Foundation Pour', dueDate: '2026-06-10', status: 'Completed', description: 'Concrete pour and settlement checks on support pillars.' },
    { title: 'Steel Framing Pillars (Level 2)', dueDate: '2026-08-01', status: 'In Progress', description: 'Setting up structural scaffolding framework for core elevator shafts.' },
    { title: 'Wall Partition Masonry', dueDate: '2026-09-15', status: 'Pending', description: 'Layering bricks for external boundary layouts.' }
  ];

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

  // Dummy projects data matching list
  private projectsList = [
    { id: 1, name: 'Metropolitan Commercial Plaza', category: 'Commercial', progress: 85, budget: '$1.5M', status: 'On Track' },
    { id: 2, name: 'Riverside Residential Township', category: 'Residential', progress: 48, budget: '$2.0M', status: 'Delayed' },
    { id: 3, name: 'Industrial Cold Storage Unit', category: 'Industrial', progress: 92, budget: '$800k', status: 'On Track' },
    { id: 4, name: 'State Highway Bypass Route', category: 'Infrastructure', progress: 24, budget: '$3.5M', status: 'Critical' },
    { id: 5, name: 'Metro Line Bridge Foundations', category: 'Government Projects', progress: 60, budget: '$5.0M', status: 'On Track' }
  ];

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id')) || 1;
    this.project = this.projectsList.find(p => p.id === id) || this.projectsList[0];

    this.logForm = this.formBuilder.group({
      action: ['', Validators.required]
    });
  }

  get f() { return this.logForm.controls; }

  getNodeClass(status: string): string {
    switch (status) {
      case 'Completed': return 'bg-node-completed';
      case 'In Progress': return 'bg-node-active';
      default: return 'bg-node-pending';
    }
  }

  getNodeIcon(status: string): string {
    switch (status) {
      case 'Completed': return 'check';
      case 'In Progress': return 'pending';
      default: return 'radio_button_unchecked';
    }
  }

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
  }
}
