import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

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
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor() {
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
    return this.currentUserValue ? this.currentUserValue.role : null;
  }

  login(email: string, role: string): Observable<User> {
    // Simulated JWT login. Any credentials will pass.
    const mockUser: User = {
      name: this.getUserNameByRole(role),
      email: email,
      role: role,
      token: 'mock-jwt-token-xyz-123'
    };
    
    localStorage.setItem('bt_user', JSON.stringify(mockUser));
    this.currentUserSubject.next(mockUser);
    return of(mockUser);
  }

  register(name: string, email: string, role: string): Observable<User> {
    // Simulated registration
    const mockUser: User = {
      name: name,
      email: email,
      role: role,
      token: 'mock-jwt-token-xyz-123'
    };
    
    localStorage.setItem('bt_user', JSON.stringify(mockUser));
    this.currentUserSubject.next(mockUser);
    return of(mockUser);
  }

  resetPassword(email: string): Observable<boolean> {
    // Simulated forgot password
    console.log(`Password reset link sent to: ${email}`);
    return of(true);
  }

  logout(): void {
    localStorage.removeItem('bt_user');
    this.currentUserSubject.next(null);
  }

  updateProfile(name: string, email: string): Observable<User | null> {
    if (this.currentUserValue) {
      const updatedUser = { ...this.currentUserValue, name, email };
      localStorage.setItem('bt_user', JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
      return of(updatedUser);
    }
    return of(null);
  }

  private getUserNameByRole(role: string): string {
    switch(role) {
      case 'Admin': return 'John Doe (Admin)';
      case 'Project Manager': return 'Sarah Jenkins';
      case 'Site Engineer': return 'Alex Rivera';
      case 'Contractor': return 'Marcus Vance';
      case 'Client': return 'BuildCorp Developments';
      default: return 'User';
    }
  }
}
