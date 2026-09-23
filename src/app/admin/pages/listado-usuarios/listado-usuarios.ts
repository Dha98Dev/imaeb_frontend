import { ChangeDetectorRef, Component } from '@angular/core';

import { FormBuilder, FormGroup } from '@angular/forms';

import { HttpErrorResponse } from '@angular/common/http';

import { finalize } from 'rxjs';

import { BreadCrumService } from '../../../core/services/breadCrumbs/bread-crumb-service';

import { ToastMessageService } from '../../../core/components/shared/toast-message/toast-message.service';

import { UsuariosService } from '../../services/usuarios.service';

import { UsuarioAdminVista, UsuariosAdminFiltros } from '../../interfaces/usuarios.interface';

@Component({
  selector: 'app-listado-usuarios',
  standalone: false,
  templateUrl: './listado-usuarios.html',
  styleUrl: './listado-usuarios.scss',
})
export class ListadoUsuarios {
  public cargando: boolean = false;

  public errorListado: string | null = null;

  public listadoUsuarios: UsuarioAdminVista[] = [];

  public usuarioSeleccionado: UsuarioAdminVista | null = null;

  public editorVisible: boolean = false;

  public filtrosForm: FormGroup = {} as FormGroup;

  public paginaActual: number = 0;

  public tamanoPagina: number = 20;

  public totalElementos: number = 0;

  public totalPaginas: number = 0;

  private paginaConfirmada: number = 0;

  private tamanoPaginaConfirmado: number = 20;

  public readonly scopes = [
    {
      label: 'Nivel',
      value: 'NIVEL',
    },
    {
      label: 'Modalidad',
      value: 'MODALIDAD',
    },
    {
      label: 'Sector',
      value: 'SECTOR',
    },
    {
      label: 'Zona',
      value: 'ZONA',
    },
    {
      label: 'Escuela',
      value: 'ESCUELA',
    },
    {
      label: 'Personalizado',
      value: 'PERSONALIZADO',
    },
    {
      label: 'Ejecutivo',
      value: 'EJECUTIVO',
    },
    {
      label: 'Administrador',
      value: 'ADMIN',
    },
  ];

  public readonly estados = [
    {
      label: 'Activos',
      value: true,
    },
    {
      label: 'Inactivos',
      value: false,
    },
  ];

  constructor(
    private breadCrumService: BreadCrumService,
    private usuariosService: UsuariosService,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private toast: ToastMessageService,
  ) {}

  ngOnInit(): void {
    this.crearFormulario();

    this.breadCrumService.addItem({
      jerarquia: 1,
      label: 'Administración de usuarios',
      urlLink: '/admin/listado-usuarios',
      icon: '',
    });

    this.getListadoUsuarios();
  }

  private crearFormulario(): void {
    this.filtrosForm = this.fb.group({
      username: [''],
      scope: [null],
      activo: [null],
    });
  }

  getListadoUsuarios(): void {
    if (this.cargando) {
      return;
    }

    this.cargando = true;

    this.errorListado = null;

    const form = this.filtrosForm.getRawValue();

    const filtros: UsuariosAdminFiltros = {
      username: form.username || undefined,

      scope: form.scope || undefined,

      activo: form.activo === null ? undefined : form.activo,

      page: this.paginaActual,

      size: this.tamanoPagina,

      sort: ['fechaCreacion,desc'],
    };

    this.usuariosService
      .getListadoUsuarios(filtros)
      .pipe(
        finalize(() => {
          this.cargando = false;

          this.cd.markForCheck();
        }),
      )
      .subscribe({
        next: (resp) => {
          this.listadoUsuarios = (resp.content ?? []).map(
            (usuario): UsuarioAdminVista => ({
              ...usuario,

              estadoTexto: usuario.activo ? 'ACTIVO' : 'INACTIVO',

              fechaCreacionTexto: this.formatearFecha(usuario.fechaCreacion),
            }),
          );

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

          this.errorListado = this.getErrorMessage(error);

          this.toast.error('No fue posible consultar usuarios', this.errorListado);
        },
      });
  }

  buscar(): void {
    this.paginaActual = 0;

    this.listadoUsuarios = [];

    this.getListadoUsuarios();
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      username: '',
      scope: null,
      activo: null,
    });

    this.paginaActual = 0;

    this.listadoUsuarios = [];

    this.getListadoUsuarios();
  }

  cambiarPagina(event: { page?: number; rows?: number }): void {
    if (this.cargando) {
      return;
    }

    this.paginaActual = event.page ?? 0;

    this.tamanoPagina = event.rows ?? this.tamanoPagina;

    this.getListadoUsuarios();
  }

  abrirEditor(usuario: UsuarioAdminVista): void {
    this.usuarioSeleccionado = usuario;

    this.editorVisible = true;
  }

  onEditorVisibleChange(visible: boolean): void {
    this.editorVisible = visible;

    if (!visible) {
      this.usuarioSeleccionado = null;
    }
  }

  onUsuarioActualizado(): void {
    this.getListadoUsuarios();
  }

  reintentar(): void {
    this.getListadoUsuarios();
  }

  private formatearFecha(fecha: string): string {
    if (!fecha) {
      return 'No disponible';
    }

    const value = new Date(fecha);

    if (Number.isNaN(value.getTime())) {
      return fecha;
    }

    return value.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 403) {
        return 'No tienes permisos para consultar la administración de usuarios.';
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
    }

    return 'Ocurrió un problema al consultar el listado de usuarios.';
  }
}
