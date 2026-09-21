import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CatalogoService } from '../../../core/services/Catalogos/catalogo.service';
import {
  catalogo,
  CentrosTrabajo,
  Nivele,
  responseCatalogo,
  Sectores,
  singleModalidad,
  Zona,
} from '../../../core/Interfaces/catalogo.interface';
import { distinctUntilChanged, firstValueFrom } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BreadCrumService } from '../../../core/services/breadCrumbs/bread-crumb-service';
import { modalidad } from '../../../core/Interfaces/Modalidad.interface';
import { CryptoJsService } from '../../../core/services/CriptoJs/cryptojs.service';
import { MessageService } from 'primeng/api';
import { paramsFilters } from '../../../core/Interfaces/paramsFilters.interface';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-filtro-page',
  standalone: false,
  templateUrl: './filtro-page.html',
  styleUrl: './filtro-page.scss',
})
export class FiltroPage {
  constructor(
    private cataloService: CatalogoService,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private router: Router,
    private crypto: CryptoJsService,
    private messageService: MessageService,
    private authService: AuthService,
  ) {}
  public niveles: Nivele[] = [];
  public modalidades: singleModalidad[] = [];
  public sectores: Sectores[] = [];
  public zonas: Zona[] = [];
  public centrosTrabajo: CentrosTrabajo[] = [];
  public datosAlumno: any;
  public nivelSelected: string = '';
  public filtros: FormGroup = {} as FormGroup;
  public nivelFiltroSeleccionado: number = 0;
  private breadCrumb = inject(BreadCrumService);
  params: paramsFilters = {} as paramsFilters;

  async ngOnInit(): Promise<void> {
    this.filtros = this.fb.group({
      nivelSelected: [''],
      modalidad: [''],
      sector: [''],
      zona: [''],
      cct: [''],
      curpAlumno: [''],
    });

    this.breadCrumb.addItem({
      jerarquia: 1,
      icon: '',
      label: 'filtros',
      urlLink: '/Auth/main-filter',
      home: '',
    });

    const usuario = await firstValueFrom(this.authService.ensureUsuario());

    if (!usuario) {
      return;
    }

    this.params = this.authService.getObjectParams();

    await this.inicializarFiltros();
  }

  async realizarPeticionCatalogoService(params: catalogo): Promise<responseCatalogo> {
    try {
      const resp = await firstValueFrom(this.cataloService.getCatalogo(params));
      return resp;
    } catch (error) {
      throw error; // o devuelve un objeto vacío si prefieres
    }
  }

  async getNiveles(): Promise<void> {
    try {
      const resp = await this.realizarPeticionCatalogoService({});

      const niveles = resp.niveles ?? [];

      this.niveles = niveles.filter((nivel) =>
        this.esPermitidoPorAlcance({
          nivelId: nivel.id,
        }),
      );

      this.cd.markForCheck();
    } catch (error) {
      this.niveles = [];

      this.cd.markForCheck();
    }
  }
  async getModalidades(): Promise<void> {
    this.limpiarPropiedades(1);

    this.limpiarCampos(['modalidad', 'sector', 'zona', 'cct']);

    const nivelId = this.valorNumero('nivelSelected');

    if (!nivelId) {
      return;
    }

    try {
      const resp = await this.realizarPeticionCatalogoService({
        nivelId,
      });

      const modalidades = resp.modalidades ?? [];

      this.modalidades = modalidades.filter((modalidad) =>
        this.esPermitidoPorAlcance({
          nivelId,
          modalidadId: modalidad.id,
        }),
      );

      if (this.modalidades.length === 1) {
        this.filtros.patchValue({
          modalidad: this.modalidades[0].id,
        });

        await this.getSectores();
      }

      this.cd.markForCheck();
    } catch (error) {
      this.modalidades = [];

      this.cd.markForCheck();
    }
  }

