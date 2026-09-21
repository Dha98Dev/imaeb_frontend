import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModalidadRoutingModule } from './modalidad-routing-module';
import { LayoutModalidad } from './layout-modalidad/layout-modalidad';
import { PrincipalModalidad } from './principal-modalidad/principal-modalidad';
import { ComponetsModule } from "../../core/components/Components.module";
import { ResumenModalidad } from './resumen-modalidad/resumen-modalidad';
import { PrimeNgModule } from '../../core/shared/PrimeNg.module';


@NgModule({
  declarations: [
    LayoutModalidad,
    PrincipalModalidad,
    ResumenModalidad
  ],
  imports: [
    CommonModule,
    ModalidadRoutingModule,
    ComponetsModule,
    PrimeNgModule
]
})
export class ModalidadModule { }
