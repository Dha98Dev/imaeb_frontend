import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutModalidad } from './layout-modalidad/layout-modalidad';
import { PrincipalModalidad } from './principal-modalidad/principal-modalidad';

const routes: Routes = [
  {
    path: '', 
    component: LayoutModalidad,
    children: [
      { path: 'resultadosModalidad/:nivel/:modalidad/:mod_des', component: PrincipalModalidad },
      // { path: '', redirectTo: '/Auth/main-filter', pathMatch: 'full' },
      { path: '**', redirectTo: '/Auth/main-filter' }
    ]
  }
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModalidadRoutingModule { }
