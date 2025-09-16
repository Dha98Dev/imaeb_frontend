import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-layout-page-dp',
  standalone: false,
  templateUrl: './layout-page-dp.html',
  styleUrl: './layout-page-dp.scss'
})
export class LayoutPageDP {
  constructor(private router: Router) { }
  items: MenuItem[] | null = [];
  // items:any

  ngOnInit() {
    // const nav = (url: string) => ({ command: () => this.router.navigateByUrl(url) });

    this.items = [
      {
        label: 'Inicio',
        icon: 'pi pi-home',
        url: '/prim_2/resultados-grupo',
        command: () => {
          this.router.navigate(['/prim_2/resultados-grupo'])
        },
      },
      {
        label: 'listado alumnos',
        icon: 'fa-solid fa-users',
        url: '/prim_2/listado-grupo',
        command: () => {
          this.router.navigate(['/prim_2/listado-grupo'])
        },

      },
      {
        label: 'result-area',
        icon: 'pi pi-home',
        url: '/prim_2/resultados-grupo-area',
          command: () => {
          this.router.navigate(['/prim_2/resultados-grupo-area'])
        },
      },

    ];

    // this.itemsBreadCrum=this.bread.getaDataBreadCrumbs()
    //   this.router.events
    //   .pipe(filter(event => event instanceof NavigationEnd))
    //   .subscribe(() => {
    //     setTimeout(() => {
    //       this.itemsBreadCrum = this.bread.getaDataBreadCrumbs();
    //       console.log(this.itemsBreadCrum)
    //     }, 1000);
    //   });
  }
}
