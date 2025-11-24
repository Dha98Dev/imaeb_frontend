import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-title',
  standalone: false,
  templateUrl: './title.html',
  styleUrl: './title.scss'
})
export class Title {
@Input()
public title:string='consulta de resultados alumnos imaeb'
@Input()
public classTitle:string=''
}
