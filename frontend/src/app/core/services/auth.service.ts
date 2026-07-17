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

  private getMockName(email: string): string {
    const emailLower = email.toLowerCase();
    if (emailLower.startsWith('admin')) return 'Admin User';
    if (emailLower.startsWith('pm')) return 'Liam Thompson';
    if (emailLower.startsWith('engineer')) return 'Alex Rivera';
    if (emailLower.startsWith('contractor')) return 'Marcus Vance';
    if (emailLower.startsWith('client')) return 'Olivia Martinez';
    if (emailLower.startsWith('worker')) return 'Liam Thompson';
    if (emailLower.startsWith('google')) return 'Google User';
    if (emailLower.startsWith('facebook')) return 'Facebook User';
    
    const username = email.split('@')[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  }

  login(email: string, password: string, role: string): Observable<any> {
    console.log("AuthService login called (mock-only)");

    const user: User = {
      name: this.getMockName(email),
      email: email,
      role: role,
      token: 'mock-jwt-token-id'
    };

    localStorage.setItem("bt_user", JSON.stringify(user));
    this.currentUserSubject.next(user);

    return of({ access_token: 'mock-jwt-token-id' });
  }

  register(name: string, email: string, role: string): Observable<any> {
    console.log("AuthService register called (mock-only)");

    const user: User = {
      name: name,
      email: email,
      role: role,
      token: 'mock-jwt-token-id'
    };

    localStorage.setItem("bt_user", JSON.stringify(user));
    this.currentUserSubject.next(user);

    return of({ message: "User registered successfully" });
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