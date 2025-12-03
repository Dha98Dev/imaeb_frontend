import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'ss',
    loadChildren: () =>
       import('./Primaria/sector/sector-module').then((m) => m.SectorModule),
    canActivate:[authGuard]
  },
  {
    path: 'sz',
    loadChildren: () =>
       import('./Primaria/Zona/zona-module').then((m) => m.ZonaModule),
    canActivate:[authGuard]
  },
  {
    path: 'prim_3',
    loadChildren: () =>
       import('./Primaria/Director/director-module').then((m) => m.DirectorModule),
    canActivate:[authGuard]
  },
  {
    path: 'prim_2',
    loadChildren: () =>
       import('./Primaria/docente/docente-module').then((m) => m.DocenteModule),
    canActivate:[authGuard]
  },
  {
    path: 'e',
    loadChildren: () =>
      import('./Primaria/EstadisticaGeneral/estadistica-general-module').then(
        (m) => m.EstadisticaGeneralModule
      ),
  },
  {
    path: 's',
    loadChildren: () =>
      import('./sharedPages/shared-pages-module').then((m) => m.SharedPagesModule),
    canActivate:[authGuard]
  },
  { path: 'Auth', 
    loadChildren: () =>
     import('./Auth/auth-module').then((m) => m.AuthModule) },
  {
    path: 'm',
    loadChildren: () =>
      import('./Primaria/Modalidad/modalidad-module').then((m) => m.ModalidadModule),
    canActivate:[authGuard]
  },
  { path: 'admin',
     loadChildren: () => 
    import ('./admin/admin-module').then((m) => m.AdminModule) },
  { path: '', redirectTo: 'Auth', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
