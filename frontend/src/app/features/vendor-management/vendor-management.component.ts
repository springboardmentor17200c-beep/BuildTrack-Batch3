import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { VendorService } from '../../core/services/vendor.service';
import { ToastService } from '../../core/services/toast.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { VendorRecord } from '../../core/interfaces/vendor-management.interface';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-vendor-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatTabsModule,
    ToastComponent
  ],
  template: `
    <div class="container-fluid">
      <!-- Title -->
      <div class="mb-4">
        <h1 class="h2 fw-bold mb-1 text-slate-800">Vendor & Supplier Directory</h1>
        <p class="text-muted mb-0">Manage verified contractors, specialty construction material suppliers, ratings, and contact info.</p>
      </div>

      <!-- Tabs -->
      <mat-tab-group class="bg-white rounded shadow-sm p-3" [selectedIndex]="activeTab">
        <!-- Tab 1: Directory Cards Grid -->
        <mat-tab label="All Suppliers">
          <div class="p-3">
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
              <div class="d-flex gap-2">
                <input type="text" class="form-control form-control-sm bt-search-input" placeholder="Search supplier or materials..." 
                       [(ngModel)]="searchQuery" (input)="filterVendors()">
              </div>
              <button class="btn btn-bt-primary btn-sm d-flex align-items-center gap-1" (click)="openAddMode()" *ngIf="canManage">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">add</mat-icon>
                <span>Add Vendor</span>
              </button>
            </div>

            <!-- List Grid -->
            <div class="row g-3">
              <div class="col-12 col-md-6 col-lg-4" *ngFor="let vendor of filteredVendors">
                <div class="bt-card h-100 position-relative">
                  <!-- Actions -->
                  <div class="position-absolute top-0 end-0 p-2 d-flex gap-1" *ngIf="canManage">
                    <button class="btn btn-link text-primary p-1" (click)="openEditMode(vendor)">
                      <mat-icon style="font-size: 18px; width: 18px; height: 18px;">edit</mat-icon>
                    </button>
                    <button class="btn btn-link text-danger p-1" (click)="deleteVendor(vendor.id)" *ngIf="isAdmin">
                      <mat-icon style="font-size: 18px; width: 18px; height: 18px;">delete</mat-icon>
                    </button>
                  </div>

                  <div class="d-flex align-items-center gap-3 mb-3">
                    <div class="avatar-circle-sm bg-warning-subtle text-warning fw-bold d-flex justify-content-center align-items-center" style="width: 48px; height: 48px; border-radius: 8px;">
                      <mat-icon>store</mat-icon>
                    </div>
                    <div style="max-width: 70%;">
                      <h6 class="fw-bold mb-0 text-slate-800 text-truncate">{{ vendor.vendorName }}</h6>
                      <span class="text-xs text-muted text-truncate d-inline-block w-100">{{ vendor.materials || 'Construction Materials' }}</span>
                    </div>
                  </div>

                  <div class="d-flex flex-column gap-2 text-xs mb-3">
                    <div class="d-flex align-items-center gap-2 text-muted">
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">person</mat-icon>
                      <span>{{ vendor.contactPerson || 'Unknown Contact' }}</span>
                    </div>
                    <div class="d-flex align-items-center gap-2 text-muted">
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">phone</mat-icon>
                      <span>{{ vendor.phone || '+1 555-0100' }}</span>
                    </div>
                    <div class="d-flex align-items-center gap-2 text-muted">
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">email</mat-icon>
                      <span class="text-truncate" style="max-width: 180px;">{{ vendor.email || 'sales@vendor.com' }}</span>
                    </div>
                  </div>

                  <!-- Footer Metrics -->
                  <div class="d-flex justify-content-between align-items-center border-top pt-2 text-xs">
                    <div class="d-flex align-items-center gap-1">
                      <mat-icon class="text-warning" style="font-size: 16px; width: 16px; height: 16px;">star</mat-icon>
                      <span class="fw-bold">{{ vendor.rating }}/5</span>
                    </div>
                    <span class="badge" [class.bg-success-subtle]="vendor.isActive" [class.text-success]="vendor.isActive"
                          [class.bg-secondary-subtle]="!vendor.isActive" [class.text-secondary]="!vendor.isActive">
                      {{ vendor.isActive ? 'Active Supplier' : 'Suspended' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Empty state -->
              <div *ngIf="filteredVendors.length === 0" class="text-center py-5 text-muted col-12">
                <mat-icon class="display-6">storefront</mat-icon>
                <p class="mt-2 text-sm">No verified suppliers logged.</p>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Tab 2: Add / Edit Form -->
        <mat-tab [label]="editMode ? 'Edit Vendor Form' : 'Register Supplier Form'" *ngIf="canManage">
          <div class="p-3" style="max-width: 650px;">
            <h5 class="fw-bold mb-3 text-slate-800">{{ editMode ? 'Modify Vendor Profile' : 'New Supplier Registration' }}</h5>
            <form [formGroup]="vendorForm" (ngSubmit)="onSubmit()" class="d-flex flex-column gap-3">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="bt-form-label">Vendor Name</label>
                  <input type="text" class="form-control bt-form-control" formControlName="vendorName" placeholder="e.g. Apex Steel & Structures">
                  <div *ngIf="submitted && f['vendorName'].errors" class="text-danger text-xs mt-1">Vendor name is required.</div>
                </div>

                <div class="col-md-6">
                  <label class="bt-form-label">Contact Person</label>
                  <input type="text" class="form-control bt-form-control" formControlName="contactPerson" placeholder="e.g. Marcus Vance">
                </div>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="bt-form-label">Phone Line</label>
                  <input type="text" class="form-control bt-form-control" formControlName="phone" placeholder="e.g. +1 555-0100">
                </div>

                <div class="col-md-6">
                  <label class="bt-form-label">Email Address</label>
                  <input type="email" class="form-control bt-form-control" formControlName="email" placeholder="e.g. orders@apexsteel.com">
                </div>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="bt-form-label">Materials Supplied Specialties</label>
                  <input type="text" class="form-control bt-form-control" formControlName="materials" placeholder="e.g. Rebars, structural steel beams">
                </div>

                <div class="col-md-6">
                  <label class="bt-form-label">Rating Value</label>
                  <input type="number" class="form-control bt-form-control" formControlName="rating" min="1" max="5" step="0.1">
                </div>
              </div>

              <div class="row g-3">
                <div class="col-md-12">
                  <label class="bt-form-label">Full Address Location</label>
                  <textarea class="form-control bt-form-control" formControlName="address" rows="2" placeholder="e.g. Industrial East Area, Suite A"></textarea>
                </div>
              </div>

              <div class="form-check form-switch mt-2">
                <input class="form-check-input" type="checkbox" id="vendorActiveSwitch" formControlName="isActive">
                <label class="form-check-label text-sm fw-medium text-slate-700" for="vendorActiveSwitch">Verified Active Status</label>
              </div>

              <div class="d-flex gap-2 mt-3">
                <button type="button" class="btn btn-bt-outline w-50 py-3" (click)="resetForm()">Cancel</button>
                <button type="submit" class="btn btn-bt-primary w-50 py-3" [disabled]="loading">
                  <span>{{ editMode ? 'Save Profile' : 'Register Supplier' }}</span>
                </button>
              </div>
            </form>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
    <app-toast></app-toast>
  `,
  styles: [`
    .text-xs { font-size: 0.8rem; }
    .text-xxs { font-size: 0.72rem; }
    .text-sm { font-size: 0.9rem; }
  `]
})
export class VendorManagementComponent implements OnInit {
  vendors: VendorRecord[] = [];
  filteredVendors: VendorRecord[] = [];
  vendorForm!: FormGroup;

