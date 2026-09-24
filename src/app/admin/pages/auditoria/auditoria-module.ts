import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuditoriaRoutingModule } from './auditoria-routing-module';
import { ListadoAuditorias } from './pages/listado-auditorias/listado-auditorias';
import { DetalleAuditoria } from './components/detalle-auditoria/detalle-auditoria';
import { PrimeNgModule } from '../../../core/shared/PrimeNg.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ListadoAuditorias,
    DetalleAuditoria
  ],
  imports: [
    CommonModule,
    AuditoriaRoutingModule,
    PrimeNgModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AuditoriaModule { }
