import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-layout-docente-preescolar',
  standalone: false,
  templateUrl: './layout-docente-preescolar.html',
  styleUrl: './layout-docente-preescolar.scss'
})
export class LayoutDocentePreescolar {
  constructor(private router: Router ) { }
  items: MenuItem[] | null = [];
  // items:any

  ngOnInit() {
    // const nav = (url: string) => ({ command: () => this.router.navigateByUrl(url) });

   
    this.items = [
      {
        label: 'Inicio',
        icon: 'pi pi-home',
        url: '/prees_2/home_docente',
        command: () => {
          this.router.navigate(['/prees_2/home_docente'])
        },
      },
      {
        label: 'listado alumnos',
        icon: 'fa-solid fa-users',
        url: '/prees_2/listado-grupo',
        command: () => {
          this.router.navigate(['/prees_2/listado-grupo'])
        },

      },
      {
        label: 'result-area',
        icon: 'pi pi-chart-pie',
        url: '/prees_2/resultados-grupo-area',
          command: () => {
          this.router.navigate(['/prees_2/resultados-grupo-area'])
        },
      },

    ];


  }
}
