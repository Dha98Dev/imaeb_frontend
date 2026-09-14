import { inject } from '@angular/core';

import { CanActivateFn, Router } from '@angular/router';

import { map } from 'rxjs';

import { AuthService } from '../../Auth/services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);

  const router = inject(Router);

  return authService.ensureUsuario().pipe(
    map((usuario) => {
      if (usuario) {
        return true;
      }

      return router.parseUrl('/Auth/login');
    }),
  );
};
