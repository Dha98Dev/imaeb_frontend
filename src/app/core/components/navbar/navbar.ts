import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AuthService } from '../../../Auth/services/auth.service';
import { inArray } from 'highcharts';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  constructor(
    private router: Router,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}
  public items: MenuItem[] | undefined;
  public visible: boolean = false;

  // variables de autenticacion
  public isAutenticated: boolean = false;
  public isNivel: boolean = false;
  public scope: string|undefined = '';

 ngOnInit() {
  this.authService.isLoggedIn$.subscribe((state) => {
    this.isAutenticated = state;

    if (state) {
      const params = this.authService.getObjectParams();
      this.scope = params.scope;
    } else {
      this.scope = undefined; // o null, como manejes
    }
  });
}


  cerrarSesion() {
    this.authService.logout();
    this.cd.detectChanges();
  }
  confirmCloseSesion(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Estas seguro de cerrar sesión?',
      header: 'Cerrar sesión',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Cerrar sesión',
        severity: 'danger',
      },

      accept: () => {
        this.messageService.add({
          severity: 'secondary',
          summary: 'Confirmando salida',
          detail: 'Cerrando sesion',
        });
        this.cerrarSesion();
      },
      reject: () => {
        this.messageService.add({
          severity: 'contrast',
          summary: 'Cancelado',
          detail: 'Cerrar sesión cancelado',
        });
      },
    });
  }
}
