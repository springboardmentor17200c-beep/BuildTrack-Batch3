import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  status: 'Active' | 'Locked' | 'Pending';
  lastActive?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = 'http://127.0.0.1:8000/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<UserRecord[]> {
    return this.http.get<UserRecord[]>(`${this.apiUrl}/`).pipe(
      map(users => users.map(u => ({
        ...u,
        status: u.status || 'Active',
        lastActive: 'Active Now'
      }))),
      catchError(err => {
        console.error('Error fetching users from API', err);
        return of([]);
      })
    );
  }

  registerUser(data: { name: string; email: string; password?: string; role: string }): Observable<UserRecord> {
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password || 'BuildTrack123!',
      role: data.role
    };

    return this.http.post<{ message: string; user: UserRecord }>(`${this.apiUrl}/register`, payload).pipe(
      map(res => ({
        ...res.user,
        status: 'Active',
        lastActive: 'Just registered'
      }))
    );
  }

  updateUserRole(userId: number, role: string): Observable<UserRecord> {
    return this.http.put<UserRecord>(`${this.apiUrl}/${userId}/role`, { role });
  }

  deleteUser(userId: number): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/${userId}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
