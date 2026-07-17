import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { WorkforceService } from '../../core/services/workforce.service';
import { ToastService } from '../../core/services/toast.service';
import { Worker } from '../../core/interfaces/workforce.interface';
import { WorkerProfileModalComponent } from './worker-profile-modal.component';

@Component({
  selector: 'app-worker-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule, WorkerProfileModalComponent],
  template: `
    <div>
      <!-- Header search / action -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div class="d-flex gap-2 flex-grow-1" style="max-width: 500px;">
          <input type="text" class="form-control bt-form-control" placeholder="Search staff directory..." (input)="onSearch($event)">
          <select class="form-select bt-form-control" style="max-width: 180px;" (change)="onFilterCategory($event)">
            <option value="All">All Categories</option>
            <option value="Engineer">Engineer</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Contractor">Contractor</option>
            <option value="Skilled Worker">Skilled Worker</option>
            <option value="Unskilled Worker">Unskilled Worker</option>
          </select>
        </div>
        <button class="btn btn-bt-primary btn-sm" (click)="openAddModal()">
          <mat-icon style="font-size: 18px; width: 18px; height: 18px;">person_add</mat-icon>
          <span>Register Staff</span>
        </button>
      </div>

      <!-- Workers Directory Grid -->
      <div class="table-responsive bg-white rounded border border-light">
        <table class="table align-middle text-sm mb-0">
          <thead class="table-light text-muted uppercase text-xs">
            <tr>
              <th>Staff Member</th>
              <th>Category / Role</th>
              <th>Email Address</th>
              <th>Phone Number</th>
              <th>Shift Assignment</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let worker of filteredWorkers">
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div class="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center fw-bold text-xs" style="width: 32px; height: 32px;">
                    {{ worker.avatarInitials }}
                  </div>
                  <div>
                    <span class="fw-semibold text-slate-800 d-block">{{ worker.name }}</span>
                    <span class="text-xxs" 
                          [class.text-success]="worker.status === 'Active'" 
                          [class.text-muted]="worker.status === 'On Leave'">
                      ● {{ worker.status }}
                    </span>
                  </div>
                </div>
              </td>
              <td>{{ worker.category }}</td>
              <td>{{ worker.email }}</td>
              <td>{{ worker.phone }}</td>
              <td>
                <span class="badge bg-light text-dark border border-secondary border-opacity-10 text-xs">{{ worker.shift }}</span>
              </td>
              <td class="text-end">
                <button type="button" class="btn btn-sm btn-bt-outline py-1 px-3 text-xs" (click)="viewProfile(worker)">
                  View Profile
                </button>
              </td>
            </tr>
            <tr *ngIf="filteredWorkers.length === 0">
              <td colspan="6" class="text-center py-4 text-muted">No staff matching criteria.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add worker modal form overlay -->
      <div *ngIf="showAddModal" class="modal-overlay d-flex align-items-center justify-content-center">
        <div class="modal-card bg-white p-4 rounded shadow-lg fade-in" style="width: 480px; max-width: 95%;">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0 text-slate-800">Register Staff Member</h5>
            <button type="button" class="btn-close-custom" (click)="closeAddModal()">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <form [formGroup]="workerForm" (ngSubmit)="onSubmitWorker()">
            <!-- Name -->
            <div class="mb-3">
              <label class="bt-form-label">Full Name</label>
              <input type="text" class="form-control bt-form-control" formControlName="name" placeholder="e.g. John Doe"
                     [class.is-invalid]="submitted && f['name'].errors">
              <div *ngIf="submitted && f['name'].errors" class="invalid-feedback text-xs">
                <span>Name is required</span>
              </div>
            </div>

            <!-- Role/Category -->
            <div class="mb-3">
              <label class="bt-form-label">Staff Category</label>
              <select class="form-select bt-form-control" formControlName="category">
                <option value="Engineer">Engineer</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Contractor">Contractor</option>
                <option value="Skilled Worker">Skilled Worker</option>
                <option value="Unskilled Worker">Unskilled Worker</option>
              </select>
            </div>

            <!-- Email & Phone -->
            <div class="row mb-3 g-2">
              <div class="col-6">
                <label class="bt-form-label">Email Address</label>
                <input type="email" class="form-control bt-form-control" formControlName="email" placeholder="john@buildtrack.com"
                       [class.is-invalid]="submitted && f['email'].errors">
                <div *ngIf="submitted && f['email'].errors" class="invalid-feedback text-xs">
                  <span>Enter a valid email</span>
                </div>
              </div>
              <div class="col-6">
                <label class="bt-form-label">Phone Number</label>
                <input type="text" class="form-control bt-form-control" formControlName="phone" placeholder="555-0100"
                       [class.is-invalid]="submitted && f['phone'].errors">
                <div *ngIf="submitted && f['phone'].errors" class="invalid-feedback text-xs">
                  <span>Phone is required</span>
                </div>
              </div>
            </div>

            <!-- Shift -->
            <div class="mb-3">
              <label class="bt-form-label">Shift Assignment</label>
              <select class="form-select bt-form-control" formControlName="shift">
                <option value="Morning">Morning Shift</option>
                <option value="Night">Night Shift</option>
                <option value="Off">Scheduled Off</option>
              </select>
            </div>

            <!-- Actions -->
            <div class="d-flex justify-content-end gap-2 mt-4 border-top border-light pt-3">
              <button type="button" class="btn btn-bt-outline py-2" (click)="closeAddModal()" [disabled]="isSaving">Cancel</button>
              <button type="submit" class="btn btn-bt-primary py-2 d-flex align-items-center gap-1" [disabled]="isSaving || workerForm.invalid">
                <span *ngIf="isSaving" class="spinner-border spinner-border-sm" role="status"></span>
                <span>Register Staff</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Reusable profile details dialog -->
      <app-worker-profile-modal *ngIf="showProfileModal" 
                                [worker]="selectedWorker" 
                                (close)="closeProfileModal()">
      </app-worker-profile-modal>
    </div>
  `,
  styles: [`
    .text-xs { font-size: 0.8rem; }
    .text-xxs { font-size: 0.72rem; }
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
    }
    .btn-close-custom {
      background: transparent;
      border: none;
      color: var(--slate-400);
      cursor: pointer;
      display: flex;
      align-items: center;
    }
    .btn-close-custom:hover {
      color: var(--slate-800);
    }
  `]
})
export class WorkerListComponent implements OnInit {
  workers: Worker[] = [];
  filteredWorkers: Worker[] = [];

