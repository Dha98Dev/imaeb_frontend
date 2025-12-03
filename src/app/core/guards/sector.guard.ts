import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../Auth/services/auth.service'; 

export const sectorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const scope = authService.getScope?.() ?? '';

  if (scope === 'NIVEL' || scope === 'MODALIDAD' || scope === 'SECTOR' || scope === 'EJECUTIVO'  || scope === 'ADMIN') {
    return true;
  }

  // Si no es NIVEL, redirigimos donde tú quieras (ejemplo: dashboard)
  router.navigate(['/Auth/main-filter']);

  return false;
};
