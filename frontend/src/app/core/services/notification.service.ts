import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export type NotificationType =
  | 'Project Update'
  | 'Task Assignment'
  | 'Procurement Alert'
  | 'Attendance Alert'
  | 'Deadline Notification'
  | 'System Notification';

// Renamed to AppNotification to avoid conflict with browser's built-in Notification API
export interface AppNotification {
  id: number;
  user_id: number;
  notification_type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = 'http://127.0.0.1:8000/notifications';

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(this.apiUrl);
  }

  markAsRead(id: number): Observable<AppNotification> {
    return this.http.put<AppNotification>(`${this.apiUrl}/${id}/read`, {});
  }

  deleteNotification(id: number): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
