import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { InventoryService } from '../../../core/services/inventory.service';
import { PurchaseOrderService } from '../../../core/services/purchase-order.service';
import { Material } from '../../../core/interfaces/inventory.interface';
import { PurchaseOrderRecord } from '../../../core/interfaces/purchase-order.interface';

@Component({
  selector: 'app-store-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  template: `
    <div class="container-fluid">
      <!-- Title -->
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h1 class="h2 fw-bold mb-1 text-slate-800">Store Manager Workspace</h1>
          <p class="text-muted mb-0">Overview of warehouse inventory levels, raw material arrivals, and low-stock alerts.</p>
        </div>
        <div class="d-flex gap-2">
          <a routerLink="/inventory" class="btn btn-bt-outline btn-sm">
            <mat-icon style="font-size: 18px; width: 18px; height: 18px;">inventory_2</mat-icon>
            <span>Inventory Directory</span>
          </a>
          <a routerLink="/deliveries" class="btn btn-bt-primary btn-sm">
            <mat-icon style="font-size: 18px; width: 18px; height: 18px;">local_shipping</mat-icon>
            <span>Material Receiving</span>
          </a>
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="row g-4 mb-4">
        <!-- Low Stock Items Count -->
        <div class="col-12 col-md-4">
          <div class="bt-card border-start border-4 border-danger">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="text-muted text-xs text-uppercase tracking-wider fw-bold">Low Stock Warning</span>
                <h3 class="display-6 fw-bold mt-1 mb-0">{{ lowStockCount }} Items</h3>
              </div>
              <div class="icon-circle bg-light-red text-danger" style="width: 44px; height: 44px; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
                <mat-icon>warning</mat-icon>
              </div>
            </div>
            <div class="text-xs text-muted mt-3">
              Items under minimum threshold limit
            </div>
          </div>
        </div>

        <!-- Pending Deliveries Count -->
        <div class="col-12 col-md-4">
          <div class="bt-card border-start border-4 border-warning">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="text-muted text-xs text-uppercase tracking-wider fw-bold">Incoming Shipments</span>
                <h3 class="display-6 fw-bold mt-1 mb-0">{{ incomingCount }} Pending</h3>
              </div>
              <div class="icon-circle bg-light-yellow text-warning" style="width: 44px; height: 44px; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
                <mat-icon>local_shipping</mat-icon>
              </div>
            </div>
            <div class="text-xs text-muted mt-3">
              Purchase orders accepted or in-transit
            </div>
          </div>
        </div>

        <!-- Total Unique Materials -->
        <div class="col-12 col-md-4">
          <div class="bt-card border-start border-4 border-success">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="text-muted text-xs text-uppercase tracking-wider fw-bold">Stock SKUs tracked</span>
                <h3 class="display-6 fw-bold mt-1 mb-0">{{ totalItems }} Materials</h3>
              </div>
              <div class="icon-circle bg-light-green text-success" style="width: 44px; height: 44px; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
                <mat-icon>category</mat-icon>
              </div>
            </div>
            <div class="text-xs text-muted mt-3">
              Active lines in storage index
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4 mb-4">
        <!-- Low Stock Items List -->
        <div class="col-12 col-lg-6">
          <div class="bt-card h-100">
            <div class="bt-card-header d-flex justify-content-between align-items-center">
              <h5 class="fw-bold mb-0 text-slate-800">Critical Low Stock Threshold Alerts</h5>
              <mat-icon class="text-danger">notifications_active</mat-icon>
            </div>

            <div class="table-responsive mt-3">
              <table class="table align-middle text-sm mb-0">
                <thead class="table-light text-muted uppercase text-xs">
                  <tr>
                    <th>Material</th>
                    <th>Current Quantity</th>
                    <th>Minimum Limit</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of lowStockItems" class="hover-row">
                    <td><strong>{{ item.name }}</strong></td>
                    <td class="text-danger fw-bold">{{ item.quantity }} {{ item.unit }}</td>
                    <td>{{ item.minimumStock }} {{ item.unit }}</td>
                    <td>
                      <span class="badge bg-danger-subtle text-danger px-2 py-1 text-xxs">Reorder Needed</span>
                    </td>
                  </tr>
                  <tr *ngIf="lowStockItems.length === 0">
                    <td colspan="4" class="text-center py-4 text-muted">All stocks above minimum limits.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Recent Shipments Queue -->
        <div class="col-12 col-lg-6">
          <div class="bt-card h-100">
            <div class="bt-card-header d-flex justify-content-between align-items-center">
              <h5 class="fw-bold mb-0 text-slate-800">Active Incoming PO Shipments</h5>
              <a routerLink="/deliveries" class="text-primary text-xs text-decoration-none">View All</a>
            </div>

            <div class="table-responsive mt-3">
              <table class="table align-middle text-sm mb-0">
                <thead class="table-light text-muted uppercase text-xs">
                  <tr>
                    <th>PO ID</th>
                    <th>Material</th>
                    <th>Supplier</th>
                    <th>Qty</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let order of incomingOrders" class="hover-row">
                    <td><strong>#{{ order.poNumber }}</strong></td>
                    <td>{{ order.materialName }}</td>
                    <td>{{ order.vendorName || 'Selected Vendor' }}</td>
                    <td>{{ order.quantity }} units</td>
                    <td>
                      <a routerLink="/deliveries" class="btn btn-xs btn-outline-primary py-1 px-2 text-xxs">Receive</a>
                    </td>
                  </tr>
                  <tr *ngIf="incomingOrders.length === 0">
                    <td colspan="5" class="text-center py-4 text-muted">No active shipments in transit.</td>
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
    .text-sm { font-size: 0.9rem; }
    .bg-light-red { background-color: rgba(239, 68, 68, 0.08); }
    .bg-light-yellow { background-color: rgba(255, 122, 0, 0.08); }
    .bg-light-green { background-color: rgba(16, 185, 129, 0.08); }
    .hover-row:hover { background-color: rgba(0, 0, 0, 0.015); }
    .btn-xs { font-size: 0.75rem; padding: 0.25rem 0.5rem; }
  `]
})
export class StoreManagerDashboardComponent implements OnInit {
  lowStockItems: Material[] = [];
  incomingOrders: PurchaseOrderRecord[] = [];
  lowStockCount = 0;
  incomingCount = 0;
  totalItems = 0;

  constructor(
    private inventoryService: InventoryService,
    private poService: PurchaseOrderService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.inventoryService.getMaterials().subscribe((items: Material[]) => {
      this.totalItems = items.length;
      this.lowStockItems = items.filter(item => {
        const qty = typeof item.quantity === 'number' ? item.quantity : parseInt(String(item.quantity).replace(/,/g, ''), 10) || 0;
        return qty <= (item.minimumStock || 0);
      });
      this.lowStockCount = this.lowStockItems.length;
    });

    this.poService.getPurchaseOrders().subscribe((orders: PurchaseOrderRecord[]) => {
      this.incomingOrders = orders.filter(o => o.status === 'Sent' || o.status === 'Accepted');
      this.incomingCount = this.incomingOrders.length;
    });
  }
}
