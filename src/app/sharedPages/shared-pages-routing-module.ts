import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPagePadreFamilia } from './layout-page-padre-familia/layout-page-padre-familia';
import { PrincipalPadreFamilia } from './principal-padre-familia/principal-padre-familia';
import { ResultadosMateria } from './resultados-materia/resultados-materia';
import { MisResultadosImaeb } from './mis-resultados-imaeb/mis-resultados-imaeb';
import { EstadisticaPrincipal } from './estadistica-principal/estadistica-principal';
import { authGuard } from '../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutPagePadreFamilia,
    children: [
      { path: 'principal_alumno/:idAlumno', component: PrincipalPadreFamilia, canActivate:[authGuard] },
      { path: 'resultados_area/:area/:idAlumno', component: ResultadosMateria, canActivate:[authGuard] },
      { path: 'mis_resultados/:idAlumno', component: MisResultadosImaeb, canActivate:[authGuard] },
      // { path: 'estadistica-principal', component: EstadisticaPrincipal },
      // { path: '', redirectTo: 'principal_alumno', pathMatch: 'full' },
      // { path: '**', redirectTo: 'principal_alumno' }
    ]
  }
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SharedPagesRoutingModule { }
