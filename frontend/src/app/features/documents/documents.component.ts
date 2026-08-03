import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DocumentService } from '../../core/services/document.service';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { DocumentItem } from '../../core/interfaces/document.interface';
import { Project } from '../../core/interfaces/project.interface';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatIconModule, ToastComponent],
  template: `
    <div class="container-fluid">
      <!-- Title -->
      <div class="mb-4">
        <h1 class="h2 fw-bold mb-1 text-slate-800">Document Management & Blueprints</h1>
        <p class="text-muted mb-0">Upload construction contracts, architectural plans, structural designs, and manage files.</p>
      </div>

      <!-- Main Layout -->
      <div class="row g-4">
        <!-- Upload Form Card -->
        <div class="col-12 col-lg-4" *ngIf="canManage">
          <div class="bt-card">
            <h5 class="fw-bold mb-3 text-slate-800">Upload Site Document</h5>
            <form [formGroup]="uploadForm" (ngSubmit)="onSubmit()" class="d-flex flex-column gap-3">
              <div>
                <label class="bt-form-label">Project Association</label>
                <select class="form-select bt-form-control" formControlName="projectId">
                  <option value="" disabled selected>Select project...</option>
                  <option *ngFor="let proj of projects" [value]="proj.id">{{ proj.name }}</option>
                </select>
                <div *ngIf="submitted && f['projectId'].errors" class="text-danger text-xs mt-1">
                  Selecting a project is required.
                </div>
              </div>

              <div>
                <label class="bt-form-label">Document Title / File Name</label>
                <input type="text" class="form-control bt-form-control" formControlName="fileName" placeholder="e.g. Architectural Blueprint Phase 1">
                <div *ngIf="submitted && f['fileName'].errors" class="text-danger text-xs mt-1">
                  File name is required.
                </div>
              </div>

              <div>
                <label class="bt-form-label">Document Type</label>
                <select class="form-select bt-form-control" formControlName="fileType">
                  <option value="Blueprint / PDF">Architectural Blueprint / PDF</option>
                  <option value="Contract / DOCX">Contract Agreement / DOCX</option>
                  <option value="CAD Plan">CAD Layout Plan</option>
                  <option value="Inspection Sheet">Inspection Quality Check Sheet</option>
                </select>
              </div>

              <div>
                <label class="bt-form-label">Description / Remarks</label>
                <textarea class="form-control bt-form-control" formControlName="description" rows="3" placeholder="e.g. Final approved structural blueprints."></textarea>
              </div>

              <!-- Simulated File Choice Path -->
              <div>
                <label class="bt-form-label">Mock Upload File Path</label>
                <input type="text" class="form-control bt-form-control" formControlName="filePath" placeholder="e.g. /static/blueprints/phase1.pdf">
                <div *ngIf="submitted && f['filePath'].errors" class="text-danger text-xs mt-1">
                  Mock file path is required.
                </div>
              </div>

              <button type="submit" class="btn btn-bt-primary w-100 py-3 mt-2 d-flex align-items-center justify-content-center gap-2" [disabled]="loading">
                <span *ngIf="!loading">Store Document File</span>
                <span *ngIf="loading" class="spinner-border spinner-border-sm" role="status"></span>
                <mat-icon *ngIf="!loading">cloud_upload</mat-icon>
              </button>
            </form>
          </div>
        </div>

        <!-- Files List Board -->
        <div class="col-12" [class.col-lg-8]="canManage">
          <div class="bt-card">
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
              <h5 class="fw-bold mb-0 text-slate-800">Files Vault / Directory</h5>
              <div class="d-flex gap-2">
                <input type="text" class="form-control form-control-sm bt-search-input" placeholder="Search file names..." 
                       [(ngModel)]="searchQuery" (input)="filterDocuments()">
              </div>
            </div>

            <!-- Documents Queue Table -->
            <div class="table-responsive">
              <table class="table align-middle text-sm mb-0">
                <thead class="table-light text-muted uppercase text-xs">
                  <tr>
                    <th>Document</th>
                    <th>Classification</th>
                    <th>Associated Project</th>
                    <th>Description</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let doc of filteredDocuments" class="hover-row">
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <mat-icon [class.text-primary]="doc.fileType.includes('PDF')" [class.text-info]="doc.fileType.includes('CAD')" class="text-slate-500">
                          {{ getFileIcon(doc.fileType) }}
                        </mat-icon>
                        <div class="d-flex flex-column">
                          <span class="fw-semibold text-slate-800">{{ doc.fileName }}</span>
                          <span class="text-xxs text-muted" *ngIf="doc.createdAt">{{ doc.createdAt | date }}</span>
                        </div>
                      </div>
                    </td>
                    <td><span class="badge bg-light text-dark border border-secondary border-opacity-10 text-xs">{{ doc.fileType }}</span></td>
                    <td>{{ doc.projectName }}</td>
                    <td><span class="text-xs text-muted text-truncate d-inline-block" style="max-width: 180px;">{{ doc.description || 'No description' }}</span></td>
                    <td class="text-end">
                      <div class="d-flex justify-content-end gap-1">
                        <a [href]="'http://127.0.0.1:8000' + doc.filePath" target="_blank" class="btn btn-xs btn-outline-primary py-1 px-2 text-xxs d-flex align-items-center gap-1">
                          <mat-icon style="font-size: 14px; width: 14px; height: 14px;">visibility</mat-icon>
                          <span>Open</span>
                        </a>
                        <button class="btn btn-link text-danger p-1" (click)="deleteDocument(doc.id)" *ngIf="isAdmin">
                          <mat-icon style="font-size: 18px; width: 18px; height: 18px;">delete</mat-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="filteredDocuments.length === 0">
                    <td colspan="5" class="text-center py-4 text-muted">No blueprints or contracts found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <app-toast></app-toast>
  `,
  styles: [`
    .text-xs { font-size: 0.8rem; }
    .text-xxs { font-size: 0.72rem; }
    .text-sm { font-size: 0.9rem; }
    .hover-row:hover { background-color: rgba(0, 0, 0, 0.015); }
    .btn-xs { font-size: 0.75rem; }
  `]
})
export class DocumentsComponent implements OnInit {
  documents: DocumentItem[] = [];
  filteredDocuments: DocumentItem[] = [];
  projects: Project[] = [];
  uploadForm!: FormGroup;
  submitted = false;
  loading = false;

