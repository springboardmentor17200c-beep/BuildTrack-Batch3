import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PurchaseOrderService } from '../../core/services/purchase-order.service';
import { VendorService } from '../../core/services/vendor.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { PurchaseOrderRecord } from '../../core/interfaces/purchase-order.interface';
import { VendorRecord } from '../../core/interfaces/vendor-management.interface';
import { WorkflowStepperComponent } from '../../shared/components/workflow-stepper/workflow-stepper.component';

@Component({
  selector: 'app-deliveries',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    ToastComponent,
    WorkflowStepperComponent
  ],
  template: `
    <div class="container-fluid">
      <!-- Title -->
      <div class="mb-4">
        <h1 class="h2 fw-bold mb-1 text-slate-800">Warehouse Delivery & receiving Desk</h1>
        <p class="text-muted mb-0">Record material deliveries, perform quality/quantity audits, and automatically update warehouse raw stock levels.</p>
      </div>

      <!-- Main Columns -->
      <div class="row g-4">
        <!-- Delivery Actions (conditional) -->
        <div class="col-12 col-lg-4" *ngIf="selectedPo">
          <div class="bt-card">
            <h5 class="fw-bold mb-3 text-slate-800">Receiving Audit: {{ selectedPo.poNumber }}</h5>
            <app-workflow-stepper currentStage="Receiving"></app-workflow-stepper>
            <form [formGroup]="deliveryForm" (ngSubmit)="onSubmit()" class="d-flex flex-column gap-3 mt-3">
              <div>
                <label class="bt-form-label">Material Target Quantity</label>
                <div class="text-slate-800 fw-bold fs-5">{{ selectedPo.quantity }} Units</div>
              </div>

              <div>
                <label class="bt-form-label">Received Quantity (Check)</label>
                <input type="number" class="form-control bt-form-control" formControlName="receivedQuantity">
                <div *ngIf="submitted && f['receivedQuantity'].errors" class="text-danger text-xs mt-1">
                  Valid received quantity is required.
                </div>
              </div>

              <div>
                <label class="bt-form-label">Audit Checklist</label>
                <div class="form-check mb-1">
                  <input class="form-check-input" type="checkbox" id="checkQuality" formControlName="qualityPassed">
                  <label class="form-check-label text-xs" for="checkQuality">Quality Inspection Verified (No Damages)</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="checkBrand" formControlName="brandVerified">
                  <label class="form-check-label text-xs" for="checkBrand">Brand Specifications Verified</label>
                </div>
              </div>

              <div>
                <label class="bt-form-label">Reception Remarks / Notes</label>
                <textarea class="form-control bt-form-control" formControlName="remarks" rows="2" placeholder="e.g. Received in good condition, signed invoice copy."></textarea>
              </div>

              <div class="d-flex gap-2">
                <button type="button" class="btn btn-bt-outline w-50 py-2" (click)="selectedPo = null">Cancel</button>
                <button type="submit" class="btn btn-bt-primary w-50 py-2" [disabled]="loading">Log Receival</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Shipments Table list -->
        <div class="col-12" [class.col-lg-8]="selectedPo">
          <div class="bt-card">
            <h5 class="fw-bold mb-3 text-slate-800">Incoming Deliveries Ledger</h5>
            <div class="table-responsive">
              <table class="table align-middle text-sm mb-0">
                <thead class="table-light text-muted uppercase text-xs">
                  <tr>
                    <th>PO ID</th>
                    <th>PO Number</th>
                    <th>Material</th>
                    <th>Supplier</th>
                    <th>Target Qty</th>
                    <th>Status</th>
                    <th class="text-end" *ngIf="canReceive">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let po of incomingPOs" class="hover-row">
                    <td><strong>#{{ po.id }}</strong></td>
                    <td><strong>{{ po.poNumber }}</strong></td>
                    <td>{{ po.materialName }}</td>
                    <td>{{ getVendorName(po.vendorId) }}</td>
                    <td>{{ po.quantity }} units</td>
                    <td>
                      <span class="bt-badge" 
                            [class.bt-badge-warning]="po.status === 'Sent'"
                            [class.bt-badge-info]="po.status === 'Accepted'"
                            [class.bt-badge-success]="po.status === 'Delivered'">
                        {{ po.status }}
                      </span>
                    </td>
                    <td class="text-end" *ngIf="canReceive">
                      <button class="btn btn-xs btn-primary px-2 py-1 text-xxs d-flex align-items-center gap-1"
                              (click)="selectPo(po)" [disabled]="po.status === 'Delivered'">
                        <mat-icon style="font-size: 14px; width: 14px; height: 14px;">check_circle</mat-icon>
                        <span>Audit & Receive</span>
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="incomingPOs.length === 0">
                    <td colspan="7" class="text-center py-4 text-muted">No active shipments in transit ready to receive.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <app-toast></app-toast>
  `,
  styles: [`
    .text-xs { font-size: 0.8rem; }
    .text-xxs { font-size: 0.72rem; }
    .text-sm { font-size: 0.9rem; }
    .hover-row:hover { background-color: rgba(0, 0, 0, 0.015); }
    .btn-xs { font-size: 0.75rem; padding: 0.25rem 0.5rem; }
  `]
})
export class DeliveriesComponent implements OnInit {
  incomingPOs: PurchaseOrderRecord[] = [];
  vendors: VendorRecord[] = [];