  async getSectores(): Promise<void> {
    this.limpiarPropiedades(2);

    this.limpiarCampos(['sector', 'zona', 'cct']);

    const nivelId = this.valorNumero('nivelSelected');

    const modalidadId = this.valorNumero('modalidad');

    if (!nivelId || !modalidadId) {
      return;
    }

    try {
      const resp = await this.realizarPeticionCatalogoService({
        nivelId,
        modalidadId,
      });

      const sectores = resp.sectores ?? [];

      this.sectores = sectores
        .filter((sector) =>
          this.esPermitidoPorAlcance({
            nivelId,
            modalidadId,
            sectorId: sector.numero,
          }),
        )
        .sort((a, b) => (a.numero || 0) - (b.numero || 0));

      if (this.sectores.length === 1) {
        this.filtros.patchValue({
          sector: this.sectores[0].numero,
        });

        await this.getZonas();
      }

      this.cd.markForCheck();
    } catch (error) {
      this.sectores = [];

      this.cd.markForCheck();
    }
  }

  async getZonas(): Promise<void> {
    this.limpiarPropiedades(3);

    this.limpiarCampos(['zona', 'cct']);

    const nivelId = this.valorNumero('nivelSelected');

    const modalidadId = this.valorNumero('modalidad');

    const sectorId = this.valorNumero('sector');

    if (nivelId === undefined || modalidadId === undefined || sectorId === undefined) {
      return;
    }

    try {
      const resp = await this.realizarPeticionCatalogoService({
        nivelId,
        modalidadId,
        sector: sectorId,
      });

      const zonas = resp.zonas ?? [];



      this.zonas = zonas
        .filter((zona) =>
          this.esPermitidoPorAlcance({
            nivelId,
            modalidadId,
            sectorId,
            zonaId: zona.id,
          }),
        )
        .sort((a, b) => (a.numero || 0) - (b.numero || 0));


      if (this.zonas.length === 1) {
        this.filtros.patchValue({
          zona: this.zonas[0].id,
        });

        await this.getCentrosTrabajo();
      }

      this.cd.markForCheck();
    } catch (error) {

      this.zonas = [];

      this.cd.markForCheck();
    }
  }
  async getCentrosTrabajo(): Promise<void> {
    this.centrosTrabajo = [];

    this.filtros.patchValue({
      cct: '',
    });

    const nivelId = this.valorNumero('nivelSelected');

    const modalidadId = this.valorNumero('modalidad');

    const sectorId = this.valorNumero('sector');

    const zonaId = this.valorNumero('zona');

    if (
      nivelId === undefined ||
      modalidadId === undefined ||
      sectorId === undefined ||
      zonaId === undefined
    ) {
      return;
    }

    const zonaSeleccionada = this.zonas.find((zona) => zona.id === zonaId);

    if (!zonaSeleccionada) {

      return;
    }

    try {
      const resp = await this.realizarPeticionCatalogoService({
        nivelId,
        modalidadId,
        sector: sectorId,
        zonaEscolar: zonaSeleccionada.numero,
      });

      const centros = resp.centrosTrabajo ?? [];

      this.centrosTrabajo = centros.filter(
        (centro) =>
          centro.nivelId === nivelId &&
          centro.modalidadId === modalidadId &&
          centro.sector === sectorId &&
          centro.zonaEscolar === zonaSeleccionada.numero,
      );

      if (this.centrosTrabajo.length === 1) {
        this.filtros.patchValue({
          cct: this.centrosTrabajo[0].id,
        });
      }

      this.cd.markForCheck();
    } catch (error) {

      this.centrosTrabajo = [];

      this.cd.markForCheck();
    }
  }
  limpiarCampos(campos: string[]) {
    const patch: any = {};
    campos.forEach((campo) => {
      patch[campo] = '';
    });
    this.filtros.patchValue(patch);
    this.cd.markForCheck();
  }

  limpiarPropiedades(nivelLimpieza: number) {
    switch (nivelLimpieza) {
      case 1:
        this.modalidades = [];
        this.sectores = [];
        this.zonas = [];
        this.centrosTrabajo = [];
        this.cd.markForCheck();
        break;
      case 2:
        this.sectores = [];
        this.zonas = [];
        this.centrosTrabajo = [];
        this.cd.markForCheck();
        break;
      case 3:
        this.zonas = [];
        this.centrosTrabajo = [];
        this.cd.markForCheck();
        break;
      case 4:
        this.centrosTrabajo = [];
        this.cd.markForCheck();
        break;

      default:
        break;
    }
  }

