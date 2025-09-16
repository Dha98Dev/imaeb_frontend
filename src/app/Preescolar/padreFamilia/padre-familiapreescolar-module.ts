import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PadreFamiliapreescolarRoutingModule } from './padre-familiapreescolar-routing-module';
import { PrincipalPadrePreescolar } from './principal-padre-preescolar/principal-padre-preescolar';
import { LayoutPagePadreFamiliaPreescolar } from './layout-page-padre-familia-preescolar/layout-page-padre-familia-preescolar';
import { ComponetsModule } from "../../core/components/Components.module";
import { ResultadosMaterias } from './resultados-materias/resultados-materias';
import { PrimeNgModule } from '../../core/shared/PrimeNg.module';


@NgModule({
  declarations: [
    PrincipalPadrePreescolar,
    LayoutPagePadreFamiliaPreescolar,
    ResultadosMaterias
  ],
  imports: [
    CommonModule,
    PadreFamiliapreescolarRoutingModule,
    ComponetsModule,
    PrimeNgModule
]
})
export class PadreFamiliapreescolarModule { }
