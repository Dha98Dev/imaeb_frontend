import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SectorRoutingModule } from './sector-routing-module';
import { LayoutSector } from './layout-sector/layout-sector';
import { PrincipalSector } from './principal-sector/principal-sector';


@NgModule({
  declarations: [
    LayoutSector,
    PrincipalSector
  ],
  imports: [
    CommonModule,
    SectorRoutingModule
  ]
})
export class SectorModule { }
