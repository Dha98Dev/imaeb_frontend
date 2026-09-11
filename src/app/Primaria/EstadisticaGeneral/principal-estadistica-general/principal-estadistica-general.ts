import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { catchError, finalize, forkJoin, map, Observable, of } from 'rxjs';

import { GetEstadisticaService } from '../../../core/services/EstadisticaPromedios/getEstadistica.service';
import { CatalogoService } from '../../../core/services/Catalogos/catalogo.service';
import { GetBackgroundService } from '../../../core/services/getColors/getBackground.service';
import { BreadCrumService } from '../../../core/services/breadCrumbs/bread-crumb-service';
import { AuthService } from '../../../Auth/services/auth.service';

import {
  catalogo,
  CatalogoCiclos,
  CatalogoExamen,
  EstructuraExamen,
  MateriaEstructuraExamen,
  MunicipiosOrLocalidades,
  Nivele,
  responseCatalogo,
  singleModalidad,
} from '../../../core/Interfaces/catalogo.interface';

import { DataGraficaBarra } from '../../../core/Interfaces/grafica.interface';

interface ResultadoGeneral {
  nivel: string;
  porcentaje: number;
  materia?: string;
  municipio?: string;
  nivelId?: number;
  materiaId?: number;
  municipioId?: number;
}

@Component({
  selector: 'app-principal-estadistica-general',
  standalone: false,
  templateUrl: './principal-estadistica-general.html',
  styleUrl: './principal-estadistica-general.scss',
})
export class PrincipalEstadisticaGeneral {
  private breadCrumb = inject(BreadCrumService);

  public loader: boolean = false;
  public nivelSeleccionado: number = 0;
  public nivelUser: number = 0;

  public ciclos: CatalogoCiclos[] = [];
  public examenes: CatalogoExamen[] = [];
  public cicloSelected: number = 0;
  public examenSelected: number = 0;
  public examenActual?: CatalogoExamen;

  public estructuraExamen?: EstructuraExamen;
  public materiasExamen: MateriaEstructuraExamen[] = [];

  public modalidades: singleModalidad[] = [];
  public municipios: MunicipiosOrLocalidades[] = [];

  public promediosGeneralesEstatales: ResultadoGeneral[] = [];
  public promedioGeneralesEstatalesBynivelAndMateria: ResultadoGeneral[] = [];
  public PromedioByNivelAndMunicipioAndMateria: ResultadoGeneral[][] = [];

  public dataChartModalidades: DataGraficaBarra = {} as DataGraficaBarra;
  public dataChartNivelAndMunicipio: DataGraficaBarra = {} as DataGraficaBarra;

  public niveles: Nivele[] = [];
  public cargandoNiveles: boolean = false;

  constructor(
    private estadisticaService: GetEstadisticaService,
    private cd: ChangeDetectorRef,
    private catalogoService: CatalogoService,
    private getBgMateriaService: GetBackgroundService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.nivelUser = this.authService.getNivel();
    this.getNiveles()

    this.breadCrumb.addItem({
      jerarquia: 1,
      icon: '',
      label: 'Estadística general',
      urlLink: '/Auth/main-filter',
      home: '',
    });

    this.inicializar();
  }

  inicializar(): void {
    this.loader = true;

    forkJoin({
      ciclos: this.catalogoService.getCiclos(),
      examenes: this.catalogoService.getExamenes(),
      municipios: this.catalogoService.getMunicipios(),
    })
      .pipe(finalize(() => this.cd.markForCheck()))
      .subscribe({
        next: ({ ciclos, examenes, municipios }) => {
          this.ciclos = ciclos ?? [];
          this.examenes = examenes ?? [];
          this.municipios = municipios ?? [];

          this.seleccionarCicloActual();
          this.getEstadistica(this.nivelUser);
        },
        error: (error) => {
          console.error('Error inicializando estadísticas generales', error);
          this.loader = false;
        },
      });
  }

