import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ProcurementService } from '../../core/services/procurement.service';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ProcurementItem } from '../../core/interfaces/procurement.interface';
import { Project } from '../../core/interfaces/project.interface';

@Component({
  selector: 'app-procurement',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatTabsModule,
    ToastComponent
  ],
  template: `
    <div class="container-fluid">
      <!-- Title -->
      <div class="mb-4">
        <h1 class="h2 fw-bold mb-1 text-slate-800">Procurement & Order Management</h1>
        <p class="text-muted mb-0">Manage material purchase orders, supplier logs, and sync deliveries directly with raw stock inventory.</p>
      </div>

      <!-- Stats Cards Row -->
      <div class="row g-4 mb-4">
        <div class="col-12 col-sm-6 col-md-3">
          <div class="bt-card border-start border-4 border-primary">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="text-muted text-xs text-uppercase tracking-wider fw-bold">Total Procurement Budget</span>
                <h3 class="display-6 fw-bold mt-1 mb-0">{{ totalBudget | currency:'USD':'symbol':'1.0-2' }}</h3>
              </div>
              <div class="icon-circle bg-light text-primary" style="width: 44px; height: 44px; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
                <mat-icon>monetization_on</mat-icon>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <div class="bt-card border-start border-4 border-warning">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="text-muted text-xs text-uppercase tracking-wider fw-bold">Pending Approval</span>
                <h3 class="display-6 fw-bold mt-1 mb-0">{{ pendingCount }} Requests</h3>
              </div>
              <div class="icon-circle bg-light text-warning" style="width: 44px; height: 44px; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
                <mat-icon>pending_actions</mat-icon>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <div class="bt-card border-start border-4 border-info">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="text-muted text-xs text-uppercase tracking-wider fw-bold">Active Orders</span>
                <h3 class="display-6 fw-bold mt-1 mb-0">{{ activeCount }} Transits</h3>
              </div>
              <div class="icon-circle bg-light text-info" style="width: 44px; height: 44px; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
                <mat-icon>local_shipping</mat-icon>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <div class="bt-card border-start border-4 border-success">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="text-muted text-xs text-uppercase tracking-wider fw-bold">Fulfilled Orders</span>
                <h3 class="display-6 fw-bold mt-1 mb-0">{{ deliveredCount }} Delivered</h3>
              </div>
              <div class="icon-circle bg-light text-success" style="width: 44px; height: 44px; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
                <mat-icon>done_all</mat-icon>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Panels -->
      <mat-tab-group class="bg-white rounded shadow-sm p-3">
        <!-- Tab 1: Orders Ledger -->
        <mat-tab label="Purchase Orders Ledger">
          <div class="p-3">
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
              <div class="d-flex gap-2">
                <input type="text" class="form-control form-control-sm bt-search-input" placeholder="Search materials..." 
                       [(ngModel)]="searchQuery" (input)="filterOrders()">
                <select class="form-select form-select-sm" [(ngModel)]="statusFilter" (change)="filterOrders()" style="width: 150px;">
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Ordered">Ordered</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <button class="btn btn-bt-primary btn-sm d-flex align-items-center gap-1" (click)="activeTab = 1">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">add</mat-icon>
                <span>New Request</span>
              </button>
            </div>

            <!-- Ledger Table -->
            <div class="table-responsive">
              <table class="table align-middle text-sm mb-0">
                <thead class="table-light text-muted uppercase text-xs">
                  <tr>
                    <th>PO ID</th>
                    <th>Material</th>
                    <th>Project</th>
                    <th>Quantity</th>
                    <th>Total Cost</th>
                    <th>Supplier</th>
                    <th>Purchase Date</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th class="text-end" *ngIf="canManage">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let order of filteredOrders" class="hover-row">
                    <td><strong>#PO-00{{ order.id }}</strong></td>
                    <td>
                      <div class="d-flex flex-column">
                        <span class="fw-semibold text-slate-800">{{ order.materialName }}</span>
                        <span class="text-xs text-muted">{{ order.category }}</span>
                      </div>
                    </td>
                    <td><span class="text-truncate" style="max-width: 150px; display: inline-block;">{{ order.projectName }}</span></td>
                    <td>{{ order.quantity }} Units</td>
                    <td>{{ order.totalCost | currency }}</td>
                    <td>
                      <div class="d-flex flex-column">
                        <span>{{ order.supplier }}</span>
                        <span class="text-xs text-muted" *ngIf="order.vendorContact">{{ order.vendorContact }}</span>
                      </div>
                    </td>
                    <td class="text-nowrap">{{ order.purchaseDate | date }}</td>
                    <td>
                      <span class="bt-badge" 
                            [class.bt-badge-warning]="order.status === 'Pending'"
                            [class.bt-badge-info]="order.status === 'Approved'"
                            [class.bt-badge-primary]="order.status === 'Ordered'"
                            [class.bt-badge-success]="order.status === 'Delivered'"
                            [class.bt-badge-danger]="order.status === 'Cancelled'">
                        {{ order.status }}
                      </span>
                    </td>
                    <td>
                      <span class="badge text-xxs px-2 py-1"
                            [class.bg-success-subtle]="order.paymentStatus === 'Paid'"
                            [class.text-success]="order.paymentStatus === 'Paid'"
                            [class.bg-warning-subtle]="order.paymentStatus === 'Pending'"
                            [class.text-warning]="order.paymentStatus === 'Pending'"
                            [class.bg-danger-subtle]="order.paymentStatus === 'Failed'"
                            [class.text-danger]="order.paymentStatus === 'Failed'">
                        {{ order.paymentStatus }}
                      </span>
                    </td>
                    <td class="text-end" *ngIf="canManage">
                      <div class="d-flex justify-content-end gap-1">
                        <button *ngIf="order.status === 'Pending'" class="btn btn-xs btn-outline-success px-2 py-1 text-xxs" 
                                (click)="updateStatus(order.id, 'Approved')">Approve</button>
                        <button *ngIf="order.status === 'Approved'" class="btn btn-xs btn-outline-info px-2 py-1 text-xxs" 
                                (click)="updateStatus(order.id, 'Ordered')">Order</button>
                        <button *ngIf="order.status === 'Ordered'" class="btn btn-xs btn-outline-primary px-2 py-1 text-xxs" 
                                (click)="updateStatus(order.id, 'Delivered')">Deliver</button>
                        <button *ngIf="order.status === 'Pending' || order.status === 'Approved'" class="btn btn-xs btn-outline-danger px-2 py-1 text-xxs" 
                                (click)="updateStatus(order.id, 'Cancelled')">Cancel</button>
                        <button class="btn btn-link text-danger p-1" (click)="deleteOrder(order.id)" *ngIf="isAdmin">
                          <mat-icon style="font-size: 18px; width: 18px; height: 18px;">delete</mat-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="filteredOrders.length === 0">
                    <td colspan="10" class="text-center py-4 text-muted">No procurement orders matching the criteria were found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </mat-tab>

        <!-- Tab 2: Create Request Form -->
        <mat-tab label="Create Requisition / Order">
          <div class="p-3" style="max-width: 700px;">
            <h5 class="fw-bold mb-3 text-slate-800">New Procurement Order Request</h5>
            <form [formGroup]="orderForm" (ngSubmit)="onSubmit()" class="d-flex flex-column gap-3">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="bt-form-label">Material Name</label>
                  <input type="text" class="form-control bt-form-control" formControlName="materialName" placeholder="e.g. Portland Cement Bags">
                  <div *ngIf="submitted && f['materialName'].errors" class="text-danger text-xs mt-1">
                    Material Name is required.
                  </div>
                </div>

                <div class="col-md-6">
                  <label class="bt-form-label">Category</label>
                  <select class="form-select bt-form-control" formControlName="category">
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="Structural Steel">Structural Steel</option>
                    <option value="Cement">Cement</option>
                    <option value="Electrical">Electrical Equipment</option>
                    <option value="Plumbing">Plumbing Equipment</option>
                    <option value="Aggregates">Aggregates / Sand</option>
                  </select>
                </div>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="bt-form-label">Associated Project</label>
                  <select class="form-select bt-form-control" formControlName="projectId">
                    <option value="" disabled selected>Select project...</option>
                    <option *ngFor="let proj of projects" [value]="proj.id">{{ proj.name }}</option>
                  </select>
                  <div *ngIf="submitted && f['projectId'].errors" class="text-danger text-xs mt-1">
                    Selecting a project is required.
                  </div>
                </div>

                <div class="col-md-6">
                  <label class="bt-form-label">Supplier / Vendor Name</label>
                  <input type="text" class="form-control bt-form-control" formControlName="supplier" placeholder="e.g. Apex Steel Corp">
                  <div *ngIf="submitted && f['supplier'].errors" class="text-danger text-xs mt-1">
                    Supplier name is required.
                  </div>
                </div>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="bt-form-label">Quantity (Units)</label>
                  <input type="number" class="form-control bt-form-control" formControlName="quantity" min="1">
                  <div *ngIf="submitted && f['quantity'].errors" class="text-danger text-xs mt-1">
                    Quantity must be positive.
                  </div>
                </div>

                <div class="col-md-6">
                  <label class="bt-form-label">Total Cost ($)</label>
                  <input type="number" class="form-control bt-form-control" formControlName="totalCost" min="1">
                  <div *ngIf="submitted && f['totalCost'].errors" class="text-danger text-xs mt-1">
                    Total cost must be positive.
                  </div>
                </div>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="bt-form-label">Purchase / Order Date</label>
                  <input type="date" class="form-control bt-form-control" formControlName="purchaseDate">
                  <div *ngIf="submitted && f['purchaseDate'].errors" class="text-danger text-xs mt-1">
                    Select a valid order date.
                  </div>
                </div>

                <div class="col-md-6">
                  <label class="bt-form-label">Payment Status</label>
                  <select class="form-select bt-form-control" formControlName="paymentStatus">
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="bt-form-label">Vendor Contact (Optional)</label>
                  <input type="text" class="form-control bt-form-control" formControlName="vendorContact" placeholder="e.g. +1 555-0199">
                </div>

                <div class="col-md-6">
                  <label class="bt-form-label">Invoice Number (Optional)</label>
                  <input type="text" class="form-control bt-form-control" formControlName="invoiceNumber" placeholder="e.g. INV-2026-99">
                </div>
              </div>

              <button type="submit" class="btn btn-bt-primary w-100 py-3 mt-3 d-flex align-items-center justify-content-center gap-2" [disabled]="loading">
                <span *ngIf="!loading">Submit Order Request</span>
                <span *ngIf="loading" class="spinner-border spinner-border-sm" role="status"></span>
                <mat-icon *ngIf="!loading">assignment_turned_in</mat-icon>
              </button>
            </form>
          </div>
        </mat-tab>

        <!-- Tab 3: Vendor Directory -->
        <mat-tab label="Vendor Directory">
          <div class="p-3">
            <h5 class="fw-bold mb-3 text-slate-800">Verified Material Suppliers</h5>
            <div class="row g-3">
              <div class="col-12 col-md-4" *ngFor="let vendor of vendors">
                <div class="bt-card h-100 border border-secondary border-opacity-10 shadow-none">
                  <div class="d-flex align-items-center gap-3 mb-3">
                    <div class="avatar-circle-sm bg-warning-subtle text-warning fw-bold d-flex justify-content-center align-items-center" style="width: 48px; height: 48px; border-radius: 8px;">
                      <mat-icon>store</mat-icon>
                    </div>
                    <div>
                      <h6 class="fw-bold mb-0 text-slate-800">{{ vendor.name }}</h6>
                      <span class="text-xs text-muted">{{ vendor.specialty }}</span>
                    </div>
                  </div>
                  <div class="d-flex flex-column gap-2 text-xs">
                    <div class="d-flex align-items-center gap-2 text-muted">
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">phone</mat-icon>
                      <span>{{ vendor.phone }}</span>
                    </div>
                    <div class="d-flex align-items-center gap-2 text-muted">
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">email</mat-icon>
                      <span>{{ vendor.email }}</span>
                    </div>
                    <div class="d-flex align-items-center gap-2 text-muted">
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">place</mat-icon>
                      <span>{{ vendor.address }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
    .hover-row:hover { background-color: rgba(0, 0, 0, 0.015); }
    .btn-xs { font-size: 0.75rem; padding: 0.25rem 0.5rem; }
  `]
})
export class ProcurementComponent implements OnInit {
  orders: ProcurementItem[] = [];
  filteredOrders: ProcurementItem[] = [];
  projects: Project[] = [];
  orderForm!: FormGroup;
  submitted = false;
  loading = false;
  activeTab = 0;

