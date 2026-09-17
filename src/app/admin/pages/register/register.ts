import { ChangeDetectorRef, Component } from '@angular/core';
import { BreadCrumService } from '../../../core/services/breadCrumbs/bread-crumb-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  Nivele,
  singleModalidad,
  Sectores,
  Zona,
  CentrosTrabajo,
  catalogo,
  responseCatalogo,
} from '../../../core/Interfaces/catalogo.interface';
import { finalize, firstValueFrom, Observable, of, switchMap, throwError } from 'rxjs';
import { CatalogoService } from '../../../core/services/Catalogos/catalogo.service';
import { UsuariosService } from '../../services/usuarios.service';
import { TipoUsuario } from '../../interfaces/usuarios.interface';
import { MessageService } from 'primeng/api';
import {
  modalidadesNivel,
  modalidadesSelectedByNivel,
} from '../../interfaces/dataNewRegister.interface';
import { Persona, CrearPersonaRequest } from '../../interfaces/persona.interface';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  constructor(
    private breadCrumb: BreadCrumService,
    private fb: FormBuilder,
    private cataloService: CatalogoService,
    private cd: ChangeDetectorRef,
    private usuarioService: UsuariosService,
    private messageService: MessageService,
  ) {}

  activeStep: number = 1;
  public niveles: Nivele[] = [];
  public modalidades: singleModalidad[] = [];
  public sectores: Sectores[] = [];
  public zonas: Zona[] = [];
  public centrosTrabajo: CentrosTrabajo[] = [];
  public nivelId: string = '';
  public alcancePermisoConsulta: FormGroup = {} as FormGroup;
  public datosPersonales: FormGroup = {} as FormGroup;
  public auth: FormGroup = {} as FormGroup;
  public nivelFiltroSeleccionado: number = 0;
  public listadoTipoPersonas: TipoUsuario[] = [];
  public showPass: boolean = false;
  public showConfirm: boolean = false;
  public usuarioGuardado: boolean = false;
  public guardandoUsuario: boolean = false;
  public scope: string = '';
  public modalidadesPersonalizado: modalidadesNivel[] = [];
  public modalidadesSelectedByNivel: modalidadesSelectedByNivel[] = [];
  public personaSeleccionada: Persona | null = null;

  public sexoOptions = [
    { label: 'Hombre', value: 'H' },
    { label: 'Mujer', value: 'M' },
  ];

  ngOnInit(): void {
    this.alcancePermisoConsulta = this.fb.group({
      nivelId: [null],
      modalidadId: [null],
      sectorId: [null],
      zonaId: [null],
      escuelaId: [null],
      nivelIds: this.fb.control([]),
      modalidadIds: this.fb.control([]),
    });

    this.datosPersonales = this.fb.group({
      nombre: ['', Validators.required],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: [''],
      sexo: ['', Validators.required],
      curp: [
        '',
        Validators.pattern(
          /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]\d$/,
        ),
      ],
      scope: ['', Validators.required],
      tipoPersonaId: [null, Validators.required],
    });

    this.auth = this.fb.group({
      username: ['', Validators.required],
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

    this.datosPersonales.valueChanges.subscribe(() => {
      this.personaSeleccionada = null;
    });

    this.breadCrumb.addItem({
      jerarquia: 1,
      icon: '',
      label: 'Registro de usuario',
      urlLink: '/admin/register',
      home: '',
    });

    this.getNiveles();
    this.getTipoPersonas();
  }

  async getNiveles(): Promise<void> {
    try {
      const resp = await this.realizarPeticionCatalogoService({});
      this.niveles = resp.niveles ?? [];
      this.cd.markForCheck();
    } catch (error) {
      console.error('Error obteniendo niveles', error);
      this.niveles = [];
      this.cd.markForCheck();
    }
  }

  async getModalidades(): Promise<void> {
    this.limpiarPropiedades(1);
    this.limpiarCampos(['modalidadId', 'sectorId', 'zonaId', 'escuelaId']);

    const nivelId = this.valorNumero(this.alcancePermisoConsulta.get('nivelId')?.value);
    if (nivelId === undefined) return;

    try {
      const resp = await this.realizarPeticionCatalogoService({ nivelId });
      this.modalidades = resp.modalidades ?? [];
      this.cd.markForCheck();
    } catch (error) {
      console.error('Error obteniendo modalidades', error);
      this.modalidades = [];
      this.cd.markForCheck();
    }
  }

  async getSectores(): Promise<void> {
    this.limpiarPropiedades(2);
    this.limpiarCampos(['sectorId', 'zonaId', 'escuelaId']);

    const nivelId = this.valorNumero(this.alcancePermisoConsulta.get('nivelId')?.value);
    const modalidadId = this.valorNumero(this.alcancePermisoConsulta.get('modalidadId')?.value);
    if (nivelId === undefined || modalidadId === undefined) return;

    if (nivelId === 3) {
      this.sectores = [];
      this.alcancePermisoConsulta.patchValue({ sectorId: 0 });
      await this.getZonas();
      return;
    }

    try {
      const resp = await this.realizarPeticionCatalogoService({ nivelId, modalidadId });
      const sectores: Sectores[] = resp.sectores ?? [];
      this.sectores = sectores.sort(
        (a: Sectores, b: Sectores) => (a.numero || 0) - (b.numero || 0),
      );
      this.cd.markForCheck();
    } catch (error) {
      console.error('Error obteniendo sectores', error);
      this.sectores = [];
      this.cd.markForCheck();
    }
  }

  async getsectorIdes(): Promise<void> {
    await this.getSectores();
  }

  async getZonas(): Promise<void> {
    this.limpiarPropiedades(3);
    this.limpiarCampos(['zonaId', 'escuelaId']);

    const nivelId = this.valorNumero(this.alcancePermisoConsulta.get('nivelId')?.value);
    const modalidadId = this.valorNumero(this.alcancePermisoConsulta.get('modalidadId')?.value);
    const sectorId = this.valorNumero(this.alcancePermisoConsulta.get('sectorId')?.value);

    if (nivelId === undefined || modalidadId === undefined || sectorId === undefined) return;

    let sector = sectorId;

    if (nivelId !== 3) {
      const sectorSeleccionado = this.sectores.find((item) => item.id === sectorId);
      if (!sectorSeleccionado) return;
      sector = sectorSeleccionado.id;
    }

    try {
      const resp = await this.realizarPeticionCatalogoService({ nivelId, modalidadId, sector });
      const zonas: Zona[] = resp.zonas ?? [];
      this.zonas = zonas.sort((a: Zona, b: Zona) => (a.numero || 0) - (b.numero || 0));
      this.cd.markForCheck();
    } catch (error) {
      console.error('Error obteniendo zonas', error);
      this.zonas = [];
      this.cd.markForCheck();
    }
  }

  async getCentrosTrabajo(): Promise<void> {
    this.centrosTrabajo = [];
    this.alcancePermisoConsulta.patchValue({ escuelaId: null });

    const nivelId = this.valorNumero(this.alcancePermisoConsulta.get('nivelId')?.value);
    const modalidadId = this.valorNumero(this.alcancePermisoConsulta.get('modalidadId')?.value);
    const sectorId = this.valorNumero(this.alcancePermisoConsulta.get('sectorId')?.value);
    const zonaId = this.valorNumero(this.alcancePermisoConsulta.get('zonaId')?.value);

    if (
      nivelId === undefined ||
      modalidadId === undefined ||
      sectorId === undefined ||
      zonaId === undefined
    )
      return;

    const zonaSeleccionada = this.zonas.find((zona) => zona.id === zonaId);
    if (!zonaSeleccionada) return;

    let sector = sectorId;

    if (nivelId !== 3) {
      const sectorSeleccionado = this.sectores.find((item) => item.id === sectorId);
      if (!sectorSeleccionado) return;
      sector = sectorSeleccionado.id;
    }

    try {
      const resp = await this.realizarPeticionCatalogoService({
        nivelId,
        modalidadId,
        sector,
        zonaEscolar: zonaSeleccionada.numero,
      });

      this.centrosTrabajo = resp.centrosTrabajo ?? [];
      this.cd.markForCheck();
    } catch (error) {
      console.error('Error obteniendo centros de trabajo', error);
      this.centrosTrabajo = [];
      this.cd.markForCheck();
    }
  }

  limpiarCampos(campos: string[]): void {
    const patch: Record<string, null> = {};
    campos.forEach((campo) => (patch[campo] = null));
    this.alcancePermisoConsulta.patchValue(patch);
    this.cd.markForCheck();
  }

  limpiarPropiedades(nivelLimpieza: number): void {
    switch (nivelLimpieza) {
      case 1:
        this.modalidades = [];
        this.sectores = [];
        this.zonas = [];
        this.centrosTrabajo = [];
        break;
      case 2:
        this.sectores = [];
        this.zonas = [];
        this.centrosTrabajo = [];
        break;
      case 3:
        this.zonas = [];
        this.centrosTrabajo = [];
        break;
      case 4:
        this.centrosTrabajo = [];
        break;
    }

    this.cd.markForCheck();
  }

  async realizarPeticionCatalogoService(params: catalogo): Promise<responseCatalogo> {
    return await firstValueFrom(this.cataloService.getCatalogo(params));
  }

  getTipoPersonas(): void {
    this.usuarioService.getListadoTipoUsuarios().subscribe({
      next: (resp) => {
        this.listadoTipoPersonas = resp;
        this.cd.markForCheck();
      },
      error: (error) => {
        console.error('Error obteniendo tipos de usuario', error);
        this.listadoTipoPersonas = [];
        this.cd.markForCheck();
      },
    });
  }

  onSelectTipoPersona(): void {
    const tipoPersonaId = this.datosPersonales.get('tipoPersonaId')?.value;
    const tipoPersona = this.listadoTipoPersonas.find((tp) => tp.id == tipoPersonaId);
    const scope = tipoPersona?.scope ?? '';

    this.scope = scope;
    this.personaSeleccionada = null;
    this.datosPersonales.patchValue({ scope }, { emitEvent: false });
    this.reiniciarAlcance();
    this.limpiarValidacionesAlcance();

    if (scope) this.addOrRemoveValidations(scope);
    this.cd.markForCheck();
  }

  private reiniciarAlcance(): void {
    this.alcancePermisoConsulta.patchValue({
      nivelId: null,
      modalidadId: null,
      sectorId: null,
      zonaId: null,
      escuelaId: null,
      nivelIds: [],
      modalidadIds: [],
    });

    this.modalidades = [];
    this.sectores = [];
    this.zonas = [];
    this.centrosTrabajo = [];
    this.modalidadesPersonalizado = [];
    this.modalidadesSelectedByNivel = [];
  }

  addOrRemoveValidations(scope: string): void {
    this.limpiarValidacionesAlcance();

    const rules: Record<string, string[]> = {
      ESCUELA: ['escuelaId', 'zonaId', 'sectorId', 'modalidadId', 'nivelId'],
      ZONA: ['zonaId', 'sectorId', 'modalidadId', 'nivelId'],
      SECTOR: ['sectorId', 'modalidadId', 'nivelId'],
      MODALIDAD: ['modalidadId', 'nivelId'],
      NIVEL: ['nivelId'],
      EJECUTIVO: [],
      ADMIN: [],
      PERSONALIZADO: ['nivelIds', 'modalidadIds'],
    };

    const fields = rules[scope] ?? [];

    fields.forEach((field) => {
      const control = this.alcancePermisoConsulta.get(field);
      control?.setValidators(Validators.required);
      control?.updateValueAndValidity();
    });
  }

  limpiarValidacionesAlcance(): void {
    Object.keys(this.alcancePermisoConsulta.controls).forEach((key) => {
      const control = this.alcancePermisoConsulta.get(key);
      control?.clearValidators();
      control?.updateValueAndValidity();
    });
  }

  isInvalid(formGroup: FormGroup, controlName: string): boolean {
    const control = formGroup.get(controlName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  private construirPayloadPersona(): CrearPersonaRequest {
    const form = this.datosPersonales.getRawValue();

    return {
      nombre: this.normalizarTexto(form.nombre),
      apellidoPaterno: this.normalizarTexto(form.apellidoPaterno),
      apellidoMaterno: this.normalizarTexto(form.apellidoMaterno),
      sexo: form.sexo,
      curp: form.curp?.trim() ? this.normalizarTexto(form.curp) : null,
      tipoPersonaId: Number(form.tipoPersonaId),
    };
  }

  private obtenerOCrearPersona(): Observable<Persona> {
    if (this.personaSeleccionada) return of(this.personaSeleccionada);

    const payload = this.construirPayloadPersona();

    if (!payload.curp) return this.usuarioService.crearPersona(payload);

    return this.usuarioService.buscarPersonaPorCurp(payload.curp).pipe(
      switchMap((resp) => {
        const personaExistente = (resp.content ?? []).find(
          (persona: Persona) => persona.curp?.toUpperCase() === payload.curp?.toUpperCase(),
        );

        if (!personaExistente) return this.usuarioService.crearPersona(payload);

        if (personaExistente.tipoPersonaId !== payload.tipoPersonaId) {
          return throwError(
            () =>
              new Error(
                `La persona con CURP ${payload.curp} ya existe con el tipo de persona ${personaExistente.tipoPersona}.`,
              ),
          );
        }

        return of(personaExistente);
      }),
    );
  }

  private construirAlcances(): any[] {
    const form = this.alcancePermisoConsulta.getRawValue();

    switch (this.scope) {
      case 'NIVEL':
        return [
          {
            scope: 'NIVEL',
            accesoGlobal: false,
            nivelId: Number(form.nivelId),
          },
        ];

      case 'MODALIDAD':
        return [
          {
            scope: 'MODALIDAD',
            accesoGlobal: false,
            modalidadId: Number(form.modalidadId),
          },
        ];

      case 'SECTOR':
        return [
          {
            scope: 'SECTOR',
            accesoGlobal: false,
            sectorId: Number(form.sectorId),
          },
        ];

      case 'ZONA':
        return [
          {
            scope: 'ZONA',
            accesoGlobal: false,
            zonaId: Number(form.zonaId),
          },
        ];

      case 'ESCUELA':
        return [
          {
            scope: 'ESCUELA',
            accesoGlobal: false,
            escuelaId: Number(form.escuelaId),
          },
        ];

      case 'PERSONALIZADO':
        return this.construirAlcancesPersonalizados();

      case 'EJECUTIVO':
      case 'ADMIN':
        return [
          {
            scope: this.scope,
            accesoGlobal: true,
          },
        ];

      default:
        return [];
    }
  }

  private construirAlcancesPersonalizados(): any[] {
    const alcances: any[] = [];

    this.modalidadesSelectedByNivel.forEach((registro) => {
      registro.modalidadesSelected.forEach((modalidadId) => {
        alcances.push({
          scope: 'PERSONALIZADO',
          accesoGlobal: false,
          nivelId: registro.idNivel,
          modalidadId,
        });
      });
    });

    return alcances;
  }

  guardarUsuario(): void {
    if (this.guardandoUsuario) return;

    if (!this.auth.valid || !this.datosPersonales.valid || !this.alcancePermisoConsulta.valid) {
      this.auth.markAllAsTouched();
      this.datosPersonales.markAllAsTouched();
      this.alcancePermisoConsulta.markAllAsTouched();

      this.messageService.add({
        severity: 'warn',
        summary: 'Información incompleta',
        detail:
          'Verifique que la información sea correcta y que no falten campos obligatorios por llenar.',
        life: 3000,
      });
      return;
    }

    if (this.auth.get('password')?.value !== this.auth.get('confirmPassword')?.value) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Contraseñas',
        detail: 'Verifique que las contraseñas sean idénticas.',
        life: 3000,
      });
      return;
    }

    const alcances = this.construirAlcances();

    if (!alcances.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Alcance requerido',
        detail: 'Debe definir al menos un alcance para el usuario.',
        life: 3000,
      });
      return;
    }

    this.guardandoUsuario = true;

    this.obtenerOCrearPersona()
      .pipe(
        switchMap((persona) => {
          this.personaSeleccionada = persona;

          const payload = {
            username: this.auth.get('username')?.value?.trim(),
            password: this.auth.get('password')?.value,
            personaId: persona.id,
            tipoPersonaId: Number(this.datosPersonales.get('tipoPersonaId')?.value),
            alcances,
          };

          console.log('Payload nuevo usuario:', payload);

          return this.usuarioService.saveUsuario(payload);
        }),
        finalize(() => {
          this.guardandoUsuario = false;
          this.cd.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.usuarioGuardado = true;
          this.activeStep = 4;

          this.messageService.add({
            severity: 'success',
            summary: 'Registro exitoso',
            detail: 'Usuario registrado correctamente.',
            life: 3000,
          });

          this.resetFormularios();
          this.cd.markForCheck();
        },
        error: (err) => {
          console.error('Error registrando usuario', err);

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail:
              err?.error?.detail ??
              err?.error?.message ??
              err?.message ??
              'No fue posible registrar el usuario.',
            life: 4000,
          });

          this.cd.markForCheck();
        },
      });
  }
  private resetFormularios(): void {
    this.datosPersonales.reset({
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      sexo: '',
      curp: '',
      scope: '',
      tipoPersonaId: null,
    });

    this.alcancePermisoConsulta.reset({
      nivelId: null,
      modalidadId: null,
      sectorId: null,
      zonaId: null,
      escuelaId: null,
      nivelIds: [],
      modalidadIds: [],
    });

    this.auth.reset({
      username: '',
      password: '',
      confirmPassword: '',
    });

    this.scope = '';
    this.personaSeleccionada = null;
    this.modalidades = [];
    this.sectores = [];
    this.zonas = [];
    this.centrosTrabajo = [];
    this.modalidadesPersonalizado = [];
    this.modalidadesSelectedByNivel = [];
    this.showPass = false;
    this.showConfirm = false;

    this.datosPersonales.markAsPristine();
    this.datosPersonales.markAsUntouched();
    this.alcancePermisoConsulta.markAsPristine();
    this.alcancePermisoConsulta.markAsUntouched();
    this.auth.markAsPristine();
    this.auth.markAsUntouched();

    this.cd.markForCheck();
  }
  async getListadoModCompletas(nivelId: number): Promise<void> {
    const nivelesSeleccionados: number[] = this.alcancePermisoConsulta.get('nivelIds')?.value ?? [];

    if (!nivelesSeleccionados.includes(nivelId)) {
      this.modalidadesSelectedByNivel = this.modalidadesSelectedByNivel.filter(
        (item) => item.idNivel !== nivelId,
      );

      if (this.modalidadesPersonalizado[nivelId]) {
        this.modalidadesPersonalizado[nivelId] = { idNivel: nivelId, modalidades: [] };
      }

      this.obtenerNivelesYModalidadesUnicos();
      this.cd.markForCheck();
      return;
    }

    try {
      const resp = await this.realizarPeticionCatalogoService({ nivelId });
      this.modalidadesPersonalizado[nivelId] = {
        idNivel: nivelId,
        modalidades: resp.modalidades ?? [],
      };
      this.cd.markForCheck();
    } catch (error) {
      console.error('Error obteniendo modalidades', error);
      this.modalidadesPersonalizado[nivelId] = { idNivel: nivelId, modalidades: [] };
      this.cd.markForCheck();
    }
  }

  private getRegistroNivel(idNivel: number): modalidadesSelectedByNivel {
    let registro = this.modalidadesSelectedByNivel.find((item) => item.idNivel === idNivel);

    if (!registro) {
      registro = { idNivel, modalidadesSelected: [] };
      this.modalidadesSelectedByNivel.push(registro);
    }

    return registro;
  }

  public agregarModalidad(idNivel: number, idModalidad: number): void {
    const registro = this.getRegistroNivel(idNivel);

    if (!registro.modalidadesSelected.includes(idModalidad)) {
      registro.modalidadesSelected.push(idModalidad);
    }
  }

  public eliminarModalidad(idNivel: number, idModalidad: number): void {
    const registro = this.modalidadesSelectedByNivel.find((item) => item.idNivel === idNivel);
    if (!registro) return;

    registro.modalidadesSelected = registro.modalidadesSelected.filter(
      (modalidad) => modalidad !== idModalidad,
    );

    if (registro.modalidadesSelected.length === 0) {
      this.modalidadesSelectedByNivel = this.modalidadesSelectedByNivel.filter(
        (item) => item.idNivel !== idNivel,
      );
    }
  }

  public onChangeModalidad(idNivel: number, idModalidad: number, checked: boolean): void {
    if (checked) this.agregarModalidad(idNivel, idModalidad);
    else this.eliminarModalidad(idNivel, idModalidad);

    this.obtenerNivelesYModalidadesUnicos();
  }

  public obtenerNivelesYModalidadesUnicos(): void {
    const modalidadesUnicas = Array.from(
      new Set(this.modalidadesSelectedByNivel.flatMap((item) => item.modalidadesSelected)),
    );
    this.alcancePermisoConsulta.patchValue({ modalidadIds: modalidadesUnicas });
  }

  public estaSeleccionada(idNivel: number, idModalidad: number): boolean {
    const registro = this.modalidadesSelectedByNivel.find((item) => item.idNivel === idNivel);
    return !!registro && registro.modalidadesSelected.includes(idModalidad);
  }

  private valorNumero(valor: any): number | undefined {
    if (valor === null || valor === undefined || valor === '') return undefined;
    const numero = Number(valor);
    return Number.isNaN(numero) ? undefined : numero;
  }

  private normalizarTexto(valor: string): string {
    return (valor ?? '').trim().toUpperCase();
  }
}
