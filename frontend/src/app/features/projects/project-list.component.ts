import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProjectService } from '../../core/services/project.service';
import { ToastService } from '../../core/services/toast.service';
import { Project } from '../../core/interfaces/project.interface';
import { ProjectFormComponent } from './project-form.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    ProjectFormComponent,
    ToastComponent
  ],
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

      <!-- Loading State -->
      <div *ngIf="isLoadingList" class="d-flex flex-column align-items-center justify-content-center py-5">
        <span class="spinner-border text-warning mb-2" role="status"></span>
        <span class="text-muted text-sm">Loading project ledger...</span>
      </div>

      <!-- Projects Grid -->
      <div class="row g-4" *ngIf="!isLoadingList">
        <div class="col-12 col-md-6 col-lg-4" *ngFor="let proj of paginatedProjects">
          <div class="bt-card h-100 d-flex flex-column justify-content-between">
            <div>
              <div class="d-flex justify-content-between align-items-start">
                <span class="badge bg-light text-dark text-xs border border-secondary border-opacity-10">{{ proj.category }}</span>
                <div class="d-flex gap-1 align-items-center">
                  <span class="bt-badge text-xxs" 
                        [class.bt-badge-success]="proj.status === 'On Track' || proj.status === 'Completed'" 
                        [class.bt-badge-warning]="proj.status === 'Delayed'" 
                        [class.bt-badge-danger]="proj.status === 'Critical'">
                    {{ proj.status }}
                  </span>
                </div>
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
              <div class="d-flex align-items-center gap-2">
                <button type="button" class="btn btn-sm btn-bt-outline py-1 px-2 border-0 text-muted" (click)="openEditModal(proj)">
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">edit</mat-icon>
                </button>
                <button type="button" class="btn btn-sm btn-bt-outline py-1 px-2 border-0 text-danger" (click)="confirmDelete(proj)">
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">delete</mat-icon>
                </button>
                <a [routerLink]="['/projects', proj.id]" class="btn btn-sm btn-bt-outline py-1 px-3 d-flex align-items-center gap-1 text-xs">
                  <span>View Workspace</span>
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">arrow_forward</mat-icon>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div class="col-12 text-center py-5" *ngIf="filteredProjects.length === 0">
          <mat-icon class="text-muted fs-1 mb-2" style="width: 40px; height: 40px;">folder_open</mat-icon>
          <p class="text-muted mb-0">No matching projects found in ledger.</p>
        </div>
      </div>

      <!-- Pagination Footer -->
      <div class="d-flex justify-content-between align-items-center mt-4 border-top border-light pt-3" *ngIf="!isLoadingList && totalPages > 1">
        <span class="text-muted text-xs">Showing {{ (currentPage-1)*pageSize + 1 }} - {{ Math.min(currentPage*pageSize, filteredProjects.length) }} of {{ filteredProjects.length }}</span>
        <div class="d-inline-flex gap-2">
          <button class="btn btn-sm btn-bt-outline py-1 px-3" [disabled]="currentPage === 1" (click)="changePage(currentPage - 1)">
            Previous
          </button>
          <button class="btn btn-sm btn-bt-outline py-1 px-3" [disabled]="currentPage === totalPages" (click)="changePage(currentPage + 1)">
            Next
          </button>
        </div>
      </div>

      <!-- Reusable Project Form Child Component -->
      <app-project-form *ngIf="showFormModal" 
                        [project]="selectedProject" 
                        [isLoading]="isSaving"
                        (save)="onSaveProject($event)" 
                        (cancel)="closeFormModal()">
      </app-project-form>

      <!-- Delete Confirmation Dialog -->
      <div *ngIf="showDeleteConfirm" class="modal-overlay d-flex align-items-center justify-content-center">
        <div class="modal-card bg-white p-4 rounded shadow-lg fade-in" style="width: 400px; max-width: 90%;">
          <h5 class="fw-bold mb-2 text-danger d-flex align-items-center gap-2">
            <mat-icon>warning</mat-icon>
            <span>Delete Project</span>
          </h5>
          <p class="text-muted text-sm mb-4">Are you absolutely sure you want to delete project <strong>{{ selectedProject?.name }}</strong>? This action is irreversible.</p>
          <div class="d-flex justify-content-end gap-2 border-top border-light pt-3">
            <button class="btn btn-bt-outline py-2" (click)="closeDeleteModal()" [disabled]="isDeleting">Cancel</button>
            <button class="btn btn-danger py-2 d-flex align-items-center gap-1 text-white border-0" (click)="onDeleteProject()" [disabled]="isDeleting" style="background-color: #ef4444;">
              <span *ngIf="isDeleting" class="spinner-border spinner-border-sm" role="status"></span>
              <span>Confirm Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <app-toast></app-toast>
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
    }
  `]
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  paginatedProjects: Project[] = [];

  // Filters State
  searchTerm = '';
  selectedCategory = 'All';
  selectedStatus = 'All';

  // Pagination State
  currentPage = 1;
  pageSize = 3;
  totalPages = 1;
  Math = Math; // reference Math inside template

  // Loading indicators
  isLoadingList = false;
  isSaving = false;
  isDeleting = false;

  // Modals state
  showFormModal = false;
  showDeleteConfirm = false;
  selectedProject: Project | null = null;

  constructor(
    private projectService: ProjectService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.isLoadingList = true;
    this.projectService.getProjects().subscribe({
      next: (list) => {
        this.projects = list;
        this.applyFilters();
        this.isLoadingList = false;
      },
      error: () => {
        this.isLoadingList = false;
        this.toastService.showError('Failed to load project portfolio.');
      }
    });
  }

  applyFilters(): void {
    this.filteredProjects = this.projects.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(this.searchTerm);
      const matchCategory = this.selectedCategory === 'All' || p.category === this.selectedCategory;
      const matchStatus = this.selectedStatus === 'All' || p.status === this.selectedStatus;
      return matchSearch && matchCategory && matchStatus;
    });
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProjects.length / this.pageSize) || 1;
    const startIdx = (this.currentPage - 1) * this.pageSize;
    this.paginatedProjects = this.filteredProjects.slice(startIdx, startIdx + this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
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

  openAddModal(): void {
    this.selectedProject = null;
    this.showFormModal = true;
  }

  openEditModal(project: Project): void {
    this.selectedProject = { ...project };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.selectedProject = null;
  }

  confirmDelete(project: Project): void {
    this.selectedProject = project;
    this.showDeleteConfirm = true;
  }

  closeDeleteModal(): void {
    this.showDeleteConfirm = false;
    this.selectedProject = null;
  }

  onSaveProject(formValue: any): void {
    this.isSaving = true;
    if (this.selectedProject) {
      // Edit mode
      const updated: Project = {
        ...this.selectedProject,
        ...formValue
      };
      this.projectService.updateProject(updated).subscribe({
        next: () => {
          this.isSaving = false;
          this.toastService.showSuccess('Project details updated successfully.');
          this.loadProjects();
          this.closeFormModal();
        },
        error: () => {
          this.isSaving = false;
          this.toastService.showError('Failed to save project changes.');
        }
      });
    } else {
      // Create mode
      this.projectService.createProject(formValue).subscribe({
        next: () => {
          this.isSaving = false;
          this.toastService.showSuccess('New construction project created.');
          this.loadProjects();
          this.closeFormModal();
        },
        error: () => {
          this.isSaving = false;
          this.toastService.showError('Failed to create new project.');
        }
      });
    }
  }

  onDeleteProject(): void {
    if (this.selectedProject) {
      this.isDeleting = true;
      this.projectService.deleteProject(this.selectedProject.id).subscribe({
        next: (success) => {
          this.isDeleting = false;
          if (success) {
            this.toastService.showSuccess('Project deleted successfully.');
            this.loadProjects();
          } else {
            this.toastService.showError('Unable to delete project.');
          }
          this.closeDeleteModal();
        },
        error: () => {
          this.isDeleting = false;
          this.toastService.showError('Error executing deletion request.');
          this.closeDeleteModal();
        }
      });
    }
  }
}
