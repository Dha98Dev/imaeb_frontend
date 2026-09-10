import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, finalize, forkJoin, map, Observable, of, switchMap } from 'rxjs';

import { GetEstadisticaService } from '../../../core/services/EstadisticaPromedios/getEstadistica.service';
import { GetBackgroundService } from '../../../core/services/getColors/getBackground.service';
import { GetCctInfoSErvice } from '../../../core/services/Cct/GetCctInfo.service';
import { CatalogoService } from '../../../core/services/Catalogos/catalogo.service';

import { itemPorcentajeAreaEvaluadaInterface } from '../../../core/components/item-porcentaje-area-evaluada/item-porcentaje-area-evaluada.component';

import {
  CatalogoCiclos,
  CatalogoExamen,
  EstructuraExamen,
  MateriaEstructuraExamen,
  responseCatalogo,
  Sectores,
  Zona,
} from '../../../core/Interfaces/catalogo.interface';

import { DataGraficaBarra } from '../../../core/Interfaces/grafica.interface';
import { BreadCrumService } from '../../../core/services/breadCrumbs/bread-crumb-service';

@Component({
  selector: 'app-principal-sector',
  standalone: false,
  templateUrl: './principal-sector.html',
  styleUrl: './principal-sector.scss',
})
export class PrincipalSector {
  constructor(
    private route: ActivatedRoute,
    private estadisticaService: GetEstadisticaService,
    private cd: ChangeDetectorRef,
    private getBg: GetBackgroundService,
    private catalogoService: CatalogoService,
    private observable: GetCctInfoSErvice,
    private breadCrumbService: BreadCrumService,
  ) {}

  public nivel: string = '';
  public sector: string = '';
  public modalidad: string = '';
  public sectorId: number = 0;
  public promedioSector: number = 0;
  public promedioEstatal: number = 0;
  public loader: boolean = false;
  public PorcentajeAreaEvaluada: itemPorcentajeAreaEvaluadaInterface[] = [];
  public dataGrafica: DataGraficaBarra = {} as DataGraficaBarra;
  public zonas: Zona[] = [];
  public ciclos: CatalogoCiclos[] = [];
  public examenes: CatalogoExamen[] = [];
  public cicloSelected: number = 0;
  public examenSelected: number = 0;
  public examenActual?: CatalogoExamen;
  public estructuraExamen?: EstructuraExamen;
  public materiasExamen: MateriaEstructuraExamen[] = [];

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
          label: 'Resultados ' + this.getNivelDescription() + ' sector ' + this.sector,
          urlLink:
            '/ss/resultados-sector/' +
            btoa(this.nivel) +
            '/' +
            btoa(this.sector) +
            '/' +
            btoa(this.modalidad),
          icon: '',
        });

        this.inicializar();
      } catch (error) {
        console.error('Error obteniendo parámetros del sector', error);
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
          console.error('Error inicializando sector', error);
          this.loader = false;
        },
      });
  }

  limpiarDatos(): void {
    this.sectorId = 0;
    this.promedioSector = 0;
    this.promedioEstatal = 0;
    this.PorcentajeAreaEvaluada = [];
    this.zonas = [];
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
          this.obtenerSector();
        },
      });
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
            console.error('No se encontró el sector', {
              nivelId: this.nivelId,
              modalidadId: this.modalidadId,
              sector: this.sectorNumero,
            });
            return of(undefined);
          }

          this.sectorId = sector.id;
          return this.cargarDatosSector(sector);
        }),
        catchError((error) => {
          console.error('Error obteniendo información del sector', error);
          return of(undefined);
        }),
        finalize(() => {
          this.loader = false;
          this.cd.markForCheck();
        }),
      )
      .subscribe();
  }

  cargarDatosSector(sector: Sectores): Observable<any> {
    return forkJoin({
      promedioSector: this.getPromedioSector(),
      promedioEstatal: this.getPromedioEstatal(),
      areas: this.getPromediosMaterias(),
      zonas: this.getZonasFromSector(sector),
    }).pipe(
      switchMap(({ promedioSector, promedioEstatal, areas, zonas }) => {
        this.promedioSector = promedioSector;
        this.promedioEstatal = promedioEstatal;
        this.PorcentajeAreaEvaluada = areas;
        this.zonas = zonas;

        return this.getPromediosZonas(zonas);
      }),
      map((dataGrafica) => {
        this.dataGrafica = dataGrafica;
        return true;
      }),
    );
  }

  getPromedioSector(): Observable<number> {
    return this.estadisticaService
      .getPromedioEstatalByNivel({
        examenId: this.examenSelected,
        nivelId: this.nivelId,
        modalidadId: this.modalidadId,
        sectorId: this.sectorId,
      })
      .pipe(
        map((resp) => resp?.[0]?.porcentaje ?? 0),
        catchError((error) => {
          console.error('Error obteniendo resultado del sector', error);
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
      const promedioSectorMateria$ = this.estadisticaService
        .getPromedioEstatalByNivel({
          examenId: this.examenSelected,
          nivelId: this.nivelId,
          modalidadId: this.modalidadId,
          sectorId: this.sectorId,
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
        promedioSector: promedioSectorMateria$,
        promedioEstatal: promedioEstatalMateria$,
      }).pipe(
        map(
          ({ promedioSector, promedioEstatal }): itemPorcentajeAreaEvaluadaInterface => ({
            firstLeyendPercent: 'Resultado del sector',
            firstPercent: promedioSector,
            secondLeyendPercent: 'Resultado estatal',
            secondPercent: promedioEstatal,
            bgTitle: this.getBg.getBackgroundMateria(materia.descripcion),
            title: materia.descripcion,
          }),
        ),
      );
    });

    return forkJoin(requests);
  }

  getZonasFromSector(sector: Sectores): Observable<Zona[]> {
    return this.catalogoService
      .getCatalogo({
        nivelId: this.nivelId,
        modalidadId: this.modalidadId,
        sector: sector.numero,
      })
      .pipe(
        map((resp: responseCatalogo) => resp.zonas ?? []),
        catchError((error) => {
          console.error('Error obteniendo zonas del sector', error);
          return of([]);
        }),
      );
  }

  getPromediosZonas(zonas: Zona[]): Observable<DataGraficaBarra> {
    if (!zonas.length) {
      return of({
        firstDataSet: [],
        firstLeyend: 'Resultado',
        categorias: [],
        title: 'Resultados de zonas del sector ' + this.sector,
        secondDataSet: [],
        secondLeyend: '',
        description: 'Resultados de las zonas del sector ' + this.sector,
      });
    }

    const requests = zonas.map((zona) =>
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
            zona: zona.numero,
            porcentaje: resp?.[0]?.porcentaje ?? 0,
          })),
          catchError((error) => {
            console.error(`Error obteniendo resultado zona ${zona.numero}`, error);

            return of({
              zona: zona.numero,
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
            categorias: resultados.map((item) => 'Zona ' + item.zona),
            title: 'Resultados de zonas del sector ' + this.sector,
            secondDataSet: [],
            secondLeyend: '',
            description: 'Resultados de las zonas del sector ' + this.sector,
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

  get sectorNumero(): number {
    return Number(this.sector);
  }

  getNivelDescription(): string {
    return this.catalogoService.getNivelDescription(this.nivel);
  }
}