  get getNivelUser(): number {
    return this.nivelUser;
  }

  seleccionarCicloActual(): void {
    if (!this.ciclos.length) {
      this.cicloSelected = 0;
      return;
    }

    const ciclo = [...this.ciclos].sort((a, b) => b.anio - a.anio)[0];
    this.cicloSelected = ciclo.id;
  }

  seleccionarExamen(nivelId: number): boolean {
    const examen = this.examenes.find(
      (item) => item.cicloId === this.cicloSelected && item.nivelId === nivelId,
    );

    if (!examen) {
      this.examenSelected = 0;
      this.examenActual = undefined;
      return false;
    }

    this.examenSelected = examen.id;
    this.examenActual = examen;

    return true;
  }

  getEstadistica(nivel: number): void {
    this.nivelSeleccionado = nivel;
    this.loader = true;
    this.limpiarResultadosNivel();

    if (!this.seleccionarExamen(nivel)) {
      console.error('No existe examen para el nivel y ciclo seleccionados', {
        nivelId: nivel,
        cicloId: this.cicloSelected,
      });

      this.loader = false;
      return;
    }

    forkJoin({
      estructura: this.catalogoService.getEstructuraExamen(this.examenSelected).pipe(
        catchError((error) => {
          console.error('Error obteniendo estructura del examen', error);
          return of(undefined);
        }),
      ),

      catalogo: this.catalogoService
        .getCatalogo({
          nivelId: nivel,
        })
        .pipe(
          catchError((error) => {
            console.error('Error obteniendo modalidades', error);
            return of(undefined);
          }),
        ),
    }).subscribe({
      next: ({ estructura, catalogo }) => {
        if (!estructura) {
          this.loader = false;
          return;
        }

        this.estructuraExamen = estructura;
        this.materiasExamen = estructura.materias ?? [];
        this.modalidades = catalogo?.modalidades ?? [];

        this.cargarEstadisticasNivel();
      },
      error: (error) => {
        console.error('Error preparando estadísticas del nivel', error);
        this.loader = false;
      },
    });
  }

  limpiarResultadosNivel(): void {
    this.modalidades = [];
    this.materiasExamen = [];
    this.estructuraExamen = undefined;
    this.promediosGeneralesEstatales = [];
    this.promedioGeneralesEstatalesBynivelAndMateria = [];
    this.PromedioByNivelAndMunicipioAndMateria = [];
    this.dataChartModalidades = {} as DataGraficaBarra;
    this.dataChartNivelAndMunicipio = {} as DataGraficaBarra;
  }

  cargarEstadisticasNivel(): void {
    forkJoin({
      promedioEstatal: this.getPromedioEstatalNivel(),
      modalidades: this.getPromediosEstatalesPorModalidad(),
      materias: this.getPromedioGeneralByMateriaAndNivel(),
      municipios: this.getEstadisticaByNivelAndMunicipio(),
      municipiosMaterias: this.getPromedioByNivelAndMunicipioAndMateria(),
    })
      .pipe(
        finalize(() => {
          this.loader = false;
          this.cd.markForCheck();
        }),
      )
      .subscribe({
        next: ({ promedioEstatal, modalidades, materias, municipios, municipiosMaterias }) => {
          this.promediosGeneralesEstatales = promedioEstatal;
          this.dataChartModalidades = modalidades;
          this.promedioGeneralesEstatalesBynivelAndMateria = materias;
          this.dataChartNivelAndMunicipio = municipios;
          this.PromedioByNivelAndMunicipioAndMateria = municipiosMaterias;
        },
        error: (error) => {
          console.error('Error cargando estadísticas del nivel', error);
        },
      });
  }

