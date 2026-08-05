import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { InventoryService } from '../../core/services/inventory.service';
import { Material } from '../../core/interfaces/inventory.interface';

@Component({
  selector: 'app-stock-monitoring',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="row g-4">
      <!-- Alerts & Recommendations Column -->
      <div class="col-12 col-lg-4">
        <div class="border border-secondary border-opacity-10 rounded p-4 bg-light h-100 d-flex flex-column justify-content-between">
          <div>
            <h6 class="fw-bold text-danger mb-3 d-flex align-items-center gap-1">
              <mat-icon style="font-size: 20px; width: 20px; height: 20px;">notification_important</mat-icon>
              <span>Critical Depletion Alerts</span>
            </h6>
            
            <div class="d-flex flex-column gap-2">
              <div *ngFor="let item of criticalItems" class="p-3 bg-white border border-danger border-opacity-20 rounded shadow-sm">
                <div class="d-flex justify-content-between align-items-start">
                  <h6 class="fw-bold text-slate-800 mb-1 text-sm">{{ item.name }}</h6>
                  <span class="badge bg-danger text-white text-xxs">CRITICAL</span>
                </div>
                <p class="text-muted text-xs mb-0">Current Stock is <strong>{{ item.quantity }} {{ item.unit }}</strong> ({{ item.currentLevel }}% capacity limit {{ item.capacityLimit }}).</p>
              </div>
              
              <div *ngIf="criticalItems.length === 0" class="text-center py-4 text-muted text-xs">
                <mat-icon class="text-success fs-3 mb-1" style="width: 24px; height: 24px;">check_circle</mat-icon>
                <p class="mb-0">No depletion warnings found. All stocks are safe.</p>
              </div>
            </div>
          </div>

          <div class="mt-4 p-3 rounded bg-white border border-secondary border-opacity-10 text-xs text-muted">
            <mat-icon style="font-size: 18px; width: 18px; height: 18px;" class="text-warning">lightbulb</mat-icon>
            <span class="ms-1">Recommend placing purchase orders for items displaying capacity below 30%.</span>
          </div>
        </div>
      </div>

      <!-- Capacity indicators details list -->
      <div class="col-12 col-lg-8">
        <div class="border border-secondary border-opacity-10 rounded p-4 bg-white shadow-sm h-100">
          <h5 class="fw-bold mb-3 text-slate-800">Sensory Stock Levels & Storage Limits</h5>
          
          <div class="d-flex flex-column gap-4 mt-3">
            <div *ngFor="let item of materials">
              <div class="d-flex justify-content-between align-items-center mb-1 text-xs">
                <span class="fw-bold text-slate-800">{{ item.name }}</span>
                <span class="text-muted">Stock: <strong>{{ item.quantity }} / {{ item.capacityLimit }} {{ item.unit }}</strong></span>
              </div>
              <div class="progress" style="height: 12px; border-radius: 6px;">
                <div class="progress-bar progress-bar-striped" 
                     [class.bg-success]="item.currentLevel >= 50" 
                     [class.bg-warning]="item.currentLevel >= 25 && item.currentLevel < 50" 
                     [class.bg-danger]="item.currentLevel < 25" 
                     role="progressbar" 
                     [style.width]="item.currentLevel + '%'"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-xxs { font-size: 0.72rem; }
    .text-xs { font-size: 0.8rem; }
    .text-sm { font-size: 0.9rem; }
  `]
})
export class StockMonitoringComponent implements OnInit {
  materials: Material[] = [];
  criticalItems: Material[] = [];

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.inventoryService.getMaterials().subscribe(list => {
      this.materials = list;
      this.criticalItems = list.filter(m => m.currentLevel < 30);
    });
  }
}
