import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { InvoiceService } from '../../../core/services/invoice.service';
import { InvoiceRecord } from '../../../core/interfaces/invoice.interface';

@Component({
  selector: 'app-finance-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  template: `
    <div class="container-fluid">
      <!-- Title -->
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h1 class="h2 fw-bold mb-1 text-slate-800">Finance Control Center</h1>
          <p class="text-muted mb-0">Overview of project procurement payouts, invoice verifications, and payment processing queues.</p>
        </div>
        <div class="d-flex gap-2">
          <a routerLink="/invoices" class="btn btn-bt-outline btn-sm">
            <mat-icon style="font-size: 18px; width: 18px; height: 18px;">receipt_long</mat-icon>
            <span>Invoices Queue</span>
          </a>
          <a routerLink="/payments" class="btn btn-bt-primary btn-sm">
            <mat-icon style="font-size: 18px; width: 18px; height: 18px;">payment</mat-icon>
            <span>Payments Board</span>
          </a>
        </div>
      </div>

      <!-- KPI Outlays -->
      <div class="row g-4 mb-4">
        <!-- Total Paid Invoices -->
        <div class="col-12 col-md-4">
          <div class="bt-card border-start border-4 border-success">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="text-muted text-xs text-uppercase tracking-wider fw-bold">Total Procurement Paid</span>
                <h3 class="display-6 fw-bold mt-1 mb-0">{{ totalPaid | currency }}</h3>
              </div>
              <div class="icon-circle bg-light-green text-success" style="width: 44px; height: 44px; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
                <mat-icon>monetization_on</mat-icon>
              </div>
            </div>
            <div class="text-xs text-muted mt-3">
              Cleared invoice payouts year-to-date
            </div>
          </div>
        </div>

        <!-- Pending Approval Invoices count -->
        <div class="col-12 col-md-4">
          <div class="bt-card border-start border-4 border-warning">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="text-muted text-xs text-uppercase tracking-wider fw-bold">Awaiting Verification</span>
                <h3 class="display-6 fw-bold mt-1 mb-0">{{ pendingVerifyCount }} Invoices</h3>
              </div>
              <div class="icon-circle bg-light-yellow text-warning" style="width: 44px; height: 44px; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
                <mat-icon>fact_check</mat-icon>
              </div>
            </div>
            <div class="text-xs text-muted mt-3">
              Invoices uploaded requiring audit review
            </div>
          </div>
        </div>

        <!-- Approved and Pending Payouts -->
        <div class="col-12 col-md-4">
          <div class="bt-card border-start border-4 border-primary">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="text-muted text-xs text-uppercase tracking-wider fw-bold">Pending Release Payout</span>
                <h3 class="display-6 fw-bold mt-1 mb-0">{{ totalPendingPayout | currency }}</h3>
              </div>
              <div class="icon-circle bg-light-blue text-primary" style="width: 44px; height: 44px; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
                <mat-icon>pending</mat-icon>
              </div>
            </div>
            <div class="text-xs text-muted mt-3">
              Verified invoices ready for bank transfer
            </div>
          </div>
        </div>
      </div>

      <!-- Invoices to audit -->
      <div class="bt-card mb-4">
        <div class="bt-card-header d-flex justify-content-between align-items-center">
          <h5 class="fw-bold mb-0 text-slate-800">Pending Finance Actions Queue</h5>
          <span class="badge bg-light text-dark border border-secondary border-opacity-10 text-xs">Awaiting Payouts</span>
        </div>

        <div class="table-responsive mt-3">
          <table class="table align-middle text-sm mb-0">
            <thead class="table-light text-muted uppercase text-xs">
              <tr>
                <th>Invoice No</th>
                <th>Supplier</th>
                <th>Purchase Date</th>
                <th>Base Amount</th>
                <th>GST Included</th>
                <th>Status</th>
                <th class="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of pendingInvoices" class="hover-row">
                <td><strong>#{{ item.invoiceNo }}</strong></td>
                <td>{{ item.vendorName || 'Selected Vendor' }}</td>
                <td>{{ item.invoiceDate }}</td>
                <td>{{ item.amount | currency }}</td>
                <td class="text-muted">+{{ item.gst | currency }}</td>
                <td>
                  <span class="badge" 
                        [class.bg-warning-subtle]="item.paymentStatus === 'Pending'"
                        [class.text-warning]="item.paymentStatus === 'Pending'"
                        [class.bg-info-subtle]="item.paymentStatus === 'Approved'"
                        [class.text-info]="item.paymentStatus === 'Approved'">
                    {{ item.paymentStatus === 'Pending' ? 'Awaiting Verification' : 'Approved' }}
                  </span>
                </td>
                <td class="text-end">
                  <a routerLink="/payments" class="btn btn-xs btn-outline-primary py-1 px-2 text-xxs">Verify & Pay</a>
                </td>
              </tr>
              <tr *ngIf="pendingInvoices.length === 0">
                <td colspan="7" class="text-center py-4 text-muted">No pending payouts inside queue ledger.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-xs { font-size: 0.8rem; }
    .text-xxs { font-size: 0.72rem; }
    .text-sm { font-size: 0.9rem; }
    .bg-light-blue { background-color: rgba(59, 130, 246, 0.08); }
    .bg-light-yellow { background-color: rgba(255, 122, 0, 0.08); }
    .bg-light-green { background-color: rgba(16, 185, 129, 0.08); }
    .hover-row:hover { background-color: rgba(0, 0, 0, 0.015); }
    .btn-xs { font-size: 0.75rem; padding: 0.25rem 0.5rem; }
  `]
})
export class FinanceDashboardComponent implements OnInit {
  pendingInvoices: InvoiceRecord[] = [];
  totalPaid = 0;
  pendingVerifyCount = 0;
  totalPendingPayout = 0;

  constructor(private invoiceService: InvoiceService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.invoiceService.getInvoices().subscribe(list => {
      this.pendingInvoices = list.filter(item => item.paymentStatus === 'Pending' || item.paymentStatus === 'Approved');
      this.pendingVerifyCount = list.filter(item => item.paymentStatus === 'Pending').length;
      
      this.totalPaid = list
        .filter(item => item.paymentStatus === 'Paid')
        .reduce((sum, item) => sum + item.amount + item.gst, 0);

      this.totalPendingPayout = list
        .filter(item => item.paymentStatus === 'Approved')
        .reduce((sum, item) => sum + item.amount + item.gst, 0);
    });
  }
}
