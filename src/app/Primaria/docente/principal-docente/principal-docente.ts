import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GetCctInfoSErvice } from '../../../core/services/Cct/GetCctInfo.service';
import { CctAndGrupoService } from '../../../core/services/CctAndGrupo/CctAndGrupoService.service';
import { conteoAlumnosGrupo } from '../../../core/Interfaces/conteoAlumnosGrupo.interface';
import { ConteoUtilizacionExamen } from '../../../core/Interfaces/ConteoUtilizacionExamen.interface';
import { conteoNivelDesempenioByGrupoAndCct, MateriaPlano } from '../../../core/Interfaces/conteoNivelDespempenioByGrupoAndCct.interface';
import { GetEstadisticaService } from '../../../core/services/EstadisticaPromedios/getEstadistica.service';
import { DatosCct } from '../../../core/Interfaces/DatosCct.interface';
import { datosCct } from '../../../core/Interfaces/listadoAlumno.interface';

@Component({
  selector: 'app-principal-docente',
  standalone: false,
  templateUrl: './principal-docente.html',
  styleUrl: './principal-docente.scss'
})
export class PrincipalDocente {
  constructor(private route: ActivatedRoute, private cctService:GetCctInfoSErvice, private cctAndGrupoService:CctAndGrupoService, private cd:ChangeDetectorRef, private estadisticaService:GetEstadisticaService) { }
  private jerarquia: number = 8
  public porcentajeNinos: number = 54.5
  public porcentajeNinas: number = 45.5
  public cct: string = '';
  public grupo: string = '';
  public loader: boolean = false
  public conteoAlumnos:conteoAlumnosGrupo={} as conteoAlumnosGrupo
  public resConteoExamenesUtilizados:ConteoUtilizacionExamen = {} as ConteoUtilizacionExamen
  public conteNivelDesempenio:MateriaPlano[]=[]
  public promedioEstatal:number=0
  public promedioGrupo:number=0
  public nivel: number=0
  private idEscuela:number=0
  ngOnInit(): void {
    this.loader = true
    this.route.paramMap.subscribe(params => {
      this.cct = params.get('cct') || '';
      this.grupo = params.get('grupo') || '';
      this.cctService.setCct(this.cct)
      this.cctService.setGrupo(this.grupo)
      this.getInfoCct()
      this.conteoSexoGrupo()
      this.conteoExamenesUtilizados()
      this.conteoNivelDesempenioByGrupoAndCct()
    });
    this.cctService.cct$.subscribe(data =>{
      console.log(data)
    })
  }

  materiaSelected(materia: any) {
    // this._router.navigate(['resultados-grupo-area'])
  }

  getInfoCct(){
    this.cctService.getInfoCct(this.cct).subscribe({
      next:(resp)=>{
        this.cctService.setCentroTrabajo(resp[0])
        this.nivel=resp[0].idNivel
        this.calcularPromedioEstatal()
        this.calcularpromedioGrupo()
      },
      error: (error)=>{

      }
    })
  }

  conteoSexoGrupo(){
    this.cctAndGrupoService.contarAlumnosEvaluadosByCctAndGrupo(this.cct, this.grupo).subscribe({
      next:(resp) =>{
        this.conteoAlumnos=resp

        // this.loader=false
        this.cd.detectChanges()
      },
      error: (error) =>{

      }
    })
  }

   conteoExamenesUtilizados(){
    this.cctAndGrupoService.contarExamenesUtilizadosByCctAndGrupo(this.cct, this.grupo).subscribe({
      next:(resp) =>{
        this.resConteoExamenesUtilizados=resp
        // this.loader=false
        this.cd.detectChanges()
      },
      error: (error) =>{

      }
    })
  }

  conteoNivelDesempenioByGrupoAndCct(){
    this.loader=true
        this.cctAndGrupoService.conteoNivelDesempenioByGrupoAndCct(this.cct, this.grupo).subscribe({
      next:(resp) =>{
        this.conteNivelDesempenio=this.transformarArreglo(resp)
        console.log(this.conteNivelDesempenio)
        this.loader=false
        this.cd.detectChanges()
      },
      error: (error) =>{

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


  calcularPromedioEstatal() {
    this.estadisticaService.getPromedioEstatalByNivel({ nivelId: this.nivel }).subscribe({
      next: resp => {
        this.promedioEstatal = resp[0].promedio
        this.cd.detectChanges()
      },
      error: error => {

      }
    })
  }
  
  calcularpromedioGrupo() {
    let datoscct:DatosCct={} as DatosCct
     this.cctService.centroTrabajo$.subscribe(data =>{
      datoscct=data
    })
    let idCct = this.getIdCctTurnoByGrupo(datoscct, this.grupo)
    this.estadisticaService.getPromedioEstatalByNivel({escuelaId: idCct!, grupoId:this.getGrupoId(this.grupo)!}).subscribe({
      next: resp => {
        this.promedioGrupo = resp[0].promedio
        console.log(this.promedioGrupo)
        this.cd.detectChanges()
      },
      error: error => {

      }
    })
  }

   getGrupoId(grupo: string): number | null {
  const map: Record<string, number> = {
    A: 1,
    B: 2,
    C: 3,
    D: 4,
    E: 5,
    F: 6,
    G: 7,
    H: 8,
    I: 9,
    J: 10,
    K: 11,
    L: 12,
  };

  return map[grupo.toUpperCase()] ?? null;
}

getIdCctTurnoByGrupo(cct: DatosCct, grupo: string): number | null {
  if (!cct?.turnos?.length) return null;

  for (const turno of cct.turnos) {
    if (turno.grupos.includes(grupo.toUpperCase())) {
      return turno.idCctTurno;
    }
  }

  return null; // si no se encontró en ningún turno
}

}
