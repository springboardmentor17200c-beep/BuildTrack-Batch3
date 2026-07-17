import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Project } from '../../core/interfaces/project.interface';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="modal-overlay d-flex align-items-center justify-content-center">
      <div class="modal-card bg-white p-4 rounded shadow-lg fade-in" style="width: 500px; max-width: 95%;">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bold mb-0 text-slate-800">{{ project ? 'Edit Construction Project' : 'Create Construction Project' }}</h5>
          <button type="button" class="btn-close-custom" (click)="onCancel()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        
        <form [formGroup]="projectForm" (ngSubmit)="onSubmit()">
          <!-- Name -->
          <div class="mb-3">
            <label class="bt-form-label">Project Name</label>
            <input type="text" class="form-control bt-form-control" formControlName="name" placeholder="e.g. Oakridge Housing"
                   [class.is-invalid]="submitted && f['name'].errors">
            <div *ngIf="submitted && f['name'].errors" class="invalid-feedback text-xs">
              <span>Project name is required</span>
            </div>
          </div>
          
          <!-- Category & Budget -->
          <div class="row mb-3 g-2">
            <div class="col-6">
              <label class="bt-form-label">Category</label>
              <select class="form-select bt-form-control" formControlName="category">
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Government Projects">Government Projects</option>
              </select>
            </div>
            <div class="col-6">
              <label class="bt-form-label">Budget</label>
              <input type="text" class="form-control bt-form-control" formControlName="budget" placeholder="e.g. $1.2M"
                     [class.is-invalid]="submitted && f['budget'].errors">
              <div *ngIf="submitted && f['budget'].errors" class="invalid-feedback text-xs">
                <span>Budget is required</span>
              </div>
            </div>
          </div>
          
          <!-- Dates -->
          <div class="row mb-3 g-2">
            <div class="col-6">
              <label class="bt-form-label">Start Date</label>
              <input type="date" class="form-control bt-form-control" formControlName="startDate"
                     [class.is-invalid]="submitted && f['startDate'].errors">
              <div *ngIf="submitted && f['startDate'].errors" class="invalid-feedback text-xs">
                <span>Start date is required</span>
              </div>
            </div>
            <div class="col-6">
              <label class="bt-form-label">Target Completion</label>
              <input type="date" class="form-control bt-form-control" formControlName="endDate"
                     [class.is-invalid]="submitted && f['endDate'].errors">
              <div *ngIf="submitted && f['endDate'].errors" class="invalid-feedback text-xs">
                <span>Completion date is required</span>
              </div>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="d-flex justify-content-end gap-2 mt-4 border-top border-light pt-3">
            <button type="button" class="btn btn-bt-outline py-2" (click)="onCancel()" [disabled]="isLoading">Cancel</button>
            <button type="submit" class="btn btn-bt-primary py-2 d-flex align-items-center gap-1" [disabled]="isLoading || projectForm.invalid">
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
              <span>{{ project ? 'Save Changes' : 'Create Project' }}</span>
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
export class ProjectFormComponent implements OnInit {
  @Input() project: Project | null = null;
  @Input() isLoading = false;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  projectForm!: FormGroup;
  submitted = false;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.projectForm = this.formBuilder.group({
      name: [this.project ? this.project.name : '', Validators.required],
      category: [this.project ? this.project.category : 'Residential', Validators.required],
      budget: [this.project ? this.project.budget : '', Validators.required],
      startDate: [this.project ? this.project.startDate : '', Validators.required],
      endDate: [this.project ? this.project.endDate : '', Validators.required]
    });
  }

  get f() { return this.projectForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    if (this.projectForm.invalid) {
      return;
    }

    this.save.emit(this.projectForm.value);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
