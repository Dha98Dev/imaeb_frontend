import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-unidad-analisis-porcentaje',
  standalone: false,
  templateUrl: './unidad-analisis-porcentaje.component.html',
  styleUrl: './unidad-analisis-porcentaje.component.scss'
})
export class UnidadAnalisisPorcentajeComponent {
@Input()
public onlyPorcentaje:boolean=false
}
