import { Component } from '@angular/core';
import { Background } from '../../core/enums/background.enum';

@Component({
  selector: 'app-mis-resultados-imaeb',
  standalone: false,
  templateUrl: './mis-resultados-imaeb.html',
  styleUrl: './mis-resultados-imaeb.scss'
})
export class MisResultadosImaeb {
  active: string = '0';
  public fondos=Background
    activeIndexChange(index : string){
        this.active = index
    }
}
