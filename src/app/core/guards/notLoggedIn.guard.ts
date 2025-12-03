import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../Auth/services/auth.service'; 

export const NotAutenticatedGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAutenticated = authService.isLoggedIn();

  if (!isAutenticated) {
    return true;
  }

  // Si no es NIVEL, redirigimos donde tú quieras (ejemplo: dashboard)
  router.navigate(['/Auth/main-filter']);

  return false;
};
