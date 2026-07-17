import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { InventoryService } from '../../core/services/inventory.service';
import { ToastService } from '../../core/services/toast.service';
import { Material } from '../../core/interfaces/inventory.interface';
import { AddMaterialDialogComponent } from './add-material-dialog.component';

@Component({
  selector: 'app-material-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, AddMaterialDialogComponent],
  template: `
    <div>
      <!-- Filter and search bar -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div class="d-flex gap-2 flex-grow-1" style="max-width: 600px;">
          <input type="text" class="form-control bt-form-control" placeholder="Search materials..." (input)="onSearch($event)">
          <select class="form-select bt-form-control" style="max-width: 200px;" (change)="onFilterCategory($event)">
            <option value="All">All Categories</option>
            <option value="Raw Materials">Raw Materials</option>
            <option value="Structural Metal">Structural Metal</option>
            <option value="Masonry Blocks">Masonry Blocks</option>
            <option value="Aggregates">Aggregates</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
          </select>
        </div>
        <button class="btn btn-bt-primary btn-sm" (click)="openAddModal()">
          <mat-icon style="font-size: 18px; width: 18px; height: 18px;">add_box</mat-icon>
          <span>Add Material</span>
        </button>
      </div>

      <!-- Materials List Table -->
      <div class="table-responsive bg-white rounded border border-light">
        <table class="table align-middle text-sm mb-0">
          <thead class="table-light text-muted uppercase text-xs">
            <tr>
              <th>Material Name</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Sensory Stock Level</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of filteredMaterials">
              <td>
                <div class="d-flex align-items-center gap-2">
                  <mat-icon class="text-slate-500">inventory_2</mat-icon>
                  <span class="fw-semibold text-slate-800">{{ item.name }}</span>
                </div>
              </td>
              <td>
                <span class="badge bg-light text-dark border border-secondary border-opacity-10 text-xs">{{ item.category }}</span>
              </td>
              <td>
                <span class="fw-bold">{{ item.quantity }}</span> <span class="text-muted text-xs">{{ item.unit }}</span>
              </td>
              <td>
                <!-- Capacity progress indicator bar -->
                <div class="d-flex align-items-center gap-2" style="max-width: 200px;">
                  <div class="progress flex-grow-1" style="height: 6px;">
                    <div class="progress-bar" 
                         [class.bg-success]="item.currentLevel >= 50" 
                         [class.bg-warning]="item.currentLevel >= 25 && item.currentLevel < 50" 
                         [class.bg-danger]="item.currentLevel < 25" 
                         role="progressbar" [style.width]="item.currentLevel + '%'"></div>
                  </div>
                  <span class="text-xs fw-bold" 
                        [class.text-success]="item.currentLevel >= 50" 
                        [class.text-warning]="item.currentLevel >= 25 && item.currentLevel < 50" 
                        [class.text-danger]="item.currentLevel < 25">
                    {{ item.currentLevel }}%
                  </span>
                </div>
              </td>
              <td class="text-end">
                <div class="d-inline-flex gap-1">
                  <button type="button" class="btn btn-sm btn-bt-outline py-1 px-2 border-0 text-muted" (click)="openEditModal(item)">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">edit</mat-icon>
                  </button>
                  <button type="button" class="btn btn-sm btn-bt-outline py-1 px-2 border-0 text-danger" (click)="confirmDelete(item)">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">delete</mat-icon>
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="filteredMaterials.length === 0">
              <td colspan="5" class="text-center py-4 text-muted">No materials found in inventory ledger.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Modal -->
      <app-add-material-dialog *ngIf="showAddModal" 
                               [material]="selectedMaterial" 
                               [isLoading]="isSaving"
                               (save)="onSaveMaterial($event)" 
                               (cancel)="closeAddModal()">
      </app-add-material-dialog>

      <!-- Delete Confirmation Dialog -->
      <div *ngIf="showDeleteConfirm" class="modal-overlay d-flex align-items-center justify-content-center">
        <div class="modal-card bg-white p-4 rounded shadow-lg fade-in" style="width: 400px; max-width: 90%;">
          <h5 class="fw-bold mb-2 text-danger d-flex align-items-center gap-2">
            <mat-icon>warning</mat-icon>
            <span>Delete Material</span>
          </h5>
          <p class="text-muted text-sm mb-4">Are you sure you want to delete <strong>{{ selectedMaterial?.name }}</strong>? This action is irreversible.</p>
          <div class="d-flex justify-content-end gap-2 border-top border-light pt-3">
            <button class="btn btn-bt-outline py-2" (click)="closeDeleteModal()" [disabled]="isDeleting">Cancel</button>
            <button class="btn btn-danger py-2 d-flex align-items-center gap-1 text-white border-0" (click)="onDeleteMaterial()" [disabled]="isDeleting" style="background-color: #ef4444;">
              <span *ngIf="isDeleting" class="spinner-border spinner-border-sm" role="status"></span>
              <span>Confirm Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-xs { font-size: 0.8rem; }
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 1050;
    }
    .modal-card {
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  `]
})
export class MaterialDashboardComponent implements OnInit {
  @Output() inventoryChanged = new EventEmitter<void>();

  materials: Material[] = [];
  filteredMaterials: Material[] = [];

  // Filter State
  searchTerm = '';
  selectedCategory = 'All';

  // Modals state
  showAddModal = false;
  showDeleteConfirm = false;
  selectedMaterial: Material | null = null;
  isSaving = false;
  isDeleting = false;

  constructor(
    private inventoryService: InventoryService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadMaterials();
  }

  loadMaterials(): void {
    this.inventoryService.getMaterials().subscribe(list => {
      this.materials = list;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.filteredMaterials = this.materials.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(this.searchTerm);
      const matchCategory = this.selectedCategory === 'All' || m.category === this.selectedCategory;
      return matchSearch && matchCategory;
    });
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value.toLowerCase();
    this.applyFilters();
  }

  onFilterCategory(event: any): void {
    this.selectedCategory = event.target.value;
    this.applyFilters();
  }

  openAddModal(): void {
    this.selectedMaterial = null;
    this.showAddModal = true;
  }

  openEditModal(item: Material): void {
    this.selectedMaterial = { ...item };
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.selectedMaterial = null;
  }

  confirmDelete(item: Material): void {
    this.selectedMaterial = item;
    this.showDeleteConfirm = true;
  }

  closeDeleteModal(): void {
    this.showDeleteConfirm = false;
    this.selectedMaterial = null;
  }

  onSaveMaterial(formValue: any): void {
    this.isSaving = true;
    if (this.selectedMaterial) {
      const updated: Material = {
        ...this.selectedMaterial,
        ...formValue,
        capacityLimit: Number(formValue.capacityLimit)
      };
      this.inventoryService.updateMaterial(updated).subscribe({
        next: () => {
          this.isSaving = false;
          this.toastService.showSuccess('Material stock levels updated successfully.');
          this.loadMaterials();
          this.inventoryChanged.emit();
          this.closeAddModal();
        },
        error: () => {
          this.isSaving = false;
          this.toastService.showError('Failed to save material.');
        }
      });
    } else {
      this.inventoryService.createMaterial({
        ...formValue,
        capacityLimit: Number(formValue.capacityLimit)
      }).subscribe({
        next: () => {
          this.isSaving = false;
          this.toastService.showSuccess('New material registered in inventory ledger.');
          this.loadMaterials();
          this.inventoryChanged.emit();
          this.closeAddModal();
        },
        error: () => {
          this.isSaving = false;
          this.toastService.showError('Failed to add material.');
        }
      });
    }
  }

  onDeleteMaterial(): void {
    if (this.selectedMaterial) {
      this.isDeleting = true;
      this.inventoryService.deleteMaterial(this.selectedMaterial.id).subscribe({
        next: (success) => {
          this.isDeleting = false;
          if (success) {
            this.toastService.showSuccess('Material removed from inventory.');
            this.loadMaterials();
            this.inventoryChanged.emit();
          } else {
            this.toastService.showError('Failed to remove material.');
          }
          this.closeDeleteModal();
        },
        error: () => {
          this.isDeleting = false;
          this.toastService.showError('Error executing removal request.');
          this.closeDeleteModal();
        }
      });
    }
  }
}
