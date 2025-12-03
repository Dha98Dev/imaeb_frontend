import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutAdminPage } from './pages/layout-admin-page/layout-admin-page';
import { Register } from './pages/register/register';
import { ListadoUsuarios } from './pages/listado-usuarios/listado-usuarios';
import { authGuard } from '../core/guards/auth.guard';
import { EjecutivoGuard } from '../core/guards/ejecutivo.guard';
import { AdminGuard } from '../core/guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutAdminPage,
    children: [
      { path: 'register', component: Register, canActivate:[authGuard,EjecutivoGuard ] },
      { path: 'listado-usuarios', component: ListadoUsuarios, canActivate:[authGuard,AdminGuard] },
      { path: '', redirectTo: 'register', pathMatch: 'full' },
      { path: '**', redirectTo: 'register' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
