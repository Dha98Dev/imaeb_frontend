import { Component, Input } from '@angular/core';

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
