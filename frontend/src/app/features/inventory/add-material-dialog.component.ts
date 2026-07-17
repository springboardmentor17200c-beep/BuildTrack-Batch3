import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Material } from '../../core/interfaces/inventory.interface';

@Component({
  selector: 'app-add-material-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="modal-overlay d-flex align-items-center justify-content-center">
      <div class="modal-card bg-white p-4 rounded shadow-lg fade-in" style="width: 480px; max-width: 95%;">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bold mb-0 text-slate-800">{{ material ? 'Edit Material Item' : 'Register Material Item' }}</h5>
          <button type="button" class="btn-close-custom" (click)="onCancel()">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <form [formGroup]="materialForm" (ngSubmit)="onSubmit()">
          <!-- Name -->
          <div class="mb-3">
            <label class="bt-form-label">Material Name</label>
            <input type="text" class="form-control bt-form-control" formControlName="name" placeholder="e.g. Portland Cement"
                   [class.is-invalid]="submitted && f['name'].errors">
            <div *ngIf="submitted && f['name'].errors" class="invalid-feedback text-xs">
              <span>Material name is required</span>
            </div>
          </div>

          <!-- Category -->
          <div class="mb-3">
            <label class="bt-form-label">Inventory Category</label>
            <select class="form-select bt-form-control" formControlName="category">
              <option value="Raw Materials">Raw Materials</option>
              <option value="Structural Metal">Structural Metal</option>
              <option value="Masonry Blocks">Masonry Blocks</option>
              <option value="Aggregates">Aggregates</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
            </select>
          </div>

          <!-- Quantity & Unit & Capacity -->
          <div class="row mb-3 g-2">
            <div class="col-4">
              <label class="bt-form-label">Current Stock</label>
              <input type="text" class="form-control bt-form-control" formControlName="quantity" placeholder="e.g. 500"
                     [class.is-invalid]="submitted && f['quantity'].errors">
              <div *ngIf="submitted && f['quantity'].errors" class="invalid-feedback text-xs">
                <span>Stock is required</span>
              </div>
            </div>
            
            <div class="col-4">
              <label class="bt-form-label">Unit of Measure</label>
              <input type="text" class="form-control bt-form-control" formControlName="unit" placeholder="e.g. Bags, Tons"
                     [class.is-invalid]="submitted && f['unit'].errors">
              <div *ngIf="submitted && f['unit'].errors" class="invalid-feedback text-xs">
                <span>Unit is required</span>
              </div>
            </div>

            <div class="col-4">
              <label class="bt-form-label">Capacity Limit</label>
              <input type="number" class="form-control bt-form-control" formControlName="capacityLimit" placeholder="e.g. 1000"
                     [class.is-invalid]="submitted && f['capacityLimit'].errors">
              <div *ngIf="submitted && f['capacityLimit'].errors" class="invalid-feedback text-xs">
                <span>Limit is required</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="d-flex justify-content-end gap-2 mt-4 border-top border-light pt-3">
            <button type="button" class="btn btn-bt-outline py-2" (click)="onCancel()" [disabled]="isLoading">Cancel</button>
            <button type="submit" class="btn btn-bt-primary py-2 d-flex align-items-center gap-1" [disabled]="isLoading || materialForm.invalid">
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
              <span>{{ material ? 'Save Stock' : 'Add Item' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
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
    .btn-close-custom {
      background: transparent;
      border: none;
      color: var(--slate-400);
      cursor: pointer;
      display: flex;
      align-items: center;
    }
    .btn-close-custom:hover {
      color: var(--slate-800);
    }
    .text-xs { font-size: 0.8rem; }
  `]
})
export class AddMaterialDialogComponent implements OnInit {
  @Input() material: Material | null = null;
  @Input() isLoading = false;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  materialForm!: FormGroup;
  submitted = false;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.materialForm = this.formBuilder.group({
      name: [this.material ? this.material.name : '', Validators.required],
      category: [this.material ? this.material.category : 'Raw Materials', Validators.required],
      quantity: [this.material ? this.material.quantity : '', Validators.required],
      unit: [this.material ? this.material.unit : 'Bags', Validators.required],
      capacityLimit: [this.material ? this.material.capacityLimit : 1000, [Validators.required, Validators.min(1)]]
    });
  }

  get f() { return this.materialForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    if (this.materialForm.invalid) {
      return;
    }

    this.save.emit(this.materialForm.value);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
