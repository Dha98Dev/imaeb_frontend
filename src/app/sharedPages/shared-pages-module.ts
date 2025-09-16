import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedPagesRoutingModule } from './shared-pages-routing-module';
import { ComponetsModule } from '../core/components/Components.module';
import { PrimeNgModule } from '../core/shared/PrimeNg.module';
import { LayoutPagePadreFamilia } from './layout-page-padre-familia/layout-page-padre-familia';
import { PrincipalPadreFamilia } from './principal-padre-familia/principal-padre-familia';
import { ResultadosMateria } from './resultados-materia/resultados-materia';
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
    SharedPagesRoutingModule,
    ComponetsModule,
    PrimeNgModule
  ]
})
export class SharedPagesModule { }
