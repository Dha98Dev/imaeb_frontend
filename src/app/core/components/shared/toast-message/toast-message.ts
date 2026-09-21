import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Observable } from 'rxjs';

import { ToastMessage, ToastType } from './toast-message.interface';

import { ToastMessageService } from './toast-message.service';

@Component({
  selector: 'app-toast-message',
  standalone: false,
  templateUrl: './toast-message.html',
  styleUrl: './toast-message.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastMessageComponent {
  public toast$: Observable<ToastMessage[]>;

  constructor(public toastService: ToastMessageService) {
    this.toast$ = this.toastService.toast$;
  }

  cerrar(id: number): void {
    this.toastService.remove(id);
  }

  ejecutarAccion(toast: ToastMessage): void {
    this.toastService.executeAction(toast);
  }

  getIcon(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'pi pi-check';

      case 'error':
        return 'pi pi-exclamation-circle';

      case 'warning':
        return 'pi pi-exclamation-triangle';

      case 'info':
        return 'pi pi-info';

      case 'default':
      default:
        return 'pi pi-bell';
    }
  }

  getContainerClass(type: ToastType): string {
    return `toast-${type}`;
  }
}
