import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPagePadreFamilia } from './layout-page-padre-familia/layout-page-padre-familia';
import { PrincipalPadreFamilia } from './principal-padre-familia/principal-padre-familia';
import { ResultadosMateria } from './resultados-materia/resultados-materia';
import { MisResultadosImaeb } from './mis-resultados-imaeb/mis-resultados-imaeb';

const routes: Routes = [
  {
    path: '',
    component: LayoutPagePadreFamilia,
    children: [
      { path: 'principal_alumno', component: PrincipalPadreFamilia },
      { path: 'resultados_area', component: ResultadosMateria },
      { path: 'mis_resultados', component: MisResultadosImaeb },
      { path: '', redirectTo: 'principal_alumno', pathMatch: 'full' },
      { path: '**', redirectTo: 'principal_alumno' }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PadreFamiliaRoutingModule { }
