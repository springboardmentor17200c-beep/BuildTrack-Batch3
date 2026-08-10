import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NotificationService, AppNotification } from '../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
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

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
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
      }
    });
  }

  markAllAsRead(): void {
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
    }
  }
}
