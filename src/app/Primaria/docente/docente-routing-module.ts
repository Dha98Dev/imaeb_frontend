import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPageDP } from './layout-page-dp/layout-page-dp';
import { PrincipalDocente } from './principal-docente/principal-docente';
import { ResultadosAreas } from './resultados-areas/resultados-areas';
import { ListadoGrupo } from './listado-grupo/listado-grupo';

const routes: Routes = [
  {
    path: '', 
    component: LayoutPageDP,
    children: [
      { path: 'resultados-grupo', component: PrincipalDocente },
      { path: 'resultados-grupo-area', component: ResultadosAreas },
      { path: 'listado-grupo/:cct/:grupo', component: ListadoGrupo },
      { path: '', redirectTo: 'resultados-grupo', pathMatch: 'full' },
      { path: '**', redirectTo: 'resultados-grupo' }
    ]
  }
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocenteRoutingModule { }
