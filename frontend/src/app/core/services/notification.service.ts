import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { NotificationItem } from '../interfaces/notification.interface';
import { AuthService } from './auth.service';

interface ApiNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://127.0.0.1:8000/notifications';

  private notificationsSubject = new BehaviorSubject<NotificationItem[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getNotifications(): Observable<NotificationItem[]> {
    return this.http.get<ApiNotification[]>(`${this.apiUrl}/`).pipe(
      map(items => items.map(item => this.toNotification(item))),
      tap(notifications => this.notificationsSubject.next(notifications)),
      catchError(err => {
        console.error('Error fetching notifications from API', err);
        return of(this.notificationsSubject.value);
      })
    );
  }

  createNotification(title: string, message: string, type: NotificationItem['type'] = 'General'): Observable<NotificationItem> {
    const userId = this.authService.currentUserValue?.id || 1;
    const payload = {
      user_id: userId,
      title: title,
      message: message,
      type: type
    };

    return this.http.post<ApiNotification>(`${this.apiUrl}/`, payload).pipe(
      map(item => this.toNotification(item)),
      tap(() => this.getNotifications().subscribe())
    );
  }

  markAsRead(id: number): Observable<NotificationItem | undefined> {
    return this.http.patch<ApiNotification>(`${this.apiUrl}/${id}/read`, {}).pipe(
      map(item => this.toNotification(item)),
      tap(() => this.getNotifications().subscribe()),
      catchError(err => {
        console.error(`Error marking notification #${id} as read, performing local update`, err);
        // Fallback local update
        const updatedList = this.notificationsSubject.value.map(n => {
          if (n.id === id) {
            return { ...n, isRead: true };
          }
          return n;
        });
        this.notificationsSubject.next(updatedList);
        return of(undefined);
      })
    );
  }

  deleteNotification(id: number): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      tap(() => this.getNotifications().subscribe()),
      catchError(() => of(false))
    );
  }

  private toNotification(item: ApiNotification): NotificationItem {
    return {
      id: item.id,
      userId: item.user_id,
      title: item.title,
      message: item.message,
      isRead: item.is_read,
      createdAt: item.created_at,
      type: (item.type || 'General') as NotificationItem['type']
    };
  }
}
