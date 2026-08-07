import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { PurchaseOrderService } from '../../core/services/purchase-order.service';
import { VendorService } from '../../core/services/vendor.service';
import { ProjectService } from '../../core/services/project.service';
import { MaterialRequestService } from '../../core/services/material-request.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { PurchaseOrderRecord } from '../../core/interfaces/purchase-order.interface';
import { VendorRecord } from '../../core/interfaces/vendor-management.interface';
import { Project } from '../../core/interfaces/project.interface';
import { MaterialRequest } from '../../core/interfaces/material-request.interface';
import { WorkflowStepperComponent } from '../../shared/components/workflow-stepper/workflow-stepper.component';

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatTabsModule,
    ToastComponent,
    WorkflowStepperComponent
  ],
  template: `
    <div class="container-fluid">
      <!-- Title -->
      <div class="mb-4">
        <h1 class="h2 fw-bold mb-1 text-slate-800">Purchase Orders (PO) Vault</h1>
        <p class="text-muted mb-0">Generate formally signed purchase orders, deploy vendor selections, and track expected delivery logs.</p>
      </div>

      <!-- Tabs -->
      <mat-tab-group class="bg-white rounded shadow-sm p-3" [selectedIndex]="activeTab">
        <!-- Tab 1: List -->
        <mat-tab label="Purchase Orders Ledger">
          <div class="p-3">
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
              <div class="d-flex gap-2">
                <input type="text" class="form-control form-control-sm bt-search-input" placeholder="Search PO number or material..." 
                       [(ngModel)]="searchQuery" (input)="filterOrders()">
                <select class="form-select form-select-sm" [(ngModel)]="statusFilter" (change)="filterOrders()" style="width: 140px;">
                  <option value="">All Statuses</option>
                  <option value="Created">Created</option>
                  <option value="Sent">Sent</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <button class="btn btn-bt-primary btn-sm d-flex align-items-center gap-1" (click)="activeTab = 1" *ngIf="canManage">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">add_shopping_cart</mat-icon>
                <span>Generate PO</span>
              </button>
            </div>

            <!-- Table -->
            <div class="table-responsive">
              <table class="table align-middle text-sm mb-0">
                <thead class="table-light text-muted uppercase text-xs">
                  <tr>
                    <th>PO ID</th>
                    <th>PO Number</th>
                    <th>Material</th>
                    <th>Supplier</th>
                    <th>Qty</th>
                    <th>Total Offered</th>
                    <th>Delivery Date</th>
                    <th>Status</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let po of filteredOrders" class="hover-row" (click)="selectPo(po)">
                    <td><strong>#{{ po.id }}</strong></td>
                    <td><strong>{{ po.poNumber }}</strong></td>
                    <td>{{ po.materialName }}</td>
                    <td>{{ getVendorName(po.vendorId) }}</td>
                    <td>{{ po.quantity }} units</td>
                    <td>{{ po.totalAmount | currency }}</td>
                    <td>{{ po.expectedDeliveryDate || 'Flexible' }}</td>
                    <td>
                      <span class="bt-badge" 
                            [class.bt-badge-warning]="po.status === 'Created'"
                            [class.bt-badge-info]="po.status === 'Sent'"
                            [class.bt-badge-primary]="po.status === 'Accepted'"
                            [class.bt-badge-success]="po.status === 'Delivered'"
                            [class.bt-badge-danger]="po.status === 'Rejected'">
                        {{ po.status }}
                      </span>
                    </td>
                    <td class="text-end" (click)="$event.stopPropagation()">
                      <div class="d-flex justify-content-end gap-1">
                        <button *ngIf="po.status === 'Created' && canManage" class="btn btn-xs btn-outline-info px-2 py-1 text-xxs" 
                                (click)="sendPo(po.id)">Send to Vendor</button>
                        <button class="btn btn-link text-primary p-1" title="Print PO" (click)="simulatePrint(po.poNumber)">
                          <mat-icon style="font-size: 18px; width: 18px; height: 18px;">print</mat-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="filteredOrders.length === 0">
                    <td colspan="9" class="text-center py-4 text-muted">No purchase orders found.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Details Timeline Panel -->
            <div class="drawer-panel border-top mt-4 pt-3" *ngIf="selectedPo">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold mb-0 text-slate-800">PO Status Pipeline Tracker: {{ selectedPo.poNumber }}</h5>
                <button class="btn btn-link text-muted p-1" (click)="selectedPo = null">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
              <app-workflow-stepper [currentStage]="selectedPo.status"></app-workflow-stepper>
              <div class="row g-3 mt-3 text-xs">
                <div class="col-md-3"><strong>Expected Arrival:</strong> {{ selectedPo.expectedDeliveryDate || 'N/A' }}</div>
                <div class="col-md-3"><strong>Offered Cost Base:</strong> {{ selectedPo.unitPrice | currency }} / unit</div>
                <div class="col-md-3"><strong>Gross Outlay:</strong> {{ selectedPo.totalAmount | currency }}</div>
                <div class="col-md-3"><strong>Associated Project:</strong> Project #{{ selectedPo.projectId }}</div>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Tab 2: Generate PO -->
        <mat-tab label="Generate Purchase Order" *ngIf="canManage">
          <div class="p-3" style="max-width: 650px;">
            <h5 class="fw-bold mb-3 text-slate-800">Generate PO from Approved Requisitions</h5>
            <form [formGroup]="poForm" (ngSubmit)="onSubmit()" class="d-flex flex-column gap-3">
              <div>
                <label class="bt-form-label">Reference Approved Material Request</label>
                <select class="form-select bt-form-control" formControlName="requestId" (change)="onReqSelected()">
                  <option value="" disabled selected>Select approved requisition...</option>
                  <option *ngFor="let req of approvedReqs" [value]="req.id">
                    #REQ-00{{ req.id }} - {{ req.materialName }} (Qty: {{ req.quantity }})
                  </option>
                </select>
                <div *ngIf="submitted && f['requestId'].errors" class="text-danger text-xs mt-1">Requisition reference is required.</div>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="bt-form-label">Material Name</label>
                  <input type="text" class="form-control bt-form-control" formControlName="materialName" readonly>
                </div>

                <div class="col-md-6">
                  <label class="bt-form-label">Associated Project</label>
                  <input type="text" class="form-control bt-form-control" [value]="getProjectName(f['projectId'].value)" readonly>
                </div>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="bt-form-label">Quantity</label>
                  <input type="number" class="form-control bt-form-control" formControlName="quantity">
                  <div *ngIf="submitted && f['quantity'].errors" class="text-danger text-xs mt-1">Quantity must be positive.</div>
                </div>

                <div class="col-md-6">
                  <label class="bt-form-label">Supplier / Vendor Choice</label>
                  <select class="form-select bt-form-control" formControlName="vendorId">
                    <option value="" disabled selected>Select supplier...</option>
                    <option *ngFor="let vend of vendors" [value]="vend.id">{{ vend.vendorName }}</option>
                  </select>
                  <div *ngIf="submitted && f['vendorId'].errors" class="text-danger text-xs mt-1">Vendor choice is required.</div>
                </div>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="bt-form-label">Unit Price Offered ($)</label>
                  <input type="number" class="form-control bt-form-control" formControlName="unitPrice" (input)="updateTotalAmount()">
                  <div *ngIf="submitted && f['unitPrice'].errors" class="text-danger text-xs mt-1">Price must be positive.</div>
                </div>

                <div class="col-md-6">
                  <label class="bt-form-label">Calculated Gross Total ($)</label>
                  <input type="number" class="form-control bt-form-control" formControlName="totalAmount" readonly>
                </div>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="bt-form-label">Expected Delivery Date</label>
                  <input type="date" class="form-control bt-form-control" formControlName="expectedDeliveryDate">
                </div>
              </div>

              <button type="submit" class="btn btn-bt-primary w-100 py-3 mt-3 d-flex align-items-center justify-content-center gap-2" [disabled]="loading">
                <span *ngIf="!loading">Generate signed PO</span>
                <span *ngIf="loading" class="spinner-border spinner-border-sm" role="status"></span>
                <mat-icon *ngIf="!loading">post_add</mat-icon>
              </button>
            </form>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
    <app-toast></app-toast>
  `,
  styles: [`
    .text-xs { font-size: 0.8rem; }
    .text-xxs { font-size: 0.72rem; }
    .text-sm { font-size: 0.9rem; }
    .hover-row { cursor: pointer; }
    .hover-row:hover { background-color: rgba(0, 0, 0, 0.015); }
    .btn-xs { font-size: 0.75rem; padding: 0.25rem 0.5rem; }
    .drawer-panel {
      background-color: var(--slate-50, #f8fafc);
      padding: 1.25rem;
      border-radius: var(--border-radius-md, 8px);
    }
  `]
})
export class PurchaseOrdersComponent implements OnInit {
  orders: PurchaseOrderRecord[] = [];
  filteredOrders: PurchaseOrderRecord[] = [];
  vendors: VendorRecord[] = [];
  projects: Project[] = [];
  approvedReqs: MaterialRequest[] = [];

