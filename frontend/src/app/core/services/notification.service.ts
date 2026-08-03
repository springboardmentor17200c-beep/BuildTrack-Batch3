import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notification {
  id: number;
  user_id: number;
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

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl);
  }

  markAsRead(id: number): Observable<Notification> {
    return this.http.put<Notification>(`${this.apiUrl}/${id}/read`, {});
  }
}
