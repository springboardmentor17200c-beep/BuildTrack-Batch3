import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new BehaviorSubject<ToastMessage | null>(null);
  public toast$: Observable<ToastMessage | null> = this.toastSubject.asObservable();
  private timeoutId: any;

  showSuccess(message: string): void {
    this.show({ message, type: 'success' });
  }

  showError(message: string): void {
    this.show({ message, type: 'error' });
  }

  show(toast: ToastMessage): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.toastSubject.next(toast);
    this.timeoutId = setTimeout(() => {
      this.clear();
    }, 4000);
  }

  clear(): void {
    this.toastSubject.next(null);
  }
}
