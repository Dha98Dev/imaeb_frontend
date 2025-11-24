import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NivelRoutingModule } from './nivel-routing-module';
import { LayoutNivel } from './layout-nivel/layout-nivel';
import { PrincipalNivel } from './principal-nivel/principal-nivel';


@NgModule({
  declarations: [
    LayoutNivel,
    PrincipalNivel
  ],
  imports: [
    CommonModule,
    NivelRoutingModule
  ]
})
export class NivelModule { }