  activeTab = 0;
  submitted = false;
  loading = false;
  editMode = false;
  selectedVendorId: number | null = null;

  searchQuery = '';

  // Roles
  canManage = false;
  isAdmin = false;

  constructor(
    private fb: FormBuilder,
    private vendorService: VendorService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const role = this.authService.currentUserValue?.role || '';
    this.isAdmin = role === 'Admin';
    this.canManage = role === 'Admin' || role === 'Project Manager';

    this.initForm();
    this.loadData();
  }

  initForm(): void {
    this.vendorForm = this.fb.group({
      vendorName: ['', Validators.required],
      contactPerson: [''],
      phone: [''],
      email: ['', Validators.email],
      materials: [''],
      rating: [5.0],
      address: [''],
      isActive: [true]
    });
  }

  get f() { return this.vendorForm.controls; }

  loadData(): void {
    this.vendorService.getVendors().subscribe(list => {
      this.vendors = list;
      this.filterVendors();
    });
  }

  filterVendors(): void {
    this.filteredVendors = this.vendors.filter(v => {
      const q = this.searchQuery.toLowerCase();
      return v.vendorName.toLowerCase().includes(q) ||
             (v.materials || '').toLowerCase().includes(q);
    });
  }

  openAddMode(): void {
    this.editMode = false;
    this.selectedVendorId = null;
    this.vendorForm.reset({
      rating: 5.0,
      isActive: true
    });
    this.activeTab = 1;
  }

  openEditMode(vendor: VendorRecord): void {
    this.editMode = true;
    this.selectedVendorId = vendor.id;
    this.vendorForm.patchValue({
      vendorName: vendor.vendorName,
      contactPerson: vendor.contactPerson,
      phone: vendor.phone,
      email: vendor.email,
      materials: vendor.materials,
      rating: vendor.rating,
      address: vendor.address,
      isActive: vendor.isActive
    });
    this.activeTab = 1;
  }

  resetForm(): void {
    this.editMode = false;
    this.selectedVendorId = null;
    this.submitted = false;
    this.vendorForm.reset({
      rating: 5.0,
      isActive: true
    });
    this.activeTab = 0;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.vendorForm.invalid) return;

    this.loading = true;
    const val = this.vendorForm.value;

    const payload: Omit<VendorRecord, 'id'> = {
      vendorName: val.vendorName,
      contactPerson: val.contactPerson,
      phone: val.phone,
      email: val.email,
      materials: val.materials,
      rating: Number(val.rating) || 5.0,
      address: val.address,
      isActive: val.isActive
    };

    if (this.editMode && this.selectedVendorId) {
      this.vendorService.updateVendor(this.selectedVendorId, payload).subscribe({
        next: () => {
          this.loading = false;
          this.toastService.showSuccess('Supplier profile saved successfully.');
          this.resetForm();
          this.loadData();
        },
        error: () => {
          this.loading = false;
          this.toastService.showError('Failed to update vendor.');
        }
      });
    } else {
      this.vendorService.createVendor(payload).subscribe({
        next: () => {
          this.loading = false;
          this.toastService.showSuccess('New vendor registered successfully.');
          this.resetForm();
          this.loadData();
        },
        error: () => {
          this.loading = false;
          this.toastService.showError('Failed to register vendor.');
        }
      });
    }
  }

  deleteVendor(id: number): void {
    if (confirm('Are you sure you want to delete this supplier from the index?')) {
      this.vendorService.deleteVendor(id).subscribe(success => {
        if (success) {
          this.toastService.showSuccess('Supplier profile deleted.');
          this.loadData();
        } else {
          this.toastService.showError('Failed to delete vendor.');
        }
      });
    }
  }
}
