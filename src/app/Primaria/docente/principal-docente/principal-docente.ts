import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GetCctInfoSErvice } from '../../../core/services/Cct/GetCctInfo.service';
import { CctAndGrupoService } from '../../../core/services/CctAndGrupo/CctAndGrupoService.service';
import { conteoAlumnosGrupo } from '../../../core/Interfaces/conteoAlumnosGrupo.interface';
import { ConteoUtilizacionExamen } from '../../../core/Interfaces/ConteoUtilizacionExamen.interface';
import { conteoNivelDesempenioByGrupoAndCct, MateriaPlano } from '../../../core/Interfaces/conteoNivelDespempenioByGrupoAndCct.interface';

@Component({
  selector: 'app-principal-docente',
  standalone: false,
  templateUrl: './principal-docente.html',
  styleUrl: './principal-docente.scss'
})
export class PrincipalDocente {
  constructor(private route: ActivatedRoute, private cctService:GetCctInfoSErvice, private cctAndGrupoService:CctAndGrupoService, private cd:ChangeDetectorRef) { }
  private jerarquia: number = 8
  public porcentajeNinos: number = 54.5
  public porcentajeNinas: number = 45.5
  public cct: string = '';
  public grupo: string = '';
  public loader: boolean = false
  public conteoAlumnos:conteoAlumnosGrupo={} as conteoAlumnosGrupo
  public resConteoExamenesUtilizados:ConteoUtilizacionExamen = {} as ConteoUtilizacionExamen
  public conteNivelDesempenio:MateriaPlano[]=[]


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
  }

  materiaSelected(materia: any) {
    // this._router.navigate(['resultados-grupo-area'])
  }

  getInfoCct(){
    this.cctService.getInfoCct(this.cct).subscribe({
      next:(resp)=>{
        this.cctService.setCentroTrabajo(resp[0])
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
}
