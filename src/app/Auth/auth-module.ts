import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing-module';
import { PrimeNgModule } from '../core/shared/PrimeNg.module';
import { AuthLayoutPage } from './pages/auth-layout-page/auth-layout-page';
import { LoginPage } from './pages/login-page/login-page';
import { ComponetsModule } from '../core/components/Components.module';
import { FiltroPage } from './pages/filtro-page/filtro-page';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AuthLayoutPage,
    LoginPage,
    FiltroPage,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    PrimeNgModule,
    ComponetsModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AuthModule { }
