import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MaterialRequestService } from '../../core/services/material-request.service';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { MaterialRequest } from '../../core/interfaces/material-request.interface';
import { Project } from '../../core/interfaces/project.interface';
import { WorkflowStepperComponent } from '../../shared/components/workflow-stepper/workflow-stepper.component';

@Component({
  selector: 'app-material-requests',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatTabsModule,
    ToastComponent,
    WorkflowStepperComponent
  ],
  template: `
    <div class="container-fluid">
      <!-- Title -->
      <div class="mb-4">
        <h1 class="h2 fw-bold mb-1 text-slate-800">Material Requisition Center</h1>
        <p class="text-muted mb-0">Create, approve, and track raw material requisition workflows for active construction sites.</p>
      </div>

      <!-- Main Tabs -->
      <mat-tab-group class="bg-white rounded shadow-sm p-3" [selectedIndex]="activeTab">
        <!-- Tab 1: Requisitions List -->
        <mat-tab label="All Requests Ledger">
          <div class="p-3">
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
              <div class="d-flex gap-2">
                <input type="text" class="form-control form-control-sm bt-search-input" placeholder="Search material name..." 
                       [(ngModel)]="searchQuery" (input)="filterRequests()">
                <select class="form-select form-select-sm" [(ngModel)]="priorityFilter" (change)="filterRequests()" style="width: 130px;">
                  <option value="">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <select class="form-select form-select-sm" [(ngModel)]="statusFilter" (change)="filterRequests()" style="width: 130px;">
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <button class="btn btn-bt-primary btn-sm d-flex align-items-center gap-1" (click)="activeTab = 1" *ngIf="canRequest">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">add</mat-icon>
                <span>New Request</span>
              </button>
            </div>

            <!-- Table -->
            <div class="table-responsive">
              <table class="table align-middle text-sm mb-0">
                <thead class="table-light text-muted uppercase text-xs">
                  <tr>
                    <th>REQ ID</th>
                    <th>Material</th>
                    <th>Required Qty</th>
                    <th>Required Date</th>
                    <th>Priority</th>
                    <th>Comments</th>
                    <th>Status</th>
                    <th class="text-end" *ngIf="canApprove || isAdmin">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let req of filteredRequests" class="hover-row" (click)="selectRequest(req)">
                    <td><strong>#REQ-00{{ req.id }}</strong></td>
                    <td>{{ req.materialName }}</td>
                    <td>{{ req.quantity }} Units</td>
                    <td>{{ req.requiredDate | date }}</td>
                    <td>
                      <span class="badge" 
                            [class.bg-danger-subtle]="req.priority === 'High'"
                            [class.text-danger]="req.priority === 'High'"
                            [class.bg-warning-subtle]="req.priority === 'Medium'"
                            [class.text-warning]="req.priority === 'Medium'"
                            [class.bg-info-subtle]="req.priority === 'Low'"
                            [class.text-info]="req.priority === 'Low'">
                        {{ req.priority }}
                      </span>
                    </td>
                    <td>
                      <span class="text-xs text-muted text-truncate d-inline-block" style="max-width: 150px;">{{ req.comments || 'No remarks' }}</span>
                    </td>
                    <td>
                      <span class="bt-badge" 
                            [class.bt-badge-warning]="req.status === 'Pending'"
                            [class.bt-badge-success]="req.status === 'Approved'"
                            [class.bt-badge-danger]="req.status === 'Rejected'">
                        {{ req.status }}
                      </span>
                    </td>
                    <td class="text-end" *ngIf="canApprove || isAdmin">
                      <div class="d-flex justify-content-end gap-1" (click)="$event.stopPropagation()">
                        <button *ngIf="req.status === 'Pending'" class="btn btn-xs btn-outline-success px-2 py-1 text-xxs" 
                                (click)="approveReq(req.id)">Approve</button>
                        <button *ngIf="req.status === 'Pending'" class="btn btn-xs btn-outline-danger px-2 py-1 text-xxs" 
                                (click)="rejectReq(req.id)">Reject</button>
                        <button class="btn btn-link text-danger p-1" (click)="deleteReq(req.id)" *ngIf="isAdmin">
                          <mat-icon style="font-size: 18px; width: 18px; height: 18px;">delete</mat-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="filteredRequests.length === 0">
                    <td colspan="8" class="text-center py-4 text-muted">No material requests found.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Details Drawer Panel -->
            <div class="drawer-panel border-top mt-4 pt-3" *ngIf="selectedReq">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold mb-0 text-slate-800">Requisition Details: #REQ-00{{ selectedReq.id }}</h5>
                <button class="btn btn-link text-muted p-1" (click)="selectedReq = null">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
              <app-workflow-stepper [currentStage]="selectedReq.status"></app-workflow-stepper>
              <div class="row g-3 mt-3 text-xs">
                <div class="col-md-3"><strong>Requested Material:</strong> {{ selectedReq.materialName }}</div>
                <div class="col-md-3"><strong>Needed Quantity:</strong> {{ selectedReq.quantity }} units</div>
                <div class="col-md-3"><strong>Required Deadline:</strong> {{ selectedReq.requiredDate | date }}</div>
                <div class="col-md-3"><strong>Remarks / Feedback:</strong> {{ selectedReq.comments || 'None' }}</div>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Tab 2: Create Requisition -->
        <mat-tab label="Create Requisition Form" *ngIf="canRequest">
          <div class="p-3" style="max-width: 650px;">
            <h5 class="fw-bold mb-3 text-slate-800">New Material Requisition Form</h5>
            <form [formGroup]="requestForm" (ngSubmit)="onSubmit()" class="d-flex flex-column gap-3">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="bt-form-label">Material Name</label>
                  <input type="text" class="form-control bt-form-control" formControlName="materialName" placeholder="e.g. Steel Rebars 12mm">
                  <div *ngIf="submitted && f['materialName'].errors" class="text-danger text-xs mt-1">Material Name is required.</div>
                </div>

                <div class="col-md-6">
                  <label class="bt-form-label">Quantity</label>
                  <input type="number" class="form-control bt-form-control" formControlName="quantity" min="1">
                  <div *ngIf="submitted && f['quantity'].errors" class="text-danger text-xs mt-1">Quantity must be positive.</div>
                </div>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="bt-form-label">Associated Project</label>
                  <select class="form-select bt-form-control" formControlName="projectId">
                    <option value="" disabled selected>Select project...</option>
                    <option *ngFor="let proj of projects" [value]="proj.id">{{ proj.name }}</option>
                  </select>
                  <div *ngIf="submitted && f['projectId'].errors" class="text-danger text-xs mt-1">Project is required.</div>
                </div>

                <div class="col-md-6">
                  <label class="bt-form-label">Required Date</label>
                  <input type="date" class="form-control bt-form-control" formControlName="requiredDate">
                  <div *ngIf="submitted && f['requiredDate'].errors" class="text-danger text-xs mt-1">Deadline is required.</div>
                </div>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="bt-form-label">Requisition Priority</label>
                  <select class="form-select bt-form-control" formControlName="priority">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="bt-form-label">Description / Comments</label>
                  <textarea class="form-control bt-form-control" formControlName="comments" rows="2" placeholder="Explain utility or specifications..."></textarea>
                </div>
              </div>

              <button type="submit" class="btn btn-bt-primary w-100 py-3 mt-3 d-flex align-items-center justify-content-center gap-2" [disabled]="loading">
                <span *ngIf="!loading">Submit Requisition</span>
                <span *ngIf="loading" class="spinner-border spinner-border-sm" role="status"></span>
                <mat-icon *ngIf="!loading">assignment</mat-icon>
              </button>
            </form>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
    <app-toast></app-toast>
  `,
  styles: [`
    .text-xs { font-size: 0.8rem; }
    .text-xxs { font-size: 0.72rem; }
    .text-sm { font-size: 0.9rem; }
    .hover-row { cursor: pointer; }
    .hover-row:hover { background-color: rgba(0, 0, 0, 0.015); }
    .btn-xs { font-size: 0.75rem; padding: 0.25rem 0.5rem; }
    .drawer-panel {
      background-color: var(--slate-50, #f8fafc);
      padding: 1.25rem;
      border-radius: var(--border-radius-md, 8px);
    }
  `]
})
export class MaterialRequestsComponent implements OnInit {
  requests: MaterialRequest[] = [];
  filteredRequests: MaterialRequest[] = [];
  projects: Project[] = [];
  selectedReq: MaterialRequest | null = null;
  requestForm!: FormGroup;

  activeTab = 0;
  submitted = false;
  loading = false;

  // Search & Filters
  searchQuery = '';
  priorityFilter = '';
  statusFilter = '';

  // Roles
  canRequest = false;
  canApprove = false;
  isAdmin = false;

  constructor(
    private fb: FormBuilder,
    private requestService: MaterialRequestService,
    private projectService: ProjectService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const role = this.authService.currentUserValue?.role || '';
    this.isAdmin = role === 'Admin';
    this.canRequest = role === 'Admin' || role === 'Site Engineer' || role === 'Store Manager' || role === 'Project Manager';
    this.canApprove = role === 'Admin' || role === 'Project Manager';

    this.initForm();
    this.loadData();
  }

  initForm(): void {
    this.requestForm = this.fb.group({
      materialName: ['', Validators.required],
      quantity: [100, [Validators.required, Validators.min(1)]],
      projectId: ['', Validators.required],
      requiredDate: [new Date().toISOString().split('T')[0], Validators.required],
      priority: ['Medium', Validators.required],
      comments: ['']
    });
  }

  get f() { return this.requestForm.controls; }

  loadData(): void {
    this.requestService.getRequests().subscribe(list => {
      this.requests = list;
      this.filterRequests();
    });

    this.projectService.getProjects().subscribe(list => {
      this.projects = list;
    });
  }

