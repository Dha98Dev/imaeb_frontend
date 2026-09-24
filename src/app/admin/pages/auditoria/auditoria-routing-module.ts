import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListadoAuditorias } from './pages/listado-auditorias/listado-auditorias';

const routes: Routes = [
  {
    path: '',
    component: ListadoAuditorias,
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuditoriaRoutingModule {}
