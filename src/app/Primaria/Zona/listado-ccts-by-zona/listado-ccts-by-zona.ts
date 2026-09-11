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
  CentrosTrabajo,
  responseCatalogo,
  Sectores,
  Zona,
} from '../../../core/Interfaces/catalogo.interface';
import { DinamicTableData, TableColumn } from '../../../core/Interfaces/TablaDinamica.interface';
import { BreadCrumService } from '../../../core/services/breadCrumbs/bread-crumb-service';
import { CryptoJsService } from '../../../core/services/CriptoJs/cryptojs.service';
import { getPromedioClass } from '../../../core/utilsFunctions/getPromedioClass';

@Component({
  selector: 'app-listado-ccts-by-zona',
  standalone: false,
  templateUrl: './listado-ccts-by-zona.html',
  styleUrl: './listado-ccts-by-zona.scss',
  providers: [ConfirmationService],
})
export class ListadoCctsByZona {
  public nivel: string = '';
  public zona: string = '';
  public modalidad: string = '';

  public sector: number = 0;
  public sectorId: number = 0;
  public zonaId: number = 0;

  public centrosTrabajos: CentrosTrabajo[] = [];
  public dataTable: DinamicTableData = {} as DinamicTableData;
  public cctSelected: CctListado | null = null;

  public loader: boolean = false;

