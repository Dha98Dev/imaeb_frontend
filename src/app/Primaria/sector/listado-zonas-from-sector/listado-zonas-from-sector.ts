import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GetCctInfoSErvice } from '../../../core/services/Cct/GetCctInfo.service';
import { CatalogoService } from '../../../core/services/Catalogos/catalogo.service';
import { GetEstadisticaService } from '../../../core/services/EstadisticaPromedios/getEstadistica.service';
import { firstValueFrom } from 'rxjs';
import { catalogo, Zona } from '../../../core/Interfaces/catalogo.interface';
import { DinamicTableData, TableColumn } from '../../../core/Interfaces/TablaDinamica.interface';
import { BreadCrumService } from '../../../core/services/breadCrumbs/bread-crumb-service';

@Component({
  selector: 'app-listado-zonas-from-sector',
  standalone: false,
  templateUrl: './listado-zonas-from-sector.html',
  styleUrl: './listado-zonas-from-sector.scss'
})
export class ListadoZonasFromSector {
  public nivel: string = ''
  public sector: string = ''
  private modalidad:string=''
  public zonas: Zona[] = []
  public zonaSelected: string = ''
  public dataTable: DinamicTableData = {} as DinamicTableData
  constructor(private route: ActivatedRoute, private router: Router, private observable: GetCctInfoSErvice, private catalogoService: CatalogoService, private estadisticaService: GetEstadisticaService, private cd: ChangeDetectorRef, private breadCrumbService: BreadCrumService) { }


  ngOnInit(): void {
    // Opción 2: Suscribiéndose a cambios (para parámetros dinámicos)
    this.route.paramMap.subscribe(params => {
      this.nivel = params.get('nivel') || '';
      this.sector = params.get('sector') || ''
      this.modalidad=params.get('modalidad') || ''
      this.observable.setNivel(this.nivel)
      this.observable.setSector(this.sector)
      this.observable.setModalidad(this.modalidad)
      this.getZonasFromSector()
      
    });
    this.observable.modalidad$.subscribe(data=>{this.modalidad=data})
    this.breadCrumbService.addItem({jerarquia:2, label:'Zonas nivel '+this.getNivelDescription() + ' sector '+ this.sector, urlLink:'/ss/zonasFromSector/'+this.nivel+'/'+this.sector+'/'+this.modalidad, icon:''})
  }

  getZonasFromSector() {
    let params: catalogo = {
      sector: parseInt(this.sector),
      nivelId: parseInt(this.nivel),
      modalidadId:parseInt(this.modalidad)
    }
    this.catalogoService.getCatalogo(params).subscribe({
      next: resp => {
        this.zonas = resp.zonas
        this.getPromediosZonaFromSector()

      },
      error: error => {

      }
    })
  }
  async getPromediosZonaFromSector() {
    const categorias: any[] = [];


    for (let i = 0; i < this.zonas.length; i++) {


      try {
        const resp = await firstValueFrom(
          this.estadisticaService.getPromedioEstatalByNivel({ nivelId: parseInt(this.nivel), zonaId: this.zonas[i].zonaEscolar, modalidadId:parseInt(this.modalidad) })
        );

        let data = {
          '#': i,
          sector: this.sector,
          zona: this.zonas[i].zonaEscolar,
          nivel: this.catalogoService.getNivelDescription(this.nivel),
          promedio: resp[0].promedio
        }
        categorias.push(data)

      } catch (error) {
      }
    }

    const columns: TableColumn[] = [
      { key: "#", label: '#', filterable: false },
      { key: 'zona', label: 'Zona', filterable: true },
      { key: 'nivel', label: 'Nivel', filterable: false },
      { key: 'promedio', label: 'Promedio', filterable: false, type: 'number', className: 'text-center' }
    ];

    this.dataTable = {
      columns: columns,
      data: categorias,
      globalSearchKeys: ['zona']
    }
    this.cd.detectChanges()
    // return { categorias, dataSet };
  }
  onRow(event: any) {
    this.zonaSelected = event.zona
  }
  confirmVerDetalles(event: any) {
    this.router.navigate(['/sz/resultados-zona', this.nivel, this.zonaSelected, this.modalidad])
  }

  getNivelDescription() {
    return this.catalogoService.getNivelDescription(this.nivel)
  }
  getNombreMateria(materia: number) {
    return this.catalogoService.getNombreMateria(materia)
  }

}
