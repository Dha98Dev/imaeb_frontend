import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutDocentePreescolar } from './layout-director-preescolar/layout-docente-preescolar';
import { PrincipalDocentePreescolar } from './principal-docente-preescolar/principal-docente-preescolar';

const routes: Routes = [
  {
    path: '',
    component: LayoutDocentePreescolar,
    children: [
      {path:'home_docente', component:PrincipalDocentePreescolar},
      { path: '', redirectTo: 'home_docente', pathMatch: 'full' },
      { path: '**', redirectTo: 'home_docente' }
    ]
  }
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocenteRoutingModule { }
