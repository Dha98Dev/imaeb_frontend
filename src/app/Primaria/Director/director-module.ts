import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DirectorRoutingModule } from './director-routing-module';
import { LayoutPageDirectorPrimaria } from './layout-page-director-primaria/layout-page-director-primaria';
import { PrincipalDirector } from './principal-director/principal-director';
import { ComponetsModule } from "../../core/components/Components.module";
import { PrimeNgModule } from '../../core/shared/PrimeNg.module';


@NgModule({
  declarations: [
    LayoutPageDirectorPrimaria,
    PrincipalDirector
  ],
  imports: [
    CommonModule,
    DirectorRoutingModule,
    ComponetsModule,
    ComponetsModule,
    PrimeNgModule
]
})
export class DirectorModule { }
