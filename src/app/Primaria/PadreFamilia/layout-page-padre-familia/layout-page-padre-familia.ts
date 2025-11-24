import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-layout-page-padre-familia',
  standalone: false,
  templateUrl: './layout-page-padre-familia.html',
  styleUrl: './layout-page-padre-familia.scss'
})
export class LayoutPagePadreFamilia {
  constructor(private router: Router) { }
  items: MenuItem[] | null = [];
  // items:any

  ngOnInit() {
    // const nav = (url: string) => ({ command: () => this.router.navigateByUrl(url) });

    this.items = [
      {
        label: 'Inicio ',
        icon: 'pi pi-home',
        command: () => {
          this.router.navigate(['/prim_1/principal_alumno'])
        }
      },
      {
        label: 'Mis Resultados',
        icon: 'pi pi-chart-line',
        command: () => {
          this.router.navigate(['/prim_1/mis_resultados'])
        }
      },
      {
        icon: 'fa-solid fa-book',
        label: 'Lenguajes',
        styleClass: 'bg-sky-500 text-white',
        command: () => {
          this.router.navigate(['/prim_1/resultados_area'])
        }
      },
      {
        icon: 'fa-solid fa-calculator',
        label: 'Matematicas',
        command: () => {
          this.router.navigate(['/prim_1/resultados_area'])
        }
      },
      {
        icon: 'fa-solid fa-flask',
        label: 'Ciencias',
        command: () => {
          this.router.navigate(['/prim_1/resultados_area'])
        }
      },
    ];

  }
}
