import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadisticaGeneralRoutingModule } from './estadistica-general-routing-module';
import { EstadisticaGeneralLayoutPage } from './estadistica-general-layout-page/estadistica-general-layout-page';
import { PrincipalEstadisticaGeneral } from './principal-estadistica-general/principal-estadistica-general';
import { ComponetsModule } from "../../core/components/Components.module";
import { PrimeNgModule } from '../../core/shared/PrimeNg.module';


@NgModule({
  declarations: [
    EstadisticaGeneralLayoutPage,
    PrincipalEstadisticaGeneral
  ],
  imports: [
    CommonModule,
    EstadisticaGeneralRoutingModule,
    ComponetsModule,
    PrimeNgModule
]
})
export class EstadisticaGeneralModule { }
