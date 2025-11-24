import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { StorageService } from '../../core/services/storage/sesionStorage.service';
import { DatosCct } from '../../core/Interfaces/DatosCct.interface';
import { GetCctInfoSErvice } from '../../core/services/Cct/GetCctInfo.service';
import { CryptoJsService } from '../../core/services/CriptoJs/cryptojs.service';

@Component({
  selector: 'app-layout-page-padre-familia',
  standalone: false,
  templateUrl: './layout-page-padre-familia.html',
  styleUrl: './layout-page-padre-familia.scss'
})
export class LayoutPagePadreFamilia {
  constructor(private router: Router, private storage: StorageService, private CctService: GetCctInfoSErvice, private cd: ChangeDetectorRef, private cripto: CryptoJsService) { }
  items: MenuItem[] | null = [];
  // items:any
  public datosCct: DatosCct = {} as DatosCct

 ngOnInit() {
  let alSeleccionado = this.storage.getCriptAlSeleccionado()
  this.items = [
    {
      label: 'Inicio',
      icon: 'pi pi-home',
      command: () => {
        this.router.navigate(['/s/principal_alumno', alSeleccionado])
      }
    },
  ];

  let itemsAgregados = false; // Bandera para controlar

  this.CctService.centroTrabajo$.subscribe(data => {
    if (data && !itemsAgregados) { // Solo agregar si no se han agregado antes
      this.datosCct = data
      if (this.datosCct.idNivel != 1) {
        this.items?.push(
          {
            icon: 'fa-solid fa-flask',
            label: 'Ciencias',
            command: () => {
              this.router.navigate(['/s/resultados_area', this.cripto.Encriptar('4'), alSeleccionado])
            }
          },
          {
            icon: 'fa-solid fa-calculator',
            label: 'Matematicas',
            command: () => {
              this.router.navigate(['/s/resultados_area', this.cripto.Encriptar('3'), alSeleccionado])
            }
          },
          {
            icon: 'fa-solid fa-book',
            label: 'Lenguajes',
            styleClass: 'bg-sky-500 text-white',
            command: () => {
              this.router.navigate(['/s/resultados_area', this.cripto.Encriptar('1'), alSeleccionado])
            }
          }
          );
        itemsAgregados = true; // Marcar como agregados
      }
    }
  });
}
  agregarItes() {

  }

  ngOnDestroy() {
    this.storage.deleteAlSeleccionado()
  }
}
