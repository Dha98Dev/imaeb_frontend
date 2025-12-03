import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { GetCctInfoSErvice } from '../../../core/services/Cct/GetCctInfo.service';
import { datosCct } from '../../../core/Interfaces/listadoAlumno.interface';
import { CryptoJsService } from '../../../core/services/CriptoJs/cryptojs.service';

@Component({
  selector: 'app-layout-page-dp',
  standalone: false,
  templateUrl: './layout-page-dp.html',
  styleUrl: './layout-page-dp.scss'
})
export class LayoutPageDP {
  constructor(private router: Router, private cctService: GetCctInfoSErvice, private cd: ChangeDetectorRef, private crypto:CryptoJsService) { }
  items: MenuItem[] | null = [];
  private grupo: string = ''
  private cct: string = ''
  // items:any
  public datosCct: datosCct = {} as datosCct
  ngOnInit() {
    // const nav = (url: string) => ({ command: () => this.router.navigateByUrl(url) });

    this.items = [
      {
        label: 'Inicio',
        icon: 'pi pi-home',
        url: '/prim_2/resultados-grupo',
        command: () => {
          this.router.navigate(['/prim_2/resultados-grupo', this.crypto.Encriptar(this.cct), this.grupo])
        },
      },
      {
        label: 'listado alumnos',
        icon: 'fa-solid fa-users',
        url: '/prim_2/listado-grupo',
        command: () => {
          this.router.navigate(['/prim_2/listado-grupo',  this.crypto.Encriptar(this.cct), this.grupo])
        },

      },

    ];

    this.cctService.cct$.subscribe(cct => {
      this.cct = cct
      this.cd.detectChanges();
    })
    this.cctService.grupo$.subscribe(grupo => {
      this.grupo = grupo
      this.cd.detectChanges();
    })

this.cctService.centroTrabajo$.subscribe(data => {
  if (data) {
    this.datosCct = data;

    if (this.datosCct.nivel !== 'Preescolar') {
      this.cd.detectChanges();

      // Verifica si ya existe un ítem con ese label
      const existe = this.items?.some(item => item.label === 'result-area');

      if (!existe) {
        this.items?.push({
          label: 'resultado-area',
          icon: 'pi pi-pen-to-square',
          url: '/prim_2/resultados-grupo-area',
          command: () => {
            this.router.navigate(['/prim_2/resultados-grupo-area', this.crypto.Encriptar(this.cct), this.grupo]);
          },
        });
      }
    }
  }
});

}
}

// this.itemsBreadCrum=this.bread.getaDataBreadCrumbs()
//   this.router.events
//   .pipe(filter(event => event instanceof NavigationEnd))
//   .subscribe(() => {
//     setTimeout(() => {
//       this.itemsBreadCrum = this.bread.getaDataBreadCrumbs();
//     }, 1000);
//   });