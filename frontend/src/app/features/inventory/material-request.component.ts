import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { InventoryService } from '../../core/services/inventory.service';
import { ToastService } from '../../core/services/toast.service';
import { MaterialRequest } from '../../core/interfaces/inventory.interface';

@Component({
  selector: 'app-material-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="row g-4">
      <!-- Request form -->
      <div class="col-12 col-lg-5">
        <div class="border border-secondary border-opacity-10 rounded p-4 bg-white shadow-sm">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0 text-slate-800">Requisition Request</h5>
            <mat-icon class="text-warning">local_shipping</mat-icon>
          </div>

          <form [formGroup]="requestForm" (ngSubmit)="onRequest()">
            <!-- Item Name -->
            <div class="mb-3">
              <label class="bt-form-label">Material / Item Name</label>
              <input type="text" class="form-control bt-form-control" formControlName="item" placeholder="e.g. Portland Cement"
                     [class.is-invalid]="submitted && f['item'].errors">
              <div *ngIf="submitted && f['item'].errors" class="invalid-feedback text-xs">
                <span>Material item is required</span>
              </div>
            </div>

            <!-- Qty -->
            <div class="row mb-3 g-2">
              <div class="col-6">
                <label class="bt-form-label">Quantity Needed</label>
                <input type="text" class="form-control bt-form-control" formControlName="qty" placeholder="e.g. 500 Bags"
                       [class.is-invalid]="submitted && f['qty'].errors">
                <div *ngIf="submitted && f['qty'].errors" class="invalid-feedback text-xs">
                  <span>Quantity is required</span>
                </div>
              </div>
              
              <div class="col-6">
                <label class="bt-form-label">Target Project Site</label>
                <select class="form-select bt-form-control" formControlName="project">
                  <option value="Metropolitan Commercial Plaza">Metropolitan Commercial Plaza</option>
                  <option value="Riverside Residential Township">Riverside Residential Township</option>
                  <option value="Industrial Cold Storage Unit">Industrial Cold Storage Unit</option>
                  <option value="State Highway Bypass Route">State Highway Bypass Route</option>
                </select>
              </div>
            </div>

            <!-- Requested By -->
            <div class="mb-3">
              <label class="bt-form-label">Requested By</label>
              <input type="text" class="form-control bt-form-control" formControlName="requestedBy" placeholder="e.g. Marcus Vance"
                     [class.is-invalid]="submitted && f['requestedBy'].errors">
              <div *ngIf="submitted && f['requestedBy'].errors" class="invalid-feedback text-xs">
                <span>Your name is required</span>
              </div>
            </div>

            <!-- Date & Vendor -->
            <div class="row mb-3 g-2">
              <div class="col-6">
                <label class="bt-form-label">Required Date</label>
                <input type="date" class="form-control bt-form-control" formControlName="requiredDate"
                       [class.is-invalid]="submitted && f['requiredDate'].errors">
                <div *ngIf="submitted && f['requiredDate'].errors" class="invalid-feedback text-xs">
                  <span>Date is required</span>
                </div>
              </div>
              
              <div class="col-6">
                <label class="bt-form-label">Preferred Supplier</label>
                <input type="text" class="form-control bt-form-control" formControlName="vendor" placeholder="e.g. Apex ReadyMix">
              </div>
            </div>

            <button type="submit" class="btn btn-bt-primary w-100 py-3 mt-2 d-flex align-items-center justify-content-center gap-2" [disabled]="isLoading">
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
              <mat-icon *ngIf="!isLoading">shopping_cart</mat-icon>
              <span>Submit Request</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Requests queue grid -->
      <div class="col-12 col-lg-7">
        <div class="border border-secondary border-opacity-10 rounded p-4 bg-white shadow-sm h-100">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0 text-slate-800">Requisitions & Purchase Requests</h5>
            <span class="badge bg-light text-dark border border-secondary border-opacity-10 text-xs">Order Queue</span>
          </div>

          <div class="table-responsive">
            <table class="table align-middle text-sm mb-0">
              <thead class="table-light text-muted uppercase text-xs">
                <tr>
                  <th>Item Name</th>
                  <th>Quantity</th>
                  <th>Site Project</th>
                  <th>Req. Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let req of requests">
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <mat-icon class="text-slate-500">assignment</mat-icon>
                      <span class="fw-semibold text-slate-800">{{ req.item }}</span>
                    </div>
                  </td>
                  <td>{{ req.qty }}</td>
                  <td>{{ req.project }}</td>
                  <td>{{ req.requiredDate || 'N/A' }}</td>
                  <td>
                    <span class="bt-badge text-xxs" 
                          [class.bt-badge-success]="req.status === 'Approved'" 
                          [class.bt-badge-warning]="req.status === 'Pending'" 
                          [class.bt-badge-danger]="req.status === 'Rejected'">
                      {{ req.status }}
                    </span>
                  </td>
                </tr>
                <tr *ngIf="requests.length === 0">
                  <td colspan="5" class="text-center py-4 text-muted">No request logs recorded.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-xs { font-size: 0.8rem; }
    .text-xxs { font-size: 0.72rem; }
  `]
})
export class MaterialRequestComponent implements OnInit {
  requestForm!: FormGroup;
  submitted = false;
  isLoading = false;
  requests: MaterialRequest[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private inventoryService: InventoryService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.requestForm = this.formBuilder.group({
      item: ['', Validators.required],
      qty: ['', Validators.required],
      project: ['Metropolitan Commercial Plaza', Validators.required],
      requestedBy: ['', Validators.required],
      requiredDate: ['', Validators.required],
      vendor: ['']
    });
    this.loadData();
  }

  loadData(): void {
    this.inventoryService.getRequests().subscribe(list => {
      this.requests = list;
    });
  }

  get f() { return this.requestForm.controls; }

  onRequest(): void {
    this.submitted = true;

    if (this.requestForm.invalid) {
      return;
    }

    this.isLoading = true;
    const formVal = this.requestForm.value;

    this.inventoryService.createRequest(formVal).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.showSuccess('Material requisition order request dispatched successfully.');
        this.requestForm.reset({
          item: '',
          qty: '',
          project: 'Metropolitan Commercial Plaza',
          requestedBy: '',
          requiredDate: '',
          vendor: ''
        });
        this.submitted = false;
        this.loadData();
      },
      error: () => {
        this.isLoading = false;
        this.toastService.showError('Failed to dispatch requisition order.');
      }
    });
  }
}
