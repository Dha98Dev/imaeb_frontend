import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FilaPlano } from '../../Interfaces/conteoNivelDespempenioByGrupoAndCct.interface';

@Component({
  selector: 'app-tabla-resultados-evidencia',
  standalone: false,
  templateUrl: './tabla-resultados-evidencia.component.html',
  styleUrl: './tabla-resultados-evidencia.component.scss'
})
export class TablaResultadosEvidenciaComponent {
@Input()public title:string='Lenguaje'
@Input()public data:FilaPlano[]=[]
@Input()public bgColorTitle:string='bg-emerald-500'
@Output() onEmitMateriaSelected:EventEmitter<any>= new EventEmitter

EmitMateriaSelected(){
this.onEmitMateriaSelected.emit(this.title)
}

getBg(materia:string){
  switch (materia.toLowerCase()) {
    case 'lenguajes': return 'bg-blue'
    case 'ciencias': return 'bg-yellow'
    case 'matemáticas': return 'bg-green'
  }
  return 'bg-blue'
}

ngOnChanges(changes:SimpleChanges){
if (changes['data'] && changes['data'].currentValue) {
}
}

}
