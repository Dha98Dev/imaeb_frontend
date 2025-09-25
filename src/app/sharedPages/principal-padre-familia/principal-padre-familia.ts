import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CryptoJsService } from '../../core/services/CriptoJs/cryptojs.service';
import { GetResultadosAlumnosService } from '../../core/services/Preguntas/GetResultadosAlumnos.service';
import { Resultado } from '../../core/Interfaces/resultadoPorcentajeAciertosMateria.interface';
import { Alumno } from '../../core/Interfaces/listadoAlumno.interface';
import { GetBackgroundService } from '../../core/services/getColors/getBackground.service';
import { GetCctInfoSErvice } from '../../core/services/Cct/GetCctInfo.service';
import { DatosCct } from '../../core/Interfaces/DatosCct.interface';

@Component({
  selector: 'app-principal-padre-familia',
  standalone: false,
  templateUrl: './principal-padre-familia.html',
  styleUrl: './principal-padre-familia.scss'
})
export class PrincipalPadreFamilia {
constructor(private route: ActivatedRoute, private crypto:CryptoJsService, private resultadosAlumnos:GetResultadosAlumnosService , private cd: ChangeDetectorRef, private getBg:GetBackgroundService, private cctInfo:GetCctInfoSErvice){}


private alumnoParam:string=''
private alumnoID:number=0

public loader:boolean=false
public resultadosPorcentajes:Resultado[]=[]
public datosAlumno:Alumno={} as Alumno
public DatosCct:DatosCct={} as DatosCct

ngOnInit(){
  this.route.paramMap.subscribe(params =>{
    try {
      this.alumnoParam=params.get('idAlumno') || ''
      if (this.alumnoParam != "") {
        this.alumnoID=parseInt(this.crypto.Desencriptar(this.alumnoParam))
        console.log(this.alumnoID)
        this.getPorcentajeAciertosAlumno()
          this.loader=true
      }
    } catch (error) {
      console.log('acaba de ocurrir un error al obtener al alumno')
    }
  })
}
getPorcentajeAciertosAlumno(){

this.resultadosAlumnos.getPorcentajeAciertosAlumno(this.alumnoID).subscribe({
  next: (resp) =>{
    this.datosAlumno=resp[0]
    this.getDataCentroTrabajo(this.datosAlumno.datosEscolares.cct)
    this.resultadosPorcentajes=this.datosAlumno.resultados!
    console.log(this.datosAlumno)
    console.log(this.resultadosPorcentajes)
    this.loader=false
    this.cd.detectChanges();
  },
  error:(error)=>{

  }
})
}

getDataCentroTrabajo(cct:string){
this.cctInfo.getInfoCct(cct).subscribe({
  next:(resp)=>{
    this.DatosCct=resp[0]
    this.cctInfo.setCentroTrabajo(this.DatosCct)
  },
  error: (error)=>{

  }
})
}

getBgMateria(materia:string){
return this.getBg.getBackgroundMateria(materia)
}
}
