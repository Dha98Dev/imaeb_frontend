import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DocenteRoutingModule } from './docente-routing-module';
import { ComponetsModule } from '../../core/components/Components.module';
import { PrimeNgModule } from '../../core/shared/PrimeNg.module';
import { LayoutDocentePreescolar } from './layout-director-preescolar/layout-docente-preescolar';
import { PrincipalDocentePreescolar } from './principal-docente-preescolar/principal-docente-preescolar';


@NgModule({
  declarations: [
    LayoutDocentePreescolar,
    PrincipalDocentePreescolar
  ],
  imports: [
    CommonModule,
    DocenteRoutingModule,
    ComponetsModule,
    PrimeNgModule
  ]
})
export class DocenteModule { }
