import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../Auth/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private loginUrl = 'auth/login'; // Ajusta si tu ruta es diferente

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    let request = req;

    if (!req.url.includes(this.loginUrl)) {

      const headers = this.authService.getAuthorizationHeader(); 
      // { Authorization: 'Bearer xxx' } o {}

      // Si trae token, clonar request agregando headers
      if (headers && headers['Authorization']) {
        request = req.clone({
          setHeaders: {
            ...headers
          }
        });
      }
    }

    // Manejo de error 401
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.authService.logout()
        }
        return throwError(() => error);
      })
    );
  }
}
