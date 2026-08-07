import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService, Notification } from '../../core/services/notification.service';
import { ToastService } from '../../core/services/toast.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, ToastComponent],
  template: `
    <div class="container-fluid">
      <!-- Title -->
      <div class="mb-4">
        <h1 class="h2 fw-bold mb-1 text-slate-800">Notification Console & History</h1>
        <p class="text-muted mb-0">View system-wide messages, threshold violation alarms, and site construction log alerts.</p>
      </div>

      <!-- Main Layout -->
      <div class="row g-4">
        <!-- Controls & Filters -->
        <div class="col-12 col-lg-3">
          <div class="bt-card">
            <h5 class="fw-bold mb-3">Filter Alerts</h5>
            <div class="d-flex flex-column gap-2 mb-4">
              <button class="btn text-start d-flex align-items-center gap-2 py-2 px-3 rounded text-sm w-100"
                      [class.btn-bt-primary]="activeFilter === ''" [class.btn-light]="activeFilter !== ''"
                      (click)="setFilter('')">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">notifications</mat-icon>
                <span>All Notifications</span>
              </button>
              
              <button class="btn text-start d-flex align-items-center gap-2 py-2 px-3 rounded text-sm w-100"
                      [class.btn-bt-primary]="activeFilter === 'Procurement Alert'" [class.btn-light]="activeFilter !== 'Procurement Alert'"
                      (click)="setFilter('Procurement Alert')">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">shopping_cart</mat-icon>
                <span>Procurement Alerts</span>
              </button>

              <button class="btn text-start d-flex align-items-center gap-2 py-2 px-3 rounded text-sm w-100"
                      [class.btn-bt-primary]="activeFilter === 'Project Update'" [class.btn-light]="activeFilter !== 'Project Update'"
                      (click)="setFilter('Project Update')">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">update</mat-icon>
                <span>Project Updates</span>
              </button>

              <button class="btn text-start d-flex align-items-center gap-2 py-2 px-3 rounded text-sm w-100"
                      [class.btn-bt-primary]="activeFilter === 'Task Assignment'" [class.btn-light]="activeFilter !== 'Task Assignment'"
                      (click)="setFilter('Task Assignment')">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">assignment</mat-icon>
                <span>Task Assignments</span>
              </button>

              <button class="btn text-start d-flex align-items-center gap-2 py-2 px-3 rounded text-sm w-100"
                      [class.btn-bt-primary]="activeFilter === 'Attendance Alert'" [class.btn-light]="activeFilter !== 'Attendance Alert'"
                      (click)="setFilter('Attendance Alert')">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">event_available</mat-icon>
                <span>Attendance Alerts</span>
              </button>

              <button class="btn text-start d-flex align-items-center gap-2 py-2 px-3 rounded text-sm w-100"
                      [class.btn-bt-primary]="activeFilter === 'Deadline Notification'" [class.btn-light]="activeFilter !== 'Deadline Notification'"
                      (click)="setFilter('Deadline Notification')">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">alarm</mat-icon>
                <span>Deadlines</span>
              </button>
            </div>

            <!-- Quick stats -->
            <div class="border-top pt-3 text-xs text-muted">
              <div class="d-flex justify-content-between mb-2">
                <span>Unread Alerts:</span>
                <span class="fw-bold text-dark">{{ unreadCount }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span>Total Stored:</span>
                <span class="fw-bold text-dark">{{ notifications.length }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Ledger Queue -->
        <div class="col-12 col-lg-9">
          <div class="bt-card">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold mb-0">System Alerts Log</h5>
              <button class="btn btn-bt-outline btn-sm d-flex align-items-center gap-1" (click)="markAllAsRead()" [disabled]="unreadCount === 0">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">done_all</mat-icon>
                <span>Mark All Read</span>
              </button>
            </div>

            <div class="d-flex flex-column gap-2">
              <div *ngFor="let item of filteredNotifications" class="alert-item d-flex gap-3 p-3 rounded border align-items-start transition"
                   [class.bg-light-yellow]="!item.is_read" [style.border-left-color]="getLeftColor(item.notification_type)">
                <!-- Icon mapping -->
                <div class="icon-indicator p-2 rounded bg-light" [style.color]="getLeftColor(item.notification_type)">
                  <mat-icon>{{ getIcon(item.notification_type) }}</mat-icon>
                </div>

                <div class="flex-grow-1">
                  <div class="d-flex justify-content-between align-items-start">
                    <h6 class="fw-bold text-sm mb-1 text-slate-800" [class.fw-extrabold]="!item.is_read">{{ item.title }}</h6>
                    <span class="text-xxs text-muted text-nowrap">{{ item.created_at | date:'short' }}</span>
                  </div>
                  <p class="text-xs text-muted mb-0">{{ item.message }}</p>
                </div>

                <!-- Actions -->
                <div class="d-flex align-items-center gap-1">
                  <button *ngIf="!item.is_read" class="btn btn-link text-success p-1" title="Mark as read" (click)="markRead(item.id)">
                    <mat-icon style="font-size: 18px; width: 18px; height: 18px;">check</mat-icon>
                  </button>
                  <button class="btn btn-link text-danger p-1" title="Delete alert" (click)="deleteAlert(item.id)">
                    <mat-icon style="font-size: 18px; width: 18px; height: 18px;">delete</mat-icon>
                  </button>
                </div>
              </div>

              <!-- Empty state -->
              <div *ngIf="filteredNotifications.length === 0" class="text-center py-5 text-muted">
                <mat-icon class="text-muted display-6">mail_outline</mat-icon>
                <p class="mt-2 text-sm">No notification alerts found.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <app-toast></app-toast>
  `,
  styles: [`
    .alert-item {
      border-left-width: 4px !important;
      background-color: #ffffff;
    }
    .bg-light-yellow {
      background-color: rgba(255, 122, 0, 0.035);
      border-color: rgba(255, 122, 0, 0.15) !important;
    }
    .transition {
      transition: all 0.2s ease;
    }
    .text-xs { font-size: 0.8rem; }
    .text-xxs { font-size: 0.72rem; }
    .text-sm { font-size: 0.9rem; }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  activeFilter: string = '';
  unreadCount = 0;

  constructor(
    private notificationService: NotificationService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe(list => {
      this.notifications = list;
      this.filterAlerts();
      this.calculateStats();
    });
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.filterAlerts();
  }

  filterAlerts(): void {
    if (!this.activeFilter) {
      this.filteredNotifications = this.notifications;
    } else {
      this.filteredNotifications = this.notifications.filter(n => n.notification_type === this.activeFilter);
    }
  }

  calculateStats(): void {
    this.unreadCount = this.notifications.filter(n => !n.is_read).length;
  }

  markRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        this.toastService.showSuccess('Notification marked as read.');
        this.loadNotifications();
      }
    });
  }

  markAllAsRead(): void {
    const unreadList = this.notifications.filter(n => !n.is_read);
    if (unreadList.length === 0) return;

    // Trigger marks
    unreadList.forEach(n => {
      this.notificationService.markAsRead(n.id).subscribe();
    });
    this.toastService.showSuccess('All notifications marked as read.');
    setTimeout(() => this.loadNotifications(), 300);
  }

  deleteAlert(id: number): void {
    this.notificationService.deleteNotification(id).subscribe(success => {
      if (success) {
        this.toastService.showSuccess('Notification deleted successfully.');
        this.loadNotifications();
      } else {
        this.toastService.showError('Failed to delete notification.');
      }
    });
  }

  getIcon(type: string): string {
    switch (type) {
      case 'Project Update':        return 'update';
      case 'Task Assignment':       return 'assignment';
      case 'Procurement Alert':     return 'shopping_cart';
      case 'Attendance Alert':      return 'event_available';
      case 'Deadline Notification': return 'alarm';
      case 'System Notification':   return 'info';
      default:                      return 'notifications';
    }
  }

  getLeftColor(type: string): string {
    switch (type) {
      case 'Project Update':        return '#3b82f6'; // Blue
      case 'Task Assignment':       return '#06b6d4'; // Cyan
      case 'Procurement Alert':     return '#ff7a00'; // Orange
      case 'Attendance Alert':      return '#10b981'; // Green
      case 'Deadline Notification': return '#ef4444'; // Red
      case 'System Notification':   return '#64748b'; // Gray
      default:                      return '#94a3b8';
    }
  }
}
