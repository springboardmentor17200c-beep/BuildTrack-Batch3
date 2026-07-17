import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OtpService {
  private generatedOtp: string = '';

  sendOtp(email: string): Observable<boolean> {
    // Generate a random 6-digit OTP
    this.generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Output code to console for easy developer testing and validation
    console.log(`%c[MOCK OTP SERVICE] Code for ${email} is: ${this.generatedOtp}`, 'color: #ff7a00; font-weight: bold; font-size: 14px;');
    
    // Simulate slight API network latency
    return of(true).pipe(delay(800));
  }

  verifyOtp(otp: string): Observable<boolean> {
    const isValid = otp === this.generatedOtp;
    return of(isValid).pipe(delay(800));
  }
}
