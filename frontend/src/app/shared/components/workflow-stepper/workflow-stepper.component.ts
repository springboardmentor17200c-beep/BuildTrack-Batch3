import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-workflow-stepper',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="stepper-container py-3 px-2 overflow-x-auto w-100">
      <div class="d-flex align-items-center justify-content-between position-relative stepper-row" style="min-width: 1000px;">
        <!-- Background Track Line -->
        <div class="stepper-line position-absolute w-100 bg-secondary opacity-25" style="height: 3px; z-index: 1;"></div>
        <!-- Active Progress Line -->
        <div class="stepper-line-active position-absolute bg-primary" 
             [style.width.%]="progressPercentage" 
             style="height: 3px; z-index: 2; transition: width 0.4s ease;"></div>

        <!-- Steps -->
        <div *ngFor="let step of steps; let i = index" 
             class="d-flex flex-column align-items-center position-relative step-item" 
             [class.active]="i === currentStepIndex" 
             [class.completed]="i < currentStepIndex"
             style="z-index: 3; width: 60px;">
          
          <!-- Circle Icon Indicator -->
          <div class="step-circle rounded-circle d-flex align-items-center justify-content-center border"
               [class.border-primary]="i <= currentStepIndex"
               [class.bg-primary]="i <= currentStepIndex"
               [class.text-white]="i <= currentStepIndex"
               [class.bg-white]="i > currentStepIndex"
               [class.text-muted]="i > currentStepIndex"
               style="width: 30px; height: 30px; transition: all 0.3s ease;">
            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">
              {{ i < currentStepIndex ? 'done' : step.icon }}
            </mat-icon>
          </div>

          <!-- Step Label -->
          <span class="step-label text-xxs mt-2 text-center text-truncate w-100"
                [class.text-primary]="i === currentStepIndex"
                [class.fw-bold]="i === currentStepIndex"
                [class.text-muted]="i !== currentStepIndex">
            {{ step.label }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stepper-container {
      background-color: var(--slate-50, #f8fafc);
      border-radius: var(--border-radius-md, 8px);
      border: 1px solid rgba(0, 0, 0, 0.05);
    }
    .stepper-row {
      height: 70px;
    }
    .text-xxs {
      font-size: 0.68rem;
    }
    .step-circle {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    .step-item.active .step-circle {
      transform: scale(1.15);
      box-shadow: 0 0 10px rgba(255, 122, 0, 0.35);
    }
  `]
})
export class WorkflowStepperComponent {
  @Input() currentStage: string = 'Material Request';

  steps = [
    { label: 'Request', icon: 'description' },
    { label: 'Approval', icon: 'rate_review' },
    { label: 'Vendor Select', icon: 'store' },
    { label: 'PO Sent', icon: 'outgoing_mail' },
    { label: 'PO Accepted', icon: 'thumb_up' },
    { label: 'Dispatch', icon: 'local_shipping' },
    { label: 'Delivery', icon: 'airport_shuttle' },
    { label: 'Receiving', icon: 'inventory_2' },
    { label: 'Stock Sync', icon: 'sync' },
    { label: 'Invoice Up', icon: 'file_present' },
    { label: 'Invoice Verif', icon: 'fact_check' },
    { label: 'Payment Appr', icon: 'check_circle' },
    { label: 'Paid', icon: 'monetization_on' },
    { label: 'Completed', icon: 'task_alt' }
  ];

  get currentStepIndex(): number {
    const idx = this.steps.findIndex(s => s.label.toLowerCase().includes(this.currentStage.toLowerCase()) || 
                                          this.currentStage.toLowerCase().includes(s.label.toLowerCase()));
    return idx === -1 ? 0 : idx;
  }

  get progressPercentage(): number {
    if (this.currentStepIndex === 0) return 0;
    return (this.currentStepIndex / (this.steps.length - 1)) * 100;
  }
}
