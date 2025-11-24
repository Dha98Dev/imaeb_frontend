import { Component, Input } from '@angular/core';
import { Background } from '../../enums/background.enum';
@Component({
    selector: 'app-chart-figure-gir-boy',
    standalone: false,
    templateUrl: './chart-figure-gir-boy.component.html',
    styleUrl: './chart-figure-gir-boy.component.scss'
})
export class ChartFigureGirBoyComponent  {
  @Input() isBoy:boolean=false
  @Input() relleno: number=0
}


