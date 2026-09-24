import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { HttpErrorResponse } from '@angular/common/http';

import { finalize } from 'rxjs';

import { AuditoriaEvento, AuditoriaResultado } from '../../interfaces/auditoria.interface';

import { AuditoriaService } from '../../services/auditoria.service';
import { ToastMessageService } from '../../../../../core/components/shared/toast-message/toast-message.service';
@Component({
  selector: 'app-detalle-auditoria',
  standalone: false,
  templateUrl: './detalle-auditoria.html',
  styleUrl: './detalle-auditoria.scss',
})
export class DetalleAuditoria implements OnChanges {
  @Input()
  public visible: boolean = false;

  @Input()
  public auditoriaId: string | null = null;

  @Output()
  public visibleChange = new EventEmitter<boolean>();

  public detalle: AuditoriaEvento | null = null;

  public cargando: boolean = false;

  public error: string | null = null;

  public sinPermiso: boolean = false;

  constructor(
    private auditoriaService: AuditoriaService,
    private toast: ToastMessageService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.visible || !this.auditoriaId) {
      return;
    }

    if (changes['visible'] || changes['auditoriaId']) {
      this.cargarDetalle();
    }
  }

  cargarDetalle(): void {
    if (!this.auditoriaId || this.cargando) {
      return;
    }

    this.cargando = true;

    this.error = null;

    this.sinPermiso = false;

    this.detalle = null;

    this.auditoriaService
      .getAuditoria(this.auditoriaId)
      .pipe(
        finalize(() => {
          this.cargando = false;
        }),
      )
      .subscribe({
        next: (resp) => {
          this.detalle = resp;
        },

        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 403) {
            this.sinPermiso = true;

            this.error = 'Tu cuenta no tiene permisos para consultar este evento de auditoría.';

            return;
          }

          this.error = this.obtenerMensajeError(
            error,
            'No fue posible consultar el detalle del evento.',
          );

          this.toast.error('Error al consultar auditoría', this.error);
        },
      });
  }

  cerrar(): void {
    this.visible = false;

    this.visibleChange.emit(false);

    this.detalle = null;

    this.error = null;

    this.sinPermiso = false;
  }

  onVisibleChange(visible: boolean): void {
    this.visible = visible;

    this.visibleChange.emit(visible);

    if (!visible) {
      this.detalle = null;

      this.error = null;

      this.sinPermiso = false;
    }
  }

  formatearValor(valor: unknown): string {
    if (valor === null || valor === undefined) {
      return 'Sin valor';
    }

    if (typeof valor === 'string') {
      return valor.length > 0 ? valor : 'Vacío';
    }

    if (typeof valor === 'number' || typeof valor === 'boolean') {
      return String(valor);
    }

    try {
      return JSON.stringify(valor);
    } catch {
      return 'Valor no disponible';
    }
  }

  getResultadoClass(resultado: AuditoriaResultado): string {
    switch (resultado) {
      case 'EXITOSO':
        return 'bg-emerald-50 text-emerald-700';

      case 'RECHAZADO':
        return 'bg-amber-50 text-amber-700';

      case 'FALLIDO':
        return 'bg-rose-50 text-rose-700';
    }
  }

  getResultadoIcon(resultado: AuditoriaResultado): string {
    switch (resultado) {
      case 'EXITOSO':
        return 'pi pi-check-circle';

      case 'RECHAZADO':
        return 'pi pi-ban';

      case 'FALLIDO':
        return 'pi pi-times-circle';
    }
  }

  private obtenerMensajeError(error: unknown, fallback: string): string {
    if (!(error instanceof HttpErrorResponse)) {
      return fallback;
    }

    if (typeof error.error === 'string' && error.error.length > 0) {
      return error.error;
    }

    if (error.error && typeof error.error === 'object' && 'message' in error.error) {
      const message = error.error.message;

      if (typeof message === 'string' && message.length > 0) {
        return message;
      }
    }

    return fallback;
  }
}
