import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface StockItem {
  name: string;
  category: string;
  qty: string;
  capacityLimit: number;
  currentLevel: number; // percentage
}

interface ProcurementRequest {
  id: number;
  item: string;
  qty: string;
  requestedBy: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  project: string;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="container-fluid">
      <!-- Title -->
      <div class="mb-4">
        <h1 class="h2 fw-bold mb-1 text-slate-800">Material & Inventory Management</h1>
        <p class="text-muted mb-0">Monitor raw material stock levels, check threshold alerts, and create procurement workflows</p>
      </div>

      <!-- Real-time stock status grids -->
      <div class="bt-card mb-4">
        <div class="bt-card-header">
          <h5 class="fw-bold mb-0">Active Stock Storage Levels</h5>
          <span class="badge bg-light text-dark border border-secondary border-opacity-10 text-xs">Real-Time Sensor Telemetry</span>
        </div>
        <div class="row g-4 mt-1">
          <div class="col-12 col-md-6 col-lg-4" *ngFor="let item of stocks">
            <div class="border border-secondary border-opacity-10 rounded p-3 bg-light">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h6 class="fw-bold mb-0 text-slate-800">{{ item.name }}</h6>
                  <span class="text-muted text-xxs">{{ item.category }}</span>
                </div>
                <span class="bt-badge text-xxs" 
                      [class.bt-badge-success]="item.currentLevel >= 50" 
                      [class.bt-badge-warning]="item.currentLevel >= 25 && item.currentLevel < 50" 
                      [class.bt-badge-danger]="item.currentLevel < 25">
                  {{ item.qty }}
                </span>
              </div>
              
