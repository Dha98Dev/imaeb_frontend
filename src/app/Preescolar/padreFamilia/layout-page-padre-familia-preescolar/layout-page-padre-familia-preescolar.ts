import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-layout-page-padre-familia-preescolar',
  standalone: false,
  templateUrl: './layout-page-padre-familia-preescolar.html',
  styleUrl: './layout-page-padre-familia-preescolar.scss'
})
export class LayoutPagePadreFamiliaPreescolar {

  constructor(private router: Router) { }
  items: MenuItem[] | null = [];
  
   ngOnInit(){
     this.items = [
      {
        label: 'Inicio ',
        icon: 'pi pi-home',
        command: () => {
          this.router.navigate(['/prees_1/alumno_pree'])
        }
      },
    
      {
        icon: 'fa-solid fa-book',
        label: 'Lenguajes',
        styleClass: 'bg-sky-500 text-white',
        command: () => {
          this.router.navigate(['/prees_1/resultados_area'])
        }
      },
      {
        icon: 'fa-solid fa-calculator',
        label: 'Matematicas',
        command: () => {
          this.router.navigate(['/prees_1/resultado_materia'])
        }
      },
      {
        icon: 'fa-solid fa-flask',
        label: 'Ciencias',
        command: () => {
          this.router.navigate(['/prees_1/resultado_materia'])
        }
      },
    ];

   }
}
