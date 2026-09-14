import {
  createScopeGuard,
} from './scope-guard.util';

export const DirectorGuard =
  createScopeGuard([
    'PERSONALIZADO',
    'NIVEL',
    'MODALIDAD',
    'SECTOR',
    'ZONA',
    'ESCUELA',
    'EJECUTIVO',
    'ADMIN',
  ]);