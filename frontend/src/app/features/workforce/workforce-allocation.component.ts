import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { WorkforceService } from '../../core/services/workforce.service';
import { ToastService } from '../../core/services/toast.service';
import { Worker } from '../../core/interfaces/workforce.interface';

@Component({
  selector: 'app-workforce-allocation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="row g-4">
      <!-- Allocation form -->
      <div class="col-12 col-lg-5">
        <div class="border border-secondary border-opacity-10 rounded p-4 bg-white shadow-sm">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0 text-slate-800">Deploy Staff Member</h5>
            <mat-icon class="text-warning">person_add</mat-icon>
          </div>

          <form [formGroup]="deployForm" (ngSubmit)="onDeploy()">
            <!-- Worker Selection -->
            <div class="mb-3">
              <label class="bt-form-label">Staff Member</label>
              <select class="form-select bt-form-control" formControlName="workerName" (change)="onWorkerSelect($event)">
                <option value="" disabled selected>Select active staff...</option>
                <option *ngFor="let w of availableWorkers" [value]="w.name">{{ w.name }} ({{ w.category }})</option>
              </select>
              <div *ngIf="submitted && f['workerName'].errors" class="text-danger text-xs mt-1">
                <span>Staff selection is required</span>
              </div>
            </div>

            <!-- Project Selection -->
            <div class="mb-3">
              <label class="bt-form-label">Assign to Site Project</label>
              <select class="form-select bt-form-control" formControlName="project">
                <option value="" disabled selected>Select project site...</option>
                <option value="Metropolitan Commercial Plaza">Metropolitan Commercial Plaza</option>
                <option value="Riverside Residential Township">Riverside Residential Township</option>
                <option value="Industrial Cold Storage Unit">Industrial Cold Storage Unit</option>
                <option value="State Highway Bypass Route">State Highway Bypass Route</option>
              </select>
              <div *ngIf="submitted && f['project'].errors" class="text-danger text-xs mt-1">
                <span>Project selection is required</span>
              </div>
            </div>

            <!-- Role/Category -->
            <div class="mb-3">
              <label class="bt-form-label">Category / Role</label>
              <input type="text" class="form-control bt-form-control bg-light" formControlName="category" readonly>
            </div>

            <!-- Date -->
            <div class="mb-3">
              <label class="bt-form-label">Assignment Start Date</label>
              <input type="date" class="form-control bt-form-control" formControlName="startDate"
                     [class.is-invalid]="submitted && f['startDate'].errors">
              <div *ngIf="submitted && f['startDate'].errors" class="invalid-feedback text-xs">
                <span>Start date is required</span>
              </div>
            </div>

            <button type="submit" class="btn btn-bt-primary w-100 py-3 mt-2 d-flex align-items-center justify-content-center gap-2" [disabled]="isLoading">
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
              <mat-icon *ngIf="!isLoading">badge</mat-icon>
              <span>Assign Staff</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Active deployments grid -->
      <div class="col-12 col-lg-7">
        <div class="border border-secondary border-opacity-10 rounded p-4 bg-white shadow-sm h-100">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0 text-slate-800">Active Staff Assignments</h5>
            <span class="badge bg-light text-dark border border-secondary border-opacity-10 text-xs">Deploy Ledger</span>
          </div>

          <div class="table-responsive">
            <table class="table align-middle text-sm mb-0">
              <thead class="table-light text-muted uppercase text-xs">
                <tr>
                  <th>Staff Member</th>
                  <th>Project Assigned</th>
                  <th>Category</th>
                  <th>Start Date</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of allocations">
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <mat-icon class="text-slate-500">account_box</mat-icon>
                      <span class="fw-semibold text-slate-800">{{ item.workerName }}</span>
                    </div>
                  </td>
                  <td>{{ item.project }}</td>
                  <td>{{ item.category }}</td>
                  <td>{{ item.startDate }}</td>
                </tr>
                <tr *ngIf="allocations.length === 0">
                  <td colspan="4" class="text-center py-4 text-muted">No assignments recorded.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-xs { font-size: 0.8rem; }
  `]
})
export class WorkforceAllocationComponent implements OnInit {
  deployForm!: FormGroup;
  submitted = false;
  isLoading = false;

  availableWorkers: Worker[] = [];
  allocations: any[] = [
    { workerName: 'Liam Thompson', project: 'Metropolitan Commercial Plaza', category: 'Skilled Worker', startDate: '2026-06-12' },
    { workerName: 'Sophia Alvarez', project: 'Riverside Residential Township', category: 'Supervisor', startDate: '2026-05-18' },
    { workerName: 'Olivia Martinez', project: 'Industrial Cold Storage Unit', category: 'Engineer', startDate: '2026-06-22' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private workforceService: WorkforceService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.deployForm = this.formBuilder.group({
      workerName: ['', Validators.required],
      project: ['', Validators.required],
      category: [''],
      startDate: ['', Validators.required]
    });
    this.loadData();
  }

  loadData(): void {
    this.workforceService.getWorkers().subscribe(list => {
      this.availableWorkers = list.filter(w => w.status === 'Active');
    });
  }

  get f() { return this.deployForm.controls; }

  onWorkerSelect(event: any): void {
    const name = event.target.value;
    const w = this.availableWorkers.find(item => item.name === name);
    if (w) {
      this.deployForm.patchValue({ category: w.category });
    }
  }

  onDeploy(): void {
    this.submitted = true;

    if (this.deployForm.invalid) {
      return;
    }

    this.isLoading = true;
    const formVal = this.deployForm.value;

    setTimeout(() => {
      this.isLoading = false;
      this.toastService.showSuccess(`Assigned ${formVal.workerName} to ${formVal.project}.`);
      this.allocations.unshift({
        workerName: formVal.workerName,
        project: formVal.project,
        category: formVal.category,
        startDate: formVal.startDate
      });
      this.deployForm.reset({
        workerName: '',
        project: '',
        category: '',
        startDate: ''
      });
      this.submitted = false;
    }, 800);
  }
}