  filterRequests(): void {
    this.filteredRequests = this.requests.filter(req => {
      const matchesSearch = req.materialName.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesPriority = this.priorityFilter ? req.priority === this.priorityFilter : true;
      const matchesStatus = this.statusFilter ? req.status === this.statusFilter : true;
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }

  selectRequest(req: MaterialRequest): void {
    this.selectedReq = req;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.requestForm.invalid) return;

    this.loading = true;
    const formVal = this.requestForm.value;

    const newRequest: Omit<MaterialRequest, 'id' | 'status'> = {
      projectId: Number(formVal.projectId),
      materialName: formVal.materialName,
      quantity: Number(formVal.quantity),
      requiredDate: formVal.requiredDate,
      priority: formVal.priority,
      comments: formVal.comments
    };

    this.requestService.createRequest(newRequest).subscribe({
      next: () => {
        this.loading = false;
        this.submitted = false;
        this.toastService.showSuccess('Material requisition requested successfully.');
        this.requestForm.reset({
          quantity: 100,
          requiredDate: new Date().toISOString().split('T')[0],
          priority: 'Medium'
        });
        this.activeTab = 0;
        this.loadData();
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Failed to submit material request.');
      }
    });
  }

  approveReq(id: number): void {
    const comments = prompt('Enter approval comments (Optional):');
    this.requestService.approveRequest(id, comments || '').subscribe({
      next: () => {
        this.toastService.showSuccess(`Requisition #REQ-00${id} approved.`);
        this.loadData();
      }
    });
  }

  rejectReq(id: number): void {
    const comments = prompt('Enter rejection feedback (Required):');
    if (comments === null) return;
    if (!comments.trim()) {
      alert('Comments are required to reject.');
      return;
    }

    this.requestService.rejectRequest(id, comments).subscribe({
      next: () => {
        this.toastService.showSuccess(`Requisition #REQ-00${id} rejected.`);
        this.loadData();
      }
    });
  }

  deleteReq(id: number): void {
    if (confirm(`Delete requisition request #REQ-00${id}?`)) {
      this.requestService.deleteRequest(id).subscribe(success => {
        if (success) {
          this.toastService.showSuccess('Requisition deleted.');
          this.loadData();
        }
      });
    }
  }
}
