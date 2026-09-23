import {
  Component,
  DestroyRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';

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

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UsuariosService } from '../../../../services/usuarios.service';

import {
  ActualizarUsuarioRequest,
  UsuarioActualizadoResponse,
  UsuarioAdminVista,
  DatosCuentaFormValue,
} from '../../../../interfaces/usuarios.interface';

import { ToastMessageService } from '../../../../../core/components/shared/toast-message/toast-message.service';

interface DatosOriginalesUsuario {
  username: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  sexo: string | null;
}

const noSoloEspaciosValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value;

  if (typeof value === 'string' && value.length > 0 && value.trim().length === 0) {
    return {
      soloEspacios: true,
    };
  }

  return null;
};

const passwordsCoincidenValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('password')?.value;

  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword
    ? null
    : {
        passwordsNoCoinciden: true,
      };
};

@Component({
  selector: 'app-usuario-editor',
  standalone: false,
  templateUrl: './usuario-editor.html',
  styleUrl: './usuario-editor.scss',
})
export class UsuarioEditor implements OnInit, OnChanges {
  @Input()
  public visible: boolean = false;

  @Input()
  public usuario: UsuarioAdminVista | null = null;

  @Output()
  public visibleChange = new EventEmitter<boolean>();

  @Output()
  public actualizado = new EventEmitter<void>();

  public datosForm: FormGroup;

  public passwordForm: FormGroup;

  public cargandoDetalle: boolean = false;

  public guardandoDatos: boolean = false;

  public actualizandoEstado: boolean = false;

  public actualizandoPassword: boolean = false;

  public errorDetalle: string | null = null;

  public sinPermisoDatos: boolean = false;

  public sinPermisoSeguridad: boolean = false;

  public showPass: boolean = false;

  public showConfirm: boolean = false;

  public tieneDetallePersona: boolean = false;

  public confirmandoUsername: boolean = false;

  public confirmandoEstado: boolean = false;

  public confirmandoPassword: boolean = false;

  public confirmandoCierre: boolean = false;

  public estadoObjetivo: boolean | null = null;

  public requisitosPassword = {
    longitud: false,
    mayuscula: false,
    numero: false,
    especial: false,
  };

  private originales: DatosOriginalesUsuario = {
    username: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: null,
    sexo: null,
  };

  private readonly destroyRef = inject(DestroyRef);

