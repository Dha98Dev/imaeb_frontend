import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, finalize, forkJoin, map, Observable, of, switchMap } from 'rxjs';

import { GetEstadisticaService } from '../../../core/services/EstadisticaPromedios/getEstadistica.service';
import { GetBackgroundService } from '../../../core/services/getColors/getBackground.service';
import { CatalogoService } from '../../../core/services/Catalogos/catalogo.service';
import { GetCctInfoSErvice } from '../../../core/services/Cct/GetCctInfo.service';
import { BreadCrumService } from '../../../core/services/breadCrumbs/bread-crumb-service';
import { AuthService } from '../../../Auth/services/auth.service';

import { itemPorcentajeAreaEvaluadaInterface } from '../../../core/components/item-porcentaje-area-evaluada/item-porcentaje-area-evaluada.component';

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

import { DataGraficaBarra } from '../../../core/Interfaces/grafica.interface';
import { paramsFilters } from '../../../core/Interfaces/paramsFilters.interface';

@Component({
  selector: 'app-principal-zona',
  standalone: false,
  templateUrl: './principal-zona.html',
  styleUrl: './principal-zona.scss',
})
export class PrincipalZona {
  constructor(
    private route: ActivatedRoute,
    private estadisticaService: GetEstadisticaService,
    private cd: ChangeDetectorRef,
    private getBg: GetBackgroundService,
    private catalogoService: CatalogoService,
    private observable: GetCctInfoSErvice,
    private breadCrumbService: BreadCrumService,
    private authService: AuthService,
  ) {}

  public nivel: string = '';
  public zona: string = '';
  public modalidad: string = '';
  public sector: number = 0;
  public sectorId: number = 0;
  public zonaId: number = 0;

  public promedioZona: number = 0;
  public promedioEstatal: number = 0;

  public PorcentajeAreaEvaluada: itemPorcentajeAreaEvaluadaInterface[] = [];
  public centrosTrabajos: CentrosTrabajo[] = [];
  public dataGrafica: DataGraficaBarra = {} as DataGraficaBarra;
  public dataUser: paramsFilters = {} as paramsFilters;

  public loader: boolean = false;

  public ciclos: CatalogoCiclos[] = [];
  public examenes: CatalogoExamen[] = [];
  public cicloSelected: number = 0;
  public examenSelected: number = 0;
  public examenActual?: CatalogoExamen;

  public estructuraExamen?: EstructuraExamen;
  public materiasExamen: MateriaEstructuraExamen[] = [];

