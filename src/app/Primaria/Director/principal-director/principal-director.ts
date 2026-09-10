import { ChangeDetectorRef, Component } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { catchError, finalize, forkJoin, of } from 'rxjs';

import { GetCctInfoSErvice } from '../../../core/services/Cct/GetCctInfo.service';
import { CatalogoService } from '../../../core/services/Catalogos/catalogo.service';
import { CryptoJsService } from '../../../core/services/CriptoJs/cryptojs.service';


import { DatosCct } from '../../../core/Interfaces/DatosCct.interface';

import { CatalogoCiclos, CatalogoExamen } from '../../../core/Interfaces/catalogo.interface';


import { DataGraficaBarra } from '../../../core/Interfaces/grafica.interface';
import { ResultadosDirectorService } from '../../../core/services/resultados-director.service';
import { ConteoSexoGrupo, PromedioGrupo, ParticipacionGrupo } from '../../../core/Interfaces/resultados-director.interface';

@Component({
  selector: 'app-principal-director',
  standalone: false,
  templateUrl: './principal-director.html',
  styleUrl: './principal-director.scss',
})
export class PrincipalDirector {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef,
    private cctService: GetCctInfoSErvice,
    private catalogoService: CatalogoService,
    private crypto: CryptoJsService,
    private resultadosDirectorService: ResultadosDirectorService,
  ) {}

  /*
   * ============================================================
   * GENERALES
   * ============================================================
   */

  public loader: boolean = false;

  private cct: string = '';

  public nivel: number = 0;

  public gruposCct: string[] = [];

  public grupoSelected: string = '';

  /*
   * ============================================================
   * CATÁLOGOS
   * ============================================================
   */

  protected ciclos: CatalogoCiclos[] = [];

  protected examenes: CatalogoExamen[] = [];

  protected cicloSelected: number = 0;

  protected examenSelected: number = 0;

  protected examenActual?: CatalogoExamen;

  /*
   * ============================================================
   * NUEVOS RESULTADOS
   * ============================================================
   */

  public conteoSexo: ConteoSexoGrupo[] = [];

  public promediosGrupos: PromedioGrupo[] = [];

  public participacionCct: ParticipacionGrupo[] = [];

  /*
   * ============================================================
   * TOTALES
   * ============================================================
   */

  public totalMujeres: number = 0;

  public totalHombres: number = 0;

  public totalSinEspecificar: number = 0;

  public totalAlumnos: number = 0;

  public promedioGeneralCct: number = 0;

  /*
   * ============================================================
   * GRÁFICA
   * ============================================================
   */

  public dataChartPromedioGrupos: DataGraficaBarra = {} as DataGraficaBarra;

  /*
   * ============================================================
   * INIT
   * ============================================================
   */

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const cctEncrypted = params.get('cct');

      if (!cctEncrypted) {
        return;
      }

      this.cct = this.crypto.Desencriptar(cctEncrypted) || '';

      if (!this.cct) {
        return;
      }

      this.inicializarDirector();
    });
  }

  /*
   * ============================================================
   * CARGA INICIAL
   * ============================================================
   */

  inicializarDirector(): void {
    this.loader = true;

    forkJoin({
      ciclos: this.catalogoService.getCiclos(),

      examenes: this.catalogoService.getExamenes(),

      datosCct: this.cctService.getInfoCct(this.cct),
    })
      .pipe(
        finalize(() => {
          this.cd.markForCheck();
        }),
      )
      .subscribe({
        next: ({ ciclos, examenes, datosCct }) => {
          /*
           * Catálogos
           */

          this.ciclos = ciclos ?? [];

          this.examenes = examenes ?? [];

          /*
           * Validar CCT
           */

          if (!datosCct?.length) {
            console.warn('No se encontró información para la CCT:', this.cct);

            this.loader = false;

            return;
          }

          const centro: DatosCct = datosCct[0];

          /*
           * Guardar CCT en servicio
           */

          this.cctService.setCentroTrabajo(centro);

          /*
           * Información escuela
           */

          this.nivel = centro.nivelId;

          this.gruposCct = this.extraerGrupos(centro);

          /*
           * Seleccionar último ciclo
           */

          this.seleccionarCicloActual();

          /*
           * Seleccionar examen del ciclo + nivel
           */

          this.seleccionarExamen();

          /*
           * Validar examen
           */

          if (!this.examenSelected) {
            console.warn('No existe examen para el ciclo y nivel seleccionados', {
              cicloId: this.cicloSelected,

              nivelId: this.nivel,
            });

            this.loader = false;

            return;
          }

          /*
           * Cargar resultados
           */

          this.loadData();
        },

        error: (error) => {
          console.error('Error cargando información inicial del director', error);

          this.loader = false;

          this.cd.markForCheck();
        },
      });
  }

  /*
   * ============================================================
   * CICLO
   * ============================================================
   */

  seleccionarCicloActual(): void {
    if (!this.ciclos.length) {
      this.cicloSelected = 0;

      return;
    }

    const ultimoCiclo = [...this.ciclos].sort((a, b) => b.anio - a.anio)[0];

    this.cicloSelected = ultimoCiclo.id;
  }

  /*
   * ============================================================
   * EXAMEN
   * ============================================================
   */

  seleccionarExamen(): void {
    const examen = this.examenes.find(
      (item) => item.cicloId === this.cicloSelected && item.nivelId === this.nivel,
    );

    if (!examen) {
      this.examenSelected = 0;

      this.examenActual = undefined;

      return;
    }

    this.examenSelected = examen.id;

    this.examenActual = examen;
  }

  /*
   * ============================================================
   * CARGA DE RESULTADOS
   * ============================================================
   */

  loadData(): void {
    if (!this.cct || !this.examenSelected) {
      return;
    }

    this.loader = true;

    this.limpiarResultados();

    forkJoin({
      /*
       * Participantes por sexo y grupo
       */

      conteoSexo: this.resultadosDirectorService.getConteoSexo(this.cct, this.examenSelected).pipe(
        catchError((error) => {
          console.error('Error obteniendo conteo por sexo', error);

          return of([]);
        }),
      ),

      /*
       * Promedios de todos los grupos
       */

      promedios: this.resultadosDirectorService
        .getPromediosGrupos(this.cct, this.examenSelected)
        .pipe(
          catchError((error) => {
            console.error('Error obteniendo promedios', error);

            return of([]);
          }),
        ),

      /*
       * Participación de todos los grupos
       */

      participacion: this.resultadosDirectorService
        .getParticipacionCct(this.cct, this.examenSelected)
        .pipe(
          catchError((error) => {
            console.error('Error obteniendo participación', error);

            return of([]);
          }),
        ),
    })
      .pipe(
        finalize(() => {
          this.loader = false;

          this.cd.markForCheck();
        }),
      )
      .subscribe({
        next: ({ conteoSexo, promedios, participacion }) => {
          /*
           * Guardar respuestas
           */

          this.conteoSexo = conteoSexo;

          this.promediosGrupos = promedios;

          this.participacionCct = participacion;

          /*
           * Totales
           */

          this.calcularTotalesSexo();

          /*
           * Resultado general
           */

          this.calcularPromedioGeneral();

          /*
           * Gráfica
           */

          this.dataChartPromedioGrupos = this.buildDataChart(this.promediosGrupos);

          /*
           * Si el endpoint trae grupos que no estaban
           * en los datos de CCT, los agregamos.
           */

          this.actualizarGruposResultados();
        },
      });
  }

  /*
   * ============================================================
   * LIMPIAR RESULTADOS
   * ============================================================
   */

  limpiarResultados(): void {
    this.conteoSexo = [];

    this.promediosGrupos = [];

    this.participacionCct = [];

    this.totalMujeres = 0;

    this.totalHombres = 0;

    this.totalSinEspecificar = 0;

    this.totalAlumnos = 0;

    this.promedioGeneralCct = 0;

    this.dataChartPromedioGrupos = {} as DataGraficaBarra;
  }

  /*
   * ============================================================
   * TOTALES POR SEXO
   * ============================================================
   */

  calcularTotalesSexo(): void {
    this.totalHombres = this.conteoSexo.reduce((total, item) => total + item.hombres, 0);

    this.totalMujeres = this.conteoSexo.reduce((total, item) => total + item.mujeres, 0);

    this.totalSinEspecificar = this.conteoSexo.reduce(
      (total, item) => total + item.sinEspecificar,
      0,
    );

    this.totalAlumnos = this.conteoSexo.reduce((total, item) => total + item.totalParticipantes, 0);
  }

  /*
   * ============================================================
   * PROMEDIO GENERAL CCT
   *
   * Se calcula utilizando puntaje obtenido / puntaje máximo
   * para que sea ponderado correctamente.
   * ============================================================
   */

  calcularPromedioGeneral(): void {
    if (!this.promediosGrupos.length) {
      this.promedioGeneralCct = 0;

      return;
    }

    const puntajeObtenido = this.promediosGrupos.reduce(
      (total, item) => total + item.puntajeObtenido,
      0,
    );

    const puntajeMaximo = this.promediosGrupos.reduce(
      (total, item) => total + item.puntajeMaximo,
      0,
    );

    if (!puntajeMaximo) {
      this.promedioGeneralCct = 0;

      return;
    }

    this.promedioGeneralCct = Number(((puntajeObtenido / puntajeMaximo) * 100).toFixed(2));
  }

  /*
   * ============================================================
   * GRÁFICA
   * ============================================================
   */

  buildDataChart(respuesta: PromedioGrupo[]): DataGraficaBarra {
    if (!respuesta.length) {
      return {} as DataGraficaBarra;
    }

    return {
      categorias: respuesta.map((item) => `Grupo ${item.grupo}`),

      firstLeyend: 'Resultado',

      firstDataSet: respuesta.map((item) => item.porcentaje),

      secondDataSet: [],

      secondLeyend: '',

      title: 'Resultados por grupo',

      description: 'Porcentaje obtenido por cada grupo evaluado',
    };
  }

  /*
   * ============================================================
   * GRUPOS
   * ============================================================
   */

  extraerGrupos(centro: DatosCct): string[] {
    if (!centro.turnos || !centro.turnos.length) {
      return [];
    }

    const grupos = centro.turnos.flatMap((turno) => turno.grupos ?? []);

    /*
     * Evitamos duplicados
     */

    return [...new Set(grupos)];
  }

  actualizarGruposResultados(): void {
    const gruposResultados = this.promediosGrupos.map((item) => item.grupo);

    this.gruposCct = [...new Set([...this.gruposCct, ...gruposResultados])];
  }

  /*
   * ============================================================
   * PORCENTAJES
   * ============================================================
   */

  getPorcentajeMujeres(): number {
    if (!this.totalAlumnos) {
      return 0;
    }

    return (this.totalMujeres / this.totalAlumnos) * 100;
  }

  getPorcentajeHombres(): number {
    if (!this.totalAlumnos) {
      return 0;
    }

    return (this.totalHombres / this.totalAlumnos) * 100;
  }

  getPorcentajeSinEspecificar(): number {
    if (!this.totalAlumnos) {
      return 0;
    }

    return (this.totalSinEspecificar / this.totalAlumnos) * 100;
  }

  /*
   * ============================================================
   * NAVEGACIÓN
   * ============================================================
   */

  redireccioarResultadosGrupo(grupo: string): void {
    this.grupoSelected = grupo;

    this.router.navigate(['/prim_2/resultados-grupo', this.crypto.Encriptar(this.cct), grupo]);
  }
}
