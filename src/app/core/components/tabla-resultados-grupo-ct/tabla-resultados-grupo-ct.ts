import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tabla-resultados-grupo-ct',
  standalone: false,
  templateUrl: './tabla-resultados-grupo-ct.html',
  styleUrl: './tabla-resultados-grupo-ct.scss'
})
export class TablaResultadosGrupoCT {
@Input()public title:string='Lenguaje'
@Input()public data:any
@Input()public bgColorTitle:string='bg-blue'
@Input()public firstLeyend:string='Grupo'
}