  ngOnInit(): void {
    this.dataUser = this.authService.getObjectParams();

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
          label: 'Resultados zona ' + this.zona,
          urlLink:
            '/sz/resultados-zona/' +
            btoa(this.nivel) +
            '/' +
            btoa(this.zona) +
            '/' +
            btoa(this.modalidad),
          icon: '',
        });

        this.inicializar();
      } catch (error) {
        console.error('Error obteniendo parámetros de zona', error);
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

          this.cargarEstructuraExamen();
        },
        error: (error) => {
          console.error('Error inicializando zona', error);
          this.loader = false;
        },
      });
  }

  limpiarDatos(): void {
    this.sector = 0;
    this.sectorId = 0;
    this.zonaId = 0;
    this.promedioZona = 0;
    this.promedioEstatal = 0;
    this.PorcentajeAreaEvaluada = [];
    this.centrosTrabajos = [];
    this.dataGrafica = {} as DataGraficaBarra;
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

          this.resolverZona();
        },
      });
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

          if (!sectores.length) {
            return of(undefined);
          }

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
            return;
          }

          this.sector = resultado.sector.numero;
          this.sectorId = resultado.sector.id;
          this.zonaId = resultado.zona.id;

          this.cargarDatosZona();
        },
      });
  }

  cargarDatosZona(): void {
    forkJoin({
      promedioZona: this.getPromedioZona(),
      promedioEstatal: this.getPromedioEstatal(),
      areas: this.getPromediosMaterias(),
      centrosTrabajo: this.getCentrosTrabajoZona(),
    })
      .pipe(
        switchMap(({ promedioZona, promedioEstatal, areas, centrosTrabajo }) => {
          this.promedioZona = promedioZona;
          this.promedioEstatal = promedioEstatal;
          this.PorcentajeAreaEvaluada = areas;
          this.centrosTrabajos = centrosTrabajo;

          return this.getPromediosCctZona(centrosTrabajo);
        }),
        finalize(() => {
          this.loader = false;
          this.cd.markForCheck();
        }),
      )
      .subscribe({
        next: (grafica) => {
          this.dataGrafica = grafica;
        },
        error: (error) => {
          console.error('Error cargando información de zona', error);
        },
      });
  }

  getPromedioZona(): Observable<number> {
    return this.estadisticaService
      .getPromedioEstatalByNivel({
        examenId: this.examenSelected,
        nivelId: this.nivelId,
        modalidadId: this.modalidadId,
        sectorId: this.sectorId,
        zonaId: this.zonaId,
      })
      .pipe(
        map((resp) => resp?.[0]?.porcentaje ?? 0),
        catchError((error) => {
          console.error('Error obteniendo resultado de zona', error);
          return of(0);
        }),
      );
  }

  getPromedioEstatal(): Observable<number> {
    return this.estadisticaService
      .getPromedioEstatalByNivel({
        examenId: this.examenSelected,
        nivelId: this.nivelId,
      })
      .pipe(
        map((resp) => resp?.[0]?.porcentaje ?? 0),
        catchError((error) => {
          console.error('Error obteniendo resultado estatal', error);
          return of(0);
        }),
      );
  }

  getPromediosMaterias(): Observable<itemPorcentajeAreaEvaluadaInterface[]> {
    if (!this.materiasExamen.length) return of([]);

    const requests = this.materiasExamen.map((materia) => {
      const promedioZonaMateria$ = this.estadisticaService
        .getPromedioEstatalByNivel({
          examenId: this.examenSelected,
          nivelId: this.nivelId,
          modalidadId: this.modalidadId,
          sectorId: this.sectorId,
          zonaId: this.zonaId,
          materiaId: materia.materiaId,
        })
        .pipe(
          map((resp) => resp?.[0]?.porcentaje ?? 0),
          catchError(() => of(0)),
        );

      const promedioEstatalMateria$ = this.estadisticaService
        .getPromedioEstatalByNivel({
          examenId: this.examenSelected,
          nivelId: this.nivelId,
          materiaId: materia.materiaId,
        })
        .pipe(
          map((resp) => resp?.[0]?.porcentaje ?? 0),
          catchError(() => of(0)),
        );

      return forkJoin({
        promedioZona: promedioZonaMateria$,
        promedioEstatal: promedioEstatalMateria$,
      }).pipe(
        map(
          ({ promedioZona, promedioEstatal }): itemPorcentajeAreaEvaluadaInterface => ({
            firstLeyendPercent: 'Resultado de zona ' + this.zona + ' en ' + materia.descripcion,
            firstPercent: promedioZona,
            secondLeyendPercent: 'Resultado estatal de ' + materia.descripcion,
            secondPercent: promedioEstatal,
            bgTitle: this.getBg.getBackgroundMateria(materia.descripcion),
            title: materia.descripcion,
          }),
        ),
      );
    });

    return forkJoin(requests);
  }

  getCentrosTrabajoZona(): Observable<CentrosTrabajo[]> {
    return this.catalogoService
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
          return of([]);
        }),
      );
  }

  getPromediosCctZona(centrosTrabajos: CentrosTrabajo[]): Observable<DataGraficaBarra> {
    if (!centrosTrabajos.length) {
      return of({
        firstDataSet: [],
        firstLeyend: 'Resultado',
        categorias: [],
        title: 'Resultados de la zona ' + this.zona,
        secondDataSet: [],
        secondLeyend: '',
        description: 'Resultados de los CCT de la zona ' + this.zona,
      });
    }

    const requests = centrosTrabajos.map((centro) =>
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
          map((resp) => ({
            cct: centro.cct,
            porcentaje: resp?.[0]?.porcentaje ?? 0,
          })),
          catchError((error) => {
            console.error(`Error obteniendo resultado del CCT ${centro.cct}`, error);

            return of({
              cct: centro.cct,
              porcentaje: 0,
            });
          }),
        ),
    );

    return forkJoin(requests).pipe(
      map(
        (resultados) =>
          ({
            firstDataSet: resultados.map((item) => item.porcentaje),
            firstLeyend: 'Resultado',
            categorias: resultados.map((item) => item.cct),
            title: 'Resultados de los CCT de la zona ' + this.zona,
            secondDataSet: [],
            secondLeyend: '',
            description: 'Resultados de los CCT de la zona ' + this.zona,
          }) as DataGraficaBarra,
      ),
    );
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
