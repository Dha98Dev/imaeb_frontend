import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-nivel-desempeno-imagen',
  standalone: false,
  templateUrl: './nivel-desempeno-imagen.component.html',
  styleUrl: './nivel-desempeno-imagen.component.scss'
})
export class NivelDesempenoImagenComponent {
@Input()
content:string=''

@Input()
public bgColorContent:string='bg-emerald-500'

}