  async generarUrl(): Promise<void> {
    const sector = this.filtros.get('sector')?.value ?? '';

    const zonaId = this.filtros.get('zona')?.value ?? '';

    const zonaSeleccionada = this.zonas.find((zona) => zona.id == zonaId);

    const zona = zonaSeleccionada?.numero ?? '';

    const modalidad = this.filtros.get('modalidad')?.value ?? '';

    const nivel = this.filtros.get('nivelSelected')?.value ?? '';

    const nivelBase64 = btoa(String(nivel));

    const modalidadBase64 = btoa(String(modalidad));

    const sectorBase64 = btoa(String(sector));

    const zonaBase64 = btoa(String(zona));

    const rutaSector = `/ss/resultados-sector/${nivelBase64}/${sectorBase64}/${modalidadBase64}`;

    const rutaZona = `/sz/resultados-zona/${nivelBase64}/${zonaBase64}/${modalidadBase64}`;

    if (this.filtros.get('cct')?.value) {
      const cctId = this.filtros.get('cct')?.value;

      const cctSelected = this.centrosTrabajo.find((cct) => cct.id == cctId);

      if (!cctSelected) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Centro de trabajo',
          detail: 'No se encontró el centro de trabajo seleccionado.',
        });

        return;
      }

      const cctCript = this.crypto.Encriptar(cctSelected.cct);

      const navego = await this.router.navigate(['/prim_3/resultados-ct', cctCript]);

      if (!navego) {
        return;
      }

      this.addBread(1, 'filtros', '/Auth/main-filter', '');

      if (String(nivel) !== '3') {
        this.addBread(2, 'sector ' + sector, rutaSector, '');
      }

      this.addBread(3, 'zona ' + zona, rutaZona, '');

      this.addBread(4, 'Resultados ' + cctSelected.cct, `/prim_3/resultados-ct/${cctCript}`, '');

      return;
    }

    if (zona) {
      const navego = await this.router.navigate([
        '/sz/resultados-zona',
        nivelBase64,
        zonaBase64,
        modalidadBase64,
      ]);

      if (!navego) {
        return;
      }

      this.addBread(3, 'zona ' + zona, rutaZona, '');

      return;
    }

    if (sector) {
      const navego = await this.router.navigate([
        '/ss/resultados-sector',
        nivelBase64,
        sectorBase64,
        modalidadBase64,
      ]);

      if (!navego) {
        return;
      }

      this.addBread(2, 'sector ' + sector, rutaSector, '');

      return;
    }

    if (modalidad) {
      const modalidadSelected = this.modalidades.find((item) => item.id == modalidad);

      if (!modalidadSelected) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Modalidad',
          detail: 'No se encontró la modalidad seleccionada.',
        });

        return;
      }

      const modalidadCripto = this.crypto.toBase64Url(
        this.crypto.Encriptar(modalidadSelected.descripcion),
      );

      await this.router.navigate([
        '/m/resumen-modalidad',
        nivelBase64,
        modalidadBase64,
        modalidadCripto,
      ]);

      return;
    }

    this.messageService.add({
      severity: 'secondary',
      summary: 'Filtro de la información',
      detail: 'Debe seleccionar un nivel y una modalidad al menos',
    });
  }
  addBread(jerarquia: number, label: string, urlLink: string, icon: string) {
    this.breadCrumb.addItem({ jerarquia, label, urlLink, icon, home: '' });
  }

  // setValues() {

  //   const { nivelId, modalidadId, sectorId, zonaId, escuelaId, nivelIds, modalidadIds } =
  //     this.params || {};

  //   // Si no hay nivel, no hacemos nada
  //   if (nivelId == null) {
  //     return;
  //   }

  //   // 1) Nivel
  //   this.niveles = this.niveles.filter((n) => nivelIds.includes(n.id));
  //   // this.filtros.patchValue({ nivelSelected: nivelIds[0] });
  //   this.getModalidades();

  //   // Esperamos a que se carguen las modalidades
  //   setTimeout(() => {
  //     // 2) Modalidad
  //     if (modalidadId == null) {
  //       return;
  //     }

  //     this.modalidades = this.modalidades.filter((m) => modalidadIds.includes(m.id));
  //     this.cd.markForCheck();
  //     this.filtros.patchValue({ modalidad: modalidadIds[0] });
  //     this.getSectores();

  //     // Esperamos a que se carguen los sectores
  //     setTimeout(() => {
  //       // 3) Sector (opcional)
  //       if (sectorId != null) {
  //         this.sectores = this.sectores.filter((s) => s.numero === sectorId);
  //         this.cd.markForCheck();
  //         this.filtros.patchValue({ sector: sectorId });
  //       }

  //       // En cualquier caso, cargamos zonas
  //       this.getZonas();

  //       // Esperamos a que se carguen las zonas y luego aplicamos zona/escuela
  //       setTimeout(() => {
  //         this.aplicarZonaYEscuela(zonaId, escuelaId);
  //       }, 200);
  //     }, 200);
  //   }, 200);
  // }

  // private aplicarZonaYEscuela(zonaId?: number, escuelaId?: number) {
  //   // 4) Zona (opcional)
  //   if (zonaId == null) {
  //     return;
  //   }

  //   this.zonas = this.zonas.filter((z) => z.numero === zonaId);
  //   this.filtros.patchValue({ zona: zonaId });
  //   this.getCentrosTrabajo();

  //   // Esperamos a que se carguen los CT
  //   setTimeout(() => {
  //     // 5) Escuela / CCT (opcional)
  //     if (escuelaId == null) {
  //       return;
  //     }

  //     this.centrosTrabajo = this.centrosTrabajo.filter((ct) => ct.id === escuelaId);
  //     this.filtros.patchValue({ cct: escuelaId });
  //   }, 200);
  // }

  private esAccesoSinRestriccion(): boolean {
    const scope = this.authService.getScope();

    return this.authService.tieneAccesoGlobal() || ['ADMIN', 'EJECUTIVO'].includes(scope);
  }

  private valorNumero(control: string): number | undefined {
    const value = this.filtros.get(control)?.value;

    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    const numero = Number(value);

    return Number.isNaN(numero) ? undefined : numero;
  }

  private esPermitidoPorAlcance(valores: {
    nivelId?: number;
    modalidadId?: number;
    sectorId?: number;
    zonaId?: number;
    escuelaId?: number;
  }): boolean {
    if (this.esAccesoSinRestriccion()) {
      return true;
    }

    const alcances = this.authService.getAlcances();

    if (!alcances.length) {
      return false;
    }

    return alcances.some((alcance) => {
      if (alcance.accesoGlobal) {
        return true;
      }

      const nivelValido =
        valores.nivelId == null || alcance.nivelId == null || alcance.nivelId === valores.nivelId;

      const modalidadValida =
        valores.modalidadId == null ||
        alcance.modalidadId == null ||
        alcance.modalidadId === valores.modalidadId;

      const sectorValido =
        valores.sectorId == null ||
        alcance.sectorId == null ||
        alcance.sectorId === valores.sectorId;

      const zonaValida =
        valores.zonaId == null || alcance.zonaId == null || alcance.zonaId === valores.zonaId;

      const escuelaValida =
        valores.escuelaId == null ||
        alcance.escuelaId == null ||
        alcance.escuelaId === valores.escuelaId;

      return nivelValido && modalidadValida && sectorValido && zonaValida && escuelaValida;
    });
  }
  private async inicializarFiltros(): Promise<void> {
    await this.getNiveles();

    if (this.niveles.length === 1) {
      this.filtros.patchValue({
        nivelSelected: this.niveles[0].id,
      });

      await this.getModalidades();
    }

    this.cd.markForCheck();
  }
}
