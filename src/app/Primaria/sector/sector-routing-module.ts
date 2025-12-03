import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutSector } from './layout-sector/layout-sector';
import { PrincipalSector } from './principal-sector/principal-sector';
import { ListadoZonasFromSector } from './listado-zonas-from-sector/listado-zonas-from-sector';
import { sectorGuard } from '../../core/guards/sector.guard';

const routes: Routes = [
  {
    path: '', 
    component: LayoutSector,
    children: [
      { path: 'resultados-sector/:nivel/:sector/:modalidad', component:PrincipalSector, canActivate:[sectorGuard]},
      { path:'zonasFromSector/:nivel/:sector/:modalidad', component:ListadoZonasFromSector, canActivate:[sectorGuard]  },
      { path: '', redirectTo: '/Auth/main-filter', pathMatch: 'full' },
      { path: '**', redirectTo: '/Auth/main-filter' }
    ]
  }
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SectorRoutingModule { }
