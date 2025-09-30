import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GetCctInfoSErvice } from '../../../core/services/Cct/GetCctInfo.service';
import { conteoNivelDesempenioByGrupoAndCct, MateriaPlano } from '../../../core/Interfaces/conteoNivelDespempenioByGrupoAndCct.interface';
import { DatosCct } from '../../../core/Interfaces/DatosCct.interface';
import { item } from '@primeuix/themes/aura/breadcrumb';
import { CctAndGrupoService } from '../../../core/services/CctAndGrupo/CctAndGrupoService.service';
import { ConteoUtilizacionExamen } from '../../../core/Interfaces/ConteoUtilizacionExamen.interface';
import { error } from 'highcharts';
import { DataGraficaBarra } from '../../../core/Interfaces/grafica.interface';
import { ParamsPromediosEstatales, PromedioEstatalCct } from '../../../core/Interfaces/promediosEstatales.interface';
import { GetEstadisticaService } from '../../../core/services/EstadisticaPromedios/getEstadistica.service';

@Component({
  selector: 'app-principal-director',
  standalone: false,
  templateUrl: './principal-director.html',
  styleUrl: './principal-director.scss'
})
export class PrincipalDirector {
  constructor(private route: ActivatedRoute, private cd: ChangeDetectorRef, private cctService: GetCctInfoSErvice, private router: Router, private cctAndGrupoService: CctAndGrupoService, private getEstadistica:GetEstadisticaService) { }

  public loader: boolean = false
  private cct: string = ''
  public conteNivelDesempenio: MateriaPlano[] = []
  public gruposCct: string[] = []
  public grupoSelected: string = 'A'
  public resConteoExamenesUtilizados: ConteoUtilizacionExamen[] = []
  public dataChartPromedioGrupos:DataGraficaBarra={} as  DataGraficaBarra
  public totalMujeres:number=0
  public totalHombres:number=0
  public totalAlumnos:number=0
  public PromedioEstatal:number=0
  public promediosCct:PromedioEstatalCct[]=[]

  ngOnInit(): void {
    // Opción 2: Suscribiéndose a cambios (para parámetros dinámicos)
    this.route.paramMap.subscribe(params => {
      this.cct = params.get('cct') || '';
      this.getDatosCct()
      this.conteoNivelDesempenioByGrupoAndCct()
      this.conteoExamenesUtilizados()
      this.getPromedioGruposcct()
      this.getNumeroAlumnosByCctandSexo()

    });
  }
  getDatosCct() {
    this.loader = true
    this.cctService.getInfoCct(this.cct).subscribe({
      next: (resp) => {
        this.cctService.setCentroTrabajo(resp[0])
        this.gruposCct = this.extraerGrupos(resp[0])
        this.loader = false
        this.cd.detectChanges()
        this.getPromediosEstatales()
      },
      error: (error) => {

      }
    })
  }
  extraerGrupos(centro: DatosCct): string[] {
    if (!centro.turnos || centro.turnos.length === 0) {
      return [];
    }
    return centro.turnos.flatMap(turno => turno.grupos ?? []);
  }
  redireccioarResultadosGrupo(grupo: string) {
    this.router.navigate(['/prim_2/resultados-grupo', this.cct, grupo])
  }
  conteoNivelDesempenioByGrupoAndCct() {
    this.loader = true
    this.cctAndGrupoService.conteoNivelDesempenioByGrupoAndCct(this.cct, '').subscribe({
      next: (resp) => {
        this.conteNivelDesempenio = this.transformarArreglo(resp)
        this.loader = false
        this.cd.detectChanges()
      },
      error: (error) => {

      }
    })
  }

  transformarArreglo(data: conteoNivelDesempenioByGrupoAndCct[]): MateriaPlano[] {
    return data.map(item => ({
      materia: item.materia,
      filas: item.filas.map(f => ({
        grupo: f.grupo,
        ...f.conteo
      }))
    }));
  }
  conteoExamenesUtilizados() {
    this.cctAndGrupoService.contarExamenesUtilizadosByCct(this.cct).subscribe({
      next: (resp) => {
        this.resConteoExamenesUtilizados = resp
        this.loader = false
        this.cd.detectChanges()
      },
      error: (error) => {

      }
    })
  }

  getPromedioGruposcct() {
    this.cctAndGrupoService.getPromedioGruposcct(this.cct).subscribe({
      next: (resp) => {
        this.dataChartPromedioGrupos=this.buildDataChart(resp)
        this.cd.detectChanges()
      },
      error: (error) => {

      }
    })
  }

  getNumeroAlumnosByCctandSexo(){
   this.cctAndGrupoService.getNumeroAlumnosByCctandSexo(this.cct).subscribe({
      next: (resp) => {
        resp.forEach(el =>{
          this.totalMujeres+=el.totalMujeres
          this.totalHombres+=el.totalHombres
          this.totalAlumnos+=el.totalAlumnos
          
        })
        console.log(this.totalAlumnos)
        this.cd.detectChanges()
      },
      error: (error) => {

      }
    })
  }

getPromediosEstatales(){
        this.cctService.centroTrabajo$.subscribe(data=>{
        let dataCct:DatosCct=data
        let nivel:number=this.cctService.getIdNivel()!
        let paramProm:ParamsPromediosEstatales={nivelId:nivel}
        this.getEstadistica.getPromedioEstatalByNivel(paramProm).subscribe({
          next: resp =>{
            this.PromedioEstatal=resp[0].promedio
          },
          error:error =>{

          }
        })

        dataCct.turnos.forEach(turno =>{
          let params:ParamsPromediosEstatales ={
            escuelaId:turno.idCctTurno,
            nivelId:nivel
          }
          this.getEstadistica.getPromedioEstatalByNivel(params).subscribe({
            next:(resp)=>{
              console.log(resp)
              this.promediosCct.push({
                cct:dataCct.cct,
                turno:turno.nombre,
                promedio:resp[0].promedio
              })
              console.log(this.promediosCct)
            },
            error:error =>{

            }
          })
          this.cd.detectChanges()
        })
        })
}
  
  buildDataChart(respuesta: { grupo: string; promedio: number; turno: string }[]): DataGraficaBarra {
    return {
      categorias: respuesta.map(r => `${r.grupo} - ${r.turno}`),
      firstLeyend: 'Promedio',
      firstDataSet: respuesta.map(r => r.promedio),
      secondDataSet: [],
      secondLeyend: '',
      title: 'Promedio de grupos',
      description: `Promedio de calificaciones por grupo (${respuesta[0]?.turno ?? ''})`
    };
  }

}
