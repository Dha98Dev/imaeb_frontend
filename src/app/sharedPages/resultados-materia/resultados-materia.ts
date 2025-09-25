import { ChangeDetectorRef, Component } from '@angular/core';
import { GetResultadosAlumnosService } from '../../core/services/Preguntas/GetResultadosAlumnos.service';
import { ActivatedRoute } from '@angular/router';
import { CryptoJsService } from '../../core/services/CriptoJs/cryptojs.service';
import { PorcentajeResultadoUnidadAnalisis, ResultadoPreguntasMateriaAumno } from '../../core/Interfaces/resultadoPorcentajeAciertosMateria.interface';
import { DataGraficaBarra } from '../../core/Interfaces/grafica.interface';
import { GetBackgroundService } from '../../core/services/getColors/getBackground.service';

@Component({
  selector: 'app-resultados-materia',
  standalone: false,
  templateUrl: './resultados-materia.html',
  styleUrl: './resultados-materia.scss'
})
export class ResultadosMateria {
constructor(private getResultadosAlumnos:GetResultadosAlumnosService, private route: ActivatedRoute, private crypto:CryptoJsService,private cd:ChangeDetectorRef, private getColor:GetBackgroundService){}

private alumnoParam:string=''
private alumnoID:number=0
private idMateriaParam:string=''
public loader:boolean=false

public resultadosPreguntasAlumnoMateria:ResultadoPreguntasMateriaAumno={} as ResultadoPreguntasMateriaAumno
public porcentajeResultado:PorcentajeResultadoUnidadAnalisis[]=[]

public porcentajeAciertos:number=0
public porcentajeDesaciertos:number=0

public dataGrafica: DataGraficaBarra={} as DataGraficaBarra

ngOnInit(){
  this.route.paramMap.subscribe(params =>{
    try {
      this.alumnoParam=params.get('idAlumno') || ''
      this.idMateriaParam=params.get('area') || ''
      if (this.alumnoParam != "" && this.idMateriaParam != '') {
        this.idMateriaParam=this.crypto.Desencriptar(this.idMateriaParam)
        this.alumnoID=parseInt(this.crypto.Desencriptar(this.alumnoParam))
          this.loader=true
          this.resultadosbyAlumnoAndMateria()
          this.resultadosbyAlumnoAndMateriaAndUnidadAnalisis()
      }
    } catch (error) {

    }
  })
}

// obtenemos las respuestas de la materia del alumno en especifico
resultadosbyAlumnoAndMateria(){
this.getResultadosAlumnos.resultadosbyAlumnoAndMateria(this.alumnoID.toString(),this.idMateriaParam).subscribe({
  next: (resp)=>{
    this.resultadosPreguntasAlumnoMateria=resp[0]
    this.loader=false
    this.calcularPromedioAciertos()
    this.cd.detectChanges()
  },
  error: (error) =>{
    this.loader=false
  }
})
}


// obtenemos el porcentaje de aciertos que tuvo el alumno por unidad de analisis en una materia en especifico

resultadosbyAlumnoAndMateriaAndUnidadAnalisis(){
  this.getResultadosAlumnos.resultadosbyAlumnoAndMateriaAndUnidadAnalisis(this.alumnoID.toString(),this.idMateriaParam).subscribe({
  next: (resp)=>{
    this.porcentajeResultado=resp
    this.transformarParaGraficas()
    this.loader=false
    this.cd.detectChanges()
  },
  error: (error) =>{
    this.loader=false
  }
})
}

calcularPromedioAciertos(){
  let respuestasCorrectas = this.resultadosPreguntasAlumnoMateria.preguntas.filter(preg => preg.respuesta === '1');
  let respuestasIncorrectas = this.resultadosPreguntasAlumnoMateria.preguntas.filter(preg => preg.respuesta === '0')
  this.porcentajeAciertos = (respuestasCorrectas.length /this.resultadosPreguntasAlumnoMateria.preguntas.length ) * 100
  this.porcentajeDesaciertos =(respuestasIncorrectas.length / this.resultadosPreguntasAlumnoMateria.preguntas.length) * 100
}

transformarParaGraficas(){
  // Transformación de datos para Highcharts
const categorias = this.porcentajeResultado.map(u => u.unidadDescripcion);
const aciertos = this.porcentajeResultado.map(u => u.porcentajeAciertos);
const desaciertos = this.porcentajeResultado.map(u => u.porcentajeDesaciertos);
this.dataGrafica={
  categorias,
  firstDataSet:aciertos,
  secondDataSet:desaciertos,
  firstLeyend:'Porcentaje Aciertos',
  secondLeyend:'Porcentaje Desaciertos',
  title:'Resultados de la materia'+this.resultadosPreguntasAlumnoMateria.nombre,
  description:''
}
}


}
