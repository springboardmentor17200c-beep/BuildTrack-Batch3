import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { OtpService } from '../../../core/services/otp.service';
import { ToastService } from '../../../core/services/toast.service';
import { ToastComponent } from '../../../shared/components/toast/toast.component';

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
    MatIconModule,
    ToastComponent
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
          <!-- Step 1: Email Form -->
          <div *ngIf="step === 1" class="fade-in">
            <div class="text-center text-lg-start mb-4">
              <h2 class="fw-bold mb-1 fs-3">Forgot Password</h2>
              <p class="text-muted text-sm">Enter your email to receive a verification code</p>
            </div>

            <form [formGroup]="emailForm" (ngSubmit)="onRequestOtp()" class="d-flex flex-column gap-3">
              <div class="form-group-custom">
                <label class="bt-form-label">Registered Email Address</label>
                <input type="email" class="form-control bt-form-control" formControlName="email" placeholder="name@company.com"
                       [class.is-invalid]="submittedEmail && fe['email'].errors">
                <div *ngIf="submittedEmail && fe['email'].errors" class="invalid-feedback text-xs">
                  <span *ngIf="fe['email'].errors['required']">Email is required</span>
                  <span *ngIf="fe['email'].errors['email']">Please enter a valid email address</span>
                </div>
              </div>

              <button type="submit" class="btn btn-bt-primary w-100 py-3 mt-2 fs-6 d-flex align-items-center justify-content-center gap-2" [disabled]="isLoading">
                <span *ngIf="!isLoading">Send Verification Code</span>
                <span *ngIf="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <mat-icon *ngIf="!isLoading" style="font-size: 20px; width: 20px; height: 20px;">send_to_mobile</mat-icon>
              </button>

              <a routerLink="/login" class="btn btn-bt-outline w-100 py-3 d-flex align-items-center justify-content-center gap-2 mt-2" [class.disabled]="isLoading">
                <mat-icon>arrow_back</mat-icon>
                <span>Cancel & Sign In</span>
              </a>
            </form>
          </div>

          <!-- Step 2: OTP Verification Form -->
          <div *ngIf="step === 2" class="fade-in">
            <div class="text-center text-lg-start mb-4">
              <h2 class="fw-bold mb-1 fs-3">Verify OTP</h2>
              <p class="text-muted text-sm">Enter the 6-digit code sent to your email (Check browser console)</p>
            </div>

            <form [formGroup]="otpForm" (ngSubmit)="onVerifyOtp()" class="d-flex flex-column gap-3">
              <div class="form-group-custom">
                <label class="bt-form-label">Verification Code (OTP)</label>
                <input type="text" class="form-control bt-form-control text-center fs-4 letter-spacing-wide" formControlName="otp" placeholder="000000" maxlength="6"
                       [class.is-invalid]="submittedOtp && fo['otp'].errors">
                <div *ngIf="submittedOtp && fo['otp'].errors" class="invalid-feedback text-xs text-start">
                  <span *ngIf="fo['otp'].errors['required']">Verification code is required</span>
                  <span *ngIf="fo['otp'].errors['pattern']">Verification code must be exactly 6 digits</span>
                </div>
              </div>

              <button type="submit" class="btn btn-bt-primary w-100 py-3 mt-2 fs-6 d-flex align-items-center justify-content-center gap-2" [disabled]="isLoading">
                <span *ngIf="!isLoading">Verify Code</span>
                <span *ngIf="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <mat-icon *ngIf="!isLoading" style="font-size: 20px; width: 20px; height: 20px;">verified_user</mat-icon>
              </button>

              <div class="d-flex justify-content-between align-items-center mt-2">
                <button type="button" class="btn btn-link text-warning text-xs text-decoration-none fw-semibold p-0" (click)="onResendOtp()" [disabled]="isLoading">
                  Resend OTP
                </button>
                <button type="button" class="btn btn-link text-muted text-xs text-decoration-none p-0" (click)="changeStep(1)" [disabled]="isLoading">
                  Change Email
                </button>
              </div>
            </form>
          </div>

          <!-- Step 3: Reset Password Form -->
          <div *ngIf="step === 3" class="fade-in">
            <div class="text-center text-lg-start mb-4">
              <h2 class="fw-bold mb-1 fs-3">Choose New Password</h2>
              <p class="text-muted text-sm">Please enter a new secure password for your account</p>
            </div>

            <form [formGroup]="passwordForm" (ngSubmit)="onResetPassword()" class="d-flex flex-column gap-3">
              <!-- Password Field -->
              <div class="form-group-custom">
                <label class="bt-form-label">New Password</label>
                <input type="password" class="form-control bt-form-control" formControlName="password" placeholder="••••••••"
                       [class.is-invalid]="submittedPassword && fp['password'].errors">
                <div *ngIf="submittedPassword && fp['password'].errors" class="invalid-feedback text-xs">
                  <span *ngIf="fp['password'].errors['required']">Password is required</span>
                  <span *ngIf="fp['password'].errors['minlength']">Password must be at least 6 characters</span>
                </div>
              </div>

              <!-- Confirm Password Field -->
              <div class="form-group-custom">
                <label class="bt-form-label">Confirm New Password</label>
                <input type="password" class="form-control bt-form-control" formControlName="confirmPassword" placeholder="••••••••"
                       [class.is-invalid]="submittedPassword && fp['confirmPassword'].errors">
                <div *ngIf="submittedPassword && fp['confirmPassword'].errors" class="invalid-feedback text-xs">
                  <span *ngIf="fp['confirmPassword'].errors['required']">Confirmation is required</span>
                  <span *ngIf="fp['confirmPassword'].errors['passwordMismatch']">Passwords must match</span>
                </div>
              </div>

              <button type="submit" class="btn btn-bt-primary w-100 py-3 mt-2 fs-6 d-flex align-items-center justify-content-center gap-2" [disabled]="isLoading">
                <span *ngIf="!isLoading">Update Password</span>
                <span *ngIf="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <mat-icon *ngIf="!isLoading" style="font-size: 20px; width: 20px; height: 20px;">lock_reset</mat-icon>
              </button>
            </form>
          </div>

          <!-- Step 4: Success State -->
          <div *ngIf="step === 4" class="text-center py-4 fade-in">
            <div class="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle mb-3" style="width: 60px; height: 60px;">
              <mat-icon style="font-size: 32px; width: 32px; height: 32px;">check_circle</mat-icon>
            </div>
            <h4 class="fw-bold text-dark">Password Updated</h4>
            <p class="text-muted text-sm px-3 mb-4">Your account credentials have been successfully updated. You can now log in using your new password.</p>
            
            <a routerLink="/login" class="btn btn-bt-primary w-100 py-3 d-flex align-items-center justify-content-center gap-2">
              <mat-icon>arrow_back</mat-icon>
              <span>Back to Sign In</span>
            </a>
          </div>
          
          <!-- Shared error alert banner inside step forms -->
          <div *ngIf="error && step !== 4" class="alert alert-danger py-2 px-3 rounded text-xs mt-3 mb-0" role="alert">
            {{ error }}
          </div>
        </div>
      </div>
    </div>
    <!-- Reusable Toast Alert Component -->
    <app-toast></app-toast>
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
      flex-direction: column;
      margin-bottom: 0.5rem;
    }
    .letter-spacing-wide {
      letter-spacing: 0.2em;
    }
  `]
})
export class ForgotPasswordComponent implements OnInit {
  step = 1;
  isLoading = false;
  error = '';
  resetEmail = '';

  // Step 1: Email Request Form
  emailForm!: FormGroup;
  submittedEmail = false;

  // Step 2: OTP Verification Form
  otpForm!: FormGroup;
  submittedOtp = false;

  // Step 3: Password Update Form
  passwordForm!: FormGroup;
  submittedPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private otpService: OtpService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.otpForm = this.formBuilder.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });

    this.passwordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.mustMatch('password', 'confirmPassword')
    });
  }

  // Getters for easy form controls access
  get fe() { return this.emailForm.controls; }
  get fo() { return this.otpForm.controls; }
  get fp() { return this.passwordForm.controls; }

  // Custom password matching validator
  mustMatch(controlName: string, matchingControlName: string) {
    return (group: AbstractControl) => {
      const formGroup = group as FormGroup;
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (!control || !matchingControl) return null;

      if (matchingControl.errors && !matchingControl.errors['passwordMismatch']) {
        return null;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ passwordMismatch: true });
      } else {
        matchingControl.setErrors(null);
      }
      return null;
    };
  }

  changeStep(newStep: number): void {
    this.step = newStep;
    this.error = '';
    this.isLoading = false;
  }

  // Action 1: Submit Email to trigger OTP
  onRequestOtp(): void {
    this.submittedEmail = true;
    this.error = '';

    if (this.emailForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.resetEmail = this.emailForm.value.email;

    this.otpService.sendOtp(this.resetEmail).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.showSuccess(`Verification OTP sent to ${this.resetEmail}.`);
        this.changeStep(2);
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.message || 'Failed to dispatch verification code.';
        this.toastService.showError(this.error);
      }
    });
  }

  // Action 2: Trigger OTP resend
  onResendOtp(): void {
    this.isLoading = true;
    this.error = '';
    this.otpService.sendOtp(this.resetEmail).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.showSuccess('A fresh OTP code has been logged to your console.');
      },
      error: ((): any) => {
        this.isLoading = false;
        this.toastService.showError('Resend limit reached, please wait.');
      }
    });
  }

  // Action 3: Verify OTP code
  onVerifyOtp(): void {
    this.submittedOtp = true;
    this.error = '';

    if (this.otpForm.invalid) {
      return;
    }

    this.isLoading = true;
    const otp = this.otpForm.value.otp;

    this.otpService.verifyOtp(otp).subscribe({
      next: (isValid) => {
        this.isLoading = false;
        if (isValid) {
          this.toastService.showSuccess('OTP verification successful!');
          this.changeStep(3);
        } else {
          this.error = 'Invalid 6-digit verification code. Please check console logs.';
          this.toastService.showError(this.error);
        }
      },
      error: () => {
        this.isLoading = false;
        this.error = 'An error occurred during verification.';
        this.toastService.showError(this.error);
      }
    });
  }

  // Action 4: Update Password
  onResetPassword(): void {
    this.submittedPassword = true;
    this.error = '';

    if (this.passwordForm.invalid) {
      return;
    }

    this.isLoading = true;
    
    // Simulate updating credentials in auth service with a delay
    setTimeout(() => {
      this.isLoading = false;
      this.toastService.showSuccess('Password updated successfully!');
      this.changeStep(4);
    }, 1000);
  }
}
