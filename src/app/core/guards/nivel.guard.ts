import {
  createScopeGuard,
} from './scope-guard.util';

export const nivelGuard =
  createScopeGuard([
    'PERSONALIZADO',
    'NIVEL',
    'EJECUTIVO',
    'ADMIN',
  ]);