import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {path: 'primaria_doc', loadChildren: () => import('./Primaria/docente/docente-module').then(m => m.DocenteModule)},
  {path: 'primaria_alumno', loadChildren: ()=> import('./Primaria/PadreFamilia/padre-familia-module').then(m =>m.PadreFamiliaModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
