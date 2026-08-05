import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 2000;" *ngIf="currentToast">
      <div class="toast show align-items-center text-white border-0 shadow-lg fade-in" 
           [class.bg-success]="currentToast.type === 'success'" 
           [class.bg-danger]="currentToast.type === 'error'" 
           role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2 py-3 px-3">
            <mat-icon style="font-size: 22px; width: 22px; height: 22px;">{{ currentToast.type === 'success' ? 'check_circle' : 'error' }}</mat-icon>
            <span class="fw-medium text-sm" style="line-height: 1.25;">{{ currentToast.message }}</span>
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Close" (click)="onClose()"></button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      pointer-events: none;
    }
    .toast {
      pointer-events: auto;
      border-radius: var(--border-radius-sm);
      min-width: 280px;
      max-width: 380px;
    }
    .text-sm {
      font-size: 0.9rem;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .fade-in {
      animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  currentToast: ToastMessage | null = null;
  private sub!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.sub = this.toastService.toast$.subscribe(toast => {
      this.currentToast = toast;
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  onClose(): void {
    this.toastService.clear();
  }
}
