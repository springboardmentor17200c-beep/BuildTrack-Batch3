import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
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
            <h1 class="display-5 fw-bold text-white mb-3 text-leading">Recover Your Password Access</h1>
            <p class="text-white-50 lead">Enter your registered email below, and we will send you instructions to safely reset your password credentials and restore account security.</p>
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
            <h2 class="fw-bold mb-1 fs-3">Reset Password</h2>
            <p class="text-muted text-sm">Retrieve access to your BuildTrack account</p>
          </div>

          <!-- Success State -->
          <div *ngIf="success" class="text-center py-4 fade-in">
            <div class="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle mb-3" style="width: 60px; height: 60px;">
              <mat-icon style="font-size: 32px; width: 32px; height: 32px;">check_circle</mat-icon>
            </div>
            <h4 class="fw-bold text-dark">Reset Email Sent</h4>
            <p class="text-muted text-sm px-3 mb-4">We've sent recovery details to the email <strong>{{ resetEmail }}</strong>. Please check your inbox and spam folders.</p>
            <a routerLink="/login" class="btn btn-bt-primary w-100 py-3 d-flex align-items-center justify-content-center gap-2">
              <mat-icon>arrow_back</mat-icon>
              <span>Back to Sign In</span>
            </a>
          </div>

          <!-- Form State -->
          <form *ngIf="!success" [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="d-flex flex-column gap-3">
            <div class="form-group-custom">
              <label class="bt-form-label">Registered Email Address</label>
              <input type="email" class="form-control bt-form-control" formControlName="email" placeholder="name@company.com"
                     [class.is-invalid]="submitted && f['email'].errors">
              <div *ngIf="submitted && f['email'].errors" class="invalid-feedback text-xs">
                <span *ngIf="f['email'].errors['required']">Email is required</span>
                <span *ngIf="f['email'].errors['email']">Please enter a valid email address</span>
              </div>
            </div>

            <button type="submit" class="btn btn-bt-primary w-100 py-3 mt-2 fs-6 d-flex align-items-center justify-content-center gap-2">
              <span>Send Recovery Link</span>
              <mat-icon style="font-size: 20px; width: 20px; height: 20px;">send_to_mobile</mat-icon>
            </button>

            <!-- Error message banner -->
            <div *ngIf="error" class="alert alert-danger py-2 px-3 rounded text-xs mt-2" role="alert">
              {{ error }}
            </div>

            <a routerLink="/login" class="btn btn-bt-outline w-100 py-3 d-flex align-items-center justify-content-center gap-2 mt-2">
              <mat-icon>arrow_back</mat-icon>
              <span>Cancel & Sign In</span>
            </a>
          </form>
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
  `]
})
export class ForgotPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  submitted = false;
  success = false;
  resetEmail = '';
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.resetForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() { return this.resetForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';

    if (this.resetForm.invalid) {
      return;
    }

    const email = this.resetForm.value.email;
    this.authService.resetPassword(email).subscribe({
      next: () => {
        this.resetEmail = email;
        this.success = true;
      },
      error: err => {
        this.error = err.message || 'Error executing request.';
      }
    });
  }
}
