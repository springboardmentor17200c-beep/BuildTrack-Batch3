import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { WorkforceService } from '../../core/services/workforce.service';
import { ToastService } from '../../core/services/toast.service';
import { ShiftSchedule } from '../../core/interfaces/workforce.interface';

@Component({
  selector: 'app-shift-calendar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule],
  template: `
    <div class="border border-secondary border-opacity-10 rounded p-4 bg-white shadow-sm">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 class="fw-bold mb-0 text-slate-800">Weekly Shift Planner</h5>
          <p class="text-muted text-xs mb-0">Manage shift assignments across the construction workforce</p>
        </div>
        <span class="badge bg-light text-dark border border-secondary border-opacity-10 text-xs">Calendar View</span>
      </div>

      <div class="table-responsive">
        <table class="table align-middle table-bordered text-sm mb-0">
          <thead class="table-light text-muted text-center uppercase text-xs">
            <tr>
              <th class="text-start">Staff Member</th>
              <th>Mon</th>
              <th>Tue</th>
              <th>Wed</th>
              <th>Thu</th>
              <th>Fri</th>
              <th>Sat</th>
              <th>Sun</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of schedules">
              <td>
                <div>
                  <span class="fw-semibold text-slate-800 d-block">{{ s.workerName }}</span>
                  <span class="text-xxs text-muted">{{ s.role }}</span>
                </div>
              </td>
              <!-- Days indicators -->
              <td class="text-center" *ngFor="let day of [s.mon, s.tue, s.wed, s.thu, s.fri, s.sat, s.sun]">
                <span class="badge text-xxs font-monospace px-2 py-1"
                      [class.bg-success-subtle]="day === 'Morning'"
                      [class.text-success]="day === 'Morning'"
                      [class.bg-info-subtle]="day === 'Night'"
                      [class.text-info]="day === 'Night'"
                      [class.bg-light]="day === 'Off'"
                      [class.text-muted]="day === 'Off'">
                  {{ day }}
                </span>
              </td>
              <!-- Change Shift Action -->
              <td class="text-center">
                <button mat-icon-button [matMenuTriggerFor]="shiftMenu" class="text-muted">
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">edit_calendar</mat-icon>
                </button>
                <mat-menu #shiftMenu="matMenu">
                  <button mat-menu-item (click)="updateShift(s.workerId, 'Morning')">
                    <mat-icon class="text-success">wb_sunny</mat-icon>
                    <span>Morning Shift</span>
                  </button>
                  <button mat-menu-item (click)="updateShift(s.workerId, 'Night')">
                    <mat-icon class="text-info">nights_stay</mat-icon>
                    <span>Night Shift</span>
                  </button>
                  <button mat-menu-item (click)="updateShift(s.workerId, 'Off')">
                    <mat-icon class="text-muted">block</mat-icon>
                    <span>Scheduled Off</span>
                  </button>
                </mat-menu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .text-xs { font-size: 0.8rem; }
    .text-xxs { font-size: 0.72rem; }
    td, th { padding: 0.5rem 0.75rem !important; }
  `]
})
export class ShiftCalendarComponent implements OnInit {
  schedules: ShiftSchedule[] = [];

  constructor(
    private workforceService: WorkforceService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadSchedules();
  }

  loadSchedules(): void {
    this.workforceService.getSchedules().subscribe(list => {
      this.schedules = list;
    });
  }

  updateShift(workerId: number, shift: 'Morning' | 'Night' | 'Off'): void {
    this.workforceService.updateWorkerShift(workerId, shift).subscribe({
      next: (success) => {
        if (success) {
          this.toastService.showSuccess('Weekly shift schedules updated.');
          this.loadSchedules();
        }
      }
    });
  }
}
