import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmationData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="p-3">
      <h3 mat-dialog-title class="fw-bold text-slate-800">{{ data.title }}</h3>
      <div mat-dialog-content class="text-muted text-sm py-2">
        <p class="mb-0">{{ data.message }}</p>
      </div>
      <div mat-dialog-actions class="d-flex justify-content-end gap-2 pt-3">
        <button mat-button class="btn btn-sm btn-bt-outline" (click)="onCancel()">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button mat-button class="btn btn-sm btn-bt-primary" (click)="onConfirm()">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </div>
    </div>
  `
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
