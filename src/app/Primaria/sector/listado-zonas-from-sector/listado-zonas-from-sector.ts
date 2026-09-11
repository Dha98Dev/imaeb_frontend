import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { catchError, finalize, forkJoin, map, of, switchMap } from 'rxjs';

import { GetCctInfoSErvice } from '../../../core/services/Cct/GetCctInfo.service';
import { CatalogoService } from '../../../core/services/Catalogos/catalogo.service';
import { GetEstadisticaService } from '../../../core/services/EstadisticaPromedios/getEstadistica.service';

import {
  CatalogoCiclos,
  CatalogoExamen,
  responseCatalogo,
  Sectores,
  Zona,
} from '../../../core/Interfaces/catalogo.interface';

import { DinamicTableData, TableColumn } from '../../../core/Interfaces/TablaDinamica.interface';

import { BreadCrumService } from '../../../core/services/breadCrumbs/bread-crumb-service';
import { getPromedioClass } from '../../../core/utilsFunctions/getPromedioClass';

@Component({
  selector: 'app-listado-zonas-from-sector',
  standalone: false,
  templateUrl: './listado-zonas-from-sector.html',
  styleUrl: './listado-zonas-from-sector.scss',
  providers: [ConfirmationService],
})
export class ListadoZonasFromSector {
  public nivel: string = '';
  public sector: string = '';
  public modalidad: string = '';
  public sectorId: number = 0;
  public zonaSelected: any
  public zonas: Zona[] = [];
  public loader: boolean = false;
  public ciclos: CatalogoCiclos[] = [];
  public examenes: CatalogoExamen[] = [];
  public cicloSelected: number = 0;
  public examenSelected: number = 0;
  public examenActual?: CatalogoExamen;
  public dataTable: DinamicTableData = {} as DinamicTableData;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private observable: GetCctInfoSErvice,
    private catalogoService: CatalogoService,
    private estadisticaService: GetEstadisticaService,
    private cd: ChangeDetectorRef,
    private breadCrumbService: BreadCrumService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      try {
        this.nivel = atob(params.get('nivel') || '');
        this.sector = atob(params.get('sector') || '');
        this.modalidad = atob(params.get('modalidad') || '');

        if (!this.nivel || !this.sector || !this.modalidad) return;

        this.observable.setNivel(this.nivel);
        this.observable.setSector(this.sector);
        this.observable.setModalidad(this.modalidad);

        this.breadCrumbService.addItem({
          jerarquia: 2,
          label: 'Zonas nivel ' + this.getNivelDescription() + ' sector ' + this.sector,
          urlLink:
            '/ss/zonasFromSector/' +
            btoa(this.nivel) +
            '/' +
            btoa(this.sector) +
            '/' +
            btoa(this.modalidad),
          icon: '',
        });

        this.inicializar();
      } catch (error) {
        console.error('Error obteniendo parámetros de zonas', error);
      }
    });
  }

  inicializar(): void {
    this.loader = true;
    this.limpiarDatos();

    forkJoin({
      ciclos: this.catalogoService.getCiclos(),
      examenes: this.catalogoService.getExamenes(),
    })
      .pipe(finalize(() => this.cd.markForCheck()))
      .subscribe({
        next: ({ ciclos, examenes }) => {
          this.ciclos = ciclos ?? [];
          this.examenes = examenes ?? [];

          this.seleccionarCicloActual();
          this.seleccionarExamen();

          if (!this.examenSelected) {
            console.error('No existe examen para el nivel seleccionado', {
              nivelId: this.nivelId,
              cicloId: this.cicloSelected,
            });

            this.loader = false;
            return;
          }

          this.obtenerSector();
        },
        error: (error) => {
          console.error('Error inicializando listado de zonas', error);
          this.loader = false;
        },
      });
  }

  limpiarDatos(): void {
    this.sectorId = 0;
    this.zonaSelected = '';
    this.zonas = [];
    this.dataTable = {} as DinamicTableData;
  }

  seleccionarCicloActual(): void {
    if (!this.ciclos.length) {
      this.cicloSelected = 0;
      return;
    }

    const ciclo = [...this.ciclos].sort((a, b) => b.anio - a.anio)[0];
    this.cicloSelected = ciclo.id;
  }

  seleccionarExamen(): void {
    const examen = this.examenes.find(
      (item) => item.cicloId === this.cicloSelected && item.nivelId === this.nivelId,
    );

    if (!examen) {
      this.examenSelected = 0;
      this.examenActual = undefined;
      return;
    }

    this.examenSelected = examen.id;
    this.examenActual = examen;
  }

  obtenerSector(): void {
    this.catalogoService
      .getCatalogo({
        nivelId: this.nivelId,
        modalidadId: this.modalidadId,
      })
      .pipe(
        map((resp: responseCatalogo) => {
          const sectores = resp.sectores ?? [];
          return sectores.find((sector) => sector.numero === this.sectorNumero);
        }),
        switchMap((sector: Sectores | undefined) => {
          if (!sector) {
            console.error('No se encontró el sector');
            return of([]);
          }

          this.sectorId = sector.id;

          return this.catalogoService
            .getCatalogo({
              nivelId: this.nivelId,
              modalidadId: this.modalidadId,
              sector: sector.numero,
            })
            .pipe(map((resp: responseCatalogo) => resp.zonas ?? []));
        }),
        catchError((error) => {
          console.error('Error obteniendo zonas del sector', error);
          return of<Zona[]>([]);
        }),
      )
      .subscribe({
        next: (zonas) => {
          this.zonas = zonas;
          this.getPromediosZonaFromSector();
        },
        error: (error) => {
          console.error('Error procesando zonas', error);
          this.loader = false;
        },
      });
  }

  getPromediosZonaFromSector(): void {
    if (!this.zonas.length) {
      this.dataTable = {
        columns: this.getColumns(),
        data: [],
        globalSearchKeys: ['zona'],
      };

      this.loader = false;
      this.cd.markForCheck();
      return;
    }

    const requests = this.zonas.map((zona, index) =>
      this.estadisticaService
        .getPromedioEstatalByNivel({
          examenId: this.examenSelected,
          nivelId: this.nivelId,
          modalidadId: this.modalidadId,
          sectorId: this.sectorId,
          zonaId: zona.id,
        })
        .pipe(
          map((resp) => ({
            '#': index + 1,
            zonaId: zona.id,
            sector: this.sectorNumero,
            zona: zona.numero,
            nivel: this.getNivelDescription().toUpperCase(),
            porcentaje: resp?.[0]?.porcentaje ?? 0,
          })),
          catchError(() =>
            of({
              '#': index + 1,
              zonaId: zona.id,
              sector: this.sectorNumero,
              zona: zona.numero,
              nivel: this.getNivelDescription().toUpperCase(),
              porcentaje: 0,
            }),
          ),
        ),
    );

    forkJoin(requests)
      .pipe(
        finalize(() => {
          this.loader = false;
          this.cd.markForCheck();
        }),
      )
      .subscribe({
        next: (data) => {
          this.dataTable = {
            columns: this.getColumns(),
            data,
            globalSearchKeys: ['zona'],
          };
        },
      });
  }

  getColumns(): TableColumn[] {
    return [
      { key: '#', label: '#', filterable: false },
      { key: 'zona', label: 'Zona', filterable: true, type: 'number' },
      { key: 'nivel', label: 'Nivel', filterable: false, type: 'text' },
      {
        key: 'porcentaje',
        label: 'Resultado',
        filterable: false,
        type: 'number',
        className: 'text-center',
        cellClass: (value) => getPromedioClass(value),
      },
    ];
  }

  onRow(event: any) {
    this.zonaSelected = event;

    this.confirmationService.confirm({
      header: 'Consultar resultados',
      message: '¿Deseas consultar los resultados de la zona ' + this.zonaSelected.zona + '?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, consultar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.confirmVerDetalles();
      },
    });
  }

  confirmVerDetalles() {
    this.router.navigate([
      '/sz/resultados-zona',
      btoa(this.nivel),
      btoa(this.zonaSelected.zona),
      btoa(this.modalidad),
    ]);
  }

  get nivelId(): number {
    return Number(this.nivel);
  }

  get modalidadId(): number {
    return Number(this.modalidad);
  }

  get sectorNumero(): number {
    return Number(this.sector);
  }

  getNivelDescription(): string {
    return this.catalogoService.getNivelDescription(this.nivel);
  }
}
