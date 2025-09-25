import { Component, Input } from '@angular/core';
import { DataGraficaBarra } from '../../Interfaces/grafica.interface';

@Component({
  selector: 'app-item-chart-resltado-area',
  standalone: false,
  templateUrl: './item-chart-resltado-area.component.html',
  styleUrl: './item-chart-resltado-area.component.scss'
})
export class ItemChartResltadoAreaComponent {
@Input() public unidadAnalisis:string=''
@Input() public dataSet:DataGraficaBarra={} as DataGraficaBarra
@Input() public alumnos:string=''
@Input() public aciertos:string=''
@Input() public desaciertos:string=''
@Input() public isAlumno:boolean=false
}
