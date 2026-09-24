import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedPagesRoutingModule } from './shared-pages-routing-module';
import { MisResultadosImaeb } from './mis-resultados-imaeb/mis-resultados-imaeb';
import { ComponetsModule } from '../core/components/Components.module';
import { PrimeNgModule } from '../core/shared/PrimeNg.module';
import { EstadisticaPrincipal } from './estadistica-principal/estadistica-principal';
import { LayoutPagePadreFamilia } from './layout-page-padre-familia/layout-page-padre-familia';
import { PrincipalPadreFamilia } from './principal-padre-familia/principal-padre-familia';
import { ResultadosMateria } from './resultados-materia/resultados-materia';

@NgModule({
  declarations: [
        LayoutPagePadreFamilia,
        PrincipalPadreFamilia,
        ResultadosMateria,
        MisResultadosImaeb,
        EstadisticaPrincipal
  ],
  imports: [
    CommonModule,
    SharedPagesRoutingModule,
    ComponetsModule,
    PrimeNgModule
  ]
})
export class SharedPagesModule { }