  private readonly passwordPattern =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]).{8,}$/;

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private toast: ToastMessageService,
    @Inject(DOCUMENT)
    private document: Document,
  ) {
    this.datosForm = this.fb.group({
      username: ['', [Validators.required, noSoloEspaciosValidator]],

      nombre: ['', [Validators.required, noSoloEspaciosValidator]],

      apellidoPaterno: ['', [Validators.required, noSoloEspaciosValidator]],

      apellidoMaterno: [''],

      sexo: [''],
    });

    this.passwordForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.pattern(this.passwordPattern)]],

        confirmPassword: ['', Validators.required],
      },
      {
        validators: passwordsCoincidenValidator,
      },
    );
  }

  ngOnInit(): void {
    this.passwordForm
      .get('password')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((password) => {
        this.evaluarPassword(password ?? '');

        this.confirmandoPassword = false;
      });

    this.datosForm
      .get('username')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.confirmandoUsername = false;
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.visible || !this.usuario) {
      return;
    }

    if (changes['visible'] || changes['usuario']) {
      this.inicializarEditor();
    }
  }

  get passwordValido(): boolean {
    return (
      this.requisitosPassword.longitud &&
      this.requisitosPassword.mayuscula &&
      this.requisitosPassword.numero &&
      this.requisitosPassword.especial
    );
  }

  get hayCambiosPendientes(): boolean {
    return this.datosForm.dirty || this.passwordForm.dirty;
  }

  get usernameOriginal(): string {
    return this.originales.username;
  }

  get usernameNuevo(): string {
    return this.datosForm.get('username')?.value ?? '';
  }

  private inicializarEditor(): void {
    if (!this.usuario) {
      return;
    }

    this.errorDetalle = null;

    this.sinPermisoDatos = false;

    this.sinPermisoSeguridad = false;

    this.confirmandoUsername = false;

    this.confirmandoEstado = false;

    this.confirmandoPassword = false;

    this.confirmandoCierre = false;

    this.estadoObjetivo = null;

    this.tieneDetallePersona = false;

    this.showPass = false;

    this.showConfirm = false;

    this.originales = {
      username: this.usuario.username,

      nombre: '',

      apellidoPaterno: '',

      apellidoMaterno: null,

      sexo: null,
    };

    this.datosForm.reset(
      {
        username: this.usuario.username,

        nombre: '',

        apellidoPaterno: '',

        apellidoMaterno: '',

        sexo: '',
      },
      {
        emitEvent: false,
      },
    );

    this.passwordForm.reset(
      {
        password: '',
        confirmPassword: '',
      },
      {
        emitEvent: false,
      },
    );

    this.evaluarPassword('');

    this.deshabilitarCamposPersona();

    if (this.usuario.personaId === null) {
      return;
    }

    this.cargarDetallePersona();
  }

  cargarDetallePersona(): void {
    if (!this.usuario || this.usuario.personaId === null) {
      return;
    }

    this.cargandoDetalle = true;

    this.errorDetalle = null;

    this.usuariosService
      .getPersona(this.usuario.personaId)
      .pipe(
        finalize(() => {
          this.cargandoDetalle = false;
        }),
      )
      .subscribe({
        next: (persona) => {
          this.tieneDetallePersona = true;

          this.originales = {
            username: this.usuario?.username ?? '',

            nombre: persona.nombre,

            apellidoPaterno: persona.apellidoPaterno,

            apellidoMaterno: persona.apellidoMaterno || null,

            sexo: persona.sexo || null,
          };

          this.habilitarCamposPersona();

          this.datosForm.reset(
            {
              username: this.usuario?.username ?? '',

              nombre: persona.nombre,

              apellidoPaterno: persona.apellidoPaterno,

              apellidoMaterno: persona.apellidoMaterno ?? '',

              sexo: persona.sexo ?? '',
            },
            {
              emitEvent: false,
            },
          );
        },

        error: (error: unknown) => {
          this.tieneDetallePersona = false;

          this.deshabilitarCamposPersona();

          this.errorDetalle = this.getErrorMessage(
            error,
            'No fue posible cargar los datos personales asociados al usuario.',
          );
        },
      });
  }

  guardarDatos(): void {
    if (!this.usuario || this.guardandoDatos) {
      return;
    }

    if (this.datosForm.invalid) {
      this.datosForm.markAllAsTouched();

      this.enfocarPrimerCampoDatosInvalido();

      return;
    }

    const payload = this.construirPayloadDatos();

    if (Object.keys(payload).length === 0) {
      this.toast.info(
        'Sin cambios',
        'No se detectaron cambios pendientes en los datos de la cuenta.',
      );

      return;
    }

    if (payload.username !== undefined) {
      this.confirmandoUsername = true;

      return;
    }

    this.ejecutarActualizacionDatos(payload);
  }

  confirmarCambioUsername(): void {
    if (!this.usuario || this.guardandoDatos) {
      return;
    }

    if (this.datosForm.invalid) {
      this.confirmandoUsername = false;

      this.datosForm.markAllAsTouched();

      this.enfocarPrimerCampoDatosInvalido();

      return;
    }

    const payload = this.construirPayloadDatos();

    if (payload.username === undefined) {
      this.confirmandoUsername = false;

      this.guardarDatos();

      return;
    }

    this.confirmandoUsername = false;

    this.ejecutarActualizacionDatos(payload);
  }

  cancelarConfirmacionUsername(): void {
    this.confirmandoUsername = false;
  }

  private ejecutarActualizacionDatos(payload: ActualizarUsuarioRequest): void {
    if (!this.usuario || this.guardandoDatos) {
      return;
    }

    this.guardandoDatos = true;

    this.sinPermisoDatos = false;

    this.usuariosService
      .actualizarUsuario(this.usuario.id, payload)
      .pipe(
        finalize(() => {
          this.guardandoDatos = false;
        }),
      )
      .subscribe({
        next: (resp) => {
          this.aplicarRespuestaUsuario(resp);

          this.datosForm.markAsPristine();

          this.toast.success(
            'Usuario actualizado',
            'Los datos de la cuenta se actualizaron correctamente.',
          );

          this.actualizado.emit();
        },

        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 403) {
            this.sinPermisoDatos = true;
          }

          this.toast.error(
            'No fue posible actualizar',
            this.getErrorMessage(error, 'No fue posible actualizar los datos del usuario.'),
          );
        },
      });
  }

  private construirPayloadDatos(): ActualizarUsuarioRequest {
    const raw = this.datosForm.getRawValue();

    const payload: ActualizarUsuarioRequest = {};

    if (raw.username !== this.originales.username) {
      payload.username = raw.username;
    }

    if (this.tieneDetallePersona) {
      if (raw.nombre !== this.originales.nombre) {
        payload.nombre = raw.nombre;
      }

      if (raw.apellidoPaterno !== this.originales.apellidoPaterno) {
        payload.apellidoPaterno = raw.apellidoPaterno;
      }

      const apellidoMaternoOriginal = this.originales.apellidoMaterno ?? '';

      if (raw.apellidoMaterno !== apellidoMaternoOriginal) {
        payload.apellidoMaterno = raw.apellidoMaterno === '' ? null : raw.apellidoMaterno;
      }

      const sexoOriginal = this.originales.sexo ?? '';

      if (raw.sexo !== sexoOriginal) {
        payload.sexo = raw.sexo === '' ? null : raw.sexo;
      }
    }

    return payload;
  }

  private aplicarRespuestaUsuario(resp: UsuarioActualizadoResponse): void {
    const nombreCompleto = [resp.nombre, resp.apellidoPaterno, resp.apellidoMaterno]
      .filter((value): value is string => typeof value === 'string' && value.length > 0)
      .join(' ');

    if (this.usuario) {
      this.usuario = {
        ...this.usuario,
        username: resp.username,
        nombreCompleto,
      };
    }

    this.originales = {
      username: resp.username,

      nombre: resp.nombre,

      apellidoPaterno: resp.apellidoPaterno,

      apellidoMaterno: resp.apellidoMaterno,

      sexo: resp.sexo,
    };

    this.datosForm.reset(
      {
        username: resp.username,

        nombre: resp.nombre,

        apellidoPaterno: resp.apellidoPaterno,

        apellidoMaterno: resp.apellidoMaterno ?? '',

        sexo: resp.sexo ?? '',
      },
      {
        emitEvent: false,
      },
    );

    this.tieneDetallePersona = true;
  }

  solicitarCambioEstado(activo: boolean): void {
    if (!this.usuario || this.actualizandoEstado) {
      return;
    }

    this.estadoObjetivo = activo;

    this.confirmandoEstado = true;
  }

  cancelarCambioEstado(): void {
    this.estadoObjetivo = null;

    this.confirmandoEstado = false;
  }

  confirmarCambioEstado(): void {
    if (!this.usuario || this.estadoObjetivo === null || this.actualizandoEstado) {
      return;
    }

    const activo = this.estadoObjetivo;

    this.actualizandoEstado = true;

    this.sinPermisoSeguridad = false;

    this.usuariosService
      .actualizarEstadoUsuario(this.usuario.id, activo)
      .pipe(
        finalize(() => {
          this.actualizandoEstado = false;
        }),
      )
      .subscribe({
        next: () => {
          if (this.usuario) {
            this.usuario = {
              ...this.usuario,
              activo,
              estadoTexto: activo ? 'ACTIVO' : 'INACTIVO',
            };
          }

          this.confirmandoEstado = false;

          this.estadoObjetivo = null;

          this.toast.success(
            activo ? 'Usuario habilitado' : 'Usuario inhabilitado',

            activo
              ? 'El usuario puede acceder nuevamente al sistema.'
              : 'El usuario fue inhabilitado correctamente.',
          );

          this.actualizado.emit();
        },

        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 403) {
            this.sinPermisoSeguridad = true;
          }

          this.toast.error(
            'No fue posible cambiar el estado',
            this.getErrorMessage(error, 'No fue posible cambiar el estado del usuario.'),
          );
        },
      });
  }

  solicitarRestablecerPassword(): void {
    if (!this.usuario || this.actualizandoPassword) {
      return;
    }

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();

      this.enfocarPrimerCampoPasswordInvalido();

      return;
    }

    this.confirmandoPassword = true;
  }

  cancelarRestablecerPassword(): void {
    this.confirmandoPassword = false;
  }

  confirmarRestablecerPassword(): void {
    if (!this.usuario || this.actualizandoPassword) {
      return;
    }

    if (this.passwordForm.invalid) {
      this.confirmandoPassword = false;

      this.passwordForm.markAllAsTouched();

      this.enfocarPrimerCampoPasswordInvalido();

      return;
    }

    const password = this.passwordForm.get('password')?.value;

    if (typeof password !== 'string' || password.length === 0) {
      return;
    }

    this.actualizandoPassword = true;

    this.sinPermisoSeguridad = false;

    this.usuariosService
      .actualizarPassword(this.usuario.id, password)
      .pipe(
        finalize(() => {
          this.actualizandoPassword = false;
        }),
      )
      .subscribe({
        next: () => {
          this.passwordForm.reset(
            {
              password: '',
              confirmPassword: '',
            },
            {
              emitEvent: false,
            },
          );

          this.evaluarPassword('');

          this.showPass = false;

          this.showConfirm = false;

          this.confirmandoPassword = false;

          this.toast.success(
            'Contraseña actualizada',
            'La contraseña del usuario se actualizó correctamente.',
          );
        },

        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 403) {
            this.sinPermisoSeguridad = true;
          }

          this.toast.error(
            'No fue posible actualizar la contraseña',
            this.getErrorMessage(error, 'No fue posible actualizar la contraseña del usuario.'),
          );
        },
      });
  }

  evaluarPassword(password: string): void {
    this.requisitosPassword = {
      longitud: password.length >= 8,

      mayuscula: /[A-Z]/.test(password),

      numero: /\d/.test(password),

      especial: /[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]/.test(password),
    };
  }

  isInvalid(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);

    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  solicitarCierre(): void {
    if (this.hayCambiosPendientes) {
      this.confirmandoCierre = true;

      return;
    }

    this.cerrar();
  }

  cancelarCierre(): void {
    this.confirmandoCierre = false;
  }

  descartarYCerrar(): void {
    this.confirmandoCierre = false;

    this.cerrar();
  }

  onDialogVisibleChange(value: boolean): void {
    if (!value && this.hayCambiosPendientes) {
      this.confirmandoCierre = true;

      return;
    }

    this.visible = value;

    this.visibleChange.emit(value);
  }

  private cerrar(): void {
    this.visible = false;

    this.visibleChange.emit(false);

    this.limpiarEstadoAlCerrar();
  }

  limpiarEstadoAlCerrar(): void {
    this.confirmandoUsername = false;

    this.confirmandoEstado = false;

    this.confirmandoPassword = false;

    this.confirmandoCierre = false;

    this.estadoObjetivo = null;

    this.showPass = false;

    this.showConfirm = false;
  }

  private habilitarCamposPersona(): void {
    ['nombre', 'apellidoPaterno', 'apellidoMaterno', 'sexo'].forEach((campo) => {
      this.datosForm.get(campo)?.enable({
        emitEvent: false,
      });
    });
  }

  private deshabilitarCamposPersona(): void {
    ['nombre', 'apellidoPaterno', 'apellidoMaterno', 'sexo'].forEach((campo) => {
      this.datosForm.get(campo)?.disable({
        emitEvent: false,
      });
    });
  }

  private enfocarPrimerCampoDatosInvalido(): void {
    const campos = ['username', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'sexo'];

    const campo = campos.find((nombre) => this.datosForm.get(nombre)?.invalid);

    if (!campo) {
      return;
    }

    queueMicrotask(() => {
      this.document.getElementById(`editor-${campo}`)?.focus();
    });
  }

  private enfocarPrimerCampoPasswordInvalido(): void {
    let id = 'editor-password';

    if (
      this.passwordForm.get('password')?.valid &&
      (this.passwordForm.get('confirmPassword')?.invalid ||
        this.passwordForm.hasError('passwordsNoCoinciden'))
    ) {
      id = 'editor-confirm-password';
    }

    queueMicrotask(() => {
      this.document.getElementById(id)?.focus();
    });
  }

  private getErrorMessage(error: unknown, fallback: string): string {
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
