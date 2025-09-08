import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-tabla-resultados-evidencia',
  standalone: false,
  templateUrl: './tabla-resultados-evidencia.component.html',
  styleUrl: './tabla-resultados-evidencia.component.scss'
})
export class TablaResultadosEvidenciaComponent {
@Input()public title:string='Lenguaje'
@Input()public data:any
@Input()public bgColorTitle:string='bg-emerald-500'
@Output() onEmitMateriaSelected:EventEmitter<any>= new EventEmitter

EmitMateriaSelected(){
this.onEmitMateriaSelected.emit(this.title)
}

}
