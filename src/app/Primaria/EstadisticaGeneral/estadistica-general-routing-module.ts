import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EstadisticaGeneralLayoutPage } from './estadistica-general-layout-page/estadistica-general-layout-page';
import { PrincipalEstadisticaGeneral } from './principal-estadistica-general/principal-estadistica-general';
import { nivelGuard } from '../../core/guards/nivel.guard';
import { authGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '', 
    component: EstadisticaGeneralLayoutPage,
    children: [
      { path: 'estadistica-general', component: PrincipalEstadisticaGeneral, canActivate:[authGuard,nivelGuard] },

      { path: '', redirectTo: 'estadistica-general', pathMatch: 'full' },
      { path: '**', redirectTo: 'estadistica-general' }
    ]
  }
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EstadisticaGeneralRoutingModule { }
