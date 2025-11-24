import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DirectorRoutingModule } from './director-routing-module';
import { LayoutDirectorPreescolar } from './layout-director-preescolar/layout-director-preescolar';
import { PrincipalDirectorPreescolar } from './principal-director-preescolar/principal-director-preescolar';
import { ComponetsModule } from "../../core/components/Components.module";
import { PrimeNgModule } from '../../core/shared/PrimeNg.module';


@NgModule({
  declarations: [
    LayoutDirectorPreescolar,
    PrincipalDirectorPreescolar
  ],
  imports: [
    CommonModule,
    DirectorRoutingModule,
    ComponetsModule,
    PrimeNgModule
]
})
export class DirectorModule { }
