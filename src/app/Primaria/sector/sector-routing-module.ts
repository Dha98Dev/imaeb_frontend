import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutSector } from './layout-sector/layout-sector';
import { PrincipalSector } from './principal-sector/principal-sector';
import { ListadoZonasFromSector } from './listado-zonas-from-sector/listado-zonas-from-sector';

const routes: Routes = [
  {
    path: '', 
    component: LayoutSector,
    children: [
      { path: 'resultados-sector/:nivel/:sector/:modalidad', component:PrincipalSector},
      { path:'zonasFromSector/:nivel/:sector/:modalidad', component:ListadoZonasFromSector  },
      { path: '', redirectTo: 'resultados-sector', pathMatch: 'full' },
      { path: '**', redirectTo: 'resultados-sector' }
    ]
  }
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SectorRoutingModule { }
