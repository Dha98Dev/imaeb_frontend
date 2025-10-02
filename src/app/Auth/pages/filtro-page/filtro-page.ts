import { ChangeDetectorRef, Component } from '@angular/core';
import { CatalogoService } from '../../../core/services/Catalogos/catalogo.service';
import { catalogo, CentrosTrabajo, Nivele, responseCatalogo, Sectores, Zona } from '../../../core/Interfaces/catalogo.interface';
import { distinctUntilChanged, firstValueFrom } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-filtro-page',
  standalone: false,
  templateUrl: './filtro-page.html',
  styleUrl: './filtro-page.scss'
})
export class FiltroPage {
  constructor(private cataloService: CatalogoService, private cd: ChangeDetectorRef, private fb: FormBuilder, private router: Router) { }
  public niveles: Nivele[] = [];
  public sectores: Sectores[] = [];
  public zonas: Zona[] = [];
  public centrosTrabajo: CentrosTrabajo[] = [];
  public datosAlumno: any;
  public nivelSelected: string = '';
  public filtros: FormGroup = {} as FormGroup;
  public nivelFiltroSeleccionado: number = 0

  ngOnInit() {
    this.getNiveles();
    this.filtros = this.fb.group({
      nivelSelected: ['', []],
      sector: ['', []],
      zona: ['', []],
      cct: ['', []],
      curpAlumno: ['', []]
    });
  }

  async realizarPeticionCatalogoService(params: catalogo): Promise<responseCatalogo> {
    try {
      console.log(params)
      const resp = await firstValueFrom(
        this.cataloService.getCatalogo(params)
      );
      return resp;
    } catch (error) {
      throw error; // o devuelve un objeto vacío si prefieres
    }
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
    if (this.filtros.get('nivelSelected')?.value == 3) {
      console.log("limpiando sectores seleccionado nivel secundaria")
      this.limpiarPropiedades(2)
      this.limpiarCampos(['zona', 'cct', 'sector'])

      this.getZonas();
      this.sectores = [];
    } else {
      try {
        console.log("limpiando zonas seleccionado sector")
        this.limpiarPropiedades(1)
        this.limpiarCampos(['sector', 'zona', 'cct'])

        const resp = await this.realizarPeticionCatalogoService({
          nivelId: this.filtros.get('nivelSelected')?.value
        });
        // Ordenar alfabéticamente por la propiedad 'sector'
        // Ordenar por ID numérico (si la propiedad existe)
        this.sectores = resp.sectores.sort((a, b) =>
          (a.sector || 0) - (b.sector || 0)
        );
        this.cd.detectChanges();
      } catch (error) {
        this.sectores = [];
      }
    }
  }

  async getZonas() {
    try {
      console.log("limpiando centros de trabajo seleccionado zona")
      this.limpiarPropiedades(3)
      const resp = await this.realizarPeticionCatalogoService({
        nivelId: this.filtros.get('nivelSelected')?.value,
        sector: this.filtros.get('sector')?.value
      });
      console.log(resp)
      this.zonas = resp.zonas.sort((a, b) =>
        (a.zonaEscolar || 0) - (b.zonaEscolar || 0)
      );
      this.cd.detectChanges();
    } catch (error) {
      this.zonas = [];
    }
  }

  async getCentrosTrabajo() {
    console.log("")
    try {
      const resp = await this.realizarPeticionCatalogoService({
        nivelId: this.filtros.get('nivelSelected')?.value,
        sector: this.filtros.get('sector')?.value,
        zonaEscolar: this.filtros.get('zona')?.value
      });
      this.centrosTrabajo = resp.centrosTrabajo;
      this.cd.detectChanges();
    } catch (error) {
      this.centrosTrabajo = [];
    }
  }

  limpiarCampos(campos: string[]) {
    const patch: any = {};
    campos.forEach(campo => {
      patch[campo] = '';
    });
    this.filtros.patchValue(patch);
    this.cd.detectChanges()
  }

  limpiarPropiedades(nivelLimpieza: number) {
    console.log(nivelLimpieza)
    switch (nivelLimpieza) {
      case 1:
        this.sectores = []
        this.zonas = []
        this.centrosTrabajo = []
        this.cd.detectChanges()
        break;
      case 2:
        this.zonas =[]
        this.centrosTrabajo = []
        this.cd.detectChanges()
        break;
      case 3:
        this.centrosTrabajo = []
        this.cd.detectChanges()
        break;

      default:
        break;
    }

  }

  generarUrl() {
    let url = ''
    if (this.filtros.get('cct')?.value) {
      let cctSelected: CentrosTrabajo = this.centrosTrabajo.filter(cct => cct.id == this.filtros.get('cct')?.value)[0]
      url = '/prim_3/resultados-ct/'
      this.router.navigate([url, cctSelected.cct]);
    }
    else if (this.filtros.get('zona')?.value) {
      this.router.navigate(['/sz/resultados-zona', this.filtros.get('nivelSelected')?.value, this.filtros.get('zona')?.value])
    }
    else if (this.filtros.get('sector')?.value) {
      url = '/ss/resultados-sector'
      this.router.navigate([url, this.filtros.get('nivelSelected')?.value, this.filtros.get('sector')?.value])
    }
  }


}
