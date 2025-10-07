import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GetEstadisticaService } from '../../../core/services/EstadisticaPromedios/getEstadistica.service';
import { GetBackgroundService } from '../../../core/services/getColors/getBackground.service';
import { GetCctInfoSErvice } from '../../../core/services/Cct/GetCctInfo.service';
import { CatalogoService } from '../../../core/services/Catalogos/catalogo.service';
import { itemPorcentajeAreaEvaluadaInterface } from '../../../core/components/item-porcentaje-area-evaluada/item-porcentaje-area-evaluada.component';
import { catalogo, CentrosTrabajo, Sectores, Zona } from '../../../core/Interfaces/catalogo.interface';
import { DataGraficaBarra } from '../../../core/Interfaces/grafica.interface';
import { ParamsPromediosEstatales } from '../../../core/Interfaces/promediosEstatales.interface';
import { firstValueFrom } from 'rxjs';
import { BreadCrumService } from '../../../core/services/breadCrumbs/bread-crumb-service';

@Component({
  selector: 'app-principal-sector',
  standalone: false,
  templateUrl: './principal-sector.html',
  styleUrl: './principal-sector.scss'
})
export class PrincipalSector {

    constructor(private route: ActivatedRoute, private estadisticaService: GetEstadisticaService, private cd: ChangeDetectorRef, private getBg: GetBackgroundService, private catalogoService: CatalogoService,  private observable:GetCctInfoSErvice, private breadCrumbService:BreadCrumService) { }
  public nivel: string = ''
  public sector: string = ''
  public promedioZona: number = 0
  public promedioEstatal: number = 0
  public PorcentajeAreaEvaluada: itemPorcentajeAreaEvaluadaInterface[] = []
  public dataGrafica: DataGraficaBarra = {} as DataGraficaBarra
  public zonas:Zona[]=[]

  ngOnInit(): void {
    // Opción 2: Suscribiéndose a cambios (para parámetros dinámicos)
    this.route.paramMap.subscribe(params => {
      this.nivel = params.get('nivel') || '';
      this.sector = params.get('sector') || ''
      this.observable.setNivel(this.nivel)
      this.observable.setSector(this.sector)
      this.getPromedioBySectorAndNivel()
      this.getPromedioEstatal()
      this.getPromedioByMateriasAndZonaAndNivelAsync()
      this.getZonasFromSector()
      this.breadCrumbService.addItem({jerarquia:2, label:'Resultados '+this.getNivelDescription() + ' sector '+ this.sector, urlLink:'/ss/zonasFromSector/'+this.nivel+'/'+this.sector, icon:''})
    });
  }

  getPromedioBySectorAndNivel() {
    let params: ParamsPromediosEstatales = { sectorId: parseInt(this.sector), nivelId: parseInt(this.nivel) }
    this.estadisticaService.getPromedioEstatalByNivel(params).subscribe({
      next: resp => {
        this.promedioZona = resp[0].promedio
        this.cd.detectChanges()
      },
      error: error => {

      }
    })
  }

  // obtenemos el promedio estatal del nivel seleccionado
  getPromedioEstatal() {
    let params: ParamsPromediosEstatales = { nivelId: parseInt(this.nivel) }
    this.estadisticaService.getPromedioEstatalByNivel(params).subscribe({
      next: resp => {
        this.promedioEstatal = resp[0].promedio
        this.cd.detectChanges()
      },
      error: error => {

      }
    })
  }

  async getPromedioByMateriasAndZonaAndNivelAsync() {
    const nivelId = +this.nivel;
    const sectorId = +this.sector;  
    const materias = (this.nivel === '1') ? [1, 2] : [1, 3, 4];

    // zona
    const zonaArr = await Promise.all(materias.map(async materiaId => {
      const resp = await firstValueFrom(
        this.estadisticaService.getPromedioEstatalByNivel({ nivelId, materiaId, sectorId })
      );
      return {
        materiaId,
        nombreMateria: this.getNombreMateria(materiaId),
        promedio: resp?.[0]?.promedio ?? 0
      };
    }));

    // estatal
    const result = await Promise.all(zonaArr.map(async item => {
      const resp = await firstValueFrom(
        this.estadisticaService.getPromedioEstatalByNivel({ nivelId, materiaId: item.materiaId })
      );
      return { ...item, promedioEstatalMateria: resp?.[0]?.promedio ?? 0 };
    }));

    this.formatearAPorcentajeAreaEvaluada(result)
  }
  
  formatearAPorcentajeAreaEvaluada(result: any[]) {
    result.forEach(el => {
      let data: itemPorcentajeAreaEvaluadaInterface = {
        firstLeyendPercent: 'Promedio en ' + el.nombreMateria + ' del sector ' + this.sector,
        firstPercent: el.promedio,
        secondLeyendPercent: 'Promedio Estatal de ' + el.nombreMateria,
        secondPercent: el.promedioEstatalMateria,
        bgTitle: this.getBg.getBackgroundMateria(el.nombreMateria),
        title: el.nombreMateria
      }
      this.PorcentajeAreaEvaluada.push(data)
    });
    this.cd.detectChanges()

  }

  getZonasFromSector() {
    let params: catalogo = {
      sector: parseInt(this.sector),
      nivelId:parseInt(this.nivel)
    }
    this.catalogoService.getCatalogo(params).subscribe({
      next: resp => {
        this.zonas=resp.zonas
        this.getPromediosZonaFromSector()

      },
      error: error => {

      }
    })
  }
  async getPromediosZonaFromSector() {
    const categorias: string[] = [];
    const dataSet: number[] = [];

    for (let i = 0; i < this.zonas.length; i++) {
      const zonaId = this.zonas[i].zonaEscolar;
      try {
        const resp = await firstValueFrom(
          this.estadisticaService.getPromedioEstatalByNivel({ nivelId:parseInt(this.nivel), zonaId: zonaId })
        );

        categorias.push('Zona '+zonaId.toString());
        dataSet.push(resp[0].promedio);
      } catch (error) {
      }
    }

    this.dataGrafica={
      firstDataSet:dataSet,
      firstLeyend:'Promedio',
      categorias:categorias,
      title:'Promedios de zonas del sector ' + this.sector + ' del nivel ' + this.getNivelDescription(),
      secondDataSet:[],
      secondLeyend:'',
      description:'promedios de las zonas del sector ' + this.sector 
    }
    this.cd.detectChanges()
    // return { categorias, dataSet };
  }

  getNivelDescription() {
    return this.catalogoService.getNivelDescription(this.nivel)
  }
  getNombreMateria(materia: number) {
    return this.catalogoService.getNombreMateria(materia)
  }


}
