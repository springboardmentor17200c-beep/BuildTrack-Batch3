import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export type NotificationType =
  | 'Project Update'
  | 'Task Assignment'
  | 'Procurement Alert'
  | 'Attendance Alert'
  | 'Deadline Notification'
  | 'System Notification';

export interface Notification {
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

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('bt_token') || '';
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/`, this.getAuthHeaders()).pipe(
      catchError(err => {
        console.error('Error fetching notifications:', err);
        return of([]);
      })
    );
  }

  markAsRead(id: number): Observable<Notification | null> {
    return this.http.put<Notification>(`${this.apiUrl}/${id}/read`, {}, this.getAuthHeaders()).pipe(
      catchError(err => {
        console.error('Error marking notification as read:', err);
        return of(null);
      })
    );
  }

  createNotification(notification: { user_id: number; notification_type?: string; title: string; message: string }): Observable<Notification | null> {
    return this.http.post<Notification>(`${this.apiUrl}/`, notification, this.getAuthHeaders()).pipe(
      catchError(err => {
        console.error('Error creating notification:', err);
        return of(null);
      })
    );
  }

  deleteNotification(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`, this.getAuthHeaders()).pipe(
      catchError(() => of(false))
    );
  }
}