  // Filter criteria
  searchTerm = '';
  selectedCategory = 'All';

  // Modals state
  showAddModal = false;
  showProfileModal = false;
  selectedWorker: Worker | null = null;
  isSaving = false;
  workerForm!: FormGroup;
  submitted = false;

  constructor(
    private workforceService: WorkforceService,
    private toastService: ToastService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.workerForm = this.formBuilder.group({
      name: ['', Validators.required],
      category: ['Skilled Worker', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      shift: ['Morning', Validators.required]
    });
    this.loadWorkers();
  }

  loadWorkers(): void {
    this.workforceService.getWorkers().subscribe(list => {
      this.workers = list;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.filteredWorkers = this.workers.filter(w => {
      const matchSearch = w.name.toLowerCase().includes(this.searchTerm);
      const matchCategory = this.selectedCategory === 'All' || w.category === this.selectedCategory;
      return matchSearch && matchCategory;
    });
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value.toLowerCase();
    this.applyFilters();
  }

  onFilterCategory(event: any): void {
    this.selectedCategory = event.target.value;
    this.applyFilters();
  }

  openAddModal(): void {
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.workerForm.reset({
      category: 'Skilled Worker',
      shift: 'Morning'
    });
    this.submitted = false;
  }

  viewProfile(worker: Worker): void {
    this.selectedWorker = worker;
    this.showProfileModal = true;
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
    this.selectedWorker = null;
  }

  get f() { return this.workerForm.controls; }

  onSubmitWorker(): void {
    this.submitted = true;

    if (this.workerForm.invalid) {
      return;
    }

    this.isSaving = true;
    this.workforceService.registerWorker(this.workerForm.value).subscribe({
      next: () => {
        this.isSaving = false;
        this.toastService.showSuccess('Staff member registered in system registry.');
        this.loadWorkers();
        this.closeAddModal();
      },
      error: () => {
        this.isSaving = false;
        this.toastService.showError('Failed to register staff.');
      }
    });
  }
}
