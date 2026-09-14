import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { AuthService } from '../../Auth/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private readonly loginUrl = 'auth/login';

  private manejando401: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {

    let request = req;

    const esLogin =
      req.url.includes(this.loginUrl);

    if (!esLogin) {

      const headers =
        this.authService.getAuthorizationHeader();

      if (
        headers &&
        headers['Authorization']
      ) {
        request = req.clone({
          setHeaders: {
            ...headers,
          },
        });
      }
    }

    return next.handle(request).pipe(

      catchError(
        (error: HttpErrorResponse) => {

          if (
            error.status === 401 &&
            !esLogin
          ) {
            this.manejarSesionExpirada();
          }

          return throwError(
            () => error,
          );
        },
      ),

    );
  }

  private manejarSesionExpirada(): void {

    if (this.manejando401) {
      return;
    }

    this.manejando401 = true;

    this.authService.clearTokens();

    this.messageService.clear();

    this.messageService.add({
      severity: 'warn',
      summary: 'Sesión finalizada',
      detail:
        'Tu sesión ha caducado. Por favor, inicia sesión nuevamente.',
      life: 5000,
      closable: true,
    });

    this.router
      .navigateByUrl('/Auth/login')
      .finally(() => {
        this.manejando401 = false;
      });
  }
}