  // Filters
  searchQuery = '';

  // Roles
  canManage = false;
  isAdmin = false;

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService,
    private projectService: ProjectService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const role = this.authService.currentUserValue?.role || '';
    this.isAdmin = role === 'Admin';
    this.canManage = role === 'Admin' || role === 'Project Manager' || role === 'Site Engineer' || role === 'Contractor';

    this.initForm();
    this.loadData();
  }

  initForm(): void {
    this.uploadForm = this.fb.group({
      projectId: ['', Validators.required],
      fileName: ['', Validators.required],
      fileType: ['Blueprint / PDF', Validators.required],
      description: [''],
      filePath: ['/static/blueprints/phase-1-design.pdf', Validators.required]
    });
  }

  get f() { return this.uploadForm.controls; }

  loadData(): void {
    this.documentService.getDocuments().subscribe(docs => {
      this.documents = docs;
      this.filterDocuments();
    });

    this.projectService.getProjects().subscribe(projects => {
      this.projects = projects;
    });
  }

  filterDocuments(): void {
    this.filteredDocuments = this.documents.filter(d => {
      return d.fileName.toLowerCase().includes(this.searchQuery.toLowerCase());
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.uploadForm.invalid) {
      return;
    }

    this.loading = true;
    const formVal = this.uploadForm.value;

    const newDoc: Omit<DocumentItem, 'id'> = {
      projectId: Number(formVal.projectId),
      uploadedBy: this.authService.currentUserValue?.id || 1,
      fileName: formVal.fileName,
      fileType: formVal.fileType,
      filePath: formVal.filePath,
      description: formVal.description
    };

    this.documentService.createDocument(newDoc).subscribe({
      next: () => {
        this.loading = false;
        this.submitted = false;
        this.toastService.showSuccess('Document stored successfully inside project vault.');
        this.uploadForm.reset({
          fileType: 'Blueprint / PDF',
          filePath: '/static/blueprints/phase-1-design.pdf'
        });
        this.loadData();
      },
      error: (err) => {
        this.loading = false;
        this.toastService.showError(err.message || 'Failed to upload document file.');
      }
    });
  }

  deleteDocument(id: number): void {
    if (confirm('Are you sure you want to delete this document from the vault?')) {
      this.documentService.deleteDocument(id).subscribe(success => {
        if (success) {
          this.toastService.showSuccess('Document deleted successfully.');
          this.loadData();
        } else {
          this.toastService.showError('Failed to delete document.');
        }
      });
    }
  }

  getFileIcon(type: string): string {
    if (type.includes('PDF') || type.includes('Blueprint')) return 'picture_as_pdf';
    if (type.includes('DOC')) return 'description';
    if (type.includes('CAD')) return 'architecture';
    return 'insert_drive_file';
  }
}
