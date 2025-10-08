import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutZona } from './layout-zona/layout-zona';
import { PrincipalZona } from './principal-zona/principal-zona';
import { ListadoCctsByZona } from './listado-ccts-by-zona/listado-ccts-by-zona';

const routes: Routes = [
  {
    path: '', 
    component: LayoutZona,
    children: [
      { path: 'resultados-zona/:nivel/:zona/:modalidad', component: PrincipalZona },
      { path:'cctstByZona/:nivel/:zona/:modalidad', component:ListadoCctsByZona  },
      { path: '', redirectTo: 'resultados-zona', pathMatch: 'full' },
      { path: '**', redirectTo: 'resultados-zona' }
    ]
  }
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ZonaRoutingModule { }
