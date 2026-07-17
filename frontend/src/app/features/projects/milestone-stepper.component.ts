import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Milestone } from '../../core/interfaces/project.interface';

@Component({
  selector: 'app-milestone-stepper',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule],
  template: `
    <div class="timeline-container px-3">
      <div *ngFor="let ms of milestones; let i = index" class="timeline-item d-flex gap-4 mb-4 position-relative">
        <!-- Connector Line -->
        <div class="connector-line" *ngIf="i < milestones.length - 1"></div>
        
        <!-- Icon Node -->
        <div class="timeline-node rounded-circle d-flex align-items-center justify-content-center"
             [ngClass]="getNodeClass(ms.status)">
          <mat-icon style="font-size: 16px; width: 16px; height: 16px;">{{ getNodeIcon(ms.status) }}</mat-icon>
        </div>
        
        <!-- Content Card -->
        <div class="timeline-content border border-secondary border-opacity-10 rounded p-3 bg-light flex-grow-1">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="fw-bold text-slate-800 mb-1">{{ ms.title }}</h6>
              <p class="text-muted text-xs mb-2">{{ ms.description }}</p>
              <span class="text-xxs text-muted fw-semibold">Target Completion: {{ ms.dueDate }}</span>
              <div class="mt-1" *ngIf="ms.completionDate">
                <span class="text-success text-xxs fw-bold d-flex align-items-center gap-0.5">
                  <mat-icon style="font-size: 12px; width: 12px; height: 12px;">check_circle</mat-icon>
                  <span>Completed: {{ ms.completionDate }}</span>
                </span>
              </div>
            </div>
            
            <!-- Update Status Dropdown Action (Mentors love interactive flows!) -->
            <div class="d-flex flex-column align-items-end gap-1">
              <span class="bt-badge text-xxs" 
                    [class.bt-badge-success]="ms.status === 'Completed'" 
                    [class.bt-badge-warning]="ms.status === 'In Progress'" 
                    [class.bt-badge-info]="ms.status === 'Pending'">
                {{ ms.status }}
              </span>
              <button mat-icon-button [matMenuTriggerFor]="statusMenu" class="text-muted" style="width: 32px; height: 32px; line-height: 32px;">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">more_vert</mat-icon>
              </button>
              <mat-menu #statusMenu="matMenu">
                <button mat-menu-item (click)="updateStatus(ms.id, 'Completed')">
                  <mat-icon class="text-success">check_circle</mat-icon>
                  <span>Set Completed</span>
                </button>
                <button mat-menu-item (click)="updateStatus(ms.id, 'In Progress')">
                  <mat-icon class="text-warning">pending</mat-icon>
                  <span>Set In Progress</span>
                </button>
                <button mat-menu-item (click)="updateStatus(ms.id, 'Pending')">
                  <mat-icon class="text-info">radio_button_unchecked</mat-icon>
                  <span>Set Pending</span>
                </button>
              </mat-menu>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .timeline-container { position: relative; }
    .timeline-item { position: relative; }
    .connector-line {
      position: absolute;
      top: 36px;
      left: 18px;
      width: 2px;
      height: calc(100% - 12px);
      background-color: var(--slate-200);
      z-index: 1;
    }
    .timeline-node {
      width: 38px;
      height: 38px;
      min-width: 38px;
      z-index: 2;
    }
    .bg-node-completed { background-color: #d1fae5; color: #10b981; border: 2px solid #10b981; }
    .bg-node-active { background-color: #ecfeff; color: #06b6d4; border: 2px solid #06b6d4; }
    .bg-node-pending { background-color: #f1f5f9; color: #94a3b8; border: 2px solid #cbd5e1; }
    .text-xxs { font-size: 0.72rem; }
    .text-xs { font-size: 0.8rem; }
  `]
})
export class MilestoneStepperComponent {
  @Input() milestones: Milestone[] = [];
  @Output() statusChange = new EventEmitter<{ milestoneId: number, status: 'Completed' | 'In Progress' | 'Pending' }>();

  getNodeClass(status: string): string {
    switch (status) {
      case 'Completed': return 'bg-node-completed';
      case 'In Progress': return 'bg-node-active';
      default: return 'bg-node-pending';
    }
  }

  getNodeIcon(status: string): string {
    switch (status) {
      case 'Completed': return 'check';
      case 'In Progress': return 'pending';
      default: return 'radio_button_unchecked';
    }
  }

  updateStatus(milestoneId: number, status: 'Completed' | 'In Progress' | 'Pending'): void {
    this.statusChange.emit({ milestoneId, status });
  }
}
