import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { catchError, finalize, forkJoin, map, Observable, of, switchMap } from 'rxjs';

import { BreadCrumService } from '../../../core/services/breadCrumbs/bread-crumb-service';
import { CryptoJsService } from '../../../core/services/CriptoJs/cryptojs.service';
import { CatalogoService } from '../../../core/services/Catalogos/catalogo.service';
import { GetEstadisticaService } from '../../../core/services/EstadisticaPromedios/getEstadistica.service';

import {
  CatalogoCiclos,
  CatalogoExamen,
  CentrosTrabajo,
  EstructuraExamen,
  MateriaEstructuraExamen,
  responseCatalogo,
  Sectores,
  Zona,
} from '../../../core/Interfaces/catalogo.interface';

import {
  dataModalidad,
  resultadosModalidad,
  SectoresModalidad,
  zonasModalidad,
} from '../../../core/Interfaces/ResultadosModalidad.interface';

import { DinamicTableData, TableColumn } from '../../../core/Interfaces/TablaDinamica.interface';

import { getPromedioClass } from '../../../core/utilsFunctions/getPromedioClass';

@Component({
  selector: 'app-principal-modalidad',
  standalone: false,
  templateUrl: './principal-modalidad.html',
  styleUrl: './principal-modalidad.scss',
})
export class PrincipalModalidad {
  constructor(
    private route: ActivatedRoute,
    private breadCrumbService: BreadCrumService,
    private crypto: CryptoJsService,
    private catalogoService: CatalogoService,
    private estadisticaService: GetEstadisticaService,
    private cd: ChangeDetectorRef,
  ) {}

  public modalidad: string = '';
  public nivel: string = '';

  public loader: boolean = false;

  public ciclos: CatalogoCiclos[] = [];
  public examenes: CatalogoExamen[] = [];

  public cicloSelected: number = 0;
  public examenSelected: number = 0;

  public examenActual?: CatalogoExamen;

  public promedioNivel: number = 0;
  public promedioModalidad: number = 0;

  public promediosMaterias: PromedioMateriaModalidad[] = [];

  public resultados: resultadosModalidad[] = [];

  public dataModalidad: dataModalidad = {} as dataModalidad;

  public tableDinamica: DinamicTableData = {} as DinamicTableData;

  private idModalidad: string = '';

