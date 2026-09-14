import { inject } from '@angular/core';

import { CanActivateFn, Router } from '@angular/router';

import { map } from 'rxjs';

import { AuthService } from '../../Auth/services/auth.service';

export function createScopeGuard(scopesPermitidos: string[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);

    const router = inject(Router);

    return authService.ensureUsuario().pipe(
      map((usuario) => {
        if (!usuario) {
          return router.parseUrl('/Auth/login');
        }

        if (scopesPermitidos.includes(usuario.scope)) {
          return true;
        }

        return router.parseUrl(authService.generateUrlBase());
      }),
    );
  };
}
