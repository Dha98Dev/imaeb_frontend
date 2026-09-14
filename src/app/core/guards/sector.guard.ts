import {
  createScopeGuard,
} from './scope-guard.util';

export const sectorGuard =
  createScopeGuard([
    'PERSONALIZADO',
    'NIVEL',
    'MODALIDAD',
    'SECTOR',
    'EJECUTIVO',
    'ADMIN',
  ]);