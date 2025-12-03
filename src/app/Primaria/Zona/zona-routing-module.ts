import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutZona } from './layout-zona/layout-zona';
import { PrincipalZona } from './principal-zona/principal-zona';
import { ListadoCctsByZona } from './listado-ccts-by-zona/listado-ccts-by-zona';
import { zonaGuard } from '../../core/guards/zona.guard';

const routes: Routes = [
  {
    path: '', 
    component: LayoutZona,
    children: [
      { path: 'resultados-zona/:nivel/:zona/:modalidad', component: PrincipalZona , canActivate:[zonaGuard]},
      { path:'cctstByZona/:nivel/:zona/:modalidad', component:ListadoCctsByZona  , canActivate:[zonaGuard]},
      { path: '', redirectTo: '/Auth/main-filter', pathMatch: 'full' },
      { path: '**', redirectTo: '/Auth/main-filter' }
    ]
  }
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ZonaRoutingModule { }