  getPromedioEstatalNivel(): Observable<ResultadoGeneral[]> {
    return this.estadisticaService
      .getPromedioEstatalByNivel({
        examenId: this.examenSelected,
        nivelId: this.nivelSeleccionado,
      })
      .pipe(
        map((resp) => [
          {
            nivel: this.getNivelDescription(this.nivelSeleccionado.toString()),
            nivelId: this.nivelSeleccionado,
            porcentaje: resp?.[0]?.porcentaje ?? 0,
          },
        ]),
        catchError((error) => {
          console.error('Error obteniendo resultado estatal', error);
          return of([]);
        }),
      );
  }

  getPromediosEstatalesPorModalidad(): Observable<DataGraficaBarra> {
    if (!this.modalidades.length) {
      return of(this.crearGraficaVaciaModalidades());
    }

    const requests = this.modalidades.map((modalidad) =>
      this.estadisticaService
        .getPromedioEstatalByNivel({
          examenId: this.examenSelected,
          nivelId: this.nivelSeleccionado,
          modalidadId: modalidad.id,
        })
        .pipe(
          map((resp) => ({
            modalidad: modalidad.descripcion,
            porcentaje: resp?.[0]?.porcentaje ?? 0,
          })),
          catchError((error) => {
            console.error(
              'Error obteniendo resultado de modalidad ' + modalidad.descripcion,
              error,
            );

            return of({
              modalidad: modalidad.descripcion,
              porcentaje: 0,
            });
          }),
        ),
    );

    return forkJoin(requests).pipe(
      map((resultados) => ({
        categorias: resultados.map((item) => item.modalidad),
        firstDataSet: resultados.map((item) => Number(item.porcentaje.toFixed(2))),
        secondDataSet: [],
        firstLeyend: 'Resultado por modalidad',
        secondLeyend: '',
        title: 'Resultados por modalidad',
        description:
          'Resultados por modalidad del nivel ' +
          this.getNivelDescription(this.nivelSeleccionado.toString()),
      })),
    );
  }

  crearGraficaVaciaModalidades(): DataGraficaBarra {
    return {
      categorias: [],
      firstDataSet: [],
      secondDataSet: [],
      firstLeyend: 'Resultado por modalidad',
      secondLeyend: '',
      title: 'Resultados por modalidad',
      description: '',
    };
  }

  getPromedioGeneralByMateriaAndNivel(): Observable<ResultadoGeneral[]> {
    if (!this.materiasExamen.length) return of([]);

    const nivelDescripcion = this.getNivelDescription(this.nivelSeleccionado.toString());

    const requests = this.materiasExamen.map((materia) =>
      this.estadisticaService
        .getPromedioEstatalByNivel({
          examenId: this.examenSelected,
          nivelId: this.nivelSeleccionado,
          materiaId: materia.materiaId,
        })
        .pipe(
          map(
            (resp): ResultadoGeneral => ({
              nivel: nivelDescripcion,
              nivelId: this.nivelSeleccionado,
              materiaId: materia.materiaId,
              materia: materia.descripcion,
              porcentaje: resp?.[0]?.porcentaje ?? 0,
            }),
          ),
          catchError((error) => {
            console.error('Error obteniendo resultado de materia ' + materia.descripcion, error);

            return of<ResultadoGeneral>({
              nivel: nivelDescripcion,
              nivelId: this.nivelSeleccionado,
              materiaId: materia.materiaId,
              materia: materia.descripcion,
              porcentaje: 0,
            });
          }),
        ),
    );

    return forkJoin(requests);
  }

