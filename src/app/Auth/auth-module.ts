import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing-module';
import { PrimeNgModule } from '../core/shared/PrimeNg.module';
import { AuthLayoutPage } from './pages/auth-layout-page/auth-layout-page';
import { LoginPage } from './pages/login-page/login-page';
import { ComponetsModule } from '../core/components/Components.module';


@NgModule({
  declarations: [
    AuthLayoutPage,
    LoginPage,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    PrimeNgModule,
    ComponetsModule
  ]
})
export class AuthModule { }
