import {
  createScopeGuard,
} from './scope-guard.util';

export const modalidadGuard =
  createScopeGuard([
    'PERSONALIZADO',
    'NIVEL',
    'MODALIDAD',
    'EJECUTIVO',
    'ADMIN',
  ]);