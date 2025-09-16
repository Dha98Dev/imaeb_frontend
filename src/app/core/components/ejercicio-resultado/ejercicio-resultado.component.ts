import { Component, Input } from '@angular/core';
import { Background } from '../../enums/background.enum';
// import { getBgColorService } from '../../Services/GetBgColor.service';

@Component({
  selector: 'app-ejercicio-resultado',
  standalone: false,
  templateUrl: './ejercicio-resultado.component.html',
  styleUrl: './ejercicio-resultado.component.scss'
})
export class EjercicioResultadoComponent {
  private fondos=Background
  @Input()  
  public bgColorTitle:Background= this.fondos.blue

  @Input() 
  public title:string ='Lenguajes'

  // constructor(private getColor:getBgColorService){}
  
  active: string = '0';

    activeIndexChange(index : string){
        this.active = index
    }

    // getBg(materia:string){
    //   return  this.getColor.getColorByCategoria(materia)
    // }

}
