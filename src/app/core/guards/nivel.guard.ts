import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../Auth/services/auth.service';

export const nivelGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const scope = authService.getScope?.() ?? '';

  if (['PERSONALIZADO','NIVEL', 'EJECUTIVO', 'ADMIN'].includes(scope)) {
    return true;
  }

  // Si no es NIVEL, redirigimos donde tú quieras (ejemplo: dashboard)
  router.navigate(['/Auth/login']);

  return false;
};
