import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { UserService, UserRecord } from '../../../core/services/user.service';
import { ProjectService } from '../../../core/services/project.service';
import { ReportService } from '../../../core/services/report.service';
import { ToastService } from '../../../core/services/toast.service';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { Project } from '../../../core/interfaces/project.interface';
import { Report } from '../../../core/interfaces/report.interface';


interface SystemLog {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  user: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatTabsModule,
    ToastComponent
  ],

  template: `
    <div class="container-fluid">
      <!-- Title Area -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 class="h2 fw-bold mb-1 text-slate-800">Admin Dashboard</h1>
          <p class="text-muted mb-0">System metrics, configuration, and security settings</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-bt-outline btn-sm" (click)="refreshMetrics()">
            <mat-icon style="font-size: 18px; width: 18px; height: 18px;">refresh</mat-icon>
            <span>Refresh</span>
          </button>
          <button class="btn btn-bt-primary btn-sm" (click)="openAddUserModal()">
            <mat-icon style="font-size: 18px; width: 18px; height: 18px;">person_add</mat-icon>
            <span>Add User</span>
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="row g-4 mb-4">
        <div class="col-12 col-md-6 col-lg-3" *ngFor="let stat of statCards">
          <div class="bt-card border-start border-4" [style.border-left-color]="stat.color">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="text-muted text-xs text-uppercase tracking-wider fw-bold">{{ stat.title }}</span>
                <h3 class="display-6 fw-bold mt-1 mb-0">{{ stat.value }}</h3>
              </div>
              <div class="icon-circle bg-light" [style.color]="stat.color">
                <mat-icon>{{ stat.icon }}</mat-icon>
              </div>
            </div>
            <div class="text-xs text-muted mt-3">
              <span [style.color]="stat.trendColor" class="fw-semibold">
                {{ stat.trend }}
              </span>
              {{ stat.trendText }}
            </div>
          </div>
        </div>
      </div>

      <!-- Main Tabs -->
      <mat-tab-group class="bg-white rounded shadow-sm p-3">
        <!-- 1. User Management Tab -->
        <mat-tab label="User Management">
          <div class="p-3">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold mb-0">Platform Access Directory</h5>
              <div class="input-group search-box" style="max-width: 300px;">
                <span class="input-group-text bg-white border-end-0 text-muted">
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;">search</mat-icon>
                </span>
                <input type="text" class="form-control border-start-0 ps-0" placeholder="Search users..." (input)="filterUsers($event)">
              </div>
            </div>
            
            <div class="table-responsive">
              <table class="table align-middle text-sm mb-0">
                <thead class="table-light text-muted uppercase text-xs">
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Last Active</th>
                    <th>Status</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let user of filteredUsers">
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <div class="avatar-circle-sm bg-warning text-dark fw-bold">
                          {{ getInitials(user.name) }}
                        </div>
                        <div class="d-flex flex-column">
                          <span class="fw-semibold text-slate-800">{{ user.name }}</span>
                          <span class="text-muted text-xs">{{ user.email }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge bg-light text-dark text-xs border border-secondary border-opacity-10">{{ user.role }}</span>
                    </td>
                    <td>{{ user.lastActive || 'Active Now' }}</td>
                    <td>
                      <span class="bt-badge" [class.bt-badge-success]="user.status === 'Active'" 
                            [class.bt-badge-danger]="user.status === 'Locked'" 
                            [class.bt-badge-warning]="user.status === 'Pending'">
                        {{ user.status }}
                      </span>
                    </td>
                    <td class="text-end">
                      <div class="d-inline-flex gap-1">
                        <button mat-button class="text-xs btn btn-xs btn-outline-secondary" (click)="toggleLock(user)">
                          {{ user.status === 'Locked' ? 'Unlock' : 'Lock' }}
                        </button>
                        <button mat-button class="text-xs btn btn-xs btn-outline-secondary" (click)="changeRole(user)">
                          Role
                        </button>
                        <button mat-button class="text-xs btn btn-xs btn-outline-danger" (click)="deleteUser(user)">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="filteredUsers.length === 0">
                    <td colspan="5" class="text-center py-4 text-muted">No users found in platform directory.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </mat-tab>

        <!-- 2. Project Monitoring Tab -->
        <mat-tab label="Project Monitoring">
          <div class="p-3">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 class="fw-bold mb-0">Live Active Construction Projects</h5>
                <span class="text-xs text-muted">Project health monitoring & budget outlays</span>
              </div>
              <a routerLink="/projects" class="btn btn-bt-outline btn-sm d-flex align-items-center gap-1">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">domain</mat-icon>
                <span>Full Projects Console</span>
              </a>
            </div>

            <div class="table-responsive">
              <table class="table align-middle text-sm mb-0">
                <thead class="table-light text-muted uppercase text-xs">
                  <tr>
                    <th>Project Name</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Allocated Budget</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let proj of projectsList">
                    <td><strong>{{ proj.name }}</strong></td>
                    <td>{{ proj.category }}</td>
                    <td>{{ proj.location }}</td>
                    <td>{{ proj.budget }}</td>
                    <td>
                      <span class="bt-badge bt-badge-success">Running</span>
                    </td>
                  </tr>
                  <tr *ngIf="projectsList.length === 0">
                    <td colspan="5" class="text-center py-4 text-muted">No projects found for monitoring.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </mat-tab>

        <!-- 3. System Analytics Tab -->
        <mat-tab label="System Analytics">
          <div class="p-3">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 class="fw-bold mb-0">System Operational Analytics</h5>
                <span class="text-xs text-muted">API performance, Database health, and latency statistics</span>
              </div>
              <a routerLink="/analytics" class="btn btn-bt-primary btn-sm d-flex align-items-center gap-1">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">insert_chart</mat-icon>
                <span>Deep System Analytics</span>
              </a>
            </div>

            <div class="row g-3">
              <div class="col-md-4">
                <div class="p-3 border rounded bg-light">
                  <span class="text-xs text-muted fw-bold">POSTGRESQL DATABASE</span>
                  <h4 class="fw-bold text-success mb-0 mt-1">Healthy (Connected)</h4>
                  <span class="text-xxs text-muted">Port 5432 / PostgreSQL 16</span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="p-3 border rounded bg-light">
                  <span class="text-xs text-muted fw-bold">FASTAPI BACKEND LATENCY</span>
                  <h4 class="fw-bold text-info mb-0 mt-1">12 ms Avg</h4>
                  <span class="text-xxs text-muted">Port 8000 / Uvicorn Server</span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="p-3 border rounded bg-light">
                  <span class="text-xs text-muted fw-bold">AUTHENTICATION ENGINE</span>
                  <h4 class="fw-bold text-primary mb-0 mt-1">JWT Active</h4>
                  <span class="text-xxs text-muted">Bearer Token Security</span>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- 4. Reports Management Tab -->
        <mat-tab label="Reports Management">
          <div class="p-3">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 class="fw-bold mb-0">Site Quality & Inspection Reports</h5>
                <span class="text-xs text-muted">Compiled digital PDF inspection sheets</span>
              </div>
              <a routerLink="/reports" class="btn btn-bt-outline btn-sm d-flex align-items-center gap-1">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">picture_as_pdf</mat-icon>
                <span>Reports Console</span>
              </a>
            </div>

            <div class="table-responsive">
              <table class="table align-middle text-sm mb-0">
                <thead class="table-light text-muted uppercase text-xs">
                  <tr>
                    <th>Report ID</th>
                    <th>Type</th>
                    <th>Project</th>
                    <th>Compiled Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let rep of reportsList">
                    <td><strong>#REP-00{{ rep.id }}</strong></td>
                    <td>{{ rep.reportType }}</td>
                    <td>{{ rep.projectName }}</td>
                    <td>{{ rep.createdAt }}</td>
                    <td><span class="badge bg-success-subtle text-success">Verified Signature</span></td>
                  </tr>
                  <tr *ngIf="reportsList.length === 0">
                    <td colspan="5" class="text-center py-4 text-muted">No reports compiled yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </mat-tab>

        <!-- 5. Activity Monitoring Tab -->
        <mat-tab label="Activity Monitoring">
          <div class="p-3">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold mb-0">Real-Time Activity & Audit Logs</h5>
              <span class="badge bg-dark text-white text-xs">Live Log Stream</span>
            </div>
            <div class="log-container bg-slate-900 text-white rounded p-3 font-monospace text-xs" style="max-height: 400px; overflow-y: auto;">
              <div *ngFor="let log of auditLogs" class="log-line py-1 border-bottom border-secondary border-opacity-10">
                <span class="text-muted">[{{ log.timestamp }}]</span>
                <span class="fw-bold mx-2" [ngClass]="getLogLevelClass(log.level)">{{ log.level }}</span>
                <span class="text-warning me-2">{{ log.user }}:</span>
                <span>{{ log.message }}</span>
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>


      <!-- Add User Modal -->
      <div *ngIf="showAddUserModal" class="modal-overlay d-flex align-items-center justify-content-center">
        <div class="modal-card bg-white p-4 rounded shadow-lg" style="width: 450px;">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0">Create Workspace User</h5>
            <button class="btn-close-custom" (click)="closeAddUserModal()">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <form [formGroup]="userForm" (ngSubmit)="saveUser()">
            <div class="mb-3">
              <label class="bt-form-label">Full Name</label>
              <input type="text" class="form-control bt-form-control" formControlName="name" placeholder="John Doe">
            </div>
            <div class="mb-3">
              <label class="bt-form-label">Email Address</label>
              <input type="email" class="form-control bt-form-control" formControlName="email" placeholder="john@company.com">
            </div>
            <div class="mb-3">
              <label class="bt-form-label">System Role</label>
              <select class="form-select bt-form-control" formControlName="role">
                <option value="Admin">Administrator</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Site Engineer">Site Engineer</option>
                <option value="Contractor">Contractor</option>
                <option value="Client">Client</option>
              </select>
            </div>
            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-bt-outline py-2" (click)="closeAddUserModal()">Cancel</button>
              <button type="submit" class="btn btn-bt-primary py-2" [disabled]="userForm.invalid || isSubmitting">
                <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                <span>Add User</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <app-toast></app-toast>
  `,
  styles: [`
    .icon-circle {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .avatar-circle-sm {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 0.85rem;
    }
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
      animation: fadeIn 0.3s ease;
    }
    .btn-close-custom {
      background: transparent;
      border: none;
      color: var(--slate-400);
      cursor: pointer;
    }
    .btn-close-custom:hover {
      color: var(--slate-800);
    }
    .bg-slate-900 {
      background-color: #0f172a !important;
    }
    .text-success { color: #10b981 !important; }
    .text-warning { color: #f59e0b !important; }
    .text-danger { color: #ef4444 !important; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  statCards = [
    { title: 'Project Monitoring', value: '0 Active', icon: 'domain', color: '#06b6d4', trend: 'Running', trendText: 'Oakridge & SVS sites', trendColor: '#10b981' },
    { title: 'System Analytics', value: '99.8%', icon: 'analytics', color: '#ff7a00', trend: 'Optimal', trendText: 'PostgreSQL & APIs healthy', trendColor: '#10b981' },
    { title: 'Reports Management', value: '0 Logged', icon: 'picture_as_pdf', color: '#10b981', trend: 'Verified', trendText: 'PDF Site Quality Audits', trendColor: '#10b981' },
    { title: 'Activity Monitoring', value: 'Live Stream', icon: 'history', color: '#6366f1', trend: 'Audited', trendText: 'Real-time security logs', trendColor: '#10b981' }
  ];

  users: UserRecord[] = [];
  filteredUsers: UserRecord[] = [];
  projectsList: Project[] = [];
  reportsList: Report[] = [];

  auditLogs: SystemLog[] = [
    { timestamp: '2026-08-12 14:28:12', level: 'INFO', message: 'Admin Dashboard initialized with 5 system consoles', user: 'Admin' },
    { timestamp: '2026-08-12 14:25:00', level: 'INFO', message: 'PostgreSQL database session active on port 5432', user: 'System' }
  ];

  showAddUserModal = false;
  isSubmitting = false;
  userForm!: FormGroup;

  constructor(
    private userService: UserService,
    private projectService: ProjectService,
    private reportService: ReportService,
    private toastService: ToastService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initUserForm();
    this.loadUsers();
    this.loadProjects();
    this.loadReports();
  }

  initUserForm(): void {
    this.userForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['Site Engineer', Validators.required]
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(list => {
      this.users = list;
      this.filteredUsers = [...this.users];
    });
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe(list => {
      this.projectsList = list;
      this.statCards[0].value = `${list.length} Active`;
    });
  }

  loadReports(): void {
    this.reportService.getReports().subscribe(list => {
      this.reportsList = list;
      this.statCards[2].value = `${list.length} Compiled`;
    });
  }


  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  refreshMetrics(): void {
    this.loadUsers();
    this.loadProjects();
    this.loadReports();
    this.toastService.showSuccess('Metrics & Admin Consoles refreshed.');
  }


  filterUsers(event: any): void {
    const term = event.target.value.toLowerCase();
    if (!term) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(u => 
        u.name.toLowerCase().includes(term) || 
        u.email.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term)
      );
    }
  }

  toggleLock(user: UserRecord): void {
    user.status = user.status === 'Locked' ? 'Active' : 'Locked';
    const logAction = user.status === 'Locked' ? 'Locked account access' : 'Restored account access';
    this.addAuditLog('WARN', `${logAction} for user: ${user.email}`, 'Admin');
    this.toastService.showSuccess(`${logAction} for ${user.name}`);
  }

  changeRole(user: UserRecord): void {
    const roles = ['Admin', 'Project Manager', 'Site Engineer', 'Contractor', 'Client'];
    const currentIdx = roles.indexOf(user.role);
    const nextIdx = (currentIdx + 1) % roles.length;
    const newRole = roles[nextIdx];

    this.userService.updateUserRole(user.id, newRole).subscribe({
      next: () => {
        user.role = newRole;
        this.addAuditLog('INFO', `Changed role for user ${user.email} to ${newRole}`, 'Admin');
        this.toastService.showSuccess(`Role updated to ${newRole} for ${user.name}`);
      },
      error: () => {
        this.toastService.showError('Failed to update user role.');
      }
    });
  }

  deleteUser(user: UserRecord): void {
    if (confirm(`Are you sure you want to delete user account for ${user.name}?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
          this.filteredUsers = this.filteredUsers.filter(u => u.id !== user.id);
          this.statCards[0].value = this.users.length.toString();
          this.addAuditLog('WARN', `Deleted user account: ${user.email}`, 'Admin');
          this.toastService.showSuccess('User account deleted successfully.');
        },
        error: () => {
          this.toastService.showError('Failed to delete user.');
        }
      });
    }
  }

  openAddUserModal(): void {
    this.showAddUserModal = true;
  }

  closeAddUserModal(): void {
    this.showAddUserModal = false;
    this.userForm.reset({ role: 'Site Engineer' });
  }

  saveUser(): void {
    if (this.userForm.invalid) return;

    this.isSubmitting = true;
    const formVal = this.userForm.value;

    this.userService.registerUser({
      name: formVal.name,
      email: formVal.email,
      role: formVal.role
    }).subscribe({
      next: (created) => {
        this.isSubmitting = false;
        this.closeAddUserModal();
        this.toastService.showSuccess(`User ${created.name} registered successfully!`);
        this.loadUsers();
      },
      error: () => {
        this.isSubmitting = false;
        this.toastService.showError('Failed to register user.');
      }
    });
  }

  getLogLevelClass(level: string): string {
    switch (level) {
      case 'INFO': return 'text-success';
      case 'WARN': return 'text-warning';
      case 'ERROR': return 'text-danger';
      default: return 'text-white';
    }
  }

  addAuditLog(level: 'INFO' | 'WARN' | 'ERROR', message: string, user: string): void {
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
    this.auditLogs.unshift({ timestamp, level, message, user });
  }
}
