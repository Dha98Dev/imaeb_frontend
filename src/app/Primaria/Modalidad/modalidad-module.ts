import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModalidadRoutingModule } from './modalidad-routing-module';
import { LayoutModalidad } from './layout-modalidad/layout-modalidad';
import { PrincipalModalidad } from './principal-modalidad/principal-modalidad';
import { ComponetsModule } from "../../core/components/Components.module";


@NgModule({
  declarations: [
    LayoutModalidad,
    PrincipalModalidad
  ],
  imports: [
    CommonModule,
    ModalidadRoutingModule,
    ComponetsModule
]
})
export class ModalidadModule { }
