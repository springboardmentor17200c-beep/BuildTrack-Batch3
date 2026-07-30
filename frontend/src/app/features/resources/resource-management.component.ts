import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { EquipmentListComponent } from './equipment-list.component';
import { ResourceAllocationComponent } from './resource-allocation.component';
import { ResourceUtilizationComponent } from './resource-utilization.component';
import { ResourceService } from '../../core/services/resource.service';
import { ToastService } from '../../core/services/toast.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-resource-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    EquipmentListComponent,
    ResourceAllocationComponent,
    ResourceUtilizationComponent,
    ToastComponent
  ],
  template: `
    <div class="container-fluid">
      <!-- Title & Action -->
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h1 class="h2 fw-bold mb-1 text-slate-800">Resource & Equipment Management</h1>
          <p class="text-muted mb-0">Track heavy machinery deployment, maintenance routines, and site operator allocations</p>
        </div>
        <button class="btn btn-bt-primary d-flex align-items-center gap-2" (click)="showAddModal = true">
          <mat-icon>add</mat-icon>
          <span>Add New Asset</span>
        </button>
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

    <!-- Add Asset Modal Overlay -->
    <div *ngIf="showAddModal" class="modal-backdrop fade show" style="background-color: rgba(0,0,0,0.5);"></div>
    <div *ngIf="showAddModal" class="modal d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">Add New Resource / Asset</h5>
            <button type="button" class="btn-close" (click)="showAddModal = false"></button>
          </div>
          <form [formGroup]="addResourceForm" (ngSubmit)="onCreateResource()">
            <div class="modal-body">
              <div class="mb-3">
                <label class="bt-form-label">Resource / Equipment Name</label>
                <input type="text" class="form-control bt-form-control" formControlName="resource_name" placeholder="e.g. Caterpillar Excavator #5">
              </div>
              <div class="mb-3">
                <label class="bt-form-label">Category</label>
                <select class="form-select bt-form-control" formControlName="category">
                  <option value="Heavy Machinery">Heavy Machinery</option>
                  <option value="Lifting Assets">Lifting Assets</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Power Systems">Power Systems</option>
                  <option value="General Equipment">General Equipment</option>
                </select>
              </div>
              <div class="row">
                <div class="col-6 mb-3">
                  <label class="bt-form-label">Quantity</label>
                  <input type="number" class="form-control bt-form-control" formControlName="quantity" min="1">
                </div>
                <div class="col-6 mb-3">
                  <label class="bt-form-label">Initial Status</label>
                  <select class="form-select bt-form-control" formControlName="status">
                    <option value="Available">Available</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="showAddModal = false">Cancel</button>
              <button type="submit" class="btn btn-bt-primary" [disabled]="addResourceForm.invalid || isSubmitting">
                <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                <span>Save Asset</span>
              </button>
            </div>
          </form>
        </div>
      </div>
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

  showAddModal = false;
  isSubmitting = false;
  addResourceForm!: FormGroup;

  cards = [
    { title: 'Total Assets', value: '0', icon: 'precision_manufacturing', color: '#ff7a00' },
    { title: 'Active Deployments', value: '0', icon: 'engineering', color: '#10b981' },
    { title: 'Maintenance Queue', value: '0', icon: 'build', color: '#ef4444' }
  ];

  constructor(
    private resourceService: ResourceService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.addResourceForm = this.fb.group({
      resource_name: ['', Validators.required],
      category: ['Heavy Machinery', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      status: ['Available', Validators.required]
    });
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

  onCreateResource(): void {
    if (this.addResourceForm.invalid) return;

    this.isSubmitting = true;
    this.resourceService.createResource(this.addResourceForm.value).subscribe({
      next: (created) => {
        this.isSubmitting = false;
        this.showAddModal = false;
        this.toastService.showSuccess(`Asset ${created.name} added successfully!`);
        this.addResourceForm.reset({
          resource_name: '',
          category: 'Heavy Machinery',
          quantity: 1,
          status: 'Available'
        });
        this.onAllocationUpdated();
      },
      error: () => {
        this.isSubmitting = false;
        this.toastService.showError('Failed to create resource asset.');
      }
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

