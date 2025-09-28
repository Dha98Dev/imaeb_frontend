import { ChangeDetectorRef, Component, computed, EventEmitter, Input, Output, signal, SimpleChanges } from '@angular/core';
import { catalogo, CentrosTrabajo } from '../../../core/Interfaces/catalogo.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { GetCctInfoSErvice } from '../../../core/services/Cct/GetCctInfo.service';
import { CatalogoService } from '../../../core/services/Catalogos/catalogo.service';
import { GetEstadisticaService } from '../../../core/services/EstadisticaPromedios/getEstadistica.service';
import { firstValueFrom } from 'rxjs';
import { DinamicTableData, TableColumn } from '../../../core/Interfaces/TablaDinamica.interface';



@Component({
  selector: 'app-listado-ccts-by-zona',
  standalone: false,
  templateUrl: './listado-ccts-by-zona.html',
  styleUrl: './listado-ccts-by-zona.scss'
})
export class ListadoCctsByZona {
  constructor(private route: ActivatedRoute, private router:Router, private observable: GetCctInfoSErvice, private catalogoService: CatalogoService, private estadisticaService: GetEstadisticaService, private cd: ChangeDetectorRef) { }
  private centrosTrabajos: CentrosTrabajo[] = []
  public nivel: string = ''
  public zona: string = ''
  public dataTable:DinamicTableData={} as DinamicTableData
  public cctSelected:string=''
  ngOnInit(): void {
    // Opción 2: Suscribiéndose a cambios (para parámetros dinámicos)
    this.route.paramMap.subscribe(params => {
      this.nivel = params.get('nivel') || '';
      this.zona = params.get('zona') || ''
      this.observable.setNivel(this.nivel)
      this.observable.setZona(this.zona)

      this.getCentrosTrabajoZona()
    });
  }
  getCentrosTrabajoZona() {
    let params: catalogo = {
      zonaEscolar: parseInt(this.zona),
      nivelId: parseInt(this.nivel)
    }
    this.catalogoService.getCatalogo(params).subscribe({
      next: resp => {
        this.centrosTrabajos = resp.centrosTrabajo
        this.getPromediosCctZona()
      },
      error: error => {

      }
    })
  }
  async getPromediosCctZona() {
    const categorias: any[] = [];


    for (let i = 0; i < this.centrosTrabajos.length; i++) {
      const escuelaId = this.centrosTrabajos[i].id;
      const cct = this.centrosTrabajos[i].cct;

      try {
        const resp = await firstValueFrom(
          this.estadisticaService.getPromedioEstatalByNivel({ escuelaId })
        );

        let data = {
          '#':i,
          zona: this.zona,
          cct: cct,
          nivel: this.catalogoService.getNivelDescription(this.nivel),
          promedio: resp[0].promedio
        }
        categorias.push(data)

      } catch (error) {
        console.error('Error al obtener promedio para', cct, error);
      }
    }

    const columns: TableColumn[] = [
    {key:"#", label:'#', filterable:false},
  { key: 'zona', label: 'Zona', filterable: false },
  { key: 'cct', label: 'CCT', filterable: true },
  { key: 'nivel', label: 'Nivel', filterable: false },
  { key: 'promedio', label: 'Promedio', filterable: false, type: 'number', className: 'text-center' }
];

    this.dataTable={
      columns:columns,
      data:categorias,
      globalSearchKeys:['cct']
    }
    this.cd.detectChanges()
    console.log(categorias)
    // return { categorias, dataSet };
  }
    getNivelDescription() {
    return this.catalogoService.getNivelDescription(this.nivel)
  }

  onRow(event:any){
    console.log(event.cct)
    this.cctSelected=event.cct
  }

  confirmVerDetalles(event:any){
          this.router.navigate(['/prim_3/resultados-ct',this.cctSelected])

  }
}
