import { ChangeDetectorRef, Component } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { finalize } from 'rxjs';

import { MessageService } from 'primeng/api';

import { BreadCrumService } from '../../../core/services/breadCrumbs/bread-crumb-service';

import { UsuariosService } from '../../services/usuarios.service';

import {
  UsuarioAdmin,
  UsuarioAdminVista,
  UsuariosAdminFiltros,
} from '../../interfaces/usuarios.interface';

import { DinamicTableData, TableColumn } from '../../../core/Interfaces/TablaDinamica.interface';

@Component({
  selector: 'app-listado-usuarios',
  standalone: false,
  templateUrl: './listado-usuarios.html',
  styleUrl: './listado-usuarios.scss',
})
export class ListadoUsuarios {
  constructor(
    private breadCrumService: BreadCrumService,
    private usuariosService: UsuariosService,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private messageService: MessageService,
  ) {}

  public visible: boolean = false;

  public cargando: boolean = false;

  public actualizandoEstado: boolean = false;

  public actualizandoPassword: boolean = false;

  public listadoUsuarios: UsuarioAdminVista[] = [];

  public usuarioSeleccionado: UsuarioAdminVista | null = null;

  public dataTable: DinamicTableData = {} as DinamicTableData;

  public filtrosForm: FormGroup = {} as FormGroup;

  public reestablecerPasswordForm: FormGroup = {} as FormGroup;

  public showPass: boolean = false;

  public showConfirm: boolean = false;

  public paginaActual: number = 0;

  public tamanoPagina: number = 20;

  public totalElementos: number = 0;

  public totalPaginas: number = 0;

  public scopes = [
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

  public estados = [
    {
      label: 'Activos',
      value: true,
    },
    {
      label: 'Inactivos',
      value: false,
    },
  ];

  ngOnInit(): void {
    this.crearFormularios();

    this.configurarTabla();

    this.breadCrumService.addItem({
      jerarquia: 1,
      label: 'Administración de usuarios',
      urlLink: '/admin/listado-usuarios',
      icon: '',
    });

    this.getListadoUsuarios();
  }

  private crearFormularios(): void {
    this.filtrosForm = this.fb.group({
      username: [''],
      scope: [null],
      activo: [null],
    });

    this.reestablecerPasswordForm = this.fb.group({
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]).{8,}$/,
          ),
        ],
      ],

      confirmPassword: ['', Validators.required],
    });
  }

  private configurarTabla(): void {
    const columns: TableColumn[] = [
      {
        key: 'nombreCompleto',
        label: 'Nombre completo',
        filterable: true,
      },
      {
        key: 'username',
        label: 'Usuario',
        filterable: true,
      },
      {
        key: 'tipoPersona',
        label: 'Tipo de persona',
        filterable: false,
      },
      {
        key: 'scope',
        label: 'Scope',
        filterable: false,
      },
      {
        key: 'estadoTexto',
        label: 'Estado',
        filterable: false,
        icon: 'pi pi-check-circle',
      },
      {
        key: 'fechaCreacionTexto',
        label: 'Fecha de creación',
        filterable: false,
      },
    ];

    this.dataTable = {
      columns,
      data: [],
      globalSearchKeys: ['nombreCompleto', 'username', 'tipoPersona', 'scope', 'estadoTexto'],
    };
  }

  getListadoUsuarios(): void {
    this.cargando = true;

    const form = this.filtrosForm.getRawValue();

    const filtros: UsuariosAdminFiltros = {
      username: form.username || undefined,

      scope: form.scope || undefined,

      activo: form.activo === null ? undefined : form.activo,

      page: this.paginaActual,

      size: 100,

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

          this.dataTable = {
            ...this.dataTable,

            data: [...this.listadoUsuarios],
          };

          this.cd.markForCheck();
        },

        error: (error) => {
          console.error('Error obteniendo usuarios', error);

          this.listadoUsuarios = [];

          this.dataTable = {
            ...this.dataTable,
            data: [],
          };

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No fue posible obtener el listado de usuarios.',
            life: 3500,
          });
        },
      });
  }

  buscar(): void {
    this.paginaActual = 0;

    this.getListadoUsuarios();
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      username: '',
      scope: null,
      activo: null,
    });

    this.paginaActual = 0;

    this.getListadoUsuarios();
  }

  cambiarPagina(event: any): void {
    this.paginaActual = event.page ?? 0;

    this.tamanoPagina = event.rows ?? 20;

    this.getListadoUsuarios();
  }

  onRow(usuario: any): void {
    this.usuarioSeleccionado = usuario;

    this.reestablecerPasswordForm.reset();

    this.showPass = false;

    this.showConfirm = false;

    this.visible = true;
  }

  cerrarDialog(): void {
    this.visible = false;

    this.usuarioSeleccionado = null;

    this.reestablecerPasswordForm.reset();

    this.showPass = false;

    this.showConfirm = false;
  }

  reestablecerPassword(): void {
    if (!this.usuarioSeleccionado) {
      return;
    }

    const password = this.reestablecerPasswordForm.get('password')?.value;

    const confirmPassword = this.reestablecerPasswordForm.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Contraseña',
        detail: 'Las contraseñas deben ser iguales.',
        life: 3000,
      });

      return;
    }

    if (this.reestablecerPasswordForm.invalid) {
      this.reestablecerPasswordForm.markAllAsTouched();

      return;
    }

    this.actualizandoPassword = true;

    this.usuariosService
      .actualizarPassword(this.usuarioSeleccionado.id, password)
      .pipe(
        finalize(() => {
          this.actualizandoPassword = false;

          this.cd.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Contraseña actualizada',
            detail: 'La contraseña del usuario se actualizó correctamente.',
            life: 3500,
          });

          this.reestablecerPasswordForm.reset();

          this.visible = false;
        },

        error: (error) => {
          console.error('Error actualizando contraseña', error);

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No fue posible actualizar la contraseña del usuario.',
            life: 3500,
          });
        },
      });
  }

  cambiarEstadoUsuario(activo: boolean): void {
    if (!this.usuarioSeleccionado) {
      return;
    }

    this.actualizandoEstado = true;

    this.usuariosService
      .actualizarEstadoUsuario(this.usuarioSeleccionado.id, activo)
      .pipe(
        finalize(() => {
          this.actualizandoEstado = false;

          this.cd.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.usuarioSeleccionado = {
            ...this.usuarioSeleccionado!,
            activo,
          };

          this.messageService.add({
            severity: 'success',

            summary: activo ? 'Usuario habilitado' : 'Usuario inhabilitado',

            detail: activo
              ? 'El usuario puede acceder nuevamente al sistema.'
              : 'El usuario fue inhabilitado correctamente.',

            life: 3500,
          });

          this.visible = false;

          this.getListadoUsuarios();
        },

        error: (error) => {
          console.error('Error actualizando usuario', error);

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No fue posible cambiar el estado del usuario.',
            life: 3500,
          });
        },
      });
  }

  isInvalid(formGroup: FormGroup, controlName: string): boolean {
    const control = formGroup.get(controlName);

    return !!(control && control.invalid && (control.touched || control.dirty));
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
}
