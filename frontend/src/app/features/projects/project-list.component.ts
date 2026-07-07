import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface Project {
  id: number;
  name: string;
  category: 'Residential' | 'Commercial' | 'Industrial' | 'Infrastructure' | 'Government Projects';
  progress: number;
  budget: string;
  startDate: string;
  endDate: string;
  status: 'On Track' | 'Delayed' | 'Critical' | 'Completed';
}

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatIconModule, MatButtonModule],
  template: `
    <div class="container-fluid">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 class="h2 fw-bold mb-1 text-slate-800">Project Portfolio</h1>
          <p class="text-muted mb-0">Browse and manage active construction projects across all categories</p>
        </div>
        <button class="btn btn-bt-primary btn-sm" (click)="openAddModal()">
          <mat-icon style="font-size: 18px; width: 18px; height: 18px;">add_box</mat-icon>
          <span>Create Project</span>
        </button>
      </div>

      <!-- Filters Row -->
      <div class="bt-card py-3 px-4 mb-4">
        <div class="row align-items-center g-3">
          <div class="col-12 col-md-5">
            <label class="bt-form-label">Search Project</label>
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0 text-muted">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">search</mat-icon>
              </span>
              <input type="text" class="form-control border-start-0 ps-0 bt-form-control" 
                     placeholder="Search by name..." (input)="onSearch($event)">
            </div>
          </div>
          
          <div class="col-12 col-md-4">
            <label class="bt-form-label">Filter by Category</label>
            <select class="form-select bt-form-control" (change)="onFilterCategory($event)">
              <option value="All">All Categories</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Government Projects">Government Projects</option>
            </select>
          </div>

          <div class="col-12 col-md-3">
            <label class="bt-form-label">Filter by Status</label>
            <select class="form-select bt-form-control" (change)="onFilterStatus($event)">
              <option value="All">All Statuses</option>
              <option value="On Track">On Track</option>
              <option value="Delayed">Delayed</option>
              <option value="Critical">Critical</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Projects Grid -->
      <div class="row g-4">
        <div class="col-12 col-md-6 col-lg-4" *ngFor="let proj of filteredProjects">
          <div class="bt-card h-100 d-flex flex-column justify-content-between">
            <div>
              <div class="d-flex justify-content-between align-items-start">
                <span class="badge bg-light text-dark text-xs border border-secondary border-opacity-10">{{ proj.category }}</span>
                <span class="bt-badge text-xxs" 
                      [class.bt-badge-success]="proj.status === 'On Track' || proj.status === 'Completed'" 
                      [class.bt-badge-warning]="proj.status === 'Delayed'" 
                      [class.bt-badge-danger]="proj.status === 'Critical'">
                  {{ proj.status }}
                </span>
              </div>
              <h5 class="fw-bold text-slate-800 mt-3 mb-2">{{ proj.name }}</h5>
              <div class="d-flex justify-content-between text-xs text-muted mb-3">
                <span>Start: {{ proj.startDate }}</span>
                <span>End: {{ proj.endDate }}</span>
              </div>

              <!-- Progress bar -->
              <div class="d-flex align-items-center gap-2 mb-3">
                <div class="progress flex-grow-1" style="height: 6px;">
                  <div class="progress-bar bg-warning" role="progressbar" [style.width]="proj.progress + '%'"></div>
                </div>
                <span class="text-xs fw-bold">{{ proj.progress }}%</span>
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center border-top border-light pt-3 mt-auto">
              <div>
                <span class="text-muted text-xxs text-uppercase fw-semibold">Budget Limit</span>
                <h6 class="fw-bold text-dark mb-0">{{ proj.budget }}</h6>
              </div>
              <a [routerLink]="['/projects', proj.id]" class="btn btn-sm btn-bt-outline py-1 px-3 d-flex align-items-center gap-1 text-xs">
                <span>View Workspace</span>
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">arrow_forward</mat-icon>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Project Modal -->
      <div *ngIf="showAddModal" class="modal-overlay d-flex align-items-center justify-content-center">
        <div class="modal-card bg-white p-4 rounded shadow-lg" style="width: 500px;">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0">Create Construction Project</h5>
            <button class="btn-close-custom" (click)="closeModal()">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <form [formGroup]="projectForm" (ngSubmit)="saveProject()">
            <div class="mb-3">
              <label class="bt-form-label">Project Name</label>
              <input type="text" class="form-control bt-form-control" formControlName="name" placeholder="e.g. Oakridge Housing">
            </div>
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
                <input type="text" class="form-control bt-form-control" formControlName="budget" placeholder="e.g. $1.2M">
              </div>
            </div>
            <div class="row mb-3 g-2">
              <div class="col-6">
                <label class="bt-form-label">Start Date</label>
                <input type="date" class="form-control bt-form-control" formControlName="startDate">
              </div>
              <div class="col-6">
                <label class="bt-form-label">Target Completion</label>
                <input type="date" class="form-control bt-form-control" formControlName="endDate">
              </div>
            </div>
            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-bt-outline py-2" (click)="closeModal()">Cancel</button>
              <button type="submit" class="btn btn-bt-primary py-2" [disabled]="projectForm.invalid">Create</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-xxs { font-size: 0.72rem; }
    .text-xs { font-size: 0.8rem; }
    .text-sm { font-size: 0.9rem; }
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
      animation: fadeIn 0.3s ease;
    }
    .btn-close-custom {
      background: transparent;
      border: none;
      color: var(--slate-400);
      cursor: pointer;
    }
    .btn-close-custom:hover {
      color: var(--slate-800);
    }
  `]
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [
    { id: 1, name: 'Metropolitan Commercial Plaza', category: 'Commercial', progress: 85, budget: '$1.5M', startDate: '2026-01-10', endDate: '2026-09-15', status: 'On Track' },
    { id: 2, name: 'Riverside Residential Township', category: 'Residential', progress: 48, budget: '$2.0M', startDate: '2026-02-15', endDate: '2026-12-20', status: 'Delayed' },
    { id: 3, name: 'Industrial Cold Storage Unit', category: 'Industrial', progress: 92, budget: '$800k', startDate: '2026-03-01', endDate: '2026-08-30', status: 'On Track' },
    { id: 4, name: 'State Highway Bypass Route', category: 'Infrastructure', progress: 24, budget: '$3.5M', startDate: '2026-04-10', endDate: '2027-06-30', status: 'Critical' },
    { id: 5, name: 'Metro Line Bridge Foundations', category: 'Government Projects', progress: 60, budget: '$5.0M', startDate: '2025-11-01', endDate: '2026-11-30', status: 'On Track' }
  ];

  filteredProjects: Project[] = [];
  searchTerm = '';
  selectedCategory = 'All';
  selectedStatus = 'All';

  showAddModal = false;
  projectForm!: FormGroup;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.filteredProjects = [...this.projects];
    this.initProjectForm();
  }

  initProjectForm(): void {
    this.projectForm = this.formBuilder.group({
      name: ['', Validators.required],
      category: ['Residential', Validators.required],
      budget: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
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

  onFilterStatus(event: any): void {
    this.selectedStatus = event.target.value;
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredProjects = this.projects.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(this.searchTerm);
      const matchCategory = this.selectedCategory === 'All' || p.category === this.selectedCategory;
      const matchStatus = this.selectedStatus === 'All' || p.status === this.selectedStatus;
      return matchSearch && matchCategory && matchStatus;
    });
  }

  openAddModal(): void {
    this.showAddModal = true;
  }

  closeModal(): void {
    this.showAddModal = false;
    this.projectForm.reset({ category: 'Residential' });
  }

  saveProject(): void {
    if (this.projectForm.valid) {
      const formVal = this.projectForm.value;
      const newProject: Project = {
        id: this.projects.length + 1,
        name: formVal.name,
        category: formVal.category,
        progress: 0,
        budget: formVal.budget,
        startDate: formVal.startDate,
        endDate: formVal.endDate,
        status: 'On Track'
      };
      this.projects.unshift(newProject);
      this.applyFilters();
      this.closeModal();
    }
  }
}
