import {
  createScopeGuard,
} from './scope-guard.util';

export const zonaGuard =
  createScopeGuard([
    'PERSONALIZADO',
    'NIVEL',
    'MODALIDAD',
    'SECTOR',
    'ZONA',
    'EJECUTIVO',
    'ADMIN',
  ]);