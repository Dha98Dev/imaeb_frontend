import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
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
import { MessageService } from 'primeng/api';
import { UsuariosService } from '../../../admin/services/usuarios.service';
import { AuthService } from '../../../Auth/services/auth.service';
import { ToastMessageService } from '../shared/toast-message/toast-message.service';

interface PerfilEditable {
  username: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  sexo: string;
}

@Component({
  selector: 'app-mi-cuenta-editor',
  standalone: false,
  templateUrl: './mi-cuenta-editor.html',
  styleUrl: './mi-cuenta-editor.scss',
})
export class MiCuentaEditor implements OnChanges {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() actualizado = new EventEmitter<any>();
  @Output() cerrarSesion = new EventEmitter<void>();

  protected perfilForm: FormGroup;
  protected passwordForm: FormGroup;
  protected usuarioId: number | null = null;
  protected usernameActual = '';
  protected tipoPersona = '';
  protected scope = '';
  protected activo = false;
  protected cargandoCuenta = false;
  protected guardandoPerfil = false;
  protected actualizandoPassword = false;
  protected errorCuenta = '';
  protected errorPerfil = '';
  protected errorPassword = '';
  protected showPass = false;
  protected showConfirm = false;
  protected confirmandoPassword = false;
  protected confirmandoUsername = false;
  protected accountData: any = null;
  private payloadPendiente: any = null;
  private perfilOriginal: PerfilEditable = {
    username: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    sexo: '',
  };

