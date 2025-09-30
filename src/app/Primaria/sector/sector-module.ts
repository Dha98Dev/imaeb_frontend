import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SectorRoutingModule } from './sector-routing-module';
import { LayoutSector } from './layout-sector/layout-sector';
import { PrincipalSector } from './principal-sector/principal-sector';
import { ComponetsModule } from '../../core/components/Components.module';
import { PrimeNgModule } from '../../core/shared/PrimeNg.module';
import { ListadoZonasFromSector } from './listado-zonas-from-sector/listado-zonas-from-sector';


@NgModule({
  declarations: [
    LayoutSector,
    PrincipalSector,
    ListadoZonasFromSector
  ],
  imports: [
    CommonModule,
    SectorRoutingModule,
    ComponetsModule,
    PrimeNgModule
  ]
})
export class SectorModule { }
