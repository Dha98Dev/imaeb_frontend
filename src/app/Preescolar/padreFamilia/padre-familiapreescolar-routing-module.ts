import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPagePadreFamiliaPreescolar } from './layout-page-padre-familia-preescolar/layout-page-padre-familia-preescolar';
import { PrincipalPadrePreescolar } from './principal-padre-preescolar/principal-padre-preescolar';
import { ResultadosMaterias } from './resultados-materias/resultados-materias';

const routes: Routes = [
  {
    path: '',
    component: LayoutPagePadreFamiliaPreescolar,
    children: [
      { path: 'alumno_pree', component: PrincipalPadrePreescolar },
      {path:'resultado_materia', component:ResultadosMaterias},
      { path: '', redirectTo: 'alumno_pree', pathMatch: 'full' },
      { path: '**', redirectTo: 'alumno_pree' }
    ]
  }
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PadreFamiliapreescolarRoutingModule { }
