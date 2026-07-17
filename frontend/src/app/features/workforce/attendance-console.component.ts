import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { WorkforceService } from '../../core/services/workforce.service';
import { ToastService } from '../../core/services/toast.service';
import { Worker, AttendanceLog } from '../../core/interfaces/workforce.interface';

@Component({
  selector: 'app-attendance-console',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="row g-4">
      <!-- Attendance check-in form -->
      <div class="col-12 col-lg-5">
        <div class="border border-secondary border-opacity-10 rounded p-4 bg-white shadow-sm">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0 text-slate-800">Check-In Staff Console</h5>
            <mat-icon class="text-warning">watch_later</mat-icon>
          </div>

          <form [formGroup]="checkInForm" (ngSubmit)="onCheckIn()">
            <!-- Worker Selection -->
            <div class="mb-3">
              <label class="bt-form-label">Select Staff Member</label>
              <select class="form-select bt-form-control" formControlName="workerName" (change)="onWorkerSelect($event)">
                <option value="" disabled selected>Select staff member...</option>
                <option *ngFor="let w of absentWorkers" [value]="w.name">{{ w.name }} ({{ w.category }})</option>
              </select>
              <div *ngIf="submitted && f['workerName'].errors" class="text-danger text-xs mt-1">
                <span>Staff selection is required</span>
              </div>
            </div>

            <!-- Role/Category -->
            <div class="mb-3">
              <label class="bt-form-label">Category / Position</label>
              <input type="text" class="form-control bt-form-control bg-light" formControlName="category" readonly>
            </div>

            <!-- Log Time -->
            <div class="mb-3">
              <label class="bt-form-label">Check-In Time</label>
              <input type="text" class="form-control bt-form-control" formControlName="checkInTime" placeholder="e.g. 08:00 AM"
                     [class.is-invalid]="submitted && f['checkInTime'].errors">
              <div *ngIf="submitted && f['checkInTime'].errors" class="invalid-feedback text-xs">
                <span>Check-in timestamp is required</span>
              </div>
            </div>

            <button type="submit" class="btn btn-bt-primary w-100 py-3 mt-2 d-flex align-items-center justify-content-center gap-2" [disabled]="isLoading">
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
              <mat-icon *ngIf="!isLoading">alarm_on</mat-icon>
              <span>Record Check-In</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Live logs table list -->
      <div class="col-12 col-lg-7">
        <div class="border border-secondary border-opacity-10 rounded p-4 bg-white shadow-sm h-100">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0 text-slate-800">Today's Check-In Log Stream</h5>
            <span class="badge bg-light text-dark border border-secondary border-opacity-10 text-xs">Live Console</span>
          </div>

          <div class="table-responsive" style="max-height: 380px; overflow-y: auto;">
            <table class="table align-middle text-sm mb-0">
              <thead class="table-light text-muted uppercase text-xs">
                <tr>
                  <th>Staff Member</th>
                  <th>In Stamp</th>
                  <th>Out Stamp</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let log of attendanceLogs">
                  <td>
                    <div>
                      <span class="fw-semibold text-slate-800 d-block">{{ log.workerName }}</span>
                      <span class="text-xxs text-muted">{{ log.category }}</span>
                    </div>
                  </td>
                  <td>{{ log.checkInTime }}</td>
                  <td>{{ log.checkOutTime || 'Active Onsite' }}</td>
                  <td class="text-end">
                    <button type="button" class="btn btn-xs btn-bt-outline py-1 px-3 text-xxs" 
                            *ngIf="!log.checkOutTime" (click)="onCheckOut(log.id)">
                      Check Out
                    </button>
                    <span class="text-success text-xxs fw-bold" *ngIf="log.checkOutTime">Logged Out</span>
                  </td>
                </tr>
                <tr *ngIf="attendanceLogs.length === 0">
                  <td colspan="4" class="text-center py-4 text-muted">No attendance logs logged.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-xs { font-size: 0.8rem; }
    .text-xxs { font-size: 0.72rem; }
    .btn-xs { font-size: 0.75rem; padding: 0.25rem 0.5rem; }
  `]
})
export class AttendanceConsoleComponent implements OnInit {
  checkInForm!: FormGroup;
  submitted = false;
  isLoading = false;

  workers: Worker[] = [];
  absentWorkers: Worker[] = [];
  attendanceLogs: AttendanceLog[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private workforceService: WorkforceService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.checkInForm = this.formBuilder.group({
      workerName: ['', Validators.required],
      category: [''],
      checkInTime: ['08:00 AM', Validators.required]
    });
    this.loadData();
  }

  loadData(): void {
    this.workforceService.getWorkers().subscribe(list => {
      this.workers = list;
      this.absentWorkers = list.filter(w => w.attendance === 'Absent');
    });
    this.workforceService.getAttendanceLogs().subscribe(list => {
      this.attendanceLogs = list;
    });
  }

  get f() { return this.checkInForm.controls; }

  onWorkerSelect(event: any): void {
    const name = event.target.value;
    const w = this.workers.find(item => item.name === name);
    if (w) {
      this.checkInForm.patchValue({ category: w.category });
    }
  }

  onCheckIn(): void {
    this.submitted = true;

    if (this.checkInForm.invalid) {
      return;
    }

    this.isLoading = true;
    const formVal = this.checkInForm.value;

    this.workforceService.logAttendance({
      workerName: formVal.workerName,
      category: formVal.category,
      checkInTime: formVal.checkInTime
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.showSuccess(`Registered check-in for ${formVal.workerName}.`);
        this.checkInForm.reset({
          workerName: '',
          category: '',
          checkInTime: '08:00 AM'
        });
        this.submitted = false;
        this.loadData();
      },
      error: () => {
        this.isLoading = false;
        this.toastService.showError('Failed to record check-in.');
      }
    });
  }

  onCheckOut(logId: number): void {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.workforceService.checkoutWorker(logId, timeStr).subscribe({
      next: (log) => {
        if (log) {
          this.toastService.showSuccess(`Registered checkout log for ${log.workerName} at ${timeStr}.`);
          this.loadData();
        }
      }
    });
  }
}
