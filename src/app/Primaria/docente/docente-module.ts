import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DocenteRoutingModule } from './docente-routing-module';
import { LayoutPageDP } from './layout-page-dp/layout-page-dp';
import { ListadoGrupo } from './listado-grupo/listado-grupo';
import { PrincipalDocente } from './principal-docente/principal-docente';
import { ResultadosAreas } from './resultados-areas/resultados-areas';
import { PrimeNgModule } from '../../core/shared/PrimeNg.module';
import { ComponetsModule } from '../../core/components/Components.module';


@NgModule({
  declarations: [
    LayoutPageDP,
    ListadoGrupo,
    PrincipalDocente,
    ResultadosAreas
  ],
  imports: [
    CommonModule,
    DocenteRoutingModule,
    PrimeNgModule,
    ComponetsModule
  ]
})
export class DocenteModule { }
