import { Component } from '@angular/core';

@Component({
  selector: 'app-mis-resultados-imaeb',
  standalone: false,
  templateUrl: './mis-resultados-imaeb.html',
  styleUrl: './mis-resultados-imaeb.scss'
})
export class MisResultadosImaeb {
  active: string = '0';

    activeIndexChange(index : string){
        this.active = index
    }
}
