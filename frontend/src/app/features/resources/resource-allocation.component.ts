import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ResourceService } from '../../core/services/resource.service';
import { ToastService } from '../../core/services/toast.service';
import { Equipment } from '../../core/interfaces/resource.interface';

@Component({
  selector: 'app-resource-allocation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="row g-4">
      <!-- Allocation form -->
      <div class="col-12 col-lg-5">
        <div class="border border-secondary border-opacity-10 rounded p-4 bg-white shadow-sm">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0 text-slate-800">Deploy Equipment / Asset</h5>
            <mat-icon class="text-warning">schedule_send</mat-icon>
          </div>

          <form [formGroup]="deployForm" (ngSubmit)="onDeploy()">
            <!-- Asset Selection -->
            <div class="mb-3">
              <label class="bt-form-label">Asset / Machinery</label>
              <select class="form-select bt-form-control" formControlName="assetName">
                <option value="" disabled selected>Select available asset...</option>
                <option *ngFor="let eq of availableAssets" [value]="eq.name">{{ eq.name }} ({{ eq.category }})</option>
              </select>
              <div *ngIf="submitted && f['assetName'].errors" class="text-danger text-xs mt-1">
                <span>Asset selection is required</span>
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

            <!-- Operator Name -->
            <div class="mb-3">
              <label class="bt-form-label">Assigned Operator</label>
              <input type="text" class="form-control bt-form-control" formControlName="operator" placeholder="e.g. Liam Thompson"
                     [class.is-invalid]="submitted && f['operator'].errors">
              <div *ngIf="submitted && f['operator'].errors" class="invalid-feedback text-xs">
                <span>Operator name is required</span>
              </div>
            </div>

            <!-- Date -->
            <div class="mb-3">
              <label class="bt-form-label">Deployment Start Date</label>
              <input type="date" class="form-control bt-form-control" formControlName="startDate"
                     [class.is-invalid]="submitted && f['startDate'].errors">
              <div *ngIf="submitted && f['startDate'].errors" class="invalid-feedback text-xs">
                <span>Start date is required</span>
              </div>
            </div>

            <button type="submit" class="btn btn-bt-primary w-100 py-3 mt-2 d-flex align-items-center justify-content-center gap-2" [disabled]="isLoading">
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
              <mat-icon *ngIf="!isLoading">local_shipping</mat-icon>
              <span>Deploy Asset</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Active allocations grid -->
      <div class="col-12 col-lg-7">
        <div class="border border-secondary border-opacity-10 rounded p-4 bg-white shadow-sm h-100">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0 text-slate-800">Active Machinery Allocations</h5>
            <span class="badge bg-light text-dark border border-secondary border-opacity-10 text-xs">Deployment Ledger</span>
          </div>

          <div class="table-responsive">
            <table class="table align-middle text-sm mb-0">
              <thead class="table-light text-muted uppercase text-xs">
                <tr>
                  <th>Asset Name</th>
                  <th>Assigned Project</th>
                  <th>Operator</th>
                  <th>Depl. Date</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let asset of allocations">
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <mat-icon class="text-slate-500">handyman</mat-icon>
                      <span class="fw-semibold text-slate-800">{{ asset.assetName }}</span>
                    </div>
                  </td>
                  <td>{{ asset.project }}</td>
                  <td>{{ asset.operator }}</td>
                  <td>{{ asset.startDate }}</td>
                </tr>
                <tr *ngIf="allocations.length === 0">
                  <td colspan="4" class="text-center py-4 text-muted">No active allocations recorded.</td>
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
export class ResourceAllocationComponent implements OnInit {
  @Output() allocationSaved = new EventEmitter<void>();

  deployForm!: FormGroup;
  submitted = false;
  isLoading = false;

  availableAssets: Equipment[] = [];
  allocations: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private resourceService: ResourceService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.deployForm = this.formBuilder.group({
      assetName: ['', Validators.required],
      project: ['', Validators.required],
      operator: ['', Validators.required],
      startDate: ['', Validators.required]
    });
    this.loadData();
  }

  loadData(): void {
    this.resourceService.getEquipment().subscribe(list => {
      // Show available or assigned assets for allocation
      this.availableAssets = list.filter(e => e.status === 'Available');
    });
    this.resourceService.getAllocations().subscribe(list => {
      this.allocations = list;
    });
  }

  get f() { return this.deployForm.controls; }

  onDeploy(): void {
    this.submitted = true;

    if (this.deployForm.invalid) {
      return;
    }

    this.isLoading = true;
    const formVal = this.deployForm.value;

    this.resourceService.allocateResource(formVal).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.showSuccess('Equipment allocated and deployed successfully.');
        this.deployForm.reset({
          assetName: '',
          project: '',
          operator: '',
          startDate: ''
        });
        this.submitted = false;
        this.loadData();
        this.allocationSaved.emit();
      },
      error: () => {
        this.isLoading = false;
        this.toastService.showError('Failed to deploy equipment asset.');
      }
    });
  }
}
