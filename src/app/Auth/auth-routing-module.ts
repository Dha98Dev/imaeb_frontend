import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthLayoutPage } from './pages/auth-layout-page/auth-layout-page';
import { LoginPage } from './pages/login-page/login-page';

const routes: Routes = [
  {
    path: '',
    component: AuthLayoutPage,
    children: [
      { path: 'login', component: LoginPage },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ]
  }
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
