import { Component, Input } from '@angular/core';
@Component({
    selector: 'app-chart-figure-gir-boy',
    standalone: false,
    templateUrl: './chart-figure-gir-boy.component.html',
    styleUrl: './chart-figure-gir-boy.component.scss'
})
export class ChartFigureGirBoyComponent  {
  @Input() isBoy:boolean=false
  @Input() bgColor:string=''
  @Input() relleno: number=0
}


