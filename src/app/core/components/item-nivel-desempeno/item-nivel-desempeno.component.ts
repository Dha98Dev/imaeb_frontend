import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-item-nivel-desempeno',
  standalone: false,
  templateUrl: './item-nivel-desempeno.component.html',
  styleUrl: './item-nivel-desempeno.component.scss'
})
export class ItemNivelDesempenoComponent {
@Input() public title:string ='Niveles de desempeño'
}