  selectedPo: PurchaseOrderRecord | null = null;
  deliveryForm!: FormGroup;

  submitted = false;
  loading = false;

  // Roles
  canReceive = false;

  constructor(
    private fb: FormBuilder,
    private poService: PurchaseOrderService,
    private vendorService: VendorService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const role = this.authService.currentUserValue?.role || '';
    this.canReceive = role === 'Admin' || role === 'Store Manager' || role === 'Site Engineer';

    this.initForm();
    this.loadData();
  }

  initForm(): void {
    this.deliveryForm = this.fb.group({
      receivedQuantity: [0, [Validators.required, Validators.min(1)]],
      qualityPassed: [true],
      brandVerified: [true],
      remarks: ['']
    });
  }

  get f() { return this.deliveryForm.controls; }

  loadData(): void {
    this.poService.getPurchaseOrders().subscribe(list => {
      // In-transit POs are Sent, Accepted, or Delivered
      this.incomingPOs = list.filter(po => po.status === 'Sent' || po.status === 'Accepted' || po.status === 'Delivered');
    });

    this.vendorService.getVendors().subscribe(list => {
      this.vendors = list;
    });
  }

  selectPo(po: PurchaseOrderRecord): void {
    this.selectedPo = po;
    this.deliveryForm.patchValue({
      receivedQuantity: po.quantity,
      remarks: ''
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.deliveryForm.invalid || !this.selectedPo) return;

    this.loading = true;
    const formVal = this.deliveryForm.value;

    let targetStatus: 'Received' | 'Partially Received' | 'Rejected' = 'Received';
    if (formVal.receivedQuantity < this.selectedPo.quantity) {
      targetStatus = 'Partially Received';
    }
    if (!formVal.qualityPassed) {
      targetStatus = 'Rejected';
    }

    this.poService.receiveDelivery(this.selectedPo.id, Number(formVal.receivedQuantity), targetStatus).subscribe({
      next: () => {
        this.loading = false;
        this.submitted = false;
        this.toastService.showSuccess(`Delivery logged. PO #${this.selectedPo!.id} status updated to ${targetStatus} and raw stock levels incremented.`);
        this.selectedPo = null;
        this.loadData();
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Failed to record material delivery.');
      }
    });
  }

  getVendorName(id: number): string {
    const vendor = this.vendors.find(v => v.id === id);
    return vendor ? vendor.vendorName : `Vendor #${id}`;
  }
}
