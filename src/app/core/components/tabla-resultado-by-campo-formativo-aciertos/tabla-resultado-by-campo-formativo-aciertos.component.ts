import { Component, Input, SimpleChanges } from '@angular/core';
import { ResultadoPreguntasMateriaAumno } from '../../Interfaces/resultadoPorcentajeAciertosMateria.interface';

@Component({
  selector: 'app-tabla-resultado-by-campo-formativo-aciertos',
  standalone: false,
  templateUrl: './tabla-resultado-by-campo-formativo-aciertos.component.html',
  styleUrl: './tabla-resultado-by-campo-formativo-aciertos.component.scss'
})
export class TablaResultadoByCampoFormativoAciertosComponent {
@Input()
public title:string=''
@Input()
public data:ResultadoPreguntasMateriaAumno= {} as ResultadoPreguntasMateriaAumno

public promedioCorrectas:number=0
public promedioIncorrectas:number=0

ngOnChanges(changes:SimpleChanges){
if (changes['data']) {
  if (this.data &&  this.data.preguntas.length > 0) {
    this.calcularPromedioAciertos()
  }
}
}

calcularPromedioAciertos(){
  let respuestasCorrectas = this.data.preguntas.filter(preg => preg.respuesta === '1');
  let respuestasIncorrectas = this.data.preguntas.filter(preg => preg.respuesta === '0')
  this.promedioCorrectas = (respuestasCorrectas.length /this.data.preguntas.length ) * 100
  this.promedioIncorrectas =(respuestasIncorrectas.length / this.data.preguntas.length) * 100
}


}
