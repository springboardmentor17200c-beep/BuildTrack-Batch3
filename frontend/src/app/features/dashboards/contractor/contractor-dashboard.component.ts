import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface EquipmentStatus {
  id: number;
  name: string;
  category: string;
  status: 'Available' | 'Assigned' | 'Maintenance';
  operator: string;
}

@Component({
  selector: 'app-contractor-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="container-fluid">
      <!-- Title Section -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h2 fw-bold mb-1 text-slate-800">Contractor Portal</h1>
          <p class="text-muted mb-0">Manage onsite machinery operations, material requisitions, and allocations</p>
        </div>
        <span class="badge bg-warning text-dark px-3 py-2 text-sm d-flex align-items-center gap-1">
          <mat-icon style="font-size: 16px; width: 16px; height: 16px;">gavel</mat-icon>
          <span>Vance Contracting Ltd</span>
        </span>
      </div>

      <div class="row g-4">
        <!-- Requisition Request Form -->
        <div class="col-12 col-lg-5">
          <div class="bt-card">
            <div class="bt-card-header">
              <h5 class="fw-bold mb-0">Request Resource / Material</h5>
              <mat-icon class="text-primary">shopping_bag</mat-icon>
            </div>
            
            <form [formGroup]="requestForm" (ngSubmit)="onSubmitRequest()" class="d-flex flex-column gap-3">
              <div class="mb-1">
                <label class="bt-form-label">Resource Type</label>
                <select class="form-select bt-form-control" formControlName="type" (change)="onTypeChange()">
                  <option value="Material">Material (Cement, Steel, Bricks)</option>
                  <option value="Machinery">Equipment / Machinery</option>
                </select>
              </div>

              <div class="mb-1">
                <label class="bt-form-label">Item Description</label>
                <select class="form-select bt-form-control" formControlName="itemName">
                  <option *ngFor="let item of availableItems" [value]="item">{{ item }}</option>
                </select>
              </div>

              <div class="mb-1">
                <label class="bt-form-label">Requested Quantity</label>
                <input type="number" class="form-control bt-form-control" formControlName="quantity" placeholder="e.g. 50">
                <div *ngIf="submitted && f['quantity'].errors" class="text-danger text-xs mt-1">
                  <span *ngIf="f['quantity'].errors['required']">Quantity is required</span>
                  <span *ngIf="f['quantity'].errors['min']">Quantity must be at least 1</span>
                </div>
              </div>

              <div class="mb-1">
                <label class="bt-form-label">Required Date</label>
                <input type="date" class="form-control bt-form-control" formControlName="requiredDate">
                <div *ngIf="submitted && f['requiredDate'].errors" class="text-danger text-xs mt-1">
                  <span>Required date is required</span>
                </div>
              </div>

              <button type="submit" class="btn btn-bt-primary w-100 py-3 mt-2 d-flex align-items-center justify-content-center gap-2">
                <mat-icon>assignment_turned_in</mat-icon>
                <span>Submit Requisition</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Machinery Status Grid -->
        <div class="col-12 col-lg-7">
          <div class="bt-card">
            <div class="bt-card-header">
              <h5 class="fw-bold mb-0">Assigned Equipment Status</h5>
              <mat-icon class="text-warning">precision_manufacturing</mat-icon>
            </div>

            <div class="table-responsive">
              <table class="table align-middle text-sm mb-0">
                <thead class="table-light text-muted uppercase text-xs">
                  <tr>
                    <th>Asset Name</th>
                    <th>Category</th>
                    <th>Operator</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let eq of equipment">
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <mat-icon class="text-slate-500">local_shipping</mat-icon>
                        <span class="fw-semibold text-slate-800">{{ eq.name }}</span>
                      </div>
                    </td>
                    <td>{{ eq.category }}</td>
                    <td>{{ eq.operator }}</td>
                    <td>
                      <span class="bt-badge" 
                            [class.bt-badge-success]="eq.status === 'Available'" 
                            [class.bt-badge-info]="eq.status === 'Assigned'" 
                            [class.bt-badge-warning]="eq.status === 'Maintenance'">
                        {{ eq.status }}
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
export class ContractorDashboardComponent implements OnInit {
  requestForm!: FormGroup;
  submitted = false;

  materials = ['Cement (Bags)', 'Steel Rebar (Tons)', 'Red Bricks (Units)', 'River Sand (Tons)', 'Concrete Mix (m³)'];
  machinery = ['Tower Crane #1', 'Excavator #3', 'Concrete Mixer truck #2', 'Diesel Generator #5'];
  availableItems: string[] = [];

  equipment: EquipmentStatus[] = [
    { id: 1, name: 'Caterpillar Excavator #3', category: 'Heavy Machinery', operator: 'Dave Miller', status: 'Assigned' },
    { id: 2, name: 'Liebherr Tower Crane #1', category: 'Lifting Assets', operator: 'Arthur Dent', status: 'Available' },
    { id: 3, name: 'Volvo Concrete Mixer truck #2', category: 'Vehicles', operator: 'Trillian Astra', status: 'Maintenance' },
    { id: 4, name: 'Cummins Diesel Generator #5', category: 'Power Systems', operator: 'Ford Prefect', status: 'Assigned' }
  ];

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.availableItems = [...this.materials];
    this.requestForm = this.formBuilder.group({
      type: ['Material', Validators.required],
      itemName: [this.materials[0], Validators.required],
      quantity: [10, [Validators.required, Validators.min(1)]],
      requiredDate: ['', Validators.required]
    });
  }

  get f() { return this.requestForm.controls; }

  onTypeChange(): void {
    const selectedType = this.requestForm.value.type;
    if (selectedType === 'Material') {
      this.availableItems = [...this.materials];
    } else {
      this.availableItems = [...this.machinery];
    }
    this.requestForm.patchValue({ itemName: this.availableItems[0] });
  }

  onSubmitRequest(): void {
    this.submitted = true;

    if (this.requestForm.invalid) {
      return;
    }

    // Success simulation
    console.log('Requisition Request Submitted:', this.requestForm.value);
    alert(`Resource request for ${this.requestForm.value.quantity}x ${this.requestForm.value.itemName} submitted successfully!`);
    
    this.requestForm.reset({
      type: 'Material',
      itemName: this.materials[0],
      quantity: 10,
      requiredDate: ''
    });
    this.submitted = false;
  }
}
