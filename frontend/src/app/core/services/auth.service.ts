import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  name: string;
  email: string;
  role: string;
  token?: string;
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
    return !!this.currentUserValue;
  }

  public get userRole(): string | null {
    return this.currentUserValue?.role || null;
  }

  login(email: string, password: string, role: string): Observable<any> {

    console.log("AuthService login called");

    const body = new URLSearchParams();
    body.set("username", email);
    body.set("password", password);

    const headers = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded"
    });

    return this.http.post<any>(
      `${this.apiUrl}/login`,
      body.toString(),
      { headers }
    ).pipe(

      tap(response => {

        const user: User = {
          name: email,
          email: email,
          role: role,
          token: response.access_token
        };

        localStorage.setItem("bt_user", JSON.stringify(user));
        this.currentUserSubject.next(user);

      })

    );

  }

  register(name: string, email: string, role: string): Observable<any> {

    return this.http.post<any>(`${this.apiUrl}/register`, {
      name: name,
      email: email,
      password: "password123",
      role: role,
      phone: ""
    });

  }

  resetPassword(email: string): Observable<boolean> {

    console.log("Reset password:", email);
    return of(true);

  }

  logout(): void {

    localStorage.removeItem("bt_user");
    this.currentUserSubject.next(null);

  }

  updateProfile(name: string, email: string): Observable<User | null> {

    if (this.currentUserValue) {

      const updatedUser: User = {
        ...this.currentUserValue,
        name,
        email
      };

      localStorage.setItem("bt_user", JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);

      return of(updatedUser);
    }

    return of(null);

  }

}