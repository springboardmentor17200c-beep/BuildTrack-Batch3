import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { InvoiceService } from '../../core/services/invoice.service';
import { VendorService } from '../../core/services/vendor.service';
import { PurchaseOrderService } from '../../core/services/purchase-order.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { InvoiceRecord } from '../../core/interfaces/invoice.interface';
import { VendorRecord } from '../../core/interfaces/vendor-management.interface';
import { PurchaseOrderRecord } from '../../core/interfaces/purchase-order.interface';

@Component({
  selector: 'app-invoices',
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
        <h1 class="h2 fw-bold mb-1 text-slate-800">Invoices & Billing Ledger</h1>
        <p class="text-muted mb-0">Review supplier uploaded invoices, verify billing totals against purchase orders, and audit GST values.</p>
      </div>

      <!-- Main Columns -->
      <div class="row g-4">
        <!-- Invoice Upload Form (for PM/Contractor) -->
        <div class="col-12 col-lg-4" *ngIf="canUpload">
          <div class="bt-card">
            <h5 class="fw-bold mb-3 text-slate-800">Upload Project Invoice</h5>
            <form [formGroup]="invoiceForm" (ngSubmit)="onSubmit()" class="d-flex flex-column gap-3">
              <div>
                <label class="bt-form-label">Reference Purchase Order</label>
                <select class="form-select bt-form-control" formControlName="purchaseOrderId" (change)="onPoSelected()">
                  <option value="">Select purchase order...</option>
                  <option *ngFor="let po of orders" [value]="po.id">
                    #{{ po.poNumber }} - {{ po.materialName }} (Qty: {{ po.quantity }})
                  </option>
                </select>

                <div *ngIf="submitted && f['purchaseOrderId'].errors" class="text-danger text-xs mt-1">Purchase Order reference is required.</div>
              </div>

              <div>
                <label class="bt-form-label">Invoice Number</label>
                <input type="text" class="form-control bt-form-control" formControlName="invoiceNo" placeholder="e.g. INV-2026-99">
                <div *ngIf="submitted && f['invoiceNo'].errors" class="text-danger text-xs mt-1">Invoice number is required.</div>
              </div>

              <div class="row g-2">
                <div class="col-6">
                  <label class="bt-form-label">Base Amount ($)</label>
                  <input type="number" class="form-control bt-form-control" formControlName="amount">
                  <div *ngIf="submitted && f['amount'].errors" class="text-danger text-xs mt-1">Amount is required.</div>
                </div>
                <div class="col-6">
                  <label class="bt-form-label">GST / Tax ($)</label>
                  <input type="number" class="form-control bt-form-control" formControlName="gst">
                </div>
              </div>

              <div>
                <label class="bt-form-label">Invoice Date</label>
                <input type="date" class="form-control bt-form-control" formControlName="invoiceDate">
                <div *ngIf="submitted && f['invoiceDate'].errors" class="text-danger text-xs mt-1">Select invoice date.</div>
              </div>

              <button type="submit" class="btn btn-bt-primary w-100 py-3 mt-2 d-flex align-items-center justify-content-center gap-2" [disabled]="loading">
                <span *ngIf="!loading">Submit Invoice</span>
                <span *ngIf="loading" class="spinner-border spinner-border-sm" role="status"></span>
                <mat-icon *ngIf="!loading">cloud_upload</mat-icon>
              </button>
            </form>
          </div>
        </div>

        <!-- Invoices List table -->
        <div class="col-12" [class.col-lg-8]="canUpload">
          <div class="bt-card">
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
              <h5 class="fw-bold mb-0 text-slate-800">Submitted Invoices Queue</h5>
              <div class="d-flex gap-2">
                <input type="text" class="form-control form-control-sm bt-search-input" placeholder="Search invoice numbers..." 
                       [(ngModel)]="searchQuery" (input)="filterInvoices()">
              </div>
            </div>

            <!-- Table -->
            <div class="table-responsive">
              <table class="table align-middle text-sm mb-0">
                <thead class="table-light text-muted uppercase text-xs">
                  <tr>
                    <th>Invoice No</th>
                    <th>Supplier</th>
                    <th>PO Ref</th>
                    <th>Base Value</th>
                    <th>GST Value</th>
                    <th>Gross Total</th>
                    <th>Date</th>
                    <th>Payout Status</th>
                    <th class="text-end" *ngIf="canVerify">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let inv of filteredInvoices" class="hover-row">
                    <td><strong>#{{ inv.invoiceNo }}</strong></td>
                    <td>{{ getVendorName(inv.vendorId) }}</td>
                    <td>#PO-{{ inv.purchaseOrderId }}</td>
                    <td>{{ inv.amount | currency }}</td>
                    <td class="text-muted">+{{ inv.gst | currency }}</td>
                    <td class="fw-semibold">{{ (inv.amount + inv.gst) | currency }}</td>
                    <td>{{ inv.invoiceDate }}</td>
                    <td>
                      <span class="badge" 
                            [class.bg-success-subtle]="inv.paymentStatus === 'Paid'"
                            [class.text-success]="inv.paymentStatus === 'Paid'"
                            [class.bg-warning-subtle]="inv.paymentStatus === 'Pending'"
                            [class.text-warning]="inv.paymentStatus === 'Pending'"
                            [class.bg-info-subtle]="inv.paymentStatus === 'Approved'"
                            [class.text-info]="inv.paymentStatus === 'Approved'">
                        {{ inv.paymentStatus }}
                      </span>
                    </td>
                    <td class="text-end" *ngIf="canVerify">
                      <div class="d-flex justify-content-end gap-1">
                        <button *ngIf="inv.paymentStatus === 'Pending'" class="btn btn-xs btn-outline-success px-2 py-1 text-xxs" 
                                (click)="approveInvoice(inv.id)">Verify</button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="filteredInvoices.length === 0">
                    <td colspan="9" class="text-center py-4 text-muted">No invoices found.</td>
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
export class InvoicesComponent implements OnInit {
  invoices: InvoiceRecord[] = [];
  filteredInvoices: InvoiceRecord[] = [];
  orders: PurchaseOrderRecord[] = [];
  vendors: VendorRecord[] = [];

  invoiceForm!: FormGroup;
  submitted = false;
  loading = false;

  // Search
  searchQuery = '';

  // Roles
  canUpload = false;
  canVerify = false;

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private poService: PurchaseOrderService,
    private vendorService: VendorService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const role = this.authService.currentUserValue?.role || '';
    this.canUpload = role === 'Admin' || role === 'Project Manager' || role === 'Contractor';
    this.canVerify = role === 'Admin' || role === 'Finance' || role === 'Project Manager';

    this.initForm();
    this.loadData();
  }

  initForm(): void {
    this.invoiceForm = this.fb.group({
      purchaseOrderId: ['', Validators.required],
      invoiceNo: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      gst: [0],
      invoiceDate: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  get f() { return this.invoiceForm.controls; }

  loadData(): void {
    this.invoiceService.getInvoices().subscribe(list => {
      this.invoices = list;
      this.filterInvoices();
    });

    this.poService.getPurchaseOrders().subscribe(list => {
      // Invoices can be generated for any valid purchase order
      this.orders = list.filter(po => po.status !== 'Rejected');
    });



    this.vendorService.getVendors().subscribe(list => {
      this.vendors = list;
    });
  }

  filterInvoices(): void {
    this.filteredInvoices = this.invoices.filter(inv => {
      return inv.invoiceNo.toLowerCase().includes(this.searchQuery.toLowerCase());
    });
  }

  onPoSelected(): void {
    const poId = this.invoiceForm.value.purchaseOrderId;
    const po = this.orders.find(o => o.id === Number(poId));
    if (po) {
      this.invoiceForm.patchValue({
        amount: po.totalAmount,
        gst: po.totalAmount * 0.18, // Suggest 18% standard GST
        invoiceNo: `INV-${po.poNumber.slice(-4)}-${Date.now().toString().slice(-4)}`
      });
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.invoiceForm.invalid) return;

    this.loading = true;
    const val = this.invoiceForm.value;

    const po = this.orders.find(o => o.id === Number(val.purchaseOrderId));
    if (!po) return;

    const payload: Omit<InvoiceRecord, 'id' | 'paymentStatus'> = {
      invoiceNo: val.invoiceNo,
      vendorId: po.vendorId,
      purchaseOrderId: po.id,
      amount: Number(val.amount),
      gst: Number(val.gst) || 0,
      invoiceDate: val.invoiceDate
    };

    this.invoiceService.createInvoice(payload).subscribe({
      next: () => {
        this.loading = false;
        this.submitted = false;
        this.toastService.showSuccess('Invoice uploaded successfully.');
        this.invoiceForm.reset({
          invoiceDate: new Date().toISOString().split('T')[0]
        });
        this.loadData();
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Failed to upload invoice.');
      }
    });
  }

  approveInvoice(id: number): void {
    this.invoiceService.updatePaymentStatus(id, 'Approved').subscribe({
      next: () => {
        this.toastService.showSuccess(`Invoice #${id} audited and verified successfully.`);
        this.loadData();
      }
    });
  }

  getVendorName(id: number): string {
    const vendor = this.vendors.find(v => v.id === id);
    return vendor ? vendor.vendorName : `Vendor #${id}`;
  }
}
