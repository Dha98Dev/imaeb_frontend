import { ChangeDetectorRef, Component, Inject } from '@angular/core';

import { DOCUMENT } from '@angular/common';

import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { HttpErrorResponse } from '@angular/common/http';

import { finalize } from 'rxjs';

import { AuditoriaService } from '../../services/auditoria.service';

import {
  AuditoriaEvento,
  AuditoriaFiltros,
  AuditoriaResultado,
  AuditoriaResultadoOpcion,
  PaginacionEvento,
} from '../../interfaces/auditoria.interface';
import { ToastMessageService } from '../../../../../core/components/shared/toast-message/toast-message.service';

const rangoFechasValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const desde = control.get('desde')?.value;
  const hasta = control.get('hasta')?.value;

  if (!desde || !hasta) {
    return null;
  }

  return desde <= hasta
    ? null
    : {
        rangoFechas: true,
      };
};

@Component({
  selector: 'app-listado-auditorias',
  standalone: false,
  templateUrl: './listado-auditorias.html',
  styleUrl: './listado-auditorias.scss',
})
export class ListadoAuditorias {
  public filtrosForm: FormGroup;

  public auditorias: AuditoriaEvento[] = [];

  public cargando: boolean = false;

  public errorListado: string | null = null;

  public sinPermiso: boolean = false;

  public paginaActual: number = 0;

  public tamanoPagina: number = 20;

  public totalElementos: number = 0;

  public totalPaginas: number = 0;

  public detalleVisible: boolean = false;

  public auditoriaSeleccionadaId: string | null = null;

  private paginaConfirmada: number = 0;

  private tamanoPaginaConfirmado: number = 20;

  public readonly resultados: AuditoriaResultadoOpcion[] = [
    {
      label: 'Exitoso',
      value: 'EXITOSO',
    },
    {
      label: 'Rechazado',
      value: 'RECHAZADO',
    },
    {
      label: 'Fallido',
      value: 'FALLIDO',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private auditoriaService: AuditoriaService,
    private toast: ToastMessageService,
    private cd: ChangeDetectorRef,
    @Inject(DOCUMENT)
    private document: Document,
  ) {
    this.filtrosForm = this.fb.group(
      {
        desde: [''],
        hasta: [''],

        actorId: [null, [Validators.min(1)]],

        usuarioDestinoId: [null, [Validators.min(1)]],

        accion: [''],

        resultado: [null as AuditoriaResultado | null],
      },
      {
        validators: rangoFechasValidator,
      },
    );
  }

  ngOnInit(): void {
    this.getAuditorias();
  }

  getAuditorias(): void {
    if (this.cargando) {
      return;
    }

    if (this.filtrosForm.invalid) {
      this.filtrosForm.markAllAsTouched();

      this.enfocarPrimerError();

      return;
    }

    this.cargando = true;

    this.errorListado = null;

    this.sinPermiso = false;

    const form = this.filtrosForm.getRawValue();

    const filtros: AuditoriaFiltros = {
      page: this.paginaActual,

      size: this.tamanoPagina,
    };

    if (form.desde) {
      filtros.desde = form.desde;
    }

    if (form.hasta) {
      filtros.hasta = form.hasta;
    }

    if (form.actorId !== null && form.actorId !== undefined && form.actorId !== '') {
      filtros.actorId = Number(form.actorId);
    }

    if (
      form.usuarioDestinoId !== null &&
      form.usuarioDestinoId !== undefined &&
      form.usuarioDestinoId !== ''
    ) {
      filtros.usuarioDestinoId = Number(form.usuarioDestinoId);
    }

    if (typeof form.accion === 'string' && form.accion.trim().length > 0) {
      filtros.accion = form.accion;
    }

    if (form.resultado) {
      filtros.resultado = form.resultado;
    }

    this.auditoriaService
      .getAuditorias(filtros)
      .pipe(
        finalize(() => {
          this.cargando = false;

          this.cd.markForCheck();
        }),
      )
      .subscribe({
        next: (resp) => {
          this.auditorias = resp.content ?? [];

          this.totalElementos = resp.page?.totalElements ?? 0;

          this.totalPaginas = resp.page?.totalPages ?? 0;

          this.paginaActual = resp.page?.number ?? 0;

          this.tamanoPagina = resp.page?.size ?? 20;

          this.paginaConfirmada = this.paginaActual;

          this.tamanoPaginaConfirmado = this.tamanoPagina;
        },

        error: (error: unknown) => {
          this.paginaActual = this.paginaConfirmada;

          this.tamanoPagina = this.tamanoPaginaConfirmado;

          if (error instanceof HttpErrorResponse && error.status === 403) {
            this.sinPermiso = true;

            this.errorListado =
              'Tu cuenta no tiene permisos para consultar la bitácora de auditoría.';

            return;
          }

          this.errorListado = this.obtenerMensajeError(
            error,
            'No fue posible consultar la bitácora de auditoría.',
          );

          this.toast.error('Error al consultar auditoría', this.errorListado);
        },
      });
  }

  buscar(): void {
    if (this.filtrosForm.invalid) {
      this.filtrosForm.markAllAsTouched();

      this.enfocarPrimerError();

      return;
    }

    this.paginaActual = 0;

    this.getAuditorias();
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      desde: '',
      hasta: '',
      actorId: null,
      usuarioDestinoId: null,
      accion: '',
      resultado: null,
    });

    this.paginaActual = 0;

    this.getAuditorias();
  }

  cambiarPagina(event: PaginacionEvento): void {
    if (this.cargando) {
      return;
    }

    this.paginaActual = event.page ?? 0;

    this.tamanoPagina = event.rows ?? this.tamanoPagina;

    this.getAuditorias();
  }

  abrirDetalle(auditoria: AuditoriaEvento): void {
    this.auditoriaSeleccionadaId = auditoria.id;

    this.detalleVisible = true;
  }

  onDetalleVisibleChange(visible: boolean): void {
    this.detalleVisible = visible;

    if (!visible) {
      this.auditoriaSeleccionadaId = null;
    }
  }

  reintentar(): void {
    this.getAuditorias();
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

  private enfocarPrimerError(): void {
    let id: string | null = null;

    if (this.filtrosForm.hasError('rangoFechas')) {
      id = 'auditoria-desde';
    } else if (this.filtrosForm.get('actorId')?.invalid) {
      id = 'auditoria-actorId';
    } else if (this.filtrosForm.get('usuarioDestinoId')?.invalid) {
      id = 'auditoria-usuarioDestinoId';
    }

    if (!id) {
      return;
    }

    queueMicrotask(() => {
      this.document.getElementById(id!)?.focus();
    });
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
