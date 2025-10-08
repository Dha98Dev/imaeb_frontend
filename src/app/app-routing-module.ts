import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {path: 'prim_2', loadChildren: () => import('./Primaria/docente/docente-module').then(m => m.DocenteModule)},
  {path: 'prim_3', loadChildren: () => import('./Primaria/Director/director-module').then(m => m.DirectorModule)},
  {path: 'sz', loadChildren: () =>import('./Primaria/Zona/zona-module').then(m => m.ZonaModule)},
  {path: 'ss', loadChildren: ()=>import('./Primaria/sector/sector-module').then(m => m.SectorModule)},
  {path: 'e', loadChildren: ()=>import('./Primaria/EstadisticaGeneral/estadistica-general-module').then(m =>m.EstadisticaGeneralModule)},
  { path: 'Auth', loadChildren: ()=>import('./Auth/auth-module').then(m=>m.AuthModule)},
  {path: 's', loadChildren: ()=> import('./sharedPages/shared-pages-module').then(m =>m.SharedPagesModule) },

  // {path: 'prees_1', loadChildren: ()=>import('./Preescolar/padreFamilia/padre-familiapreescolar-module').then(m =>m.PadreFamiliapreescolarModule)},
  // {path: 'prees_2', loadChildren: ()=>import('./Preescolar/docente/docente-module').then(m =>m.DocenteModule)},
  // {path : 'prees_3', loadChildren:()=>import('./Preescolar/director/director-module').then(m =>m.DirectorModule)},
  {path:'', redirectTo:'Auth', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

