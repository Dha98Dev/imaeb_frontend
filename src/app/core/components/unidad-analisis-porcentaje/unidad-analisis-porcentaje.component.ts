import { Component, Input } from '@angular/core';
import { PorcentajeResultadoUnidadAnalisis } from '../../Interfaces/resultadoPorcentajeAciertosMateria.interface';
import { GetBackgroundService } from '../../services/getColors/getBackground.service';
import { backgroundNivel } from '../../Interfaces/Background.interface';

@Component({
  selector: 'app-unidad-analisis-porcentaje',
  standalone: false,
  templateUrl: './unidad-analisis-porcentaje.component.html',
  styleUrl: './unidad-analisis-porcentaje.component.scss'
})
export class UnidadAnalisisPorcentajeComponent {
@Input()
public onlyPorcentaje:boolean=false

@Input()
public dataUnidadAnalisis:PorcentajeResultadoUnidadAnalisis[]=[]

constructor(private getColor:GetBackgroundService){}

getBackgroundAndText(porcentaje:number): backgroundNivel{
return this.getColor.getnivelAprendizaje(porcentaje)
}

// @Input()
// public nombreAlumno:string=''

// @Input()
// public materia:string=''

}
