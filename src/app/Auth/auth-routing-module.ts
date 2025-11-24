import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthLayoutPage } from './pages/auth-layout-page/auth-layout-page';
import { LoginPage } from './pages/login-page/login-page';
import { FiltroPage } from './pages/filtro-page/filtro-page';

const routes: Routes = [
  {
    path: '',
    component: AuthLayoutPage,
    children: [
      { path: 'login', component: LoginPage },
      { path: 'main-filter', component: FiltroPage },
      { path: '', redirectTo: 'main-filter', pathMatch: 'full' },
    ]
  }
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
