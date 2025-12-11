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
import { firstValueFrom } from 'rxjs';
import { CatalogoService } from '../../../core/services/Catalogos/catalogo.service';
import { UsuariosService } from '../../services/usuarios.service';
import { TipoUsuario } from '../../interfaces/usuarios.interface';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import {
  modalidadesNivel,
  modalidadesSelectedByNivel,
} from '../../interfaces/dataNewRegister.interface';

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
    private router: Router
  ) {}
  showPassword = false;
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
  showPass: boolean = false;
  showConfirm: boolean = false;
  usuarioGuardado: boolean = false;
  public scope: string = '';
  public modalidadesPersonalizado: modalidadesNivel[] = [];
  public modalidadesSelectedByNivel: modalidadesSelectedByNivel[] = [];
  ngOnInit() {
    this.getNiveles();
    this.getTipoPersonas();
    this.alcancePermisoConsulta = this.fb.group({
      nivelId: ['', []],
      modalidadId: ['', []],
      sectorId: ['', []],
      zonaId: ['', []],
      escuelaId: ['', []],
      nivelIds: this.fb.control([]),
      modalidadIds: this.fb.control([]),
    });
    this.datosPersonales = this.fb.group({
      nombre: ['', [Validators.required]],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: ['', Validators.required],
      curp: [
        '',
        Validators.pattern(
          /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]\d$/
        ),
      ],
      scope: ['', Validators.required],
      tipoPersonaId: ['', [Validators.required]],
    });

    this.auth = this.fb.group({
      username: ['', Validators.required],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]).{8,}$/
          ),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
    });

    this.breadCrumb.addItem({
      jerarquia: 1,
      icon: '',
      label: 'Registro de usuario',
      urlLink: '/admin/register',
      home: '',
    });
  }

  async getNiveles() {
    try {
      const resp = await this.realizarPeticionCatalogoService({});
      this.niveles = resp.niveles;
      this.cd.detectChanges(); // solo si usas OnPush y necesitas forzar CD
    } catch (err) {
      this.niveles = [];
    }
  }
  async getSectores() {
    if (this.alcancePermisoConsulta.get('nivelId')?.value == 3) {
      this.limpiarPropiedades(3);
      this.limpiarCampos(['zonaId', 'escuelaId', 'sectorId']);

      this.getZonas();
      this.sectores = [];
    } else {
      try {
        this.limpiarPropiedades(2);
        this.limpiarCampos(['sectorId', 'zonaId', 'escuelaId']);
        const resp = await this.realizarPeticionCatalogoService({
          nivelId: this.alcancePermisoConsulta.get('nivelId')?.value,
          modalidadId: this.alcancePermisoConsulta.get('modalidadId')?.value,
        });
        // Ordenar alfabéticamente por la propiedad 'sector'
        // Ordenar por ID numérico (si la propiedad existe)
        this.sectores = resp.sectores.sort((a, b) => (a.sector || 0) - (b.sector || 0));
        this.cd.detectChanges();
      } catch (error) {
        this.sectores = [];
      }
    }
  }
  async getModalidades() {
    try {
      const resp = await this.realizarPeticionCatalogoService({
        nivelId: this.alcancePermisoConsulta.get('nivelId')?.value,
      });
      this.modalidades = resp.modalidades;
      this.cd.detectChanges();
    } catch (err) {
      this.modalidades = [];
    }
  }

  async getsectorIdes() {
    if (this.alcancePermisoConsulta.get('nivelId')?.value == 3) {
      this.limpiarPropiedades(3);
      this.limpiarCampos(['zonaId', 'escuelaId', 'sectorId']);

      this.getZonas();
      this.sectores = [];
    } else {
      try {
        this.limpiarPropiedades(2);
        this.limpiarCampos(['sectorId', 'zonaId', 'escuelaId']);
        const resp = await this.realizarPeticionCatalogoService({
          nivelId: this.alcancePermisoConsulta.get('nivelId')?.value,
          modalidadId: this.alcancePermisoConsulta.get('modalidadId')?.value,
        });
        // Ordenar alfabéticamente por la propiedad 'sector'
        // Ordenar por ID numérico (si la propiedad existe)
        this.sectores = resp.sectores.sort((a, b) => (a.sector || 0) - (b.sector || 0));
        this.cd.detectChanges();
      } catch (error) {
        this.sectores = [];
      }
    }
  }

  async getZonas() {
    try {
      this.limpiarPropiedades(4);
      const resp = await this.realizarPeticionCatalogoService({
        nivelId: this.alcancePermisoConsulta.get('nivelId')?.value,
        modalidadId: this.alcancePermisoConsulta.get('modalidadId')?.value,
        sector: this.alcancePermisoConsulta.get('sectorId')?.value,
      });
      this.zonas = resp.zonas.sort((a, b) => (a.zonaEscolar || 0) - (b.zonaEscolar || 0));
      this.cd.detectChanges();
    } catch (error) {
      this.zonas = [];
    }
  }

  async getCentrosTrabajo() {
    try {
      const resp = await this.realizarPeticionCatalogoService({
        nivelId: this.alcancePermisoConsulta.get('nivelId')?.value,
        modalidadId: this.alcancePermisoConsulta.get('modalidadId')?.value,
        sector: this.alcancePermisoConsulta.get('sectorId')?.value,
        zonaEscolar: this.alcancePermisoConsulta.get('zonaId')?.value,
      });
      this.centrosTrabajo = resp.centrosTrabajo;
      this.cd.detectChanges();
    } catch (error) {
      this.centrosTrabajo = [];
    }
  }

  limpiarCampos(campos: string[]) {
    const patch: any = {};
    campos.forEach((campo) => {
      patch[campo] = '';
    });
    this.alcancePermisoConsulta.patchValue(patch);
    this.cd.detectChanges();
  }

  limpiarPropiedades(nivelLimpieza: number) {
    switch (nivelLimpieza) {
      case 1:
        this.modalidades = [];
        this.sectores = [];
        this.zonas = [];
        this.centrosTrabajo = [];
        this.cd.detectChanges();
        break;
      case 2:
        this.sectores = [];
        this.zonas = [];
        this.centrosTrabajo = [];
        this.cd.detectChanges();
        break;
      case 3:
        this.zonas = [];
        this.centrosTrabajo = [];
        this.cd.detectChanges();
        break;
      case 4:
        this.centrosTrabajo = [];
        this.cd.detectChanges();
        break;

      default:
        break;
    }
  }
  async realizarPeticionCatalogoService(params: catalogo): Promise<responseCatalogo> {
    try {
      const resp = await firstValueFrom(this.cataloService.getCatalogo(params));
      return resp;
    } catch (error) {
      throw error; // o devuelve un objeto vacío si prefieres
    }
  }

  getTipoPersonas() {
    this.usuarioService.getListadoTipoUsuarios().subscribe({
      next: (resp) => {
        this.listadoTipoPersonas = resp;
        this.cd.detectChanges();
      },
    });
  }
  onSelectTipoPersona() {
    const tipoPersonaId = this.datosPersonales.get('tipoPersonaId')?.value;

    const tipoPersona = this.listadoTipoPersonas.find((tp) => tp.id === tipoPersonaId);

    const scope = tipoPersona?.scope || null;

    this.datosPersonales.patchValue({ scope });
    this.scope = scope!;

    if (scope) {
      this.addOrRemoveValidations(scope);
    }
  }

  addOrRemoveValidations(scope: string) {
    const rules: Record<string, string[]> = {
      ESCUELA: ['escuelaId', 'zonaId', 'modalidadId', 'nivelId'],
      ZONA: ['zonaId', 'modalidadId', 'nivelId'],
      SECTOR: ['sectorId', 'modalidadId', 'nivelId'],
      MODALIDAD: ['modalidadId', 'nivelId'],
      NIVEL: ['nivelId'],
      EJECUTIVO: [],
      PERSONALIZADO: ['nivelIds', 'modalidadesIds'],
    };

    const fields = rules[scope] || [];

    fields.forEach((field) => {
      this.alcancePermisoConsulta.get(field)?.addValidators(Validators.required);
      this.alcancePermisoConsulta.get(field)?.updateValueAndValidity();
    });
  }

  clearValuesByScope(scope: string) {
    const clearRules: Record<string, string[]> = {
      ZONA: ['escuelaId'],
      SECTOR: ['escuelaId', 'zonaId'],
      MODALIDAD: ['escuelaId', 'zonaId', 'sectorId'],
      NIVEL: ['escuelaId', 'zonaId', 'modalidadId', 'sectorId'],
      EJECUTIVO: ['escuelaId', 'zonaId', 'modalidadId', 'nivelId', 'sectorId'],
      PERSONALIZADO: ['escuelaId', 'zonaId', 'modalidadId', 'nivelId', 'sectorId'],
    };

    const fieldsToClear = clearRules[scope] || [];

    fieldsToClear.forEach((field) => {
      const control = this.alcancePermisoConsulta.get(field);
      if (control) {
        control.setValue(null);
        control.updateValueAndValidity();
      }
    });
  }

  isInvalid(formGroup: FormGroup, controlName: string): boolean {
    const control = formGroup.get(controlName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  guardarUsuario() {
    // this.usuarioGuardado=true
    // this.activeStep=4
    if (this.auth.valid && this.datosPersonales.valid && this.alcancePermisoConsulta.valid) {
      let scope = this.datosPersonales.get('scope')?.value;
      this.clearValuesByScope(scope);

      // validamos que el scope sea personalizado y haya al menos una modalidad seleccionada
      if (
        scope == 'PERSONALIZADO' &&
        this.alcancePermisoConsulta.get('modalidadIds')?.value.length == 0
      ) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Nota',
          detail:
            'Para el tipo de usuario PERSONALIZADO debe de seleccionar al menos una modalidad',
          life: 3000,
        });
        return;
      }

      if (this.auth.get('password')?.value != this.auth.get('confirmPassword')?.value) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Nota',
          detail: 'Verifique que las contraseñas sean identicas',
          life: 3000,
        });
      } else {
        let dataCompleta = {
          ...this.auth.value,
          ...this.datosPersonales.value,
          ...this.alcancePermisoConsulta.value,
        };
        dataCompleta.nivelId = [dataCompleta.nivelId];
        dataCompleta.modalidadId = [dataCompleta.modalidadId];
        dataCompleta.modalidadIds =
          dataCompleta.modalidadIds.length > 0
            ? dataCompleta.modalidadIds
            : dataCompleta.modalidadId;
        dataCompleta.nivelIds =
          dataCompleta.nivelIds.length > 0 ? dataCompleta.nivelIds : dataCompleta.nivelId;
        delete dataCompleta.confirmPassword;

        this.usuarioService.saveUsuario(dataCompleta).subscribe({
          next: (resp) => {
            this.usuarioGuardado = true;
            this.activeStep = 4;
            this.messageService.add({
              severity: 'success',
              summary: 'Registro exitoso',
              detail: 'Usuario registrado correctamente',
              life: 3000,
            });
            setTimeout(() => {
              this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                this.router.navigate(['/admin/register']);
              });
            }, 1500);
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error.detail,
              life: 3000,
            });
          },
        });
      }
    } else {
      this.auth.markAllAsTouched();
      this.datosPersonales.markAllAsTouched();
      this.alcancePermisoConsulta.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Nota',
        detail:
          'Verifique que la información sea correcta y que no falten campos obligatorios por llenar. ',
        life: 3000,
      });
    }
  }
  limpiarValidacionesAlcance() {
    Object.keys(this.alcancePermisoConsulta.controls).forEach((key) => {
      const control = this.alcancePermisoConsulta.get(key);
      control?.clearValidators();
      control?.updateValueAndValidity();
    });
  }

  async getListadoModCompletas(nivelId: number) {
    try {
      const resp = await this.realizarPeticionCatalogoService({
        nivelId,
      });
      this.modalidadesPersonalizado[nivelId] = { idNivel: nivelId, modalidades: resp.modalidades };
      this.cd.detectChanges();
    } catch (err) {
      console.error(err);
      this.modalidadesPersonalizado = [];
    }
  }

  private getRegistroNivel(idNivel: number): modalidadesSelectedByNivel {
    let registro = this.modalidadesSelectedByNivel.find((x) => x.idNivel === idNivel);

    if (!registro) {
      registro = { idNivel, modalidadesSelected: [] };
      this.modalidadesSelectedByNivel.push(registro);
    }

    return registro;
  }
  public agregarModalidad(idNivel: number, idModalidad: number) {
    const registro = this.getRegistroNivel(idNivel);

    if (!registro.modalidadesSelected.includes(idModalidad)) {
      registro.modalidadesSelected.push(idModalidad);
    }
  }

  public eliminarModalidad(idNivel: number, idModalidad: number) {
    const registro = this.modalidadesSelectedByNivel.find((x) => x.idNivel === idNivel);
    if (!registro) return;

    registro.modalidadesSelected = registro.modalidadesSelected.filter((m) => m !== idModalidad);

    // Si el nivel ya no tiene modalidades, eliminar el registro completo
    if (registro.modalidadesSelected.length === 0) {
      this.modalidadesSelectedByNivel = this.modalidadesSelectedByNivel.filter(
        (x) => x.idNivel !== idNivel
      );
    }
  }
  public onChangeModalidad(idNivel: number, idModalidad: number, checked: boolean) {
    if (checked) {
      this.agregarModalidad(idNivel, idModalidad);
    } else {
      this.eliminarModalidad(idNivel, idModalidad);
    }

    this.obtenerNivelesYModalidadesUnicos(); // si la quieres seguir llamando aquí
  }
  public obtenerNivelesYModalidadesUnicos() {
    // 1. Niveles únicos
    const nivelesUnicos = Array.from(
      new Set(this.modalidadesSelectedByNivel.map((x) => x.idNivel))
    );
    // 2. Modalidades únicas de todos los niveles
    const modalidadesUnicas = Array.from(
      new Set(this.modalidadesSelectedByNivel.flatMap((x) => x.modalidadesSelected))
    );
    this.alcancePermisoConsulta.patchValue({ modalidadIds: modalidadesUnicas });
  }
  public estaSeleccionada(idNivel: number, idModalidad: number): boolean {
    const registro = this.modalidadesSelectedByNivel.find((r) => r.idNivel === idNivel);
    return !!registro && registro.modalidadesSelected.includes(idModalidad);
  }
}
