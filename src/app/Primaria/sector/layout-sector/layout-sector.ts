import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { GetCctInfoSErvice } from '../../../core/services/Cct/GetCctInfo.service';

@Component({
  selector: 'app-layout-sector',
  standalone: false,
  templateUrl: './layout-sector.html',
  styleUrl: './layout-sector.scss'
})
export class LayoutSector {
  public nivel:string=''
  public sector:string=''
  public modalidad:string=''
    constructor(private router:Router, private cctService:GetCctInfoSErvice, private cd:ChangeDetectorRef){}
  items: MenuItem[] | null = [];

    ngOnInit(){
  
    this.cctService.sector$.subscribe(data =>{
      this.sector=data
      this.cd.detectChanges()
    })
    this.cctService.nivel$.subscribe(data =>{
      this.nivel=data
      this.cd.detectChanges()
    })
        this.cctService.modalidad$.subscribe(data =>{
      this.modalidad=data
      this.cd.detectChanges()
    })

        this.items = [
      {
        label: 'Resutados de sector',
        icon: 'pi pi-home',
        // url: '/prim_2/resultados-grupo',
        command: () => {
          this.router.navigate(['/ss/resultados-sector', this.nivel , this.sector, this.modalidad])
        },
      },
      {
        label: 'zonas del sector ' +this.sector,
        icon: 'fa-solid fa-list',
        // url: '/prim_2/listado-grupo',
        command: () => {
          this.router.navigate(['/ss/zonasFromSector',this.nivel, this.sector, this.modalidad])
        },

      },

    ];
  }
}
