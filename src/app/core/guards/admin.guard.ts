import {
  createScopeGuard,
} from './scope-guard.util';

export const AdminGuard =
  createScopeGuard([
    'ADMIN',
  ]);