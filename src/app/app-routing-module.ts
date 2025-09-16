import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {path: 'prim_2', loadChildren: () => import('./Primaria/docente/docente-module').then(m => m.DocenteModule)},
  {path: 's', loadChildren: ()=> import('./sharedPages/shared-pages-module').then(m =>m.SharedPagesModule) },
  {path: 'prees_1', loadChildren: ()=>import('./Preescolar/padreFamilia/padre-familiapreescolar-module').then(m =>m.PadreFamiliapreescolarModule)},
  {path: 'prees_2', loadChildren: ()=>import('./Preescolar/docente/docente-module').then(m =>m.DocenteModule)},
  {path : 'prees_3', loadChildren:()=>import('./Preescolar/director/director-module').then(m =>m.DirectorModule)},
  { path: 'Auth', loadChildren: ()=>import('./Auth/auth-module').then(m=>m.AuthModule)
  },
  {path:'', redirectTo:'Auth', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

