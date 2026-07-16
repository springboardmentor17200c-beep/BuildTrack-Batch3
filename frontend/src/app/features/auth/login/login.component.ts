import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="auth-container d-flex align-items-center justify-content-center min-vh-100 p-4">
      <div class="auth-card row g-0 shadow-lg border-0 fade-in">
        <!-- Left Banner Column -->
        <div class="col-lg-6 d-none d-lg-flex flex-column justify-content-between p-5 bg-gradient text-white position-relative overflow-hidden">
          <div class="z-1">
            <div class="d-flex align-items-center gap-2 mb-4">
              <mat-icon class="fs-1 text-warning" style="width: 40px; height: 40px; font-size: 40px;">construction</mat-icon>
              <h2 class="h3 fw-bold mb-0 text-white">BuildTrack</h2>
            </div>
            <h1 class="display-5 fw-bold text-white mb-3 text-leading">Real-Time Site Monitoring & Management</h1>
            <p class="text-white-50 lead">Empower your construction team with digitized resource scheduling, active material inventory tracking, and visual site dashboards.</p>
          </div>
          <div class="mt-5 border-top border-light border-opacity-25 pt-4 z-1">
            <div class="d-flex align-items-center gap-3">
              <div class="avatar-group-img bg-warning text-dark fw-bold">BT</div>
              <div>
                <p class="mb-0 fw-semibold text-white">BuildTrack Systems</p>
                <p class="text-white-50 text-xs mb-0">Platform Version 18.0</p>
              </div>
            </div>
          </div>
          <!-- Decorative Background Elements -->
          <div class="bg-circle bg-circle-1"></div>
          <div class="bg-circle bg-circle-2"></div>
        </div>

        <!-- Right Form Column -->
        <div class="col-lg-6 p-5 bg-white d-flex flex-column justify-content-center">
          <div class="text-center text-lg-start mb-4">
            <h2 class="fw-bold mb-1 fs-3">Welcome Back</h2>
            <p class="text-muted text-sm">Please sign in to access your dashboard</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="d-flex flex-column gap-3">
            <!-- Email Field -->
            <div class="form-group-custom">
              <label class="bt-form-label">Email Address</label>
              <input type="email" class="form-control bt-form-control" formControlName="email" placeholder="name@company.com" 
                     [class.is-invalid]="submitted && f['email'].errors">
              <div *ngIf="submitted && f['email'].errors" class="invalid-feedback text-xs">
                <span *ngIf="f['email'].errors['required']">Email is required</span>
                <span *ngIf="f['email'].errors['email']">Please enter a valid email address</span>
              </div>
            </div>

            <!-- Password Field -->
            <div class="form-group-custom">
              <label class="bt-form-label">Password</label>
              <div class="position-relative">
                <input [type]="showPassword ? 'text' : 'password'" class="form-control bt-form-control pe-5" formControlName="password" placeholder="••••••••"
                       [class.is-invalid]="submitted && f['password'].errors">
                <button type="button" class="btn-eye" (click)="showPassword = !showPassword">
                  <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>
              <div *ngIf="submitted && f['password'].errors" class="invalid-feedback d-block text-xs" style="margin-top: 4px;">
                <span *ngIf="f['password'].errors['required']">Password is required</span>
                <span *ngIf="f['password'].errors['minlength']">Password must be at least 6 characters</span>
              </div>
            </div>

            <!-- Role Selector -->
            <div class="form-group-custom">
              <label class="bt-form-label">Select System Role</label>
              <select class="form-select bt-form-control" formControlName="role" [class.is-invalid]="submitted && f['role'].errors">
                <option value="" disabled selected>Choose your role...</option>
                <option value="Admin">Administrator</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Site Engineer">Site Engineer</option>
                <option value="Contractor">Contractor</option>
                <option value="Client">Client / Owner</option>
              </select>
              <div *ngIf="submitted && f['role'].errors" class="invalid-feedback text-xs">
                <span *ngIf="f['role'].errors['required']">Role selection is required</span>
              </div>
            </div>

            <div class="d-flex align-items-center justify-content-between my-2">
              <div class="form-check">
                <input class="form-check-input check-warning" type="checkbox" id="rememberMe">
                <label class="form-check-label text-xs text-muted" for="rememberMe">Remember me</label>
              </div>
              <a routerLink="/forgot-password" class="text-warning text-xs text-decoration-none fw-semibold hover-underline">Forgot Password?</a>
            </div>

            <button type="submit" class="btn btn-bt-primary w-100 py-3 mt-2 fs-6 d-flex align-items-center justify-content-center gap-2">
              <span>Sign In</span>
              <mat-icon style="font-size: 20px; width: 20px; height: 20px;">login</mat-icon>
            </button>

            <!-- Error message banner -->
            <div *ngIf="error" class="alert alert-danger py-2 px-3 rounded text-xs mt-2" role="alert">
              {{ error }}
            </div>
          </form>

          <p class="text-center text-muted text-sm mt-4 mb-0">
            Don't have an account? 
            <a routerLink="/register" class="text-warning text-decoration-none fw-semibold hover-underline">Register here</a>
          </p>

          <!-- Quick Login Section (Evaluation Feature) -->
          <div class="mt-4 border-top border-light border-2 pt-4">
            <h6 class="text-muted text-center text-xs fw-bold tracking-wider text-uppercase mb-3">Quick Login (Testing)</h6>
            <div class="d-flex flex-wrap justify-content-center gap-2">
              <button (click)="quickLogin('admin@buildtrack.com', 'Admin')" class="btn btn-xs btn-outline-secondary px-3 py-1 text-xxs">Admin</button>
              <button (click)="quickLogin('pm@buildtrack.com', 'Project Manager')" class="btn btn-xs btn-outline-secondary px-3 py-1 text-xxs">Manager</button>
              <button (click)="quickLogin('engineer@buildtrack.com', 'Site Engineer')" class="btn btn-xs btn-outline-secondary px-3 py-1 text-xxs">Engineer</button>
              <button (click)="quickLogin('contractor@buildtrack.com', 'Contractor')" class="btn btn-xs btn-outline-secondary px-3 py-1 text-xxs">Contractor</button>
              <button (click)="quickLogin('client@buildtrack.com', 'Client')" class="btn btn-xs btn-outline-secondary px-3 py-1 text-xxs">Client</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%);
    }
    .auth-card {
      background-color: #ffffff;
      border-radius: var(--border-radius-lg);
      max-width: 960px;
      width: 100%;
      overflow: hidden;
    }
    .bg-gradient {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
    }
    .text-leading {
      line-height: 1.15;
    }
    .text-xxs {
      font-size: 0.72rem;
    }
    .text-xs {
      font-size: 0.8rem;
    }
    .text-sm {
      font-size: 0.9rem;
    }
    .z-1 {
      position: relative;
      z-index: 1;
    }
    .avatar-group-img {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 4px 10px rgba(255, 122, 0, 0.25);
    }
    .bg-circle {
      position: absolute;
      background: radial-gradient(circle, rgba(255, 122, 0, 0.15) 0%, rgba(255, 122, 0, 0) 70%);
      border-radius: 50%;
    }
    .bg-circle-1 {
      width: 300px;
      height: 300px;
      top: -100px;
      right: -100px;
    }
    .bg-circle-2 {
      width: 400px;
      height: 400px;
      bottom: -150px;
      left: -150px;
    }
    .form-group-custom {
      display: flex;
      flex-column: column;
      margin-bottom: 0.5rem;
    }
    .btn-eye {
      position: absolute;
      top: 50%;
      right: 15px;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      color: var(--slate-400);
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 0;
    }
    .btn-eye:hover {
      color: var(--slate-700);
    }
    .check-warning:checked {
      background-color: var(--primary);
      border-color: var(--primary);
    }
    .btn-xs {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
    }
    .hover-underline:hover {
      text-decoration: underline !important;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  showPassword = false;
  error = '';
  returnUrl = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
     
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required]
    });

    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // Redirect to home dashboard if already logged in
    if (this.authService.isLoggedIn) {
      this.redirectToDashboard(this.authService.userRole || '');
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
  
    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    const { email, password, role } = this.loginForm.value;
    console.log("Login button clicked");
    this.authService.login(email, password, role).subscribe({
      next: (response) => {
        console.log("Login Success", response);
        this.redirectToDashboard(role);
      },
      error: err => {
        console.log("Login Error", err);
        this.error = err.message || 'Login failed. Please check credentials.';
      }
    });
  }

  quickLogin(email: string, role: string): void {
    this.loginForm.patchValue({ email, password: 'password123', role });
    this.onSubmit();
  }

  private redirectToDashboard(role: string): void {
    switch (role) {
      case 'Admin':
        this.router.navigate(['/dashboard/admin']);
        break;
      case 'Project Manager':
        this.router.navigate(['/dashboard/manager']);
        break;
      case 'Site Engineer':
        this.router.navigate(['/dashboard/engineer']);
        break;
      case 'Contractor':
        this.router.navigate(['/dashboard/contractor']);
        break;
      case 'Client':
        this.router.navigate(['/dashboard/client']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}
