import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
<<<<<<< HEAD
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NotificationService, AppNotification } from '../../core/services/notification.service';
=======
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService, Notification } from '../../core/services/notification.service';
import { ToastService } from '../../core/services/toast.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';
>>>>>>> 357f28c3b3005d7b8f29177f5320ff47038d5dff

@Component({
  selector: 'app-notifications',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, MatIconModule, MatButtonModule, MatCardModule],
  template: `
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="fw-bold mb-0">Notifications</h4>
        <button mat-stroked-button color="primary" (click)="markAllAsRead()" *ngIf="unreadCount > 0">
          Mark all as read ({{ unreadCount }})
        </button>
      </div>

      <div *ngIf="loading" class="text-center py-5 text-muted">Loading...</div>

      <div *ngIf="!loading && notifications.length === 0" class="text-center py-5 text-muted">
        <mat-icon style="font-size: 48px; width: 48px; height: 48px;">notifications_none</mat-icon>
        <p class="mt-2">No notifications yet</p>
      </div>

      <div *ngFor="let note of notifications"
        class="d-flex align-items-start gap-3 p-3 mb-2 rounded border"
        [class.bg-light]="!note.is_read"
        [class.bg-white]="note.is_read">
        <mat-icon [class]="note.is_read ? 'text-muted' : getNotificationClass(note.notification_type)" style="flex-shrink:0; margin-top:2px;">
          {{ getNotificationIcon(note.notification_type) }}
        </mat-icon>
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between align-items-start">
            <span class="fw-semibold" [class.text-muted]="note.is_read">{{ note.title }}</span>
            <small class="text-muted ms-2" style="white-space:nowrap;">{{ note.created_at | date:'short' }}</small>
          </div>
          <p class="mb-1 text-muted" style="font-size:0.88rem;">{{ note.message }}</p>
          <span class="badge rounded-pill" [class]="getBadgeClass(note.notification_type)" style="font-size:0.72rem;">
            {{ note.notification_type }}
          </span>
        </div>
        <button *ngIf="!note.is_read" mat-icon-button class="text-success" (click)="markAsRead(note)" title="Mark as read">
          <mat-icon>done</mat-icon>
        </button>
      </div>
    </div>
  `
})
export class NotificationsComponent implements OnInit {

  notifications: AppNotification[] = [];
  unreadCount = 0;
  loading = true;

  constructor(private notificationService: NotificationService) {}
=======
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
>>>>>>> 357f28c3b3005d7b8f29177f5320ff47038d5dff

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
<<<<<<< HEAD
    this.loading = true;
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.unreadCount = data.filter(n => !n.is_read).length;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  markAsRead(note: AppNotification): void {
    this.notificationService.markAsRead(note.id).subscribe({
      next: () => {
        note.is_read = true;
        this.unreadCount = this.notifications.filter(n => !n.is_read).length;
=======
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
>>>>>>> 357f28c3b3005d7b8f29177f5320ff47038d5dff
      }
    });
  }

  markAllAsRead(): void {
<<<<<<< HEAD
    const unread = this.notifications.filter(n => !n.is_read);
    unread.forEach(note => {
      this.notificationService.markAsRead(note.id).subscribe({
        next: () => {
          note.is_read = true;
          this.unreadCount = this.notifications.filter(n => !n.is_read).length;
        }
      });
    });
  }

  getNotificationIcon(type: string): string {
=======
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
>>>>>>> 357f28c3b3005d7b8f29177f5320ff47038d5dff
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

<<<<<<< HEAD
  getNotificationClass(type: string): string {
    switch (type) {
      case 'Project Update':        return 'text-primary';
      case 'Task Assignment':       return 'text-info';
      case 'Procurement Alert':     return 'text-warning';
      case 'Attendance Alert':      return 'text-success';
      case 'Deadline Notification': return 'text-danger';
      case 'System Notification':   return 'text-secondary';
      default:                      return 'text-muted';
    }
  }

  getBadgeClass(type: string): string {
    switch (type) {
      case 'Project Update':        return 'bg-primary text-white';
      case 'Task Assignment':       return 'bg-info text-white';
      case 'Procurement Alert':     return 'bg-warning text-dark';
      case 'Attendance Alert':      return 'bg-success text-white';
      case 'Deadline Notification': return 'bg-danger text-white';
      case 'System Notification':   return 'bg-secondary text-white';
      default:                      return 'bg-light text-dark';
=======
  getLeftColor(type: string): string {
    switch (type) {
      case 'Project Update':        return '#3b82f6'; // Blue
      case 'Task Assignment':       return '#06b6d4'; // Cyan
      case 'Procurement Alert':     return '#ff7a00'; // Orange
      case 'Attendance Alert':      return '#10b981'; // Green
      case 'Deadline Notification': return '#ef4444'; // Red
      case 'System Notification':   return '#64748b'; // Gray
      default:                      return '#94a3b8';
>>>>>>> 357f28c3b3005d7b8f29177f5320ff47038d5dff
    }
  }
}
