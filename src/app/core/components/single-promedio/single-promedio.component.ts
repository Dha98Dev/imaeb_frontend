import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-single-promedio',
  standalone: false,
  templateUrl: './single-promedio.component.html',
  styleUrl: './single-promedio.component.scss'
})
export class SinglePromedioComponent {
@Input()
public title:string='Promedio Estatal '

@Input()
public content:string=''

@Input()
public isEstatal:boolean=false

}