  selectedPo: PurchaseOrderRecord | null = null;
  poForm!: FormGroup;

  activeTab = 0;
  submitted = false;
  loading = false;

  // Filters
  searchQuery = '';
  statusFilter = '';

  // Roles
  canManage = false;
  isAdmin = false;

  constructor(
    private fb: FormBuilder,
    private poService: PurchaseOrderService,
    private vendorService: VendorService,
    private projectService: ProjectService,
    private requestService: MaterialRequestService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const role = this.authService.currentUserValue?.role || '';
    this.isAdmin = role === 'Admin';
    this.canManage = role === 'Admin' || role === 'Project Manager';

    this.initForm();
    this.loadData();
  }

  initForm(): void {
    this.poForm = this.fb.group({
      requestId: ['', Validators.required],
      projectId: [''],
      materialName: [''],
      vendorId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [10, [Validators.required, Validators.min(0.1)]],
      totalAmount: [10],
      expectedDeliveryDate: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  get f() { return this.poForm.controls; }

  loadData(): void {
    this.poService.getPurchaseOrders().subscribe(list => {
      this.orders = list;
      this.filterOrders();
    });

    this.vendorService.getVendors().subscribe(list => {
      this.vendors = list;
    });

    this.projectService.getProjects().subscribe(list => {
      this.projects = list;
    });

    this.requestService.getRequests().subscribe(list => {
      this.approvedReqs = list.filter(r => r.status === 'Approved');
    });
  }

  filterOrders(): void {
    this.filteredOrders = this.orders.filter(po => {
      const matchesSearch = po.poNumber.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            po.materialName.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = this.statusFilter ? po.status === this.statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }

  selectPo(po: PurchaseOrderRecord): void {
    this.selectedPo = po;
  }

  onReqSelected(): void {
    const reqId = this.poForm.value.requestId;
    const req = this.approvedReqs.find(r => r.id === Number(reqId));
    if (req) {
      this.poForm.patchValue({
        projectId: req.projectId,
        materialName: req.materialName,
        quantity: req.quantity
      });
      this.updateTotalAmount();
    }
  }

  updateTotalAmount(): void {
    const qty = Number(this.poForm.value.quantity) || 0;
    const price = Number(this.poForm.value.unitPrice) || 0;
    this.poForm.patchValue({
      totalAmount: qty * price
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.poForm.invalid) return;

    this.loading = true;
    const formVal = this.poForm.value;

    const newPO: Omit<PurchaseOrderRecord, 'id' | 'poNumber'> = {
      projectId: Number(formVal.projectId),
      vendorId: Number(formVal.vendorId),
      requestId: Number(formVal.requestId),
      materialName: formVal.materialName,
      quantity: Number(formVal.quantity),
      unitPrice: Number(formVal.unitPrice),
      totalAmount: Number(formVal.totalAmount),
      expectedDeliveryDate: formVal.expectedDeliveryDate,
      status: 'Created'
    };

    this.poService.createPurchaseOrder(newPO).subscribe({
      next: () => {
        this.loading = false;
        this.submitted = false;
        this.toastService.showSuccess('Purchase Order generated successfully.');
        this.poForm.reset();
        this.activeTab = 0;
        this.loadData();
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Failed to generate purchase order.');
      }
    });
  }

  sendPo(id: number): void {
    this.poService.updatePurchaseOrder(id, { status: 'Sent' }).subscribe({
      next: () => {
        this.toastService.showSuccess(`PO #${id} dispatched to vendor.`);
        this.loadData();
      }
    });
  }

  simulatePrint(poNumber: string): void {
    alert(`Compiling printable receipt copy for ${poNumber}... Outputting draft layout to desktop printer.`);
  }

  getVendorName(id: number): string {
    const vendor = this.vendors.find(v => v.id === id);
    return vendor ? vendor.vendorName : `Vendor #${id}`;
  }

  getProjectName(id: number): string {
    const project = this.projects.find(p => p.id === id);
    return project ? project.name : `Project #${id}`;
  }
}
