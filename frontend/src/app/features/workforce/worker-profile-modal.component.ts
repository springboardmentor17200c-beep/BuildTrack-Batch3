import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Worker } from '../../core/interfaces/workforce.interface';

@Component({
  selector: 'app-worker-profile-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="modal-overlay d-flex align-items-center justify-content-center" *ngIf="worker">
      <div class="modal-card bg-white p-4 rounded shadow-lg fade-in" style="width: 440px; max-width: 95%;">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-start mb-4">
          <div class="d-flex align-items-center gap-3">
            <div class="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center fw-bold fs-4" style="width: 50px; height: 50px;">
              {{ worker.avatarInitials }}
            </div>
            <div>
              <h5 class="fw-bold mb-0 text-slate-800">{{ worker.name }}</h5>
              <span class="text-xs text-muted">{{ worker.category }}</span>
            </div>
          </div>
          <button type="button" class="btn-close-custom" (click)="onClose()">
            <mat-icon style="font-size: 20px; width: 20px; height: 20px;">close</mat-icon>
          </button>
        </div>

        <!-- Details Grid (Simplified profile parameters list) -->
        <div class="border border-secondary border-opacity-10 rounded p-3 bg-light mb-4">
          <div class="d-flex flex-column gap-3">
            <div class="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
              <span class="text-muted text-xs">Email Address:</span>
              <span class="fw-medium text-slate-800 text-sm">{{ worker.email }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
              <span class="text-muted text-xs">Phone Number:</span>
              <span class="fw-medium text-slate-800 text-sm">{{ worker.phone }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
              <span class="text-muted text-xs">Role Category:</span>
              <span class="fw-bold text-dark text-sm">{{ worker.category }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
              <span class="text-muted text-xs">Shift Schedule:</span>
              <span class="badge bg-light text-dark border border-secondary border-opacity-10 text-xs">{{ worker.shift }} Shift</span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-1">
              <span class="text-muted text-xs">Today's Attendance:</span>
              <span class="bt-badge text-xxs" 
                    [class.bt-badge-success]="worker.attendance === 'Present'" 
                    [class.bt-badge-danger]="worker.attendance === 'Absent'" 
                    [class.bt-badge-warning]="worker.attendance === 'On Leave'">
                {{ worker.attendance }}
              </span>
            </div>
          </div>
        </div>

        <button type="button" class="btn btn-bt-primary w-100 py-2.5" (click)="onClose()">
          Close Profile
        </button>
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
      padding: 0;
    }
    .btn-close-custom:hover {
      color: var(--slate-800);
    }
    .text-xxs { font-size: 0.72rem; }
    .text-xs { font-size: 0.8rem; }
    .text-sm { font-size: 0.9rem; }
  `]
})
export class WorkerProfileModalComponent {
  @Input() worker: Worker | null = null;
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
