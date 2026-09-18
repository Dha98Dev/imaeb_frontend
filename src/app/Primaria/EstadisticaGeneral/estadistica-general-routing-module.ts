import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EstadisticaGeneralLayoutPage } from './estadistica-general-layout-page/estadistica-general-layout-page';
import { PrincipalEstadisticaGeneral } from './principal-estadistica-general/principal-estadistica-general';
import { nivelGuard } from '../../core/guards/nivel.guard';
import { authGuard } from '../../core/guards/auth.guard';
import { ResumenNivel } from './resumen-nivel/resumen-nivel';

const routes: Routes = [
  {
    path: '',
    component: EstadisticaGeneralLayoutPage,
    children: [
      {
        path: 'estadistica-general',
        component: PrincipalEstadisticaGeneral,
        canActivate: [authGuard, nivelGuard],
      },
      { path: 'resumen-nivel', component: ResumenNivel, canActivate: [authGuard, nivelGuard] },

      { path: '', redirectTo: 'resumen-nivel', pathMatch: 'full' },
      { path: '**', redirectTo: 'resumen-nivel' },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EstadisticaGeneralRoutingModule {}
// bbertha He]WW!\f4m