import { ChangeDetectorRef, Component, Input, SimpleChanges } from '@angular/core';
import { DatosCct } from '../../Interfaces/DatosCct.interface';
import { GetCctInfoSErvice } from '../../services/Cct/GetCctInfo.service';

@Component({
  selector: 'app-datos-ct',
  standalone: false,
  templateUrl: './datos-ct.component.html',
  styleUrl: './datos-ct.component.scss'
})
export class DatosCtComponent {
  constructor(private CctService:GetCctInfoSErvice, private cd: ChangeDetectorRef){}
// @Input()
public datosCct:DatosCct={} as DatosCct

ngOnInit(){
      this.CctService.centroTrabajo$.subscribe(data =>{
      if (data) {
        this.datosCct=data
         this.cd.detectChanges();
      }
    })
}
}
