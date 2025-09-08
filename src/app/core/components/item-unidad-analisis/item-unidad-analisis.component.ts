import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-item-unidad-analisis',
  standalone: false,
  templateUrl: './item-unidad-analisis.component.html',
  styleUrl: './item-unidad-analisis.component.scss'
})
export class ItemUnidadAnalisisComponent {
@Input() public title:string ='Unidad de analisis'
}
