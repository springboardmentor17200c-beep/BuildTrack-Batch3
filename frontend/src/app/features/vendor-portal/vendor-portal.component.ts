import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { PurchaseOrderService } from '../../core/services/purchase-order.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { PurchaseOrderRecord } from '../../core/interfaces/purchase-order.interface';
import { InvoiceRecord } from '../../core/interfaces/invoice.interface';

@Component({
  selector: 'app-vendor-portal',
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
      <!-- Header -->
      <div class="mb-4">
        <h1 class="h2 fw-bold mb-1 text-slate-800">Supplier Vendor Portal</h1>
        <p class="text-muted mb-0">Accept orders, schedule material dispatches, upload invoices, and monitor invoice payment statuses.</p>
      </div>

      <!-- KPI Summary Cards -->
      <div class="row g-4 mb-4">
        <div class="col-12 col-sm-6 col-md-3">
          <div class="bt-card border-start border-4 border-warning">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="text-muted text-xs text-uppercase tracking-wider fw-bold">New Orders</span>
                <h3 class="display-6 fw-bold mt-1 mb-0">{{ newOrdersCount }} Pending</h3>
              </div>
              <div class="icon-circle bg-light text-warning" style="width: 44px; height: 44px; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
                <mat-icon>mail</mat-icon>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <div class="bt-card border-start border-4 border-primary">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="text-muted text-xs text-uppercase tracking-wider fw-bold">Active Transits</span>
                <h3 class="display-6 fw-bold mt-1 mb-0">{{ transitOrdersCount }} Dispatched</h3>
              </div>
              <div class="icon-circle bg-light text-primary" style="width: 44px; height: 44px; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
                <mat-icon>local_shipping</mat-icon>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <div class="bt-card border-start border-4 border-info">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="text-muted text-xs text-uppercase tracking-wider fw-bold">Billed Value</span>
                <h3 class="display-6 fw-bold mt-1 mb-0">{{ totalBilled | currency }}</h3>
              </div>
              <div class="icon-circle bg-light text-info" style="width: 44px; height: 44px; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
                <mat-icon>receipt</mat-icon>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <div class="bt-card border-start border-4 border-success">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="text-muted text-xs text-uppercase tracking-wider fw-bold">Received Payouts</span>
                <h3 class="display-6 fw-bold mt-1 mb-0">{{ totalPaid | currency }}</h3>
              </div>
              <div class="icon-circle bg-light text-success" style="width: 44px; height: 44px; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
                <mat-icon>payments</mat-icon>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Tabs -->
      <mat-tab-group class="bg-white rounded shadow-sm p-3">
        <!-- Tab 1: Assigned POs -->
        <mat-tab label="Purchase Orders Queue">
          <div class="p-3">
            <h5 class="fw-bold mb-3 text-slate-800">Incoming Project Purchase Orders</h5>
            <div class="table-responsive">
              <table class="table align-middle text-sm mb-0">
                <thead class="table-light text-muted uppercase text-xs">
                  <tr>
                    <th>PO ID</th>
                    <th>Material</th>
                    <th>Required Qty</th>
                    <th>Offered Value</th>
                    <th>Expected Delivery</th>
                    <th>Status</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let order of myOrders" class="hover-row">
                    <td><strong>#{{ order.poNumber }}</strong></td>
                    <td>{{ order.materialName }}</td>
                    <td>{{ order.quantity }} units</td>
                    <td>{{ order.totalAmount | currency }}</td>
                    <td>{{ order.expectedDeliveryDate || 'Flexible' }}</td>
                    <td>
                      <span class="bt-badge" 
                            [class.bt-badge-warning]="order.status === 'Created' || order.status === 'Sent'"
                            [class.bt-badge-info]="order.status === 'Accepted'"
                            [class.bt-badge-success]="order.status === 'Delivered'"
                            [class.bt-badge-danger]="order.status === 'Rejected'">
                        {{ order.status }}
                      </span>
                    </td>
                    <td class="text-end">
                      <div class="d-flex justify-content-end gap-1" *ngIf="order.status === 'Created' || order.status === 'Sent'">
                        <button class="btn btn-xs btn-outline-success px-2 py-1 text-xxs" 
                                (click)="updatePoStatus(order.id, 'Accepted')">Accept</button>
                        <button class="btn btn-xs btn-outline-danger px-2 py-1 text-xxs" 
                                (click)="updatePoStatus(order.id, 'Rejected')">Reject</button>
                      </div>
                      <div *ngIf="order.status === 'Accepted'">
                        <button class="btn btn-xs btn-primary px-2 py-1 text-xxs d-flex align-items-center gap-1"
                                (click)="openInvoiceUpload(order)">
                          <mat-icon style="font-size: 14px; width: 14px; height: 14px;">cloud_upload</mat-icon>
                          <span>Bill Invoice</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="myOrders.length === 0">
                    <td colspan="7" class="text-center py-4 text-muted">No purchase orders found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </mat-tab>

        <!-- Tab 2: Billing & Invoice status -->
        <mat-tab label="Billing & Invoices">
          <div class="p-3">
            <div class="row g-4">
              <!-- Upload Form (conditional) -->
              <div class="col-12 col-lg-4" *ngIf="selectedPo">
                <div class="bt-card">
                  <h5 class="fw-bold mb-3 text-slate-800">Generate Invoice for #{{ selectedPo.poNumber }}</h5>
                  <form [formGroup]="invoiceForm" (ngSubmit)="submitInvoice()" class="d-flex flex-column gap-3">
                    <div>
                      <label class="bt-form-label">Invoice Number</label>
                      <input type="text" class="form-control bt-form-control" formControlName="invoiceNo" placeholder="e.g. INV-2026-001">
                      <div *ngIf="submitted && f['invoiceNo'].errors" class="text-danger text-xs mt-1">Invoice number is required.</div>
                    </div>

                    <div>
                      <label class="bt-form-label">Bill Base Amount ($)</label>
                      <input type="number" class="form-control bt-form-control" formControlName="amount">
                      <div *ngIf="submitted && f['amount'].errors" class="text-danger text-xs mt-1">Amount must be positive.</div>
                    </div>

                    <div>
                      <label class="bt-form-label">GST / Tax Amount ($)</label>
                      <input type="number" class="form-control bt-form-control" formControlName="gst">
                    </div>

                    <div>
                      <label class="bt-form-label">Billing Date</label>
                      <input type="date" class="form-control bt-form-control" formControlName="invoiceDate">
                    </div>

                    <div class="d-flex gap-2 mt-2">
                      <button type="button" class="btn btn-bt-outline w-50 py-2" (click)="selectedPo = null">Cancel</button>
                      <button type="submit" class="btn btn-bt-primary w-50 py-2" [disabled]="loading">Submit</button>
                    </div>
                  </form>
                </div>
              </div>

              <!-- List of uploaded invoices -->
              <div class="col-12" [class.col-lg-8]="selectedPo">
                <div class="bt-card">
                  <h5 class="fw-bold mb-3 text-slate-800">Submitted Invoices Ledger</h5>
                  <div class="table-responsive">
                    <table class="table align-middle text-sm mb-0">
                      <thead class="table-light text-muted uppercase text-xs">
                        <tr>
                          <th>Invoice No</th>
                          <th>PO Reference</th>
                          <th>Amount</th>
                          <th>GST</th>
                          <th>Date</th>
                          <th>Payout Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let invoice of myInvoices" class="hover-row">
                          <td><strong>#{{ invoice.invoiceNo }}</strong></td>
                          <td>#PO-{{ invoice.purchaseOrderId }}</td>
                          <td>{{ invoice.amount | currency }}</td>
                          <td>{{ invoice.gst | currency }}</td>
                          <td>{{ invoice.invoiceDate }}</td>
                          <td>
                            <span class="badge"
                                  [class.bg-success-subtle]="invoice.paymentStatus === 'Paid'"
                                  [class.text-success]="invoice.paymentStatus === 'Paid'"
                                  [class.bg-warning-subtle]="invoice.paymentStatus === 'Pending'"
                                  [class.text-warning]="invoice.paymentStatus === 'Pending'"
                                  [class.bg-info-subtle]="invoice.paymentStatus === 'Approved'"
                                  [class.text-info]="invoice.paymentStatus === 'Approved'">
                              {{ invoice.paymentStatus }}
                            </span>
                          </td>
                        </tr>
                        <tr *ngIf="myInvoices.length === 0">
                          <td colspan="6" class="text-center py-4 text-muted">No invoices billed yet.</td>
                        </tr>
                      </tbody>
                    </table>
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
export class VendorPortalComponent implements OnInit {
  myOrders: PurchaseOrderRecord[] = [];
  myInvoices: InvoiceRecord[] = [];

  // Stats
  newOrdersCount = 0;
  transitOrdersCount = 0;
  totalBilled = 0;
  totalPaid = 0;

  // Invoice form triggers
  selectedPo: PurchaseOrderRecord | null = null;
  invoiceForm!: FormGroup;
  submitted = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private poService: PurchaseOrderService,
    private invoiceService: InvoiceService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  initForm(): void {
    this.invoiceForm = this.fb.group({
      invoiceNo: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      gst: [0, Validators.required],
      invoiceDate: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  get f() { return this.invoiceForm.controls; }

  loadData(): void {
    this.poService.getPurchaseOrders().subscribe(orders => {
      // In a real environment we would filter by vendor ID from currentUser.
      // Since this is evaluated locally, we show all POs assigned.
      this.myOrders = orders;
      this.calculateStats();
    });

    this.invoiceService.getInvoices().subscribe(invoices => {
      this.myInvoices = invoices;
      this.calculateStats();
    });
  }

  calculateStats(): void {
    this.newOrdersCount = this.myOrders.filter(o => o.status === 'Created' || o.status === 'Sent').length;
    this.transitOrdersCount = this.myOrders.filter(o => o.status === 'Accepted').length;
    
    this.totalBilled = this.myInvoices.reduce((sum, item) => sum + item.amount + item.gst, 0);
    this.totalPaid = this.myInvoices
      .filter(inv => inv.paymentStatus === 'Paid')
      .reduce((sum, item) => sum + item.amount + item.gst, 0);
  }

  updatePoStatus(id: number, status: PurchaseOrderRecord['status']): void {
    this.poService.updatePurchaseOrder(id, { status }).subscribe({
      next: () => {
        this.toastService.showSuccess(`Purchase Order status updated to ${status}.`);
        this.loadData();
      }
    });
  }

  openInvoiceUpload(po: PurchaseOrderRecord): void {
    this.selectedPo = po;
    this.invoiceForm.patchValue({
      amount: po.totalAmount,
      gst: po.totalAmount * 0.18, // Auto-suggest 18% GST standard
      invoiceNo: `INV-${po.poNumber.slice(-4)}-${Date.now().toString().slice(-4)}`
    });
  }

  submitInvoice(): void {
    this.submitted = true;
    if (this.invoiceForm.invalid || !this.selectedPo) return;

    this.loading = true;
    const formVal = this.invoiceForm.value;

    const payload: Omit<InvoiceRecord, 'id' | 'paymentStatus'> = {
      invoiceNo: formVal.invoiceNo,
      vendorId: this.selectedPo.vendorId,
      purchaseOrderId: this.selectedPo.id,
      amount: Number(formVal.amount),
      gst: Number(formVal.gst),
      invoiceDate: formVal.invoiceDate
    };

    this.invoiceService.createInvoice(payload).subscribe({
      next: () => {
        this.loading = false;
        this.submitted = false;
        this.toastService.showSuccess('Invoice uploaded successfully to Finance queue!');
        
        // Also update the PO status to Delivered once invoice is billed
        this.poService.updatePurchaseOrder(this.selectedPo!.id, { status: 'Delivered' }).subscribe();
        
        this.selectedPo = null;
        this.loadData();
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Failed to create invoice.');
      }
    });
  }
}
