import {
  createScopeGuard,
} from './scope-guard.util';

export const EjecutivoGuard =
  createScopeGuard([
    'EJECUTIVO',
    'ADMIN',
  ]);