  public ciclos: CatalogoCiclos[] = [];
  public examenes: CatalogoExamen[] = [];
  public cicloSelected: number = 0;
  public examenSelected: number = 0;
  public examenActual?: CatalogoExamen;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private observable: GetCctInfoSErvice,
    private catalogoService: CatalogoService,
    private estadisticaService: GetEstadisticaService,
    private cd: ChangeDetectorRef,
    private breadCrumbService: BreadCrumService,
    private crypto: CryptoJsService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      try {
        this.nivel = atob(params.get('nivel') || '');
        this.zona = atob(params.get('zona') || '');
        this.modalidad = atob(params.get('modalidad') || '');

        if (!this.nivel || !this.zona || !this.modalidad) return;

        this.observable.setNivel(this.nivel);
        this.observable.setZona(this.zona);
        this.observable.setModalidad(this.modalidad);

        this.breadCrumbService.addItem({
          jerarquia: 3,
          label: 'CCT zona ' + this.zona,
          urlLink:
            '/sz/cctstByZona/' +
            btoa(this.nivel) +
            '/' +
            btoa(this.zona) +
            '/' +
            btoa(this.modalidad),
          icon: '',
        });

        this.inicializar();
      } catch (error) {
        console.error('Error obteniendo parámetros', error);
      }
    });
  }

  inicializar(): void {
    this.loader = true;
    this.limpiarDatos();

    forkJoin({
      ciclos: this.catalogoService.getCiclos(),
      examenes: this.catalogoService.getExamenes(),
    }).subscribe({
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
          this.cd.markForCheck();
          return;
        }

        this.resolverZona();
      },
      error: (error) => {
        console.error('Error inicializando listado de CCT', error);
        this.loader = false;
        this.cd.markForCheck();
      },
    });
  }

  limpiarDatos(): void {
    this.sector = 0;
    this.sectorId = 0;
    this.zonaId = 0;
    this.centrosTrabajos = [];
    this.cctSelected = null;
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

  resolverZona(): void {
    this.catalogoService
      .getCatalogo({
        nivelId: this.nivelId,
        modalidadId: this.modalidadId,
      })
      .pipe(
        switchMap((resp: responseCatalogo) => {
          const sectores = resp.sectores ?? [];

          if (!sectores.length) return of(undefined);

          const requests = sectores.map((sector) =>
            this.catalogoService
              .getCatalogo({
                nivelId: this.nivelId,
                modalidadId: this.modalidadId,
                sector: sector.numero,
              })
              .pipe(
                map((respSector: responseCatalogo) => {
                  const zona = (respSector.zonas ?? []).find(
                    (item) => item.numero === this.zonaNumero,
                  );

                  if (!zona) return undefined;

                  return {
                    sector,
                    zona,
                  };
                }),
                catchError(() => of(undefined)),
              ),
          );

          return forkJoin(requests).pipe(
            map((resultados) => resultados.find((item) => item !== undefined)),
          );
        }),
        catchError((error) => {
          console.error('Error resolviendo zona', error);
          return of(undefined);
        }),
      )
      .subscribe({
        next: (resultado) => {
          if (!resultado) {
            console.error('No se encontró la zona', {
              zona: this.zonaNumero,
              nivelId: this.nivelId,
              modalidadId: this.modalidadId,
            });

            this.loader = false;
            this.cd.markForCheck();
            return;
          }

          this.sector = resultado.sector.numero;
          this.sectorId = resultado.sector.id;
          this.zonaId = resultado.zona.id;

          this.getCentrosTrabajoZona();
        },
      });
  }

  getCentrosTrabajoZona(): void {
    this.catalogoService
      .getCatalogo({
        nivelId: this.nivelId,
        modalidadId: this.modalidadId,
        sector: this.sector,
        zonaEscolar: this.zonaNumero,
      })
      .pipe(
        map((resp: responseCatalogo) => resp.centrosTrabajo ?? []),
        catchError((error) => {
          console.error('Error obteniendo centros de trabajo', error);
          return of<CentrosTrabajo[]>([]);
        }),
      )
      .subscribe({
        next: (centros) => {
          this.centrosTrabajos = centros;
          this.getPromediosCctZona();
        },
      });
  }

  getPromediosCctZona(): void {
    if (!this.centrosTrabajos.length) {
      this.dataTable = {
        columns: this.getColumns(),
        data: [],
        globalSearchKeys: ['cct', 'nombre'],
      };

      this.loader = false;
      this.cd.markForCheck();
      return;
    }

    const requests = this.centrosTrabajos.map((centro, index) =>
      this.estadisticaService
        .getPromedioEstatalByNivel({
          examenId: this.examenSelected,
          nivelId: this.nivelId,
          modalidadId: this.modalidadId,
          sectorId: this.sectorId,
          zonaId: this.zonaId,
          escuelaId: centro.id,
        })
        .pipe(
          map(
            (resp): CctListado => ({
              '#': index + 1,
              escuelaId: centro.id,
              zonaId: this.zonaId,
              sectorId: this.sectorId,
              zona: this.zonaNumero,
              cct: centro.cct,
              nombre: centro.nombre ?? '',
              turno: centro.turno ?? '',
              nivel: this.getNivelDescription().toUpperCase(),
              porcentaje: resp?.[0]?.porcentaje ?? 0,
            }),
          ),
          catchError((error) => {
            console.error('Error obteniendo resultado de CCT ' + centro.cct, error);

            return of<CctListado>({
              '#': index + 1,
              escuelaId: centro.id,
              zonaId: this.zonaId,
              sectorId: this.sectorId,
              zona: this.zonaNumero,
              cct: centro.cct,
              nombre: centro.nombre ?? '',
              turno: centro.turno ?? '',
              nivel: this.getNivelDescription().toUpperCase(),
              porcentaje: 0,
            });
          }),
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
            globalSearchKeys: ['cct', 'nombre'],
          };
        },
        error: (error) => {
          console.error('Error obteniendo resultados de CCT', error);

          this.dataTable = {
            columns: this.getColumns(),
            data: [],
            globalSearchKeys: ['cct', 'nombre'],
          };
        },
      });
  }

  getColumns(): TableColumn[] {
    return [
      {
        key: '#',
        label: '#',
        filterable: false,
      },
      {
        key: 'cct',
        label: 'CCT',
        filterable: true,
        type: 'text',
      },
      {
        key: 'nombre',
        label: 'Centro de trabajo',
        filterable: true,
        type: 'text',
      },
      {
        key: 'turno',
        label: 'Turno',
        filterable: false,
        type: 'text',
      },
      {
        key: 'zona',
        label: 'Zona',
        filterable: false,
        type: 'number',
      },
      {
        key: 'nivel',
        label: 'Nivel',
        filterable: false,
        type: 'text',
      },
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

  onRow(event: any): void {
    this.cctSelected = event;

    this.confirmationService.confirm({
      header: 'Consultar resultados',
      message:
        '¿Deseas consultar los resultados del centro de trabajo ' + this.cctSelected!.cct + '?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, consultar',
      rejectLabel: 'Cancelar',
      accept: () => this.confirmVerDetalles(),
    });
  }

  confirmVerDetalles(): void {
    if (!this.cctSelected) return;

    this.router.navigate(['/prim_3/resultados-ct', this.crypto.Encriptar(this.cctSelected.cct)]);
  }

  get nivelId(): number {
    return Number(this.nivel);
  }

  get modalidadId(): number {
    return Number(this.modalidad);
  }

  get zonaNumero(): number {
    return Number(this.zona);
  }

  getNivelDescription(): string {
    return this.catalogoService.getNivelDescription(this.nivel);
  }
}

export interface CctListado {
  '#': number;
  escuelaId: number;
  sectorId: number;
  zonaId: number;
  zona: number;
  cct: string;
  nombre: string;
  turno: string;
  nivel: string;
  porcentaje: number;
}