  getEstadisticaByNivelAndMunicipio(): Observable<DataGraficaBarra> {
    if (!this.municipios.length) {
      return of({
        firstLeyend: 'Resultado',
        secondLeyend: '',
        firstDataSet: [],
        secondDataSet: [],
        title: 'Resultados por municipio',
        description: '',
        categorias: [],
      });
    }

    const requests = this.municipios.map((municipio) =>
      this.estadisticaService
        .getPromedioEstatalByNivel({
          examenId: this.examenSelected,
          nivelId: this.nivelSeleccionado,
          municipioId: municipio.id,
        })
        .pipe(
          map((resp) => ({
            municipio: municipio.nombre,
            porcentaje: resp?.[0]?.porcentaje ?? 0,
          })),
          catchError((error) => {
            console.error('Error obteniendo resultado del municipio ' + municipio.nombre, error);

            return of({
              municipio: municipio.nombre,
              porcentaje: 0,
            });
          }),
        ),
    );

    return forkJoin(requests).pipe(
      map((resultados) => ({
        firstLeyend: 'Resultado de ' + this.getNivelDescription(this.nivelSeleccionado.toString()),
        secondLeyend: '',
        firstDataSet: resultados.map((item) => item.porcentaje),
        secondDataSet: [],
        title:
          'Resultados por municipio de ' +
          this.getNivelDescription(this.nivelSeleccionado.toString()),
        description: 'Resultados por municipio',
        categorias: resultados.map((item) => item.municipio),
      })),
    );
  }

  getPromedioByNivelAndMunicipioAndMateria(): Observable<ResultadoGeneral[][]> {
    if (!this.municipios.length || !this.materiasExamen.length) return of([]);

    const nivelDescripcion = this.getNivelDescription(this.nivelSeleccionado.toString());

    const porMunicipio$ = this.municipios.map((municipio) => {
      const porMateria$ = this.materiasExamen.map((materia) =>
        this.estadisticaService
          .getPromedioEstatalByNivel({
            examenId: this.examenSelected,
            nivelId: this.nivelSeleccionado,
            materiaId: materia.materiaId,
            municipioId: municipio.id,
          })
          .pipe(
            map(
              (resp): ResultadoGeneral => ({
                nivel: nivelDescripcion,
                nivelId: this.nivelSeleccionado,
                municipioId: municipio.id,
                municipio: municipio.nombre,
                materiaId: materia.materiaId,
                materia: materia.descripcion,
                porcentaje: resp?.[0]?.porcentaje ?? 0,
              }),
            ),
            catchError((error) => {
              console.error(`Error en ${municipio.nombre} - ${materia.descripcion}`, error);

              return of<ResultadoGeneral>({
                nivel: nivelDescripcion,
                nivelId: this.nivelSeleccionado,
                municipioId: municipio.id,
                municipio: municipio.nombre,
                materiaId: materia.materiaId,
                materia: materia.descripcion,
                porcentaje: 0,
              });
            }),
          ),
      );

      return forkJoin(porMateria$);
    });

    return forkJoin(porMunicipio$);
  }

  getNiveles(): void {
    const params: catalogo = {} as catalogo;

    this.catalogoService.getCatalogo(params).subscribe({
      next: (resp: responseCatalogo) => {
        this.niveles = resp?.niveles ?? [];

        if (this.niveles.length > 0 && !this.nivelSeleccionado) {
          this.getEstadistica(this.niveles[0].id);
        }

        this.cd.markForCheck();
      },

      error: (error) => {
        console.error('Error obteniendo niveles', error);

        this.niveles = [];
        this.cd.markForCheck();
      },
    });
  }
  getIconNivel(descripcion: string): string {
    const nivel = descripcion
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (nivel.includes('preescolar')) {
      return 'fa-solid fa-children';
    }

    if (nivel.includes('primaria')) {
      return 'fa-solid fa-school';
    }

    if (nivel.includes('secundaria')) {
      return 'fa-solid fa-building-columns';
    }

    return 'fa-solid fa-graduation-cap';
  }

  formatearNivel(descripcion: string): string {
    if (!descripcion) {
      return '';
    }

    const texto = descripcion.toLowerCase();

    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  getNivelDescription(nivel: string): string {
    return this.catalogoService.getNivelDescription(nivel);
  }

  getBgMateria(materia: string): string {
    return this.getBgMateriaService.getBackgroundMateria(materia);
  }
}
