import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ZonaRoutingModule } from './zona-routing-module';
import { LayoutZona } from './layout-zona/layout-zona';
import { PrincipalZona } from './principal-zona/principal-zona';


@NgModule({
  declarations: [
    LayoutZona,
    PrincipalZona
  ],
  imports: [
    CommonModule,
    ZonaRoutingModule
  ]
})
export class ZonaModule { }
