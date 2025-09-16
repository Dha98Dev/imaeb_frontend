import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-layout-director-preescolar',
  standalone: false,
  templateUrl: './layout-director-preescolar.html',
  styleUrl: './layout-director-preescolar.scss'
})
export class LayoutDirectorPreescolar {
  constructor(private router: Router ) { }
  items: MenuItem[] | null = [];
  // items:any

  ngOnInit() {
    // const nav = (url: string) => ({ command: () => this.router.navigateByUrl(url) });

    this.items = [
      {
        label: 'Inicio',
        icon: 'pi pi-home',
        url: '/prim_3/home_director',
        command: () => {
          this.router.navigate(['/prim_3/home_director'])
        },
      },
      {
        label: ' Grupo A',
        icon: 'fa-solid fa-users',
        url: '/prim_2/listado-grupo',
        command: () => {
          this.router.navigate(['/prim_2/listado-grupo'])
        },

      },
      {
        label: 'Grupo B',
        icon: 'pi pi-home',
        url: '/prim_2/listado-grupo',
          command: () => {
          this.router.navigate(['/prim_2/listado-grupo'])
        },
      },

    ];

  }
}
