import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface AllocatedAsset {
  id: number;
  assetName: string;
  project: string;
  operator: string;
  startDate: string;
  status: 'In Use' | 'Standby' | 'Under Maintenance';
}

@Component({
  selector: 'app-resource-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="container-fluid">
      <!-- Title -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h2 fw-bold mb-1 text-slate-800">Resource & Equipment Management</h1>
          <p class="text-muted mb-0">Track heavy machinery deployment, maintenance routines, and site operator allocations</p>
        </div>
      </div>

      <!-- Overview Cards -->
      <div class="row g-4 mb-4">
        <div class="col-12 col-md-4" *ngFor="let card of cards">
          <div class="bt-card border-start border-4" [style.border-left-color]="card.color">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="text-muted text-xs text-uppercase tracking-wider fw-bold">{{ card.title }}</span>
                <h3 class="display-6 fw-bold mt-1 mb-0">{{ card.value }}</h3>
              </div>
              <div class="icon-circle bg-light" [style.color]="card.color" style="width: 44px; height: 44px; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
                <mat-icon>{{ card.icon }}</mat-icon>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="row g-4">
        <!-- Machinery Allocation Form -->
        <div class="col-12 col-lg-5">
          <div class="bt-card">
            <div class="bt-card-header">
              <h5 class="fw-bold mb-0">Deploy Equipment / Asset</h5>
              <mat-icon class="text-primary">schedule_send</mat-icon>
            </div>

            <form [formGroup]="deployForm" (ngSubmit)="onDeploy()" class="d-flex flex-column gap-3">
              <div class="mb-1">
                <label class="bt-form-label">Asset / Machinery</label>
                <select class="form-select bt-form-control" formControlName="assetName">
                  <option value="Tower Crane #1">Tower Crane #1 (Liebherr)</option>
                  <option value="Caterpillar Excavator #3">Caterpillar Excavator #3</option>
                  <option value="Concrete Mixer #2">Concrete Mixer #2 (Volvo)</option>
                  <option value="Diesel Generator #5">Diesel Generator #5 (Cummins)</option>
                  <option value="Forklift Loader #4">Forklift Loader #4 (Toyota)</option>
                </select>
              </div>

              <div class="mb-1">
                <label class="bt-form-label">Assign to Site Project</label>
                <select class="form-select bt-form-control" formControlName="project">
                  <option value="Metropolitan Commercial Plaza">Metropolitan Commercial Plaza</option>
                  <option value="Riverside Residential Township">Riverside Residential Township</option>
                  <option value="Industrial Cold Storage Unit">Industrial Cold Storage Unit</option>
                  <option value="State Highway Bypass Route">State Highway Bypass Route</option>
                </select>
              </div>

              <div class="mb-1">
                <label class="bt-form-label">Assigned Operator</label>
                <input type="text" class="form-control bt-form-control" formControlName="operator" placeholder="e.g. John Doe">
                <div *ngIf="submitted && f['operator'].errors" class="text-danger text-xs mt-1">
                  <span>Operator name is required</span>
                </div>
              </div>

              <div class="mb-1">
                <label class="bt-form-label">Deployment Start Date</label>
                <input type="date" class="form-control bt-form-control" formControlName="startDate">
                <div *ngIf="submitted && f['startDate'].errors" class="text-danger text-xs mt-1">
                  <span>Start date is required</span>
                </div>
              </div>

              <button type="submit" class="btn btn-bt-primary w-100 py-3 mt-2 d-flex align-items-center justify-content-center gap-2">
                <mat-icon>local_shipping</mat-icon>
                <span>Deploy Asset</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Allocation Ledger Table -->
        <div class="col-12 col-lg-7">
          <div class="bt-card">
            <div class="bt-card-header">
              <h5 class="fw-bold mb-0">Active Machinery Allocations</h5>
              <span class="badge bg-light text-dark border border-secondary border-opacity-10 text-xs">Platform Live Status</span>
            </div>

            <div class="table-responsive">
              <table class="table align-middle text-sm mb-0">
                <thead class="table-light text-muted uppercase text-xs">
                  <tr>
                    <th>Asset Name</th>
                    <th>Assigned Project</th>
                    <th>Operator</th>
                    <th>Depl. Date</th>
                    <th>Status</th>
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
                    <td>
                      <span class="bt-badge" 
                            [class.bt-badge-success]="asset.status === 'In Use'" 
                            [class.bt-badge-warning]="asset.status === 'Standby'" 
                            [class.bt-badge-danger]="asset.status === 'Under Maintenance'">
                        {{ asset.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-xs { font-size: 0.8rem; }
  `]
})
export class ResourceManagementComponent implements OnInit {
  deployForm!: FormGroup;
  submitted = false;

  cards = [
    { title: 'Total Assets', value: '18 Heavy', icon: 'precision_manufacturing', color: '#ff7a00' },
    { title: 'Active Deployments', value: '12 In Use', icon: 'engineering', color: '#10b981' },
    { title: 'Maintenance Queue', value: '2 Units', icon: 'build', color: '#ef4444' }
  ];

  allocations: AllocatedAsset[] = [
    { id: 1, assetName: 'Caterpillar Excavator #3', project: 'Riverside Residential Township', operator: 'Dave Miller', startDate: '2026-06-01', status: 'In Use' },
    { id: 2, assetName: 'Liebherr Tower Crane #1', project: 'Metropolitan Commercial Plaza', operator: 'Arthur Dent', startDate: '2026-05-10', status: 'In Use' },
    { id: 3, assetName: 'Volvo Concrete Mixer truck #2', project: 'Metropolitan Commercial Plaza', operator: 'Trillian Astra', startDate: '2026-06-15', status: 'Under Maintenance' },
    { id: 4, assetName: 'Cummins Diesel Generator #5', project: 'Industrial Cold Storage Unit', operator: 'Ford Prefect', startDate: '2026-06-20', status: 'Standby' }
  ];

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.deployForm = this.formBuilder.group({
      assetName: ['Tower Crane #1', Validators.required],
      project: ['Metropolitan Commercial Plaza', Validators.required],
      operator: ['', Validators.required],
      startDate: ['', Validators.required]
    });
  }

  get f() { return this.deployForm.controls; }

  onDeploy(): void {
    this.submitted = true;

    if (this.deployForm.invalid) {
      return;
    }

    const formVal = this.deployForm.value;
    const newAlloc: AllocatedAsset = {
      id: this.allocations.length + 1,
      assetName: formVal.assetName,
      project: formVal.project,
      operator: formVal.operator,
      startDate: formVal.startDate,
      status: 'In Use'
    };

    this.allocations.unshift(newAlloc);
    this.deployForm.reset({
      assetName: 'Tower Crane #1',
      project: 'Metropolitan Commercial Plaza'
    });
    this.submitted = false;
  }
}
