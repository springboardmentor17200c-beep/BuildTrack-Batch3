import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface AttendanceLog {
  id: number;
  workerName: string;
  category: 'Engineer' | 'Supervisor' | 'Contractor' | 'Skilled Worker' | 'Unskilled Worker';
  checkInTime: string;
  checkOutTime?: string;
  status: 'Present' | 'Absent' | 'On Leave';
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="container-fluid">
      <!-- Title Area -->
      <div class="mb-4">
        <h1 class="h2 fw-bold mb-1 text-slate-800">Workforce & Attendance Logs</h1>
        <p class="text-muted mb-0">Track contractor attendance, check-in skilled crews, and manage daily shifts</p>
      </div>

      <!-- Quick stats -->
      <div class="row g-4 mb-4">
        <div class="col-6 col-md-3" *ngFor="let stat of kpiStats">
          <div class="bt-card py-3 px-4">
            <span class="text-muted text-xxs text-uppercase fw-bold tracking-wider">{{ stat.label }}</span>
            <h4 class="fw-bold mt-1 mb-0" [style.color]="stat.color">{{ stat.value }}</h4>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <!-- Worker Registration / Check In Form -->
        <div class="col-12 col-lg-5">
          <div class="bt-card">
            <div class="bt-card-header">
              <h5 class="fw-bold mb-0">Record Worker Check-In</h5>
              <mat-icon class="text-primary">person_add_alt_1</mat-icon>
            </div>

            <form [formGroup]="checkInForm" (ngSubmit)="onCheckIn()" class="d-flex flex-column gap-3">
              <div class="mb-1">
                <label class="bt-form-label">Worker Name</label>
                <input type="text" class="form-control bt-form-control" formControlName="workerName" placeholder="e.g. Liam Thompson">
                <div *ngIf="submitted && f['workerName'].errors" class="text-danger text-xs mt-1">
                  <span>Name is required</span>
                </div>
              </div>

              <div class="mb-1">
                <label class="bt-form-label">Category / Classification</label>
                <select class="form-select bt-form-control" formControlName="category">
                  <option value="Skilled Worker">Skilled Worker (Carpenter, Welder, Mason)</option>
                  <option value="Unskilled Worker">Unskilled Worker (General Laborer)</option>
                  <option value="Supervisor">Site Supervisor</option>
                  <option value="Engineer">Site Engineer</option>
                </select>
              </div>

              <div class="mb-1">
                <label class="bt-form-label">Check-In Time</label>
                <input type="time" class="form-control bt-form-control" formControlName="checkInTime">
                <div *ngIf="submitted && f['checkInTime'].errors" class="text-danger text-xs mt-1">
                  <span>Check-in time is required</span>
                </div>
              </div>

              <button type="submit" class="btn btn-bt-primary w-100 py-3 mt-2 d-flex align-items-center justify-content-center gap-2">
                <mat-icon>fingerprint</mat-icon>
                <span>Record Check-In</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Attendance Registry list -->
        <div class="col-12 col-lg-7">
          <div class="bt-card">
            <div class="bt-card-header">
              <h5 class="fw-bold mb-0">Daily Shift Registry</h5>
              <span class="badge bg-light text-dark border border-secondary border-opacity-10 text-xs">Today: {{ todayDate }}</span>
            </div>

            <div class="table-responsive">
              <table class="table align-middle text-sm mb-0">
                <thead class="table-light text-muted uppercase text-xs">
                  <tr>
                    <th>Worker</th>
                    <th>Category</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let log of logs">
                    <td>
                      <span class="fw-semibold text-slate-800">{{ log.workerName }}</span>
                    </td>
                    <td>
                      <span class="badge bg-light text-dark border border-secondary border-opacity-10">{{ log.category }}</span>
                    </td>
                    <td>{{ log.checkInTime }}</td>
                    <td>{{ log.checkOutTime || '--:--' }}</td>
                    <td>
                      <span class="bt-badge" 
                            [class.bt-badge-success]="log.status === 'Present'" 
                            [class.bt-badge-warning]="log.status === 'On Leave'" 
                            [class.bt-badge-danger]="log.status === 'Absent'">
                        {{ log.status }}
                      </span>
                    </td>
                    <td class="text-end">
                      <button *ngIf="!log.checkOutTime" class="btn btn-xs btn-bt-outline py-1 px-2 text-xxs" (click)="checkOut(log)">
                        Check Out
                      </button>
                      <span *ngIf="log.checkOutTime" class="text-muted text-xxs">Completed</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-xs { font-size: 0.8rem; }
    .text-xxs { font-size: 0.72rem; }
    .btn-xs { font-size: 0.75rem; }
  `]
})
export class AttendanceComponent implements OnInit {
  checkInForm!: FormGroup;
  submitted = false;
  todayDate = '';

  kpiStats = [
    { label: 'Present Today', value: '42 Heads', color: '#10b981' },
    { label: 'On Leave / Sick', value: '3 Heads', color: '#f59e0b' },
    { label: 'Unskilled Crew', value: '25 Heads', color: '#ff7a00' },
    { label: 'Skilled Crew', value: '17 Heads', color: '#06b6d4' }
  ];

  logs: AttendanceLog[] = [
    { id: 1, workerName: 'Liam Thompson', category: 'Skilled Worker', checkInTime: '08:00 AM', status: 'Present' },
    { id: 2, workerName: 'Sophia Alvarez', category: 'Supervisor', checkInTime: '07:45 AM', checkOutTime: '04:30 PM', status: 'Present' },
    { id: 3, workerName: 'Jackson Briggs', category: 'Unskilled Worker', checkInTime: '08:15 AM', status: 'Present' },
    { id: 4, workerName: 'Olivia Martinez', category: 'Engineer', checkInTime: '08:00 AM', status: 'Present' },
    { id: 5, workerName: 'Ethan Carter', category: 'Skilled Worker', checkInTime: '08:02 AM', status: 'Present' }
  ];

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    const today = new Date();
    this.todayDate = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Set default check-in time to current local time (HH:MM)
    const hours = today.getHours().toString().padStart(2, '0');
    const minutes = today.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    this.checkInForm = this.formBuilder.group({
      workerName: ['', Validators.required],
      category: ['Skilled Worker', Validators.required],
      checkInTime: [currentTime, Validators.required]
    });
  }

  get f() { return this.checkInForm.controls; }

  onCheckIn(): void {
    this.submitted = true;

    if (this.checkInForm.invalid) {
      return;
    }

    const val = this.checkInForm.value;
    
    // Convert 24h to 12h time for layout
    const timeParts = val.checkInTime.split(':');
    let h = parseInt(timeParts[0]);
    const m = timeParts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; // hour 0 should be 12
    const formatedTime = `${h.toString().padStart(2, '0')}:${m} ${ampm}`;

    const newLog: AttendanceLog = {
      id: this.logs.length + 1,
      workerName: val.workerName,
      category: val.category,
      checkInTime: formatedTime,
      status: 'Present'
    };

    this.logs.unshift(newLog);
    this.checkInForm.reset({
      category: 'Skilled Worker',
      checkInTime: timeParts.join(':') // preserve current time input
    });
    this.submitted = false;
  }

  checkOut(log: AttendanceLog): void {
    const today = new Date();
    let h = today.getHours();
    const m = today.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    log.checkOutTime = `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
  }
}
