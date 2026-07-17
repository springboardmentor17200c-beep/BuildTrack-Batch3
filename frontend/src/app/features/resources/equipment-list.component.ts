import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Equipment } from '../../core/interfaces/resource.interface';
import { ResourceService } from '../../core/services/resource.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule],
  template: `
    <div class="row g-3">
      <!-- Filters -->
      <div class="col-12 mb-2 d-flex flex-wrap gap-2 align-items-center">
        <span class="text-xs text-muted fw-bold me-2 uppercase">Filter Status:</span>
        <button class="btn btn-xs" [class.btn-warning]="filter === 'All'" [class.btn-outline-secondary]="filter !== 'All'" (click)="setFilter('All')">All</button>
        <button class="btn btn-xs" [class.btn-warning]="filter === 'Available'" [class.btn-outline-secondary]="filter !== 'Available'" (click)="setFilter('Available')">Available</button>
        <button class="btn btn-xs" [class.btn-warning]="filter === 'Assigned'" [class.btn-outline-secondary]="filter !== 'Assigned'" (click)="setFilter('Assigned')">Assigned</button>
        <button class="btn btn-xs" [class.btn-warning]="filter === 'Maintenance'" [class.btn-outline-secondary]="filter !== 'Maintenance'" (click)="setFilter('Maintenance')">Maintenance</button>
      </div>

      <!-- Equipment cards grid -->
      <div class="col-12 col-md-6 col-lg-4" *ngFor="let eq of filteredEquipment">
        <div class="bt-card h-100 p-3 d-flex flex-column justify-content-between position-relative">
          <div>
            <div class="d-flex justify-content-between align-items-start">
              <span class="badge bg-light text-dark text-xs border border-secondary border-opacity-10">{{ eq.category }}</span>
              <span class="bt-badge text-xxs" 
                    [class.bt-badge-success]="eq.status === 'Available'" 
                    [class.bt-badge-info]="eq.status === 'Assigned'" 
                    [class.bt-badge-warning]="eq.status === 'Maintenance'">
                {{ eq.status }}
              </span>
            </div>
            
            <div class="d-flex align-items-center gap-2 mt-3 mb-2">
              <div class="icon-circle bg-light text-slate-600" style="width: 32px; height: 32px; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">precision_manufacturing</mat-icon>
              </div>
              <h6 class="fw-bold text-slate-800 mb-0">{{ eq.name }}</h6>
            </div>
            
            <p class="text-muted text-xs mb-1">Serial: <strong>{{ eq.serialNumber }}</strong></p>
            <p class="text-muted text-xs mb-0" *ngIf="eq.operator">Operator: <strong>{{ eq.operator }}</strong></p>
          </div>

          <!-- Status toggle action -->
          <div class="d-flex justify-content-end border-top border-light pt-2 mt-3">
            <button mat-button [matMenuTriggerFor]="statusMenu" class="text-xs btn btn-xs btn-bt-outline py-1 px-3 d-flex align-items-center gap-1">
              <span>Change Status</span>
              <mat-icon style="font-size: 14px; width: 14px; height: 14px;">arrow_drop_down</mat-icon>
            </button>
            <mat-menu #statusMenu="matMenu">
              <button mat-menu-item (click)="updateStatus(eq.id, 'Available')">
                <mat-icon class="text-success">check_circle</mat-icon>
                <span>Set Available</span>
              </button>
              <button mat-menu-item (click)="updateStatus(eq.id, 'Assigned')">
                <mat-icon class="text-info">assignment_ind</mat-icon>
                <span>Set Assigned</span>
              </button>
              <button mat-menu-item (click)="updateStatus(eq.id, 'Maintenance')">
                <mat-icon class="text-warning">build</mat-icon>
                <span>Set Maintenance</span>
              </button>
            </mat-menu>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-xxs { font-size: 0.72rem; }
    .text-xs { font-size: 0.8rem; }
    .btn-xs { font-size: 0.75rem; padding: 0.25rem 0.5rem; }
  `]
})
export class EquipmentListComponent implements OnInit {
  equipment: Equipment[] = [];
  filteredEquipment: Equipment[] = [];
  filter = 'All';

  constructor(
    private resourceService: ResourceService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadEquipment();
  }

  loadEquipment(): void {
    this.resourceService.getEquipment().subscribe({
      next: (list) => {
        this.equipment = list;
        this.applyFilter();
      }
    });
  }

  setFilter(filter: string): void {
    this.filter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.filter === 'All') {
      this.filteredEquipment = [...this.equipment];
    } else {
      this.filteredEquipment = this.equipment.filter(e => e.status === this.filter);
    }
  }

  updateStatus(id: number, status: 'Available' | 'Assigned' | 'Maintenance'): void {
    this.resourceService.updateEquipmentStatus(id, status).subscribe({
      next: (updated) => {
        if (updated) {
          this.toastService.showSuccess(`Asset ${updated.name} status set to ${status}.`);
          this.loadEquipment();
        }
      },
      error: () => {
        this.toastService.showError('Failed to change status.');
      }
    });
  }
}
