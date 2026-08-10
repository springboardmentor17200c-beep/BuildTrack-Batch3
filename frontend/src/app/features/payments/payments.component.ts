import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { InvoiceService } from '../../core/services/invoice.service';
import { VendorService } from '../../core/services/vendor.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { InvoiceRecord } from '../../core/interfaces/invoice.interface';
import { VendorRecord } from '../../core/interfaces/vendor-management.interface';
import { WorkflowStepperComponent } from '../../shared/components/workflow-stepper/workflow-stepper.component';

@Component({
  selector: 'app-payments',
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
        <h1 class="h2 fw-bold mb-1 text-slate-800">Payment Outlay Desk</h1>
        <p class="text-muted mb-0">Record bank wire transfers, authorize approved invoice clearances, and log transaction hashes.</p>
      </div>

      <!-- Main Columns -->
      <div class="row g-4">
        <!-- Payout Modal Card (conditional) -->
        <div class="col-12 col-lg-4" *ngIf="selectedInvoice">
          <div class="bt-card">
            <h5 class="fw-bold mb-3 text-slate-800">Clear Invoice: #{{ selectedInvoice.invoiceNo }}</h5>
            <app-workflow-stepper currentStage="Payment Approved"></app-workflow-stepper>
            <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()" class="d-flex flex-column gap-3 mt-3">
              <div>
                <label class="bt-form-label">Calculated Payout Total</label>
                <div class="text-slate-800 fw-bold fs-4">
                  {{ (selectedInvoice.amount + selectedInvoice.gst) | currency }}
                </div>
                <span class="text-xxs text-muted">(Base: {{ selectedInvoice.amount | currency }} + GST: {{ selectedInvoice.gst | currency }})</span>
              </div>

              <div>
                <label class="bt-form-label">Transaction Reference / UTR</label>
                <input type="text" class="form-control bt-form-control" formControlName="transactionRef" placeholder="e.g. TXN9988776655">
                <div *ngIf="submitted && f['transactionRef'].errors" class="text-danger text-xs mt-1">
                  UTR Reference is required.
                </div>
              </div>

              <div>
                <label class="bt-form-label">Payment Date</label>
                <input type="date" class="form-control bt-form-control" formControlName="paymentDate">
              </div>

              <div class="d-flex gap-2 mt-2">
                <button type="button" class="btn btn-bt-outline w-50 py-2" (click)="selectedInvoice = null">Cancel</button>
                <button type="submit" class="btn btn-success w-50 py-2" [disabled]="loading">Log Clearance</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Ledger Table -->
        <div class="col-12" [class.col-lg-8]="selectedInvoice">
          <div class="bt-card">
            <h5 class="fw-bold mb-3 text-slate-800">Payout Requisitions Queue</h5>
            <div class="table-responsive">
              <table class="table align-middle text-sm mb-0">
                <thead class="table-light text-muted uppercase text-xs">
                  <tr>
                    <th>Invoice No</th>
                    <th>Supplier</th>
                    <th>Gross Amount</th>
                    <th>Status</th>
                    <th class="text-end" *ngIf="canPay">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of invoices" class="hover-row">
                    <td><strong>#{{ item.invoiceNo }}</strong></td>
                    <td>{{ getVendorName(item.vendorId) }}</td>
                    <td class="fw-bold">{{ (item.amount + item.gst) | currency }}</td>
                    <td>
                      <span class="badge" 
                            [class.bg-warning-subtle]="item.paymentStatus === 'Pending'"
                            [class.text-warning]="item.paymentStatus === 'Pending'"
                            [class.bg-info-subtle]="item.paymentStatus === 'Approved'"
                            [class.text-info]="item.paymentStatus === 'Approved'"
                            [class.bg-success-subtle]="item.paymentStatus === 'Paid'"
                            [class.text-success]="item.paymentStatus === 'Paid'">
                        {{ item.paymentStatus }}
                      </span>
                    </td>
                    <td class="text-end" *ngIf="canPay">
                      <button class="btn btn-xs btn-success px-2 py-1 text-xxs d-flex align-items-center gap-1"
                              (click)="selectInvoice(item)" [disabled]="item.paymentStatus !== 'Approved'">
                        <mat-icon style="font-size: 14px; width: 14px; height: 14px;">payments</mat-icon>
                        <span>Clear Payout</span>
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="invoices.length === 0">
                    <td colspan="5" class="text-center py-4 text-muted">No pending payouts logged.</td>
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
export class PaymentsComponent implements OnInit {
  invoices: InvoiceRecord[] = [];
  vendors: VendorRecord[] = [];

  selectedInvoice: InvoiceRecord | null = null;
  paymentForm!: FormGroup;

  submitted = false;
  loading = false;

  // Roles
  canPay = false;

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private vendorService: VendorService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const role = this.authService.currentUserValue?.role || '';
    this.canPay = role === 'Admin' || role === 'Finance';

    this.initForm();
    this.loadData();
  }

  initForm(): void {
    this.paymentForm = this.fb.group({
      transactionRef: ['', Validators.required],
      paymentDate: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  get f() { return this.paymentForm.controls; }

  loadData(): void {
    this.invoiceService.getInvoices().subscribe(list => {
      // Payments desk shows Approved or Paid invoices
      this.invoices = list.filter(item => item.paymentStatus === 'Approved' || item.paymentStatus === 'Paid');
    });

    this.vendorService.getVendors().subscribe(list => {
      this.vendors = list;
    });
  }

  selectInvoice(inv: InvoiceRecord): void {
    this.selectedInvoice = inv;
    this.paymentForm.patchValue({
      transactionRef: `TXN${Date.now().toString().slice(-8)}`,
      paymentDate: new Date().toISOString().split('T')[0]
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.paymentForm.invalid || !this.selectedInvoice) return;

    this.loading = true;

    this.invoiceService.updatePaymentStatus(this.selectedInvoice.id, 'Paid').subscribe({
      next: () => {
        this.loading = false;
        this.submitted = false;
        this.toastService.showSuccess(`Invoice cleared successfully! logged Txn Ref: ${this.paymentForm.value.transactionRef}`);
        this.selectedInvoice = null;
        this.loadData();
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Failed to record payment.');
      }
    });
  }

  getVendorName(id: number): string {
    const vendor = this.vendors.find(v => v.id === id);
    return vendor ? vendor.vendorName : `Vendor #${id}`;
  }
}