  protected readonly sexoOptions: Array<{ label: string; value: 'H' | 'M' }> = [
    { label: 'Hombre', value: 'H' },
    { label: 'Mujer', value: 'M' },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private usuariosService: UsuariosService,
    private messageService: MessageService,
    private toastMessageService: ToastMessageService,
  ) {
    this.perfilForm = this.fb.group({
      username: ['', [Validators.required, this.noSoloEspaciosValidator()]],
      nombre: ['', [this.textoOpcionalValidator()]],
      apellidoPaterno: ['', [this.textoOpcionalValidator()]],
      apellidoMaterno: ['', [this.textoOpcionalValidator()]],
      sexo: [null, [this.sexoOpcionalValidator()]],
    });
    this.passwordForm = this.fb.group(
      {
        password: ['', [Validators.required, this.passwordValidator()]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordsIgualesValidator() },
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    const visibleChange = changes['visible'];
    if (
      visibleChange &&
      visibleChange.currentValue === true &&
      visibleChange.previousValue !== true
    )
      this.prepararApertura();
  }

  get hayCambiosPendientes(): boolean {
    return Object.keys(this.construirPayloadPerfil()).length > 0 || this.passwordForm.dirty;
  }

  get requisitosPassword(): {
    longitud: boolean;
    mayuscula: boolean;
    numero: boolean;
    especial: boolean;
  } {
    const password = this.passwordForm.get('password')?.value ?? '';
    return {
      longitud: password.length >= 8,
      mayuscula: /\p{Lu}/u.test(password),
      numero: /\d/.test(password),
      especial: /[^\p{L}\p{N}\s]/u.test(password),
    };
  }

  private prepararApertura(): void {
    this.errorCuenta = '';
    this.errorPerfil = '';
    this.errorPassword = '';
    this.confirmandoPassword = false;
    this.confirmandoUsername = false;
    this.payloadPendiente = null;
    this.showPass = false;
    this.showConfirm = false;
    this.usuarioId = null;
    this.usernameActual = '';
    this.tipoPersona = '';
    this.scope = '';
    this.activo = false;
    this.accountData = null;
    this.perfilOriginal = {
      username: '',
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      sexo: '',
    };
    this.perfilForm.reset({
      username: '',
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      sexo: null,
    });
    this.passwordForm.reset({ password: '', confirmPassword: '' });
    this.cargarCuenta();
  }

  cargarCuenta(): void {
    if (this.cargandoCuenta) return;
    this.cargandoCuenta = true;
    this.errorCuenta = '';

    this.authService
      .getMe()
      .pipe(finalize(() => (this.cargandoCuenta = false)))
      .subscribe({
        next: (usuario) => {
          this.usuarioId = usuario.id;
          this.usernameActual = usuario.username ?? '';
          this.tipoPersona = usuario.tipoPersona ?? '';
          this.scope = usuario.scope ?? '';
          this.activo = usuario.activo;
          this.accountData = usuario;

          this.perfilOriginal = {
            username: usuario.username ?? '',
            nombre: usuario.nombre ?? '',
            apellidoPaterno: usuario.apellidoPaterno ?? '',
            apellidoMaterno: usuario.apellidoMaterno ?? '',
            sexo: usuario.sexo ?? '',
          };

          this.perfilForm.reset({ ...this.perfilOriginal });
          this.perfilForm.markAsPristine();
          this.perfilForm.markAsUntouched();
        },
        error: (error: unknown) =>
          (this.errorCuenta = this.obtenerMensajeError(
            error,
            'No fue posible cargar la información de tu cuenta.',
          )),
      });
  }

  guardarPerfil(): void {
    if (this.guardandoPerfil || this.cargandoCuenta) return;
    this.errorPerfil = '';
    this.perfilForm.markAllAsTouched();

    if (this.perfilForm.invalid) {
      this.enfocarPrimerCampoInvalido(this.perfilForm, {
        username: 'mi-cuenta-username',
        nombre: 'mi-cuenta-nombre',
        apellidoPaterno: 'mi-cuenta-apellido-paterno',
        apellidoMaterno: 'mi-cuenta-apellido-materno',
        sexo: 'mi-cuenta-sexo',
      });
      return;
    }

    const body = this.construirPayloadPerfil();

    if (Object.keys(body).length === 0) {
      this.toastMessageService.info('Sin cambios', 'No hay modificaciones de perfil para guardar.');
      return;
    }

    if (Object.prototype.hasOwnProperty.call(body, 'username')) {
      this.payloadPendiente = body;
      this.confirmandoUsername = true;
      return;
    }

    this.actualizarPerfil(body, false);
  }

  confirmarCambioUsername(): void {
    if (!this.payloadPendiente) return;
    const body = { ...this.payloadPendiente };
    this.payloadPendiente = null;
    this.confirmandoUsername = false;
    this.actualizarPerfil(body, true);
  }

  cancelarCambioUsername(): void {
    this.confirmandoUsername = false;
    this.payloadPendiente = null;
  }

  private actualizarPerfil(body: any, cerrarSesionDespues: boolean): void {
    this.guardandoPerfil = true;

    this.authService
      .actualizarMe(body)
      .pipe(finalize(() => (this.guardandoPerfil = false)))
      .subscribe({
        next: (perfil) => {
          this.usernameActual = perfil.username;
          this.accountData = perfil;

          this.perfilOriginal = {
            username: perfil.username ?? '',
            nombre: perfil.nombre ?? '',
            apellidoPaterno: perfil.apellidoPaterno ?? '',
            apellidoMaterno: perfil.apellidoMaterno ?? '',
            sexo: perfil.sexo ?? '',
          };

          this.perfilForm.reset({ ...this.perfilOriginal });
          this.perfilForm.markAsPristine();
          this.perfilForm.markAsUntouched();
          this.actualizado.emit(perfil);

          if (cerrarSesionDespues) {
          this.toastMessageService.success('Perfil actualizado', 'El nombre de usuario cambió correctamente. Inicia sesión nuevamente para continuar.');
            setTimeout(() => this.cerrarSesion.emit(), 1200);
            return;
          }

         this.messageService.add({ severity: 'success', summary: 'Perfil actualizado', detail: 'Tu información fue actualizada correctamente.' });
        },
        error: (error: unknown) =>
          (this.errorPerfil = this.obtenerMensajeError(
            error,
            'No fue posible actualizar tu perfil.',
          )),
      });
  }

  private construirPayloadPerfil(): any {
    if (!this.perfilForm) return {};

    const actual = {
      username: String(this.perfilForm.get('username')?.value ?? '').trim(),
      nombre: String(this.perfilForm.get('nombre')?.value ?? '').trim(),
      apellidoPaterno: String(this.perfilForm.get('apellidoPaterno')?.value ?? '').trim(),
      apellidoMaterno: String(this.perfilForm.get('apellidoMaterno')?.value ?? '').trim(),
      sexo: String(this.perfilForm.get('sexo')?.value ?? '').trim(),
    };

    const body: any = {};

    if (actual.username !== this.perfilOriginal.username) body.username = actual.username;
    if (actual.nombre !== this.perfilOriginal.nombre) body.nombre = actual.nombre;
    if (actual.apellidoPaterno !== this.perfilOriginal.apellidoPaterno)
      body.apellidoPaterno = actual.apellidoPaterno;
    if (actual.apellidoMaterno !== this.perfilOriginal.apellidoMaterno)
      body.apellidoMaterno = actual.apellidoMaterno === '' ? null : actual.apellidoMaterno;
    if (actual.sexo !== this.perfilOriginal.sexo && (actual.sexo === 'H' || actual.sexo === 'M'))
      body.sexo = actual.sexo;

    return body;
  }

  solicitarRestablecerPassword(): void {
    if (this.actualizandoPassword || this.usuarioId === null) return;
    this.errorPassword = '';
    this.passwordForm.markAllAsTouched();

    if (this.passwordForm.invalid) {
      this.enfocarPrimerCampoInvalido(this.passwordForm, {
        password: 'mi-cuenta-password',
        confirmPassword: 'mi-cuenta-confirm-password',
      });
      return;
    }

    this.confirmandoPassword = true;
  }

  cancelarRestablecerPassword(): void {
    if (!this.actualizandoPassword) this.confirmandoPassword = false;
  }

  confirmarRestablecerPassword(): void {
    if (this.actualizandoPassword || this.usuarioId === null || this.passwordForm.invalid) return;
    const nuevaPassword = this.passwordForm.get('password')?.value;
    if (typeof nuevaPassword !== 'string') return;

    this.actualizandoPassword = true;
    this.errorPassword = '';

    this.usuariosService
      .actualizarPassword(this.usuarioId, nuevaPassword)
      .pipe(finalize(() => (this.actualizandoPassword = false)))
      .subscribe({
        next: () => {
          this.confirmandoPassword = false;
          this.passwordForm.reset({ password: '', confirmPassword: '' });
          this.passwordForm.markAsPristine();
          this.passwordForm.markAsUntouched();
          this.showPass = false;
          this.showConfirm = false;
         this.toastMessageService.success('Contraseña actualizada', 'Tu contraseña fue actualizada correctamente.');
        },
        error: (error: unknown) =>
          (this.errorPassword = this.obtenerMensajeError(
            error,
            'No fue posible actualizar la contraseña.',
          )),
      });
  }

  onDialogVisibleChange(visible: boolean): void {
    if (!visible) this.cerrar();
  }

  solicitarCierre(): void {
    this.cerrar();
  }

  private cerrar(): void {
    if (this.guardandoPerfil || this.actualizandoPassword) return;
    this.confirmandoPassword = false;
    this.confirmandoUsername = false;
    this.payloadPendiente = null;
    this.perfilForm.reset();
    this.passwordForm.reset();
    this.visibleChange.emit(false);
  }

  isInvalid(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  private noSoloEspaciosValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '') return null;
      return typeof value === 'string' && value.trim().length === 0 ? { soloEspacios: true } : null;
    };
  }

