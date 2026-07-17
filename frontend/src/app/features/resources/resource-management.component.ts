import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { EquipmentListComponent } from './equipment-list.component';
import { ResourceAllocationComponent } from './resource-allocation.component';
import { ResourceUtilizationComponent } from './resource-utilization.component';
import { ResourceService } from '../../core/services/resource.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-resource-management',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTabsModule,
    EquipmentListComponent,
    ResourceAllocationComponent,
    ResourceUtilizationComponent,
    ToastComponent
  ],
  template: `
    <div class="container-fluid">
      <!-- Title -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h2 fw-bold mb-1 text-slate-800">Resource & Equipment Management</h1>
          <p class="text-muted mb-0">Track heavy machinery deployment, maintenance routines, and site operator allocations</p>
        </div>
      </div>

      <!-- Overview Cards -->
      <div class="row g-4 mb-4">
        <div class="col-12 col-md-4" *ngFor="let card of cards">
          <div class="bt-card border-start border-4" [style.border-left-color]="card.color">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="text-muted text-xs text-uppercase tracking-wider fw-bold">{{ card.title }}</span>
                <h3 class="display-6 fw-bold mt-1 mb-0">{{ card.value }}</h3>
              </div>
              <div class="icon-circle bg-light" [style.color]="card.color" style="width: 44px; height: 44px; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
                <mat-icon>{{ card.icon }}</mat-icon>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabbed layout panels -->
      <mat-tab-group class="bg-white rounded shadow-sm p-3">
        <mat-tab label="Machinery Inventory Fleet">
          <div class="p-3">
            <h5 class="fw-bold mb-3 text-slate-800">Operational Equipment Fleet</h5>
            <app-equipment-list #eqList></app-equipment-list>
          </div>
        </mat-tab>
        
        <mat-tab label="Deployment & Allocations">
          <div class="p-3">
            <app-resource-allocation #resAlloc (allocationSaved)="onAllocationUpdated()"></app-resource-allocation>
          </div>
        </mat-tab>
        
        <mat-tab label="Fleet Utilization Analysis">
          <div class="p-3">
            <app-resource-utilization></app-resource-utilization>
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
export class ResourceManagementComponent implements OnInit {
  @ViewChild('eqList') eqListComponent!: EquipmentListComponent;
  @ViewChild('resAlloc') resAllocComponent!: ResourceAllocationComponent;

  cards = [
    { title: 'Total Assets', value: '0', icon: 'precision_manufacturing', color: '#ff7a00' },
    { title: 'Active Deployments', value: '0', icon: 'engineering', color: '#10b981' },
    { title: 'Maintenance Queue', value: '0', icon: 'build', color: '#ef4444' }
  ];

  constructor(private resourceService: ResourceService) {}

  ngOnInit(): void {
    this.updateStats();
  }

  updateStats(): void {
    this.resourceService.getEquipment().subscribe(list => {
      const total = list.length;
      const active = list.filter(e => e.status === 'Assigned').length;
      const maintenance = list.filter(e => e.status === 'Maintenance').length;

      this.cards[0].value = `${total} Units`;
      this.cards[1].value = `${active} In Use`;
      this.cards[2].value = `${maintenance} Units`;
    });
  }

  onAllocationUpdated(): void {
    this.updateStats();
    if (this.eqListComponent) {
      this.eqListComponent.loadEquipment();
    }
    if (this.resAllocComponent) {
      this.resAllocComponent.loadData();
    }
  }
}
