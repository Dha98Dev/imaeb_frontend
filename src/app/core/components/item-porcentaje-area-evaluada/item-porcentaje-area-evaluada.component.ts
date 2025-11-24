import { Component, Input } from '@angular/core';
export interface itemPorcentajeAreaEvaluadaInterface {
  title: string;                // Título de la tarjeta, ej. "Lenguajes"
  firstPercent: number | string;   // Primer valor en porcentaje
  secondPercent: number | string;  // Segundo valor en porcentaje
  firstLeyendPercent: string;      // Leyenda del primer valor
  secondLeyendPercent: string;     // Leyenda del segundo valor
  bgTitle: string;                 // Clase CSS o color de fondo del título
}
@Component({
  selector: 'app-item-porcentaje-area-evaluada',
  standalone: false,
  templateUrl: './item-porcentaje-area-evaluada.component.html',
  styleUrl: './item-porcentaje-area-evaluada.component.scss'
})
export class ItemPorcentajeAreaEvaluadaComponent {
@Input() 
public title:string='Lenguajes'
@Input()
firstPercent:number | string=''
@Input()
public secondPercent:number | string =''
@Input()
public firstLeyendPercent:string=''
@Input()
public secondLeyendPercent:string=''
@Input()
public bgTitle:string ='bg-sky-500'
}
