import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id?: number;
  name: string;
  email: string;
  role: string;
  token?: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: Omit<User, 'token'>;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/users';

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('bt_user');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isLoggedIn(): boolean {
    return !!this.currentUserValue?.token;
  }

  public get userRole(): string | null {
    return this.currentUserValue?.role || null;
  }

  login(email: string, password: string): Observable<LoginResponse> {
    const body = new HttpParams()
      .set('username', email)
      .set('password', password);

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      body.toString(),
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded'
        })
      }
    ).pipe(
      tap(response => {
        const user: User = { ...response.user, token: response.access_token };
        localStorage.setItem('bt_user', JSON.stringify(user));
        localStorage.setItem('bt_token', response.access_token);
        this.currentUserSubject.next(user);
      })
    );
  }


 

 register(
  name: string,
  email: string,
  password: string,
  role: string,
  phone: string
): Observable<any> {

  return this.http.post(`${this.apiUrl}/register`, {
    name,
    email,
    password,
    role,
    phone
  });

}


  resetPassword(email: string): Observable<boolean> {
    console.log('Reset password:', email);
    return of(true);
  }

  setCurrentUser(user: User): void {
    localStorage.setItem('bt_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  logout(): void {
    localStorage.removeItem('bt_user');
    localStorage.removeItem('bt_token');
    this.currentUserSubject.next(null);
  }

  updateProfile(name: string, email: string): Observable<User | null> {
    if (this.currentUserValue) {
      const updatedUser: User = { ...this.currentUserValue, name, email };
      localStorage.setItem('bt_user', JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
      return of(updatedUser);
    }

    return of(null);
  }
}
