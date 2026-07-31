import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { InventoryService } from '../../core/services/inventory.service';
import { ProjectService } from '../../core/services/project.service';
import { ToastService } from '../../core/services/toast.service';
import { MaterialRequest, MaterialProcurement } from '../../core/interfaces/inventory.interface';

@Component({
  selector: 'app-material-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="row g-4">
      <!-- Request form -->
      <div class="col-12 col-lg-5">
        <div class="border border-secondary border-opacity-10 rounded p-4 bg-white shadow-sm">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0 text-slate-800">Procurement Requisition & Purchase Order</h5>
            <mat-icon class="text-warning">local_shipping</mat-icon>
          </div>

          <form [formGroup]="requestForm" (ngSubmit)="onRequest()">
            <!-- Procurement Category -->
            <div class="mb-3">
              <label class="bt-form-label">Procurement Category</label>
              <select class="form-select bt-form-control" formControlName="category">
                <option value="Raw Materials">Raw Materials (Cement, Steel, Sand, etc.)</option>
                <option value="Equipment">Equipment</option>
                <option value="Machinery">Machinery</option>
                <option value="Safety Equipment">Safety Equipment</option>
                <option value="Office Supplies">Office Supplies</option>
              </select>
            </div>

            <!-- Item Name -->
            <div class="mb-3">
              <label class="bt-form-label">Material / Item Name</label>
              <input type="text" class="form-control bt-form-control" formControlName="item" placeholder="e.g. Portland Cement / Safety Helmets"
                     [class.is-invalid]="submitted && f['item'].errors">
              <div *ngIf="submitted && f['item'].errors" class="invalid-feedback text-xs">
                <span>Material item is required</span>
              </div>
            </div>

            <!-- Qty & Site Project -->
            <div class="row mb-3 g-2">
              <div class="col-6">
                <label class="bt-form-label">Quantity Needed</label>
                <input type="text" class="form-control bt-form-control" formControlName="qty" placeholder="e.g. 500 Bags / 20 Units"
                       [class.is-invalid]="submitted && f['qty'].errors">
                <div *ngIf="submitted && f['qty'].errors" class="invalid-feedback text-xs">
                  <span>Quantity is required</span>
                </div>
              </div>
              
              <div class="col-6">
                <label class="bt-form-label">Target Project Site</label>
                <select class="form-select bt-form-control" formControlName="project">
                  <option *ngFor="let p of projects" [value]="p.name">{{ p.name }}</option>
                </select>
              </div>
            </div>

            <!-- Vendor / Supplier Management & Contact -->
            <div class="row mb-3 g-2">
              <div class="col-6">
                <label class="bt-form-label">Preferred Supplier</label>
                <input type="text" class="form-control bt-form-control" formControlName="vendor" placeholder="e.g. Apex ReadyMix Ltd">
              </div>
              <div class="col-6">
                <label class="bt-form-label">Vendor Contact Phone/Email</label>
                <input type="text" class="form-control bt-form-control" formControlName="vendorContact" placeholder="e.g. +1 555-0199">
              </div>
            </div>

            <!-- Invoice Tracking & Date -->
            <div class="row mb-3 g-2">
              <div class="col-6">
                <label class="bt-form-label">Invoice Number</label>
                <input type="text" class="form-control bt-form-control" formControlName="invoiceNumber" placeholder="e.g. INV-2026-001">
              </div>
              <div class="col-6">
                <label class="bt-form-label">Required Date</label>
                <input type="date" class="form-control bt-form-control" formControlName="requiredDate"
                       [class.is-invalid]="submitted && f['requiredDate'].errors">
                <div *ngIf="submitted && f['requiredDate'].errors" class="invalid-feedback text-xs">
                  <span>Required date is mandatory</span>
                </div>
              </div>
            </div>

            <!-- Requested By -->
            <div class="mb-3">
              <label class="bt-form-label">Requested By</label>
              <input type="text" class="form-control bt-form-control" formControlName="requestedBy" placeholder="e.g. Marcus Vance (Site Inspector)"
                     [class.is-invalid]="submitted && f['requestedBy'].errors">
              <div *ngIf="submitted && f['requestedBy'].errors" class="invalid-feedback text-xs">
                <span>Requester name is required</span>
              </div>
            </div>

            <button type="submit" class="btn btn-bt-primary w-100 py-3 mt-2 d-flex align-items-center justify-content-center gap-2" [disabled]="isLoading">
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
              <mat-icon *ngIf="!isLoading">shopping_cart</mat-icon>
              <span>Submit Requisition Order</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Requests queue grid -->
      <div class="col-12 col-lg-7">
        <div class="border border-secondary border-opacity-10 rounded p-4 bg-white shadow-sm h-100">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0 text-slate-800">Procurement & Invoice Tracking Ledger</h5>
            <span class="badge bg-light text-dark border border-secondary border-opacity-10 text-xs">PO Queue</span>
          </div>

          <div class="table-responsive">
            <table class="table align-middle text-sm mb-0">
              <thead class="table-light text-muted uppercase text-xs">
                <tr>
                  <th>Item & Category</th>
                  <th>Invoice #</th>
                  <th>Supplier & Contact</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let po of procurements">
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <mat-icon class="text-primary">assignment</mat-icon>
                      <div class="d-flex flex-column">
                        <span class="fw-semibold text-slate-800">{{ po.materialName }}</span>
                        <span class="badge bg-light text-dark text-xxs border border-secondary border-opacity-10 w-auto d-inline-block mt-0.5">
                          {{ po.category || 'Raw Materials' }}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="d-flex flex-column">
                      <span class="fw-semibold text-xs text-dark">{{ po.invoiceNumber || 'INV-00' + po.id }}</span>
                      <span class="text-xxs text-muted">Payment: {{ po.paymentStatus || 'Pending' }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="d-flex flex-column">
                      <span class="text-xs fw-semibold">{{ po.supplier }}</span>
                      <span class="text-xxs text-muted">{{ po.vendorContact || 'N/A' }}</span>
                    </div>
                  </td>
                  <td>{{ po.quantity }} Units</td>
                  <td>
                    <span class="bt-badge text-xxs" 
                          [class.bt-badge-success]="po.status === 'Approved'" 
                          [class.bt-badge-warning]="po.status === 'Pending'" 
                          [class.bt-badge-danger]="po.status === 'Rejected'">
                      {{ po.status }}
                    </span>
                  </td>
                  <td class="text-end">
                    <div class="d-flex justify-content-end gap-1" *ngIf="po.status === 'Pending'">
                      <button class="btn btn-xs btn-outline-success py-0 px-2 text-xxs" (click)="updateStatus(po.id, 'Approved')">
                        Approve
                      </button>
                      <button class="btn btn-xs btn-outline-danger py-0 px-2 text-xxs" (click)="updateStatus(po.id, 'Rejected')">
                        Reject
                      </button>
                    </div>
                    <span *ngIf="po.status !== 'Pending'" class="text-muted text-xxs">—</span>
                  </td>
                </tr>
                <tr *ngIf="procurements.length === 0">
                  <td colspan="6" class="text-center py-4 text-muted">No purchase orders recorded.</td>
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
    .text-xxs { font-size: 0.72rem; }
    .btn-xs { font-size: 0.75rem; }
  `]
})
export class MaterialRequestComponent implements OnInit {
  requestForm!: FormGroup;
  submitted = false;
  isLoading = false;
  procurements: MaterialProcurement[] = [];
  projects: { id: number; name: string }[] = [
    { id: 1, name: 'Oakridge housing' },
    { id: 2, name: 'SVS housing' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private inventoryService: InventoryService,
    private projectService: ProjectService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const todayStr = new Date().toISOString().split('T')[0];
    const defaultInv = `INV-${Date.now().toString().slice(-6)}`;

    this.requestForm = this.formBuilder.group({
      category: ['Raw Materials', Validators.required],
      item: ['', Validators.required],
      qty: ['', Validators.required],
      project: [this.projects[0]?.name || 'Oakridge housing', Validators.required],
      vendor: ['Apex ReadyMix Ltd', Validators.required],
      vendorContact: ['+1 555-0199'],
      invoiceNumber: [defaultInv, Validators.required],
      requestedBy: ['Marcus Vance', Validators.required],
      requiredDate: [todayStr, Validators.required]
    });
    this.loadData();
  }

  loadData(): void {
    this.inventoryService.getProcurements().subscribe(list => {
      this.procurements = list;
    });
    this.projectService.getProjects().subscribe({
      next: (projList) => {
        if (projList && projList.length > 0) {
          this.projects = projList.map(p => ({ id: p.id, name: p.name }));
        }
      },
      error: () => {}
    });
  }

  get f() { return this.requestForm.controls; }

  onRequest(): void {
    this.submitted = true;

    if (this.requestForm.invalid) {
      return;
    }

    this.isLoading = true;
    const formVal = this.requestForm.value;

    const selectedProj = this.projects.find(p => p.name === formVal.project);

    this.inventoryService.createRequest({
      item: formVal.item,
      category: formVal.category,
      qty: formVal.qty,
      project: formVal.project,
      projectId: selectedProj ? selectedProj.id : 1,
      requestedBy: formVal.requestedBy,
      requiredDate: formVal.requiredDate,
      vendor: formVal.vendor,
      vendorContact: formVal.vendorContact,
      invoiceNumber: formVal.invoiceNumber
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.showSuccess('Purchase requisition order dispatched successfully!');
        const defaultInv = `INV-${Date.now().toString().slice(-6)}`;
        this.requestForm.reset({
          category: 'Raw Materials',
          item: '',
          qty: '',
          project: this.projects[0]?.name || 'Oakridge housing',
          vendor: 'Apex ReadyMix Ltd',
          vendorContact: '+1 555-0199',
          invoiceNumber: defaultInv,
          requestedBy: 'Marcus Vance',
          requiredDate: new Date().toISOString().split('T')[0]
        });
        this.submitted = false;
        this.loadData();
      },
      error: () => {
        this.isLoading = false;
        this.toastService.showError('Failed to dispatch purchase requisition order.');
      }
    });
  }

  updateStatus(id: number, status: 'Approved' | 'Rejected'): void {
    this.inventoryService.updateRequestStatus(id, status).subscribe({
      next: (updated) => {
        this.toastService.showSuccess(`Purchase order requisition set to ${status}.`);
        this.loadData();
      },
      error: () => {
        this.toastService.showError('Failed to update purchase order status.');
      }
    });
  }
}
