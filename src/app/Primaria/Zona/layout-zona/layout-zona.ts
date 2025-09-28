import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { GetCctInfoSErvice } from '../../../core/services/Cct/GetCctInfo.service';

@Component({
  selector: 'app-layout-zona',
  standalone: false,
  templateUrl: './layout-zona.html',
  styleUrl: './layout-zona.scss'
})
export class LayoutZona {
  constructor(private router:Router, private cctService:GetCctInfoSErvice, private cd:ChangeDetectorRef){}
  items: MenuItem[] | null = [];
  private nivel:string=''
  private zona:string=''

  ngOnInit(){
  
    this.cctService.zona$.subscribe(data =>{
      this.zona=data
      this.cd.detectChanges()
    })
    this.cctService.nivel$.subscribe(data =>{
      this.nivel=data
      this.cd.detectChanges()
    })

        this.items = [
      {
        label: 'Resutados de zona',
        icon: 'pi pi-home',
        // url: '/prim_2/resultados-grupo',
        command: () => {
          this.router.navigate(['/sz/resultados-zona', this.nivel , this.zona])
        },
      },
      {
        label: 'ccts de zona ' +this.zona,
        icon: 'fa-solid fa-list',
        // url: '/prim_2/listado-grupo',
        command: () => {
          this.router.navigate(['/sz/cctstByZona',this.nivel, this.zona])
        },

      },

    ];
  }

}
