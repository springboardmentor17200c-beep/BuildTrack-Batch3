import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MaterialDashboardComponent } from './material-dashboard.component';
import { StockMonitoringComponent } from './stock-monitoring.component';
import { MaterialRequestComponent } from './material-request.component';
import { InventoryService } from '../../core/services/inventory.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTabsModule,
    MaterialDashboardComponent,
    StockMonitoringComponent,
    MaterialRequestComponent,
    ToastComponent
  ],
  template: `
    <div class="container-fluid">
      <!-- Title -->
      <div class="mb-4">
        <h1 class="h2 fw-bold mb-1 text-slate-800">Material & Inventory Management</h1>
        <p class="text-muted mb-0">Monitor raw material stock levels, check threshold alerts, and create procurement workflows</p>
      </div>

      <!-- Tabbed layout panels -->
      <mat-tab-group class="bg-white rounded shadow-sm p-3">
        <mat-tab label="Material Inventory Ledgers">
          <div class="p-3">
            <app-material-dashboard #dashboard (inventoryChanged)="onInventoryUpdated()"></app-material-dashboard>
          </div>
        </mat-tab>

        <mat-tab label="Stock Capacity Monitoring">
          <div class="p-3">
            <app-stock-monitoring #monitor></app-stock-monitoring>
          </div>
        </mat-tab>

        <mat-tab label="Procurement Requisitions">
          <div class="p-3">
            <app-material-request #requests></app-material-request>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
    <app-toast></app-toast>
  `,
  styles: [`
    .text-xs { font-size: 0.8rem; }
  `]
})
export class InventoryComponent implements OnInit {
  @ViewChild('dashboard') dashboardComponent!: MaterialDashboardComponent;
  @ViewChild('monitor') monitorComponent!: StockMonitoringComponent;
  @ViewChild('requests') requestsComponent!: MaterialRequestComponent;

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {}

  onInventoryUpdated(): void {
    if (this.monitorComponent) {
      this.monitorComponent.loadData();
    }
    if (this.dashboardComponent) {
      this.dashboardComponent.loadMaterials();
    }
    if (this.requestsComponent) {
      this.requestsComponent.loadData();
    }
  }
}