  private textoOpcionalValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '') return null;
      return typeof value === 'string' && value.trim().length === 0 ? { soloEspacios: true } : null;
    };
  }

  private sexoOpcionalValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '') return null;
      return value === 'H' || value === 'M' ? null : { sexoInvalido: true };
    };
  }

  private passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value;
      if (password === null || password === undefined || password === '') return null;
      if (typeof password !== 'string') return { passwordInvalida: true };

      const errors: ValidationErrors = {};
      if (password.length < 8) errors['longitud'] = true;
      if (!/\p{Lu}/u.test(password)) errors['mayuscula'] = true;
      if (!/\d/.test(password)) errors['numero'] = true;
      if (!/[^\p{L}\p{N}\s]/u.test(password)) errors['especial'] = true;
      return Object.keys(errors).length ? errors : null;
    };
  }

  private passwordsIgualesValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password')?.value;
      const confirmPassword = control.get('confirmPassword')?.value;
      if (!password || !confirmPassword) return null;
      return password === confirmPassword ? null : { passwordsNoCoinciden: true };
    };
  }

  private enfocarPrimerCampoInvalido(form: FormGroup, fieldIds: Record<string, string>): void {
    const controlName = Object.keys(fieldIds).find((key) => form.get(key)?.invalid);
    if (!controlName) return;
    setTimeout(() => document.getElementById(fieldIds[controlName])?.focus());
  }

  private obtenerMensajeError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const response = error.error;
      if (
        response &&
        typeof response === 'object' &&
        'message' in response &&
        typeof response.message === 'string'
      )
        return response.message;
      if (typeof response === 'string' && response.trim()) return response;
    }
    return fallback;
  }
}
