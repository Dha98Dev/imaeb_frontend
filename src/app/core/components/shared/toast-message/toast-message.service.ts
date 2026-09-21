import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ToastMessage, ToastOptions, ToastType } from './toast-message.interface';

@Injectable({
  providedIn: 'root',
})
export class ToastMessageService {
  private readonly toastSubject = new BehaviorSubject<ToastMessage[]>([]);

  public readonly toast$ = this.toastSubject.asObservable();

  private idCounter: number = 0;

  default(title: string, message?: string, options?: ToastOptions): void {
    this.show('default', title, message, options);
  }

  info(title: string, message?: string, options?: ToastOptions): void {
    this.show('info', title, message, options);
  }

  success(title: string, message?: string, options?: ToastOptions): void {
    this.show('success', title, message, options);
  }

  warning(title: string, message?: string, options?: ToastOptions): void {
    this.show('warning', title, message, options);
  }

  error(title: string, message?: string, options?: ToastOptions): void {
    this.show('error', title, message, options);
  }

  show(type: ToastType, title: string, message?: string, options?: ToastOptions): void {
    const toast: ToastMessage = {
      id: ++this.idCounter,

      type,

      title,

      message,

      duration: options?.duration ?? 5000,

      closable: options?.closable ?? true,

      actionLabel: options?.actionLabel,

      action: options?.action,
    };

    this.toastSubject.next([...this.toastSubject.value, toast]);

    if (toast.duration > 0) {
      window.setTimeout(() => {
        this.remove(toast.id);
      }, toast.duration);
    }
  }

  executeAction(toast: ToastMessage): void {
    if (toast.action) {
      toast.action();
    }

    this.remove(toast.id);
  }

  remove(id: number): void {
    this.toastSubject.next(this.toastSubject.value.filter((toast) => toast.id !== id));
  }

  clear(): void {
    this.toastSubject.next([]);
  }
}
