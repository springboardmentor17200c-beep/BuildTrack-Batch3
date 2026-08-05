import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { WorkerListComponent } from './worker-list.component';
import { AttendanceConsoleComponent } from './attendance-console.component';
import { ShiftCalendarComponent } from './shift-calendar.component';
import { WorkforceAllocationComponent } from './workforce-allocation.component';
import { WorkforceService } from '../../core/services/workforce.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-workforce',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTabsModule,
    WorkerListComponent,
    AttendanceConsoleComponent,
    ShiftCalendarComponent,
    WorkforceAllocationComponent,
    ToastComponent
  ],
  template: `
    <div class="container-fluid">
      <!-- Title -->
      <div class="mb-4">
        <h1 class="h2 fw-bold mb-1 text-slate-800">Workforce & Attendance Registry</h1>
        <p class="text-muted mb-0">Manage onsite construction labor registries, daily attendance check-ins, and shift schedules</p>
      </div>

      <!-- Workforce overview stats cards -->
      <div class="row g-4 mb-4" *ngIf="userRole !== 'Worker'">
        <div class="col-12 col-md-4" *ngFor="let card of cards">
          <div class="bt-card border-start border-4" [style.border-left-color]="card.color">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="text-muted text-xs text-uppercase tracking-wider fw-bold">{{ card.title }}</span>
                <h3 class="display-6 fw-bold mt-1 mb-0">{{ card.value }}</h3>
              </div>
              <div class="icon-circle bg-light" [style.color]="card.color" style="width: 44px; height: 44px; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
                <mat-icon>{{ card.icon }}</mat-icon>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabbed layout panels -->
      <mat-tab-group class="bg-white rounded shadow-sm p-3">
        <mat-tab label="Staff Registry Directory" *ngIf="userRole !== 'Worker'">
          <div class="p-3">
            <app-worker-list #dirList></app-worker-list>
          </div>
        </mat-tab>

        <mat-tab label="Daily Attendance Logs">
          <div class="p-3">
            <app-attendance-console #console (click)="onConsoleEvent()"></app-attendance-console>
          </div>
        </mat-tab>

        <mat-tab label="Weekly Shift Calendar">
          <div class="p-3">
            <app-shift-calendar #calendar></app-shift-calendar>
          </div>
        </mat-tab>

        <mat-tab label="Staff Site Allocations" *ngIf="userRole !== 'Worker'">
          <div class="p-3">
            <app-workforce-allocation #alloc></app-workforce-allocation>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
    <app-toast></app-toast>
  `,
  styles: [`
    .text-xs { font-size: 0.8rem; }
  `]
})
export class WorkforceComponent implements OnInit {
  @ViewChild('dirList') dirComponent!: WorkerListComponent;
  @ViewChild('calendar') calendarComponent!: ShiftCalendarComponent;
  @ViewChild('alloc') allocComponent!: WorkforceAllocationComponent;
  @ViewChild('console') consoleComponent!: AttendanceConsoleComponent;

  userRole = '';

  cards = [
    { title: 'Total Registered Staff', value: '0', icon: 'groups', color: '#ff7a00' },
    { title: 'Present Onsite Today', value: '0', icon: 'how_to_reg', color: '#10b981' },
    { title: 'Scheduled Off / Absent', value: '0', icon: 'person_off', color: '#ef4444' }
  ];

  constructor(
    private workforceService: WorkforceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.userRole = user?.role || '';
    });
    this.updateStats();
  }

  updateStats(): void {
    this.workforceService.getWorkers().subscribe(list => {
      const total = list.length;
      const present = list.filter(w => w.attendance === 'Present').length;
      const off = list.filter(w => w.attendance !== 'Present').length;

      this.cards[0].value = `${total} Staff`;
      this.cards[1].value = `${present} Active`;
      this.cards[2].value = `${off} Members`;
    });
  }

  onConsoleEvent(): void {
    // Refresh stats when attendance check-in triggers
    this.updateStats();
    if (this.dirComponent) {
      this.dirComponent.loadWorkers();
    }
  }
}
