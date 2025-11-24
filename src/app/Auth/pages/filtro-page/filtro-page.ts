import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CatalogoService } from '../../../core/services/Catalogos/catalogo.service';
import { catalogo, CentrosTrabajo, Nivele, responseCatalogo, Sectores, singleModalidad, Zona } from '../../../core/Interfaces/catalogo.interface';
import { distinctUntilChanged, firstValueFrom } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BreadCrumService } from '../../../core/services/breadCrumbs/bread-crumb-service';
import { modalidad } from '../../../core/Interfaces/Modalidad.interface';
import { CryptoJsService } from '../../../core/services/CriptoJs/cryptojs.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-filtro-page',
  standalone: false,
  templateUrl: './filtro-page.html',
  styleUrl: './filtro-page.scss'
})
export class FiltroPage {
  constructor(private cataloService: CatalogoService, private cd: ChangeDetectorRef, private fb: FormBuilder, private router: Router, private crypto:CryptoJsService, private messageService: MessageService) { }
  public niveles: Nivele[] = [];
  public modalidades: singleModalidad[] = []
  public sectores: Sectores[] = [];
  public zonas: Zona[] = [];
  public centrosTrabajo: CentrosTrabajo[] = [];
  public datosAlumno: any;
  public nivelSelected: string = '';
  public filtros: FormGroup = {} as FormGroup;
  public nivelFiltroSeleccionado: number = 0
  private breadCrumb = inject(BreadCrumService)

  ngOnInit() {
    this.getNiveles();
    this.filtros = this.fb.group({
      nivelSelected: ['', []],
      modalidad: ['', []],
      sector: ['', []],
      zona: ['', []],
      cct: ['', []],
      curpAlumno: ['', []]
    });
    this.breadCrumb.addItem({
      jerarquia: 1,
      icon: '',
      label: 'filtros',
      urlLink: '/Auth/main-filter',
      home: ''
    })

  }

  async realizarPeticionCatalogoService(params: catalogo): Promise<responseCatalogo> {
    try {
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
  async getModalidades() {
    try {
      const resp = await this.realizarPeticionCatalogoService({ nivelId: this.filtros.get('nivelSelected')?.value })
      this.modalidades = resp.modalidades
      this.cd.detectChanges()
    } catch (err) {
      this.modalidades = []
    }
  }

  async getSectores() {
    if (this.filtros.get('nivelSelected')?.value == 3) {
      this.limpiarPropiedades(3)
      this.limpiarCampos(['zona', 'cct', 'sector'])

      this.getZonas();
      this.sectores = [];
    } else {
      try {
        this.limpiarPropiedades(2)
        this.limpiarCampos(['sector', 'zona', 'cct'])
        const resp = await this.realizarPeticionCatalogoService({ nivelId: this.filtros.get('nivelSelected')?.value, modalidadId: this.filtros.get('modalidad')?.value });
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
      this.limpiarPropiedades(4)
      const resp = await this.realizarPeticionCatalogoService({
        nivelId: this.filtros.get('nivelSelected')?.value,
        modalidadId: this.filtros.get('modalidad')?.value,
        sector: this.filtros.get('sector')?.value
      });
      this.zonas = resp.zonas.sort((a, b) =>
        (a.zonaEscolar || 0) - (b.zonaEscolar || 0)
      );
      this.cd.detectChanges();
    } catch (error) {
      this.zonas = [];
    }
  }

  async getCentrosTrabajo() {
    try {
      const resp = await this.realizarPeticionCatalogoService({
        nivelId: this.filtros.get('nivelSelected')?.value,
        modalidadId: this.filtros.get('modalidad')?.value,
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
    switch (nivelLimpieza) {
      case 1:
        this.modalidades = []
        this.sectores = []
        this.zonas = []
        this.centrosTrabajo = []
        this.cd.detectChanges()
        break;
      case 2:
        this.sectores = []
        this.zonas = []
        this.centrosTrabajo = []
        this.cd.detectChanges()
        break;
      case 3:
        this.zonas = []
        this.centrosTrabajo = []
        this.cd.detectChanges()
        break;
      case 4:
        this.centrosTrabajo = []
        this.cd.detectChanges()
        break;

      default:
        break;
    }

  }

  generarUrl() {
    let url = ''
    let sector = this.filtros.get('sector')?.value ?? ''
    let zona = this.filtros.get('zona')?.value ?? ''
    let modalidad = this.filtros.get('modalidad')?.value ?? ''
    let nivel = this.filtros.get('nivelSelected')?.value ?? ''
    let rutaSector = '/ss/resultados-sector/' + nivel + '/' + sector+'/'+modalidad
    let rutaZona = '/sz/resultados-zona/' + nivel + '/' + zona
    if (this.filtros.get('cct')?.value) {
      let cctSelected: CentrosTrabajo = this.centrosTrabajo.filter(cct => cct.id == this.filtros.get('cct')?.value)[0]
      url = '/prim_3/resultados-ct/'
      this.router.navigate([url, cctSelected.cct]);
      this.addBread(1, 'filtros', '/Auth/main-filter', '')
      if (nivel != '3') {
        this.addBread(2, 'sector ' + sector, rutaSector, '')
      }
      this.addBread(3, 'zona ' + zona, rutaZona, '')
      this.addBread(4, 'Resultados ' + cctSelected.cct, '/prim_3/resultados-ct/' + cctSelected.cct, '')
      // this.addBread(3,cctSelected.cct,'/prim_3/resultados-ct/'+cctSelected.cct, '')


    }
    else if (this.filtros.get('zona')?.value) {
      this.addBread(3, 'zona ' + zona, rutaZona, '')
      this.router.navigate(['/sz/resultados-zona', nivel, zona, modalidad])
    }
    else if (this.filtros.get('sector')?.value) {
      this.addBread(2, 'sector ' + sector, rutaSector, '')
      url = '/ss/resultados-sector'
      this.router.navigate([url, nivel, sector,modalidad ])
    }
    else if (this.filtros.get('modalidad')?.value){
      url = '/m/resultadosModalidad'
      let modalidadSelected=this.modalidades.filter(mod => mod.id == modalidad)
      let modalidadCripto = this.crypto.toBase64Url(this.crypto.Encriptar(modalidadSelected[0].descripcion))
      this.router.navigate([url, nivel, modalidad, modalidadCripto ])
    }else{
      this.messageService.add({ severity: 'secondary', summary: 'Filtro de la informacion', detail: 'Debe de seleccionar un nivel y una modalidad al menos' });
    }
  }
  addBread(jerarquia: number, label: string, urlLink: string, icon: string) {
    this.breadCrumb.addItem({ jerarquia, label, urlLink, icon, home: '' })
  }


}
