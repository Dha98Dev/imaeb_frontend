import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { StorageService } from '../../core/services/storage/sesionStorage.service';

@Component({
  selector: 'app-layout-page-padre-familia',
  standalone: false,
  templateUrl: './layout-page-padre-familia.html',
  styleUrl: './layout-page-padre-familia.scss'
})
export class LayoutPagePadreFamilia {
  constructor(private router: Router, private storage:StorageService) { }
  items: MenuItem[] | null = [];
  // items:any

  ngOnInit() {
    // const nav = (url: string) => ({ command: () => this.router.navigateByUrl(url) });
    let alSeleccionado=this.storage.getCriptAlSeleccionado()
    this.items = [
      {
        label: 'Inicio ',
        icon: 'pi pi-home',
        command: () => {
          console.log('redireccionando')
          this.router.navigate(['/s/principal_alumno', alSeleccionado])
        }
      },
      {
        label: 'Mis Resultados',
        icon: 'pi pi-chart-line',
        command: () => {
          console.log('redireccionando')
          this.router.navigate(['/s/mis_resultados', alSeleccionado])
        }
      },
      {
        icon: 'fa-solid fa-book',
        label: 'Lenguajes',
        styleClass: 'bg-sky-500 text-white',
        command: () => {
          this.router.navigate(['/s/resultados_area', 'lenguaje',alSeleccionado])
        }
      },
      {
        icon: 'fa-solid fa-calculator',
        label: 'Matematicas',
        command: () => {
          this.router.navigate(['/s/resultados_area', 'matematicas',alSeleccionado])
        }
      },
      {
        icon: 'fa-solid fa-flask',
        label: 'Ciencias',
        command: () => {
          this.router.navigate(['/s/resultados_area', 'ciencias',alSeleccionado])
        }
      },
    ];

  }

  ngOnDestroy(){
    this.storage.deleteAlSeleccionado()
  }
}
