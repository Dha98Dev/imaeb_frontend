import { Component, Input } from '@angular/core';

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
public data:any

public respuesta:number=1
}
