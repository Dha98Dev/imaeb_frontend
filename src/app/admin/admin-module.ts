import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing-module';
import { Register } from './pages/register/register';
import { LayoutAdminPage } from './pages/layout-admin-page/layout-admin-page';
import { PrimeNgModule } from '../core/shared/PrimeNg.module';
import { ComponetsModule } from '../core/components/Components.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ListadoUsuarios } from './pages/listado-usuarios/listado-usuarios';


@NgModule({
  declarations: [
    Register,
    LayoutAdminPage,
    ListadoUsuarios
  ],  
  imports: [
    CommonModule,
    AdminRoutingModule,
    PrimeNgModule,
    ComponetsModule,
    ReactiveFormsModule
  ]
})
export class AdminModule { }
