import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';

interface SystemUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Locked' | 'Pending';
  lastActive: string;
}

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
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatTabsModule
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
        <!-- User Directory Tab -->
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
                    <td>{{ user.lastActive }}</td>
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
                </tbody>
              </table>
            </div>
          </div>
        </mat-tab>

        <!-- System Audit Logs Tab -->
        <mat-tab label="System Logs & Security">
          <div class="p-3">
            <h5 class="fw-bold mb-3">Recent Security & Operations Logs</h5>
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

      <!-- Add User Modal (Simulated Form Overlay) -->
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
              <button type="submit" class="btn btn-bt-primary py-2" [disabled]="userForm.invalid">Add User</button>
            </div>
          </form>
        </div>
      </div>
    </div>
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
    { title: 'Total Members', value: '42', icon: 'groups', color: '#ff7a00', trend: '+4', trendText: 'this month', trendColor: '#10b981' },
    { title: 'Active Sites', value: '8', icon: 'location_on', color: '#06b6d4', trend: 'Steady', trendText: 'since last week', trendColor: '#64748b' },
    { title: 'API Success Rate', value: '99.8%', icon: 'api', color: '#10b981', trend: '+0.1%', trendText: 'vs standard', trendColor: '#10b981' },
    { title: 'Security Audits', value: '0 Alerts', icon: 'security', color: '#ef4444', trend: 'Healthy', trendText: 'zero breaches', trendColor: '#10b981' }
  ];

  users: SystemUser[] = [
    { id: 1, name: 'Sarah Jenkins', email: 'pm@buildtrack.com', role: 'Project Manager', status: 'Active', lastActive: '5 mins ago' },
    { id: 2, name: 'Alex Rivera', email: 'engineer@buildtrack.com', role: 'Site Engineer', status: 'Active', lastActive: '12 mins ago' },
    { id: 3, name: 'Marcus Vance', email: 'contractor@buildtrack.com', role: 'Contractor', status: 'Active', lastActive: '1 hr ago' },
    { id: 4, name: 'BuildCorp Developments', email: 'client@buildtrack.com', role: 'Client', status: 'Active', lastActive: 'Yesterday' },
    { id: 5, name: 'Tom Huddleston', email: 'tom.h@buildtrack.com', role: 'Site Engineer', status: 'Pending', lastActive: 'Never' },
    { id: 6, name: 'Rupert Finch', email: 'rupert@contractor.com', role: 'Contractor', status: 'Locked', lastActive: '2 days ago' }
  ];

  filteredUsers: SystemUser[] = [];

  auditLogs: SystemLog[] = [
    { timestamp: '2026-07-06 20:45:12', level: 'INFO', message: 'User pm@buildtrack.com updated Milestone (Foundation Phase)', user: 'Sarah Jenkins' },
    { timestamp: '2026-07-06 20:30:05', level: 'INFO', message: 'New material allocation request created (Steel/Bricks)', user: 'Marcus Vance' },
    { timestamp: '2026-07-06 19:15:33', level: 'WARN', message: 'Failed login attempt from IP 192.168.1.115', user: 'SYSTEM' },
    { timestamp: '2026-07-06 18:22:11', level: 'ERROR', message: 'API Gateway timeout during connection to DB cache layer', user: 'SYSTEM' },
    { timestamp: '2026-07-06 17:10:04', level: 'INFO', message: 'Admin dashboard initialized successfully', user: 'John Doe (Admin)' }
  ];

  showAddUserModal = false;
  userForm!: FormGroup;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.filteredUsers = [...this.users];
    this.initUserForm();
  }

  initUserForm(): void {
    this.userForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['Site Engineer', Validators.required]
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  refreshMetrics(): void {
    console.log('Metrics refreshed');
    // Simulated change in stats on refresh
    this.statCards[2].value = '99.9%';
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

  toggleLock(user: SystemUser): void {
    user.status = user.status === 'Locked' ? 'Active' : 'Locked';
    const logAction = user.status === 'Locked' ? 'Locked account access' : 'Restored account access';
    this.addAuditLog('WARN', `${logAction} for user: ${user.email}`, 'John Doe (Admin)');
  }

  changeRole(user: SystemUser): void {
    const roles = ['Admin', 'Project Manager', 'Site Engineer', 'Contractor', 'Client'];
    const currentIdx = roles.indexOf(user.role);
    const nextIdx = (currentIdx + 1) % roles.length;
    const oldRole = user.role;
    user.role = roles[nextIdx];
    this.addAuditLog('INFO', `Changed role for user ${user.email} from ${oldRole} to ${user.role}`, 'John Doe (Admin)');
  }

  deleteUser(user: SystemUser): void {
    this.users = this.users.filter(u => u.id !== user.id);
    this.filteredUsers = this.filteredUsers.filter(u => u.id !== user.id);
    this.addAuditLog('WARN', `Deleted user account: ${user.email}`, 'John Doe (Admin)');
  }

  openAddUserModal(): void {
    this.showAddUserModal = true;
  }

  closeAddUserModal(): void {
    this.showAddUserModal = false;
    this.userForm.reset({ role: 'Site Engineer' });
  }

  saveUser(): void {
    if (this.userForm.valid) {
      const newUser: SystemUser = {
        id: this.users.length + 1,
        name: this.userForm.value.name,
        email: this.userForm.value.email,
        role: this.userForm.value.role,
        status: 'Pending',
        lastActive: 'Never'
      };
      this.users.unshift(newUser);
      this.filteredUsers = [...this.users];
      this.addAuditLog('INFO', `Registered new user: ${newUser.email} (${newUser.role})`, 'John Doe (Admin)');
      this.closeAddUserModal();
    }
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
