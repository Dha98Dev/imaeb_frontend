import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPageDirectorPrimaria } from './layout-page-director-primaria/layout-page-director-primaria';
import { PrincipalDirector } from './principal-director/principal-director';
import { DirectorGuard } from '../../core/guards/director.guard';

const routes: Routes = [
  {
    path: '', 
    component: LayoutPageDirectorPrimaria,
    children: [
      { path: 'resultados-ct/:cct', component: PrincipalDirector,  canActivate:[DirectorGuard] },
      { path: '', redirectTo: '/Auth/main-filter', pathMatch: 'full' },
      { path: '**', redirectTo: '/Auth/main-filter' }
    ]
  }
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DirectorRoutingModule { }