  // Filters
  searchQuery = '';
  statusFilter = '';

  // Stats
  totalBudget = 0;
  pendingCount = 0;
  activeCount = 0;
  deliveredCount = 0;

  // Roles
  isAdmin = false;
  canManage = false;

  vendors = [
    { name: 'Apex Steel & Structures', specialty: 'Structural Steel Rebars & Beams', phone: '+1 555-0100', email: 'sales@apexsteel.com', address: 'Industrial Zone East, Site A' },
    { name: 'Portland Building Materials', specialty: 'Portland Cement & Drywall Mixes', phone: '+1 555-0112', email: 'orders@portlandcement.com', address: '404 Supply Route Road' },
    { name: 'Metro Aggregate Supplies', specialty: 'Aggregates, Masonry Sand & Gravel', phone: '+1 555-0199', email: 'info@metroagg.com', address: 'Pebble Beach Highway' },
    { name: 'Titan Concrete Ready-Mix', specialty: 'Pre-mixed concrete & foundations', phone: '+1 555-0210', email: 'delivery@titanconcrete.com', address: 'Mixer Depot Industrial Park' },
    { name: 'ElectroWire Inc.', specialty: 'Conduits, cable trays & wiring', phone: '+1 555-0245', email: 'sales@electrowire.com', address: 'Silicon Way Plaza' }
  ];

  constructor(
    private fb: FormBuilder,
    private procurementService: ProcurementService,
    private projectService: ProjectService,
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
    this.orderForm = this.fb.group({
      materialName: ['', Validators.required],
      category: ['Raw Materials', Validators.required],
      projectId: ['', Validators.required],
      supplier: ['', Validators.required],
      quantity: [100, [Validators.required, Validators.min(1)]],
      totalCost: [5000, [Validators.required, Validators.min(1)]],
      purchaseDate: [new Date().toISOString().split('T')[0], Validators.required],
      paymentStatus: ['Pending', Validators.required],
      vendorContact: [''],
      invoiceNumber: ['']
    });
  }

  get f() { return this.orderForm.controls; }

  loadData(): void {
    this.procurementService.getProcurements().subscribe(orders => {
      this.orders = orders;
      this.filterOrders();
      this.calculateStats();
    });

    this.projectService.getProjects().subscribe(projects => {
      this.projects = projects;
    });
  }

  filterOrders(): void {
    this.filteredOrders = this.orders.filter(o => {
      const matchesSearch = o.materialName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            o.supplier.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = this.statusFilter ? o.status === this.statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }

  calculateStats(): void {
    this.totalBudget = this.orders.reduce((sum, o) => sum + o.totalCost, 0);
    this.pendingCount = this.orders.filter(o => o.status === 'Pending').length;
    this.activeCount = this.orders.filter(o => o.status === 'Approved' || o.status === 'Ordered').length;
    this.deliveredCount = this.orders.filter(o => o.status === 'Delivered').length;
  }

  updateStatus(id: number, status: ProcurementItem['status']): void {
    this.procurementService.updateProcurementStatus(id, status).subscribe({
      next: (updated) => {
        if (updated) {
          this.toastService.showSuccess(`PO #${id} status updated to ${status}.`);
          this.loadData();
        }
      },
      error: () => {
        this.toastService.showError(`Failed to update status for PO #${id}.`);
      }
    });
  }

  deleteOrder(id: number): void {
    if (confirm(`Are you sure you want to delete order request PO #${id}?`)) {
      this.procurementService.deleteProcurement(id).subscribe(success => {
        if (success) {
          this.toastService.showSuccess(`Order PO #${id} deleted successfully.`);
          this.loadData();
        } else {
          this.toastService.showError(`Failed to delete PO #${id}.`);
        }
      });
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.orderForm.invalid) {
      return;
    }

    this.loading = true;
    const formVal = this.orderForm.value;

    const newItem: Omit<ProcurementItem, 'id'> = {
      projectId: Number(formVal.projectId),
      materialName: formVal.materialName,
      category: formVal.category,
      supplier: formVal.supplier,
      vendorContact: formVal.vendorContact || '',
      invoiceNumber: formVal.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
      paymentStatus: formVal.paymentStatus as ProcurementItem['paymentStatus'],
      quantity: Number(formVal.quantity),
      totalCost: Number(formVal.totalCost),
      purchaseDate: formVal.purchaseDate,
      status: 'Pending'
    };

    this.procurementService.createProcurement(newItem).subscribe({
      next: () => {
        this.loading = false;
        this.submitted = false;
        this.toastService.showSuccess('Procurement request submitted successfully!');
        this.orderForm.reset({
          category: 'Raw Materials',
          quantity: 100,
          totalCost: 5000,
          purchaseDate: new Date().toISOString().split('T')[0],
          paymentStatus: 'Pending'
        });
        this.loadData();
      },
      error: (err) => {
        this.loading = false;
        this.toastService.showError(err.message || 'Failed to submit procurement request.');
      }
    });
  }
}
