import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PadreFamiliaRoutingModule } from './padre-familia-routing-module';
import { LayoutPagePadreFamilia } from './layout-page-padre-familia/layout-page-padre-familia';
import { PrincipalPadreFamilia } from './principal-padre-familia/principal-padre-familia';
import { ComponetsModule } from "../../core/components/Components.module";
import { ResultadosMateria } from './resultados-materia/resultados-materia';
import { PrimeNgModule } from '../../core/shared/PrimeNg.module';
import { MisResultadosImaeb } from './mis-resultados-imaeb/mis-resultados-imaeb';


@NgModule({
  declarations: [
    LayoutPagePadreFamilia,
    PrincipalPadreFamilia,
    ResultadosMateria,
    MisResultadosImaeb
  ],
  imports: [
    CommonModule,
    PadreFamiliaRoutingModule,
    ComponetsModule,
    PrimeNgModule
]
})
export class PadreFamiliaModule { }
