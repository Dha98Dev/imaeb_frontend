import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ZonaRoutingModule } from './zona-routing-module';
import { LayoutZona } from './layout-zona/layout-zona';
import { PrincipalZona } from './principal-zona/principal-zona';
import { ComponetsModule } from "../../core/components/Components.module";
import { PrimeNgModule } from '../../core/shared/PrimeNg.module';
import { ListadoCctsByZona } from './listado-ccts-by-zona/listado-ccts-by-zona';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    LayoutZona,
    PrincipalZona,
    ListadoCctsByZona
  ],
  imports: [
    CommonModule,
    ZonaRoutingModule,
    ComponetsModule,
    PrimeNgModule,
    FormsModule
]
})
export class ZonaModule { }