              <!-- Progress indicator -->
              <div class="progress my-2" style="height: 8px;">
                <div class="progress-bar" role="progressbar" 
                     [class.bg-success]="item.currentLevel >= 50"
                     [class.bg-warning]="item.currentLevel >= 25 && item.currentLevel < 50"
                     [class.bg-danger]="item.currentLevel < 25"
                     [style.width]="item.currentLevel + '%'"></div>
              </div>
              <div class="d-flex justify-content-between text-xxs text-muted mt-1">
                <span>Capacity Level</span>
                <span class="fw-bold">{{ item.currentLevel }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <!-- Requisition / Procurement form -->
        <div class="col-12 col-lg-5">
          <div class="bt-card">
            <div class="bt-card-header">
              <h5 class="fw-bold mb-0">Initiate Procurement Order</h5>
              <mat-icon class="text-primary">local_shipping</mat-icon>
            </div>

            <form [formGroup]="orderForm" (ngSubmit)="onSubmitOrder()" class="d-flex flex-column gap-3">
              <div class="mb-1">
                <label class="bt-form-label">Material Item</label>
                <select class="form-select bt-form-control" formControlName="itemName">
                  <option value="Cement (Bags)">Portland Cement (Bags)</option>
                  <option value="Steel Rebar (Tons)">Structural Steel Rebar (Tons)</option>
                  <option value="Red Bricks (Units)">Red Clay Bricks (Units)</option>
                  <option value="River Sand (Tons)">Washed River Sand (Tons)</option>
                  <option value="Ready-Mix Concrete (m³)">Ready-Mix Concrete (m³)</option>
                </select>
              </div>

              <div class="row mb-1 g-2">
                <div class="col-6">
                  <label class="bt-form-label">Quantity</label>
                  <input type="number" class="form-control bt-form-control" formControlName="qty" placeholder="e.g. 50">
                  <div *ngIf="submitted && f['qty'].errors" class="text-danger text-xs mt-1">
                    <span>Must be >= 1</span>
                  </div>
                </div>
                <div class="col-6">
                  <label class="bt-form-label">Destination Site</label>
                  <select class="form-select bt-form-control" formControlName="project">
                    <option value="Metropolitan Commercial Plaza">Commercial Plaza</option>
                    <option value="Riverside Residential Township">Residential Township</option>
                    <option value="Industrial Cold Storage Unit">Cold Storage Unit</option>
                  </select>
                </div>
              </div>

              <div class="mb-1">
                <label class="bt-form-label">Preferred Vendor / Supplier</label>
                <input type="text" class="form-control bt-form-control" formControlName="vendor" placeholder="e.g. Holcim Group">
                <div *ngIf="submitted && f['vendor'].errors" class="text-danger text-xs mt-1">
                  <span>Vendor name is required</span>
                </div>
              </div>

              <button type="submit" class="btn btn-bt-primary w-100 py-3 mt-2 d-flex align-items-center justify-content-center gap-2">
                <mat-icon>shopping_cart</mat-icon>
                <span>Request Procurement</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Pending procurement requests grid -->
        <div class="col-12 col-lg-7">
          <div class="bt-card">
            <div class="bt-card-header">
              <h5 class="fw-bold mb-0">Procurement Workflow Pipeline</h5>
              <span class="badge bg-light text-dark border border-secondary border-opacity-10 text-xs">Approval Queue</span>
            </div>

            <div class="table-responsive">
              <table class="table align-middle text-sm mb-0">
                <thead class="table-light text-muted uppercase text-xs">
                  <tr>
                    <th>Material Requested</th>
                    <th>Qty</th>
                    <th>Project Site</th>
                    <th>Requested By</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let req of requests">
                    <td>
                      <div class="fw-semibold text-slate-800">{{ req.item }}</div>
                    </td>
                    <td>{{ req.qty }}</td>
                    <td>{{ req.project }}</td>
                    <td>{{ req.requestedBy }}</td>
                    <td>
                      <span class="bt-badge" 
                            [class.bt-badge-success]="req.status === 'Approved'" 
                            [class.bt-badge-warning]="req.status === 'Pending'" 
                            [class.bt-badge-danger]="req.status === 'Rejected'">
                        {{ req.status }}
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
    .text-xxs { font-size: 0.72rem; }
  `]
})
export class InventoryComponent implements OnInit {
  orderForm!: FormGroup;
  submitted = false;

  stocks: StockItem[] = [
    { name: 'Portland Cement (OPC)', category: 'Raw Materials', qty: '820 Bags', capacityLimit: 1000, currentLevel: 82 },
    { name: 'Structural Steel Rebar (12mm)', category: 'Structural Metal', qty: '12 Tons', capacityLimit: 50, currentLevel: 24 }, // Low Stock!
    { name: 'Red Facing Clay Bricks', category: 'Masonry Blocks', qty: '14,000 Pcs', capacityLimit: 20000, currentLevel: 70 },
    { name: 'Ready-Mix Concrete (M25 Grade)', category: 'Raw Materials', qty: '65 m³', capacityLimit: 120, currentLevel: 54 },
    { name: 'Washed River Sand', category: 'Aggregates', qty: '8 Tons', capacityLimit: 40, currentLevel: 20 } // Low Stock!
  ];

  requests: ProcurementRequest[] = [
    { id: 1, item: 'Steel Rebar (12mm)', qty: '15 Tons', requestedBy: 'Marcus Vance', status: 'Pending', project: 'Metropolitan Commercial Plaza' },
    { id: 2, item: 'Red Facing Clay Bricks', qty: '5,000 Pcs', requestedBy: 'Sarah Jenkins', status: 'Approved', project: 'Riverside Residential Township' },
    { id: 3, item: 'Portland Cement (OPC)', qty: '200 Bags', requestedBy: 'Alex Rivera', status: 'Approved', project: 'Industrial Cold Storage Unit' },
    { id: 4, item: 'Washed River Sand', qty: '10 Tons', requestedBy: 'Marcus Vance', status: 'Pending', project: 'Metropolitan Commercial Plaza' }
  ];

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.orderForm = this.formBuilder.group({
      itemName: ['Cement (Bags)', Validators.required],
      qty: [50, [Validators.required, Validators.min(1)]],
      project: ['Metropolitan Commercial Plaza', Validators.required],
      vendor: ['', Validators.required]
    });
  }

  get f() { return this.orderForm.controls; }

  onSubmitOrder(): void {
    this.submitted = true;

    if (this.orderForm.invalid) {
      return;
    }

    const val = this.orderForm.value;
    const newReq: ProcurementRequest = {
      id: this.requests.length + 1,
      item: val.itemName,
      qty: val.qty.toString() + (val.itemName.includes('Bags') ? ' Bags' : val.itemName.includes('Tons') ? ' Tons' : ' Units'),
      requestedBy: 'Sarah Jenkins',
      status: 'Pending',
      project: val.project
    };

    this.requests.unshift(newReq);
    
    // Simulate updating sensor telemetry if the items are approved
    alert(`Procurement request for ${newReq.qty} of ${val.itemName} registered under pending approval queue.`);
    
    this.orderForm.reset({
      itemName: 'Cement (Bags)',
      qty: 50,
      project: 'Metropolitan Commercial Plaza'
    });
    this.submitted = false;
  }
}
