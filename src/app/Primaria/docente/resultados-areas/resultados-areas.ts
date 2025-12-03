import { ChangeDetectorRef, Component } from '@angular/core';
import { GetCctInfoSErvice } from '../../../core/services/Cct/GetCctInfo.service';
import { ActivatedRoute } from '@angular/router';
import { CctAndGrupoService } from '../../../core/services/CctAndGrupo/CctAndGrupoService.service';
import { GrupoPorUnidad, PreguntaStat } from '../../../core/Interfaces/conteoRespuestasByPreguntaAndCct.interface';
import { UnidadChartData } from '../../../core/Interfaces/grafica.interface';
import { BreadCrumService } from '../../../core/services/breadCrumbs/bread-crumb-service';
import { CryptoJsService } from '../../../core/services/CriptoJs/cryptojs.service';

@Component({
  selector: 'app-resultados-areas',
  standalone: false,
  templateUrl: './resultados-areas.html',
  styleUrl: './resultados-areas.scss'
})
export class ResultadosAreas {
  constructor(private cctService: GetCctInfoSErvice, private route: ActivatedRoute, private cctAndGrupoService: CctAndGrupoService, private cd: ChangeDetectorRef, private breadCrumbService:BreadCrumService, private crypto:CryptoJsService) { }
  public materiaSelected: number = 1
  public subtitle: string = ''
  public cct: string = '';
  public grupo: string = '';
  public loader: boolean = false
  public nivel: string | number = ''
  public dataChart: UnidadChartData[] = []
  

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.cct = this.crypto.Desencriptar(params.get('cct')!) || '';
      this.grupo = params.get('grupo') || '';
      this.cctService.setCct(this.cct)
      this.cctService.setGrupo(this.grupo)
      this.getInfoCct()
      this.conteoNivelDesempenioByGrupoAndCct()
      this.breadCrumbService.addItem({ jerarquia: 5, label: 'grupo area ' + this.grupo, urlLink: 'prim_2/resultados-grupo-area/' + this.crypto.Encriptar(this.cct)+'/'+this.grupo , icon: '' })
      
    });

    this.cctService.centroTrabajo$.subscribe(data => {
    })
  }

  get getSubtitle(): string {
    switch (this.materiaSelected) {
      case 1: return 'Resultados de Lenguaje';
      case 3: return 'Resultados de Matemáticas';
      case 4: return 'Resultados de Ciencias';
      default: return 'Resultados de Lenguaje';
    }
  }

  // Cambias materiaSelected sólo en eventos de UI:
  onPick(n: number) {
    this.materiaSelected = n;
    this.conteoNivelDesempenioByGrupoAndCct()
  }


  getInfoCct() {
    this.cctService.getInfoCct(this.cct).subscribe({
      next: (resp) => {
        this.cctService.setCentroTrabajo(resp[0])
        this.nivel= resp[0].idNivel
        this.cd.detectChanges()
      },
      error: (error) => {

      }
    })
  }

  conteoNivelDesempenioByGrupoAndCct() {
    this.loader = true
    this.cctAndGrupoService.conteoNumeroAciertosByPreguntaByMateria(this.cct, this.grupo, this.materiaSelected).subscribe({
      next: (resp) => {
        // this.agruparPorUnidad(resp)
        this.dataChart = this.buildChartDataPorPorcentaje(resp)
        this.loader = false
        this.cd.detectChanges()
      },
      error: (error) => {

      }
    })
  }

  //   agruparPorUnidad(data: PreguntaStat[]): GrupoPorUnidad[] {
  //   const map = new Map<string, PreguntaStat[]>();

  //   for (const item of data ?? []) {
  //     const key = item.unidad ?? '(sin unidad)';
  //     if (!map.has(key)) map.set(key, []);
  //     map.get(key)!.push(item);
  //   }

  //   // Construye el arreglo final y ordena las preguntas dentro de cada unidad
  //   return Array.from(map.entries()).map(([unidad, preguntas]) => ({
  //     unidad,
  //     preguntas: preguntas.sort((a, b) => a.numeroPregunta - b.numeroPregunta),
  //   }));
  // }

  buildChartDataPorPorcentaje(data: PreguntaStat[]): UnidadChartData[] {
    const porUnidad = new Map<string, PreguntaStat[]>();

    for (const it of data ?? []) {
      const key = it.unidad ?? '(Sin unidad)';
      if (!porUnidad.has(key)) porUnidad.set(key, []);
      porUnidad.get(key)!.push(it);
    }

    const salida: UnidadChartData[] = [];
    for (const [unidad, arr] of porUnidad.entries()) {
      arr.sort((a, b) => a.numeroPregunta - b.numeroPregunta);

      const categorias = arr.map(p => (p.numeroPregunta).toString());
      const aciertos = arr.map(p => Number((p.porcentajeAciertos ?? 0).toFixed(2)));
      const desaciertos = arr.map(p => Number((p.porcentajeDesaciertos ?? 0).toFixed(2)));

      const base = arr[0];
      salida.push({
        unidad,
        totalAlumnos: base?.totalRespuestas ?? 0,
        porcentajeAciertos: base?.porcentajeAciertos ?? 0,
        porcentajeDesaciertos: base?.porcentajeDesaciertos ?? 0,
        dataChart: {
          categorias,
          firstLeyend: 'Aciertos (%)',
          secondLeyend: 'Desaciertos (%)',
          firstDataSet: aciertos,
          secondDataSet: desaciertos,
          title: 'Porcentaje',
          description: `Porcentaje por pregunta en ${unidad}`
        }
      });
    }
    return salida;
  }
}