  private promedioSectorCache = new Map<number, number>();
  private promedioZonaCache = new Map<number, number>();
  private promedioCctCache = new Map<number, number>();
  protected estructuraExamen?: EstructuraExamen;
  protected materiasExamen: MateriaEstructuraExamen[] = [];

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      try {
        this.idModalidad = atob(params.get('modalidad') || '');
        this.nivel = atob(params.get('nivel') || '');

        this.modalidad =
          this.crypto.Desencriptar(this.crypto.fromBase64Url(params.get('mod_des') || '')) || '';

        if (!this.idModalidad || !this.nivel) {
          return;
        }

        this.breadCrumbService.addItem({
          jerarquia: 2,
          label: this.getnivelDescription() + ' ' + this.modalidad,
          urlLink:
            '/m/resultadosModalidad/' +
            params.get('nivel') +
            '/' +
            params.get('modalidad') +
            '/' +
            params.get('mod_des'),
          icon: '',
        });

        this.inicializar();
      } catch (error) {
        console.error('Error obteniendo parámetros de modalidad', error);
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
      .pipe(
        finalize(() => {
          this.cd.markForCheck();
        }),
      )
      .subscribe({
        next: ({ ciclos, examenes }) => {
          this.ciclos = ciclos ?? [];

          this.examenes = examenes ?? [];

          this.seleccionarCicloActual();

          this.seleccionarExamen();

          if (!this.examenSelected) {
            console.warn('No existe examen para el nivel y ciclo seleccionados', {
              cicloId: this.cicloSelected,
              nivelId: this.nivelId,
            });

            this.loader = false;

            return;
          }

          this.cargarEstructuraExamen();
        },

        error: (error) => {
          console.error('Error inicializando modalidad', error);

          this.loader = false;

          this.cd.markForCheck();
        },
      });
  }
  limpiarDatos(): void {
    this.promedioNivel = 0;
    this.promedioModalidad = 0;
    this.promediosMaterias = [];
    this.resultados = [];
    this.dataModalidad = {} as dataModalidad;
    this.tableDinamica = {} as DinamicTableData;
    this.promedioSectorCache.clear();
    this.promedioZonaCache.clear();
    this.promedioCctCache.clear();
    this.estructuraExamen = undefined;
    this.materiasExamen = [];
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

  cargarPromediosIniciales(): void {
    forkJoin({
      promedioNivel: this.estadisticaService
        .getPromedioEstatalByNivel({
          examenId: this.examenSelected,

          nivelId: this.nivelId,
        })
        .pipe(
          map((resp) => resp?.[0]?.porcentaje ?? 0),

          catchError((error) => {
            console.error('Error obteniendo resultado del nivel', error);

            return of(0);
          }),
        ),

      promedioModalidad: this.estadisticaService
        .getPromedioEstatalByNivel({
          examenId: this.examenSelected,

          nivelId: this.nivelId,

          modalidadId: this.modalidadId,
        })
        .pipe(
          map((resp) => resp?.[0]?.porcentaje ?? 0),

          catchError((error) => {
            console.error('Error obteniendo resultado de modalidad', error);

            return of(0);
          }),
        ),
    }).subscribe({
      next: ({ promedioNivel, promedioModalidad }) => {
        this.promedioNivel = promedioNivel;

        this.promedioModalidad = promedioModalidad;

        this.cargarPromediosMaterias();

        this.cargarEstructura();
      },

      error: (error) => {
        console.error('Error obteniendo promedios iniciales', error);

        this.loader = false;
      },
    });
  }

  cargarPromediosMaterias(): void {
    if (!this.materiasExamen.length) {
      this.promediosMaterias = [];

      this.cd.markForCheck();

      return;
    }

    const requests = this.materiasExamen.map((materia) =>
      this.estadisticaService
        .getPromedioEstatalByNivel({
          examenId: this.examenSelected,

          nivelId: this.nivelId,

          modalidadId: this.modalidadId,

          materiaId: materia.materiaId,
        })
        .pipe(
          map(
            (resp): PromedioMateriaModalidad => ({
              materiaId: materia.materiaId,

              materia: materia.descripcion,

              porcentaje: resp?.[0]?.porcentaje ?? 0,
            }),
          ),

          catchError((error) => {
            console.error(`Error obteniendo resultado de ${materia.descripcion}`, error);

            return of({
              materiaId: materia.materiaId,

              materia: materia.descripcion,

              porcentaje: 0,
            });
          }),
        ),
    );

    forkJoin(requests).subscribe({
      next: (resp) => {
        this.promediosMaterias = resp;

        this.cd.markForCheck();
      },

      error: (error) => {
        console.error('Error obteniendo promedios por materia', error);

        this.promediosMaterias = [];
      },
    });
  }
  cargarEstructuraExamen(): void {
    this.catalogoService
      .getEstructuraExamen(this.examenSelected)
      .pipe(
        catchError((error) => {
          console.error('Error obteniendo estructura del examen', error);

          return of(undefined);
        }),
      )
      .subscribe({
        next: (resp) => {
          if (!resp) {
            this.loader = false;

            return;
          }

          this.estructuraExamen = resp;

          this.materiasExamen = resp.materias ?? [];

          this.cargarPromediosIniciales();
        },
      });
  }

  cargarEstructura(): void {
    this.catalogoService
      .getCatalogo({
        nivelId: this.nivelId,
        modalidadId: this.modalidadId,
      })
      .pipe(
        switchMap((resp: responseCatalogo): Observable<SectoresModalidad[]> => {
          const sectores = resp.sectores ?? [];

          if (!sectores.length) {
            return of([]);
          }

          const requests: Observable<SectoresModalidad>[] = sectores.map((sector) =>
            this.cargarSector(sector),
          );

          return forkJoin(requests);
        }),

        catchError((error) => {
          console.error('Error obteniendo sectores', error);

          return of<SectoresModalidad[]>([]);
        }),
      )
      .subscribe({
        next: (sectores) => {
          this.dataModalidad = {
            nivel: this.getnivelDescription(),
            modalidad: this.modalidad,
            sectores,
          };

          this.cargarResultadosPromedios();
        },

        error: (error) => {
          console.error('Error procesando estructura', error);

          this.loader = false;
        },
      });
  }

  cargarSector(sector: Sectores): Observable<SectoresModalidad> {
    return this.catalogoService
      .getCatalogo({
        nivelId: this.nivelId,

        modalidadId: this.modalidadId,

        sector: sector.numero,
      })
      .pipe(
        switchMap((resp: responseCatalogo): Observable<SectoresModalidad> => {
          const zonas = resp.zonas ?? [];

          if (!zonas.length) {
            return of({
              sectorId: sector.id,
              sector: sector.numero,
              zonas: [],
            });
          }

          const requests: Observable<zonasModalidad>[] = zonas.map((zona) =>
            this.cargarZona(sector, zona),
          );

          return forkJoin(requests).pipe(
            map(
              (zonasResultado): SectoresModalidad => ({
                sectorId: sector.id,
                sector: sector.numero,
                zonas: zonasResultado,
              }),
            ),
          );
        }),

        catchError((error) => {
          console.error(`Error obteniendo sector ${sector.numero}`, error);

          return of({
            sectorId: sector.id,
            sector: sector.numero,
            zonas: [],
          });
        }),
      );
  }

  cargarZona(sector: Sectores, zona: Zona): Observable<zonasModalidad> {
    return this.catalogoService
      .getCatalogo({
        nivelId: this.nivelId,

        modalidadId: this.modalidadId,

        sector: sector.numero,

        zonaEscolar: zona.numero,
      })
      .pipe(
        map(
          (resp: responseCatalogo): zonasModalidad => ({
            zonaId: zona.id,

            zona: zona.numero,

            cct: resp.centrosTrabajo ?? [],
          }),
        ),

        catchError((error) => {
          console.error(`Error obteniendo zona ${zona.numero}`, error);

          return of({
            zonaId: zona.id,
            zona: zona.numero,
            cct: [],
          });
        }),
      );
  }

  cargarResultadosPromedios(): void {
    const sectores = this.dataModalidad?.sectores ?? [];

    if (!sectores.length) {
      this.resultados = [];

      this.crearTabla();

      this.loader = false;

      this.cd.markForCheck();

      return;
    }

    const sectoresUnicos = Array.from(
      new Map(sectores.map((sector) => [sector.sectorId, sector])).values(),
    );

    const zonasUnicas = Array.from(
      new Map(
        sectores.flatMap((sector) => sector.zonas.map((zona) => [zona.zonaId, zona])),
      ).values(),
    );

    const centrosUnicos = Array.from(
      new Map(
        sectores.flatMap((sector) =>
          sector.zonas.flatMap((zona) => zona.cct.map((centro) => [centro.id, centro])),
        ),
      ).values(),
    );

    const sectoresRequest$ = sectoresUnicos.length
      ? forkJoin(sectoresUnicos.map((sector) => this.getPromedioSector(sector)))
      : of([]);

    const zonasRequest$ = zonasUnicas.length
      ? forkJoin(zonasUnicas.map((zona) => this.getPromedioZona(zona)))
      : of([]);

    const cctRequest$ = centrosUnicos.length
      ? forkJoin(centrosUnicos.map((centro) => this.getPromedioCct(centro)))
      : of([]);

    forkJoin({
      sectores: sectoresRequest$,

      zonas: zonasRequest$,

      ccts: cctRequest$,
    })
      .pipe(
        finalize(() => {
          this.loader = false;

          this.cd.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.construirResultados();

          this.crearTabla();
        },

        error: (error) => {
          console.error('Error obteniendo promedios', error);

          this.resultados = [];

          this.crearTabla();
        },
      });
  }

  getPromedioSector(sector: SectoresModalidad): Observable<number> {
    const cache = this.promedioSectorCache.get(sector.sectorId);

    if (cache !== undefined) {
      return of(cache);
    }

    return this.estadisticaService
      .getPromedioEstatalByNivel({
        examenId: this.examenSelected,

        nivelId: this.nivelId,

        modalidadId: this.modalidadId,

        sectorId: sector.sectorId,
      })
      .pipe(
        map((resp) => {
          const porcentaje = resp?.[0]?.porcentaje ?? 0;

          this.promedioSectorCache.set(sector.sectorId, porcentaje);

          return porcentaje;
        }),

        catchError((error) => {
          console.error(`Error obteniendo resultado del sector ${sector.sector}`, error);

          this.promedioSectorCache.set(sector.sectorId, 0);

          return of(0);
        }),
      );
  }

  getPromedioZona(zona: zonasModalidad): Observable<number> {
    const cache = this.promedioZonaCache.get(zona.zonaId);

    if (cache !== undefined) {
      return of(cache);
    }

    return this.estadisticaService
      .getPromedioEstatalByNivel({
        examenId: this.examenSelected,

        nivelId: this.nivelId,

        modalidadId: this.modalidadId,

        zonaId: zona.zonaId,
      })
      .pipe(
        map((resp) => {
          const porcentaje = resp?.[0]?.porcentaje ?? 0;

          this.promedioZonaCache.set(zona.zonaId, porcentaje);

          return porcentaje;
        }),

        catchError((error) => {
          console.error(`Error obteniendo resultado de zona ${zona.zona}`, error);

          this.promedioZonaCache.set(zona.zonaId, 0);

          return of(0);
        }),
      );
  }

  getPromedioCct(centro: CentrosTrabajo): Observable<number> {
    const cache = this.promedioCctCache.get(centro.id);

    if (cache !== undefined) {
      return of(cache);
    }

    return this.estadisticaService
      .getPromedioEstatalByNivel({
        examenId: this.examenSelected,

        nivelId: this.nivelId,

        modalidadId: this.modalidadId,

        escuelaId: centro.id,
      })
      .pipe(
        map((resp) => {
          const porcentaje = resp?.[0]?.porcentaje ?? 0;

          this.promedioCctCache.set(centro.id, porcentaje);

          return porcentaje;
        }),

        catchError((error) => {
          console.error(`Error obteniendo resultado del CCT ${centro.cct}`, error);

          this.promedioCctCache.set(centro.id, 0);

          return of(0);
        }),
      );
  }

  construirResultados(): void {
    const resultados: resultadosModalidad[] = [];

    for (const sector of this.dataModalidad.sectores) {
      for (const zona of sector.zonas) {
        for (const centro of zona.cct) {
          resultados.push({
            nivel: this.getnivelDescription().toUpperCase(),

            promedioNivel: this.promedioNivel,

            modalidad: this.modalidad,

            promedioModalidad: this.promedioModalidad,

            sector: sector.sector,

            promedioSector: this.promedioSectorCache.get(sector.sectorId) ?? 0,

            zona: zona.zona,

            promedioZona: this.promedioZonaCache.get(zona.zonaId) ?? 0,

            cct: centro.cct,

            promedioCct: this.promedioCctCache.get(centro.id) ?? 0,
          });
        }
      }
    }

    this.resultados = resultados;
  }

  crearTabla(): void {
    const esSecundaria = this.nivelId === 3;

    const columns: TableColumn[] = [
      {
        key: 'nivel',
        label: 'Nivel',
        type: 'text',
        filterable: false,
      },
      {
        key: 'modalidad',
        label: 'Tipo de servicio',
        type: 'text',
        filterable: false,
      },
      {
        key: 'promedioNivel',
        label: 'Resultado nivel',
        type: 'number',
        cellClass: (value) => getPromedioClass(value),
      },
      {
        key: 'promedioModalidad',
        label: 'Resultado modalidad',
        type: 'number',
        cellClass: (value) => getPromedioClass(value),
      },
    ];

    if (!esSecundaria) {
      columns.push(
        {
          key: 'sector',
          label: 'Sector',
          type: 'number',
          filterable: false,
        },
        {
          key: 'promedioSector',
          label: 'Resultado sector',
          type: 'number',
          cellClass: (value) => getPromedioClass(value),
        },
      );
    }

    columns.push(
      {
        key: 'zona',
        label: 'Zona',
        type: 'number',
        filterable: false,
      },
      {
        key: 'promedioZona',
        label: 'Resultado zona',
        type: 'number',
        cellClass: (value) => getPromedioClass(value),
      },
      {
        key: 'cct',
        label: 'Centro de trabajo',
        type: 'text',
        filterable: false,
      },
      {
        key: 'promedioCct',
        label: 'Resultado CCT',
        type: 'number',
        cellClass: (value) => getPromedioClass(value),
      },
    );

    this.tableDinamica = {
      columns,

      data: this.resultados,

      globalSearchKeys: esSecundaria
        ? ['nivel', 'modalidad', 'zona', 'cct']
        : ['nivel', 'modalidad', 'sector', 'zona', 'cct'],
    };
  }

  get nivelId(): number {
    return Number(this.nivel);
  }

  get modalidadId(): number {
    return Number(this.idModalidad);
  }

  getnivelDescription(): string {
    return this.catalogoService.getNivelDescription(this.nivel);
  }
}

export interface PromedioMateriaModalidad {
  materiaId: number;
  materia: string;
  porcentaje: number;
}
