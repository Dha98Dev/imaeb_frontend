import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutDirectorPreescolar } from './layout-director-preescolar/layout-director-preescolar';
import { PrincipalDirectorPreescolar } from './principal-director-preescolar/principal-director-preescolar';

const routes: Routes = [
  {
    path: '',
    component: LayoutDirectorPreescolar,
    children: [
      { path:'home_director', component:PrincipalDirectorPreescolar},
      { path: '', redirectTo: 'home_director', pathMatch: 'full' },
      { path: '**', redirectTo: 'home_director' }
    ]
  }
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DirectorRoutingModule { }
