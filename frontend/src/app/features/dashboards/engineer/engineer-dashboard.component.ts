import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface DailyLogEntry {
  id: number;
  date: string;
  category: string;
  summary: string;
  workStatus: string;
  inspector: string;
}

@Component({
  selector: 'app-engineer-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="container-fluid">
      <!-- Header Section -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h2 fw-bold mb-1 text-slate-800">Site Engineer Station</h1>
          <p class="text-muted mb-0">Record site logs, log inspection activities, and track daily checklists</p>
        </div>
        <span class="badge bg-warning text-dark px-3 py-2 text-sm d-flex align-items-center gap-1">
          <mat-icon style="font-size: 16px; width: 16px; height: 16px;">pin_drop</mat-icon>
          <span>Site B - Downtown Center</span>
        </span>
      </div>

      <div class="row g-4">
        <!-- Daily Progress Log Form -->
        <div class="col-12 col-lg-5">
          <div class="bt-card">
            <div class="bt-card-header">
              <h5 class="fw-bold mb-0">Record Daily Progress</h5>
              <mat-icon class="text-primary">edit_note</mat-icon>
            </div>
            
            <form [formGroup]="logForm" (ngSubmit)="onSubmitLog()" class="d-flex flex-column gap-3">
              <div class="mb-1">
                <label class="bt-form-label">Category</label>
                <select class="form-select bt-form-control" formControlName="category">
                  <option value="Foundation">Foundation Work</option>
                  <option value="Structural">Structural Work</option>
                  <option value="Electrical">Electrical Installation</option>
                  <option value="Plumbing">Plumbing Installation</option>
                  <option value="Finishing">Finishing Work</option>
                  <option value="Inspection">Inspection Work</option>
                </select>
              </div>

              <div class="mb-1">
                <label class="bt-form-label">Work Summary</label>
                <textarea class="form-control bt-form-control" formControlName="summary" rows="3" 
                          placeholder="e.g. Poured concrete slab for Section 3, structural inspection passed."></textarea>
                <div *ngIf="submitted && f['summary'].errors" class="text-danger text-xs mt-1">
                  <span>Summary details are required</span>
                </div>
              </div>

              <div class="mb-1">
                <label class="bt-form-label">Work Completion Status</label>
                <select class="form-select bt-form-control" formControlName="workStatus">
                  <option value="On Schedule">On Schedule</option>
                  <option value="Minor Delay">Minor Delay</option>
                  <option value="Critical Block">Critical Block</option>
                </select>
              </div>

              <div class="d-flex align-items-center gap-2 border border-secondary border-opacity-10 rounded p-3 bg-light my-2">
                <input class="form-check-input check-warning" type="checkbox" id="safetyPass" formControlName="safetyCompliance">
                <label class="form-check-label text-xs fw-semibold text-slate-800" for="safetyPass">
                  Confirm Site Safety Protocols Complied With
                </label>
              </div>
              <div *ngIf="submitted && f['safetyCompliance'].errors" class="text-danger text-xs mt-1">
                <span>Must confirm safety compliance to upload log</span>
              </div>

              <button type="submit" class="btn btn-bt-primary w-100 py-3 mt-1 d-flex align-items-center justify-content-center gap-2">
                <mat-icon>cloud_upload</mat-icon>
                <span>Upload Site Log</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Recent Logs Directory -->
        <div class="col-12 col-lg-7">
          <div class="bt-card">
            <div class="bt-card-header">
              <h5 class="fw-bold mb-0">Recent Activity Logs</h5>
              <span class="badge bg-light text-dark border border-secondary border-opacity-10 text-xs">Site B History</span>
            </div>

            <div class="table-responsive">
              <table class="table align-middle text-sm mb-0">
                <thead class="table-light text-muted uppercase text-xs">
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Summary</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let entry of logs">
                    <td class="text-nowrap">{{ entry.date }}</td>
                    <td>
                      <span class="badge bg-light text-dark border border-secondary border-opacity-10">{{ entry.category }}</span>
                    </td>
                    <td>{{ entry.summary }}</td>
                    <td>
                      <span class="bt-badge" 
                            [class.bt-badge-success]="entry.workStatus === 'On Schedule'" 
                            [class.bt-badge-warning]="entry.workStatus === 'Minor Delay'" 
                            [class.bt-badge-danger]="entry.workStatus === 'Critical Block'">
                        {{ entry.workStatus }}
                      </span>
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
    .check-warning:checked {
      background-color: var(--primary);
      border-color: var(--primary);
    }
    .text-xs { font-size: 0.8rem; }
  `]
})
export class EngineerDashboardComponent implements OnInit {
  logForm!: FormGroup;
  submitted = false;

  logs: DailyLogEntry[] = [
    { id: 1, date: 'Today, 2:30 PM', category: 'Inspection', summary: 'Reinforcement bar inspection completed for Level 2 beams. Approved.', workStatus: 'On Schedule', inspector: 'Alex Rivera' },
    { id: 2, date: 'Yesterday, 4:00 PM', category: 'Foundation', summary: 'Excavation completed for core elevator shaft. Water pump installed.', workStatus: 'On Schedule', inspector: 'Alex Rivera' },
    { id: 3, date: '04 Jul 2026', category: 'Plumbing', summary: 'Main drainage conduit installed. Pressure test pending inspector sign-off.', workStatus: 'Minor Delay', inspector: 'Alex Rivera' },
    { id: 4, date: '02 Jul 2026', category: 'Electrical', summary: 'Substation wiring layout mapped out. Cable tray hangers installed in basement.', workStatus: 'On Schedule', inspector: 'Alex Rivera' }
  ];

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.logForm = this.formBuilder.group({
      category: ['Structural', Validators.required],
      summary: ['', Validators.required],
      workStatus: ['On Schedule', Validators.required],
      safetyCompliance: [false, Validators.requiredTrue]
    });
  }

  get f() { return this.logForm.controls; }

  onSubmitLog(): void {
    this.submitted = true;

    if (this.logForm.invalid) {
      return;
    }

    const newLog: DailyLogEntry = {
      id: this.logs.length + 1,
      date: 'Today, Just Now',
      category: this.logForm.value.category,
      summary: this.logForm.value.summary,
      workStatus: this.logForm.value.workStatus,
      inspector: 'Alex Rivera'
    };

    this.logs.unshift(newLog);
    this.logForm.reset({
      category: 'Structural',
      workStatus: 'On Schedule',
      safetyCompliance: false
    });
    this.submitted = false;
  }
}
