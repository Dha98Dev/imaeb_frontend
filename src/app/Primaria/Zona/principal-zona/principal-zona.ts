import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GetEstadisticaService } from '../../../core/services/EstadisticaPromedios/getEstadistica.service';
import { ParamsPromediosEstatales } from '../../../core/Interfaces/promediosEstatales.interface';
import { firstValueFrom } from 'rxjs';
import { itemPorcentajeAreaEvaluadaInterface } from '../../../core/components/item-porcentaje-area-evaluada/item-porcentaje-area-evaluada.component';
import { GetBackgroundService } from '../../../core/services/getColors/getBackground.service';
import { CatalogoService } from '../../../core/services/Catalogos/catalogo.service';
import { catalogo, CentrosTrabajo } from '../../../core/Interfaces/catalogo.interface';
import { DataGraficaBarra } from '../../../core/Interfaces/grafica.interface';
import { GetCctInfoSErvice } from '../../../core/services/Cct/GetCctInfo.service';
import { BreadCrumService } from '../../../core/services/breadCrumbs/bread-crumb-service';

@Component({
  selector: 'app-principal-zona',
  standalone: false,
  templateUrl: './principal-zona.html',
  styleUrl: './principal-zona.scss'
})
export class PrincipalZona {
  constructor(private route: ActivatedRoute, private estadisticaService: GetEstadisticaService, private cd: ChangeDetectorRef, private getBg: GetBackgroundService, private catalogoService: CatalogoService, private observable: GetCctInfoSErvice, private breadCrumbService: BreadCrumService) { }
  public nivel: string = ''
  public zona: string = ''
  public modalidad: string = ''
  public promedioZona: number = 0
  public promedioEstatal: number = 0
  public PorcentajeAreaEvaluada: itemPorcentajeAreaEvaluadaInterface[] = []
  private centrosTrabajos: CentrosTrabajo[] = []
  public dataGrafica: DataGraficaBarra = {} as DataGraficaBarra

  ngOnInit(): void {
    // Opción 2: Suscribiéndose a cambios (para parámetros dinámicos)
    this.route.paramMap.subscribe(params => {
      this.nivel = params.get('nivel') || '';
      this.zona = params.get('zona') || ''
      this.modalidad = params.get('modalidad') || ''
      this.observable.setNivel(this.nivel)
      this.observable.setZona(this.zona)
      this.observable.setModalidad(this.modalidad)
      this.getPromedioByZonaAndNivel()
      this.getPromedioEstatal()
      this.getPromedioByMateriasAndZonaAndNivelAsync()
      this.getCentrosTrabajoZona()
      this.breadCrumbService.addItem({ jerarquia: 3, label: 'Resultados zona ' + this.zona, urlLink: '/sz/resultados-zona/' + this.nivel + '/' + this.zona + '/' + this.modalidad, icon: '' })
    });
  }

  getPromedioByZonaAndNivel() {
    let params: ParamsPromediosEstatales = { zonaId: parseInt(this.zona), nivelId: parseInt(this.nivel), modalidadId: parseInt(this.modalidad) }
    this.estadisticaService.getPromedioEstatalByNivel(params).subscribe({
      next: resp => {
        this.promedioZona = resp[0].promedio
        console.log(resp)
        this.cd.detectChanges()
      },
      error: error => {

      }
    })
  }
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
    const zonaId = +this.zona;
    const materias = (this.nivel === '1') ? [1, 2] : [1, 3, 4];

    // zona
    const zonaArr = await Promise.all(materias.map(async materiaId => {
      const resp = await firstValueFrom(
        this.estadisticaService.getPromedioEstatalByNivel({ nivelId, materiaId, zonaId, modalidadId: parseInt(this.modalidad) })
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
        firstLeyendPercent: 'Promedio en ' + el.nombreMateria + ' de zona ' + this.zona,
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

  getCentrosTrabajoZona() {
    let params: catalogo = {
      zonaEscolar: parseInt(this.zona),
      nivelId: parseInt(this.nivel),
      modalidadId: parseInt(this.modalidad)
    }
    this.catalogoService.getCatalogo(params).subscribe({
      next: resp => {
        this.centrosTrabajos = resp.centrosTrabajo
        this.getPromediosCctZona()
      },
      error: error => {

      }
    })
  }
  async getPromediosCctZona() {
    const categorias: string[] = [];
    const dataSet: number[] = [];

    for (let i = 0; i < this.centrosTrabajos.length; i++) {
      const escuelaId = this.centrosTrabajos[i].id;
      const cct = this.centrosTrabajos[i].cct;

      try {
        const resp = await firstValueFrom(
          this.estadisticaService.getPromedioEstatalByNivel({ escuelaId })
        );

        categorias.push(cct);
        dataSet.push(resp[0].promedio);
      } catch (error) {
      }
    }

    this.dataGrafica = {
      firstDataSet: dataSet,
      firstLeyend: 'Promedio',
      categorias: categorias,
      title: 'Promedio de cc de la zona ' + this.zona + ' del nivel ' + this.nivel,
      secondDataSet: [],
      secondLeyend: '',
      description: 'promedios de la zona ' + this.zona
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
