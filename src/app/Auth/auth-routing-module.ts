import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthLayoutPage } from './pages/auth-layout-page/auth-layout-page';
import { LoginPage } from './pages/login-page/login-page';
import { FiltroPage } from './pages/filtro-page/filtro-page';
import { authGuard } from '../core/guards/auth.guard';
import { NotAutenticatedGuard } from '../core/guards/notLoggedIn.guard';

const routes: Routes = [
  {
    path: '',
    component: AuthLayoutPage,
    children: [
      { path: 'login', component: LoginPage, canActivate:[NotAutenticatedGuard] },
      { path: 'main-filter', component: FiltroPage, canActivate:[authGuard]},
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ]
  }
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
