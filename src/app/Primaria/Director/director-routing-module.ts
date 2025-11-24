import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPageDirectorPrimaria } from './layout-page-director-primaria/layout-page-director-primaria';
import { PrincipalDirector } from './principal-director/principal-director';

const routes: Routes = [
  {
    path: '', 
    component: LayoutPageDirectorPrimaria,
    children: [
      { path: 'resultados-ct/:cct', component: PrincipalDirector },
      { path: '', redirectTo: 'resultados-ct', pathMatch: 'full' },
      { path: '**', redirectTo: 'resultados-ct' }
    ]
  }
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DirectorRoutingModule { }
