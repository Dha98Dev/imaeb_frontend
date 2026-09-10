import { ChangeDetectorRef, Component } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { catchError, finalize, forkJoin, of } from 'rxjs';

import { GetCctInfoSErvice } from '../../../core/services/Cct/GetCctInfo.service';

import { BreadCrumService } from '../../../core/services/breadCrumbs/bread-crumb-service';

import { CryptoJsService } from '../../../core/services/CriptoJs/cryptojs.service';

import { CatalogoService } from '../../../core/services/Catalogos/catalogo.service';

import { CatalogoCiclos, CatalogoExamen } from '../../../core/Interfaces/catalogo.interface';

import { UnidadChartData } from '../../../core/Interfaces/grafica.interface';

import { DatosCct } from '../../../core/Interfaces/DatosCct.interface';
import { ResultadosDirectorService } from '../../../core/services/resultados-director.service';
import { DesempenioMateriaGrupo, ResultadoPregunta } from '../../../core/Interfaces/resultados-director.interface';

@Component({
  selector: 'app-resultados-areas',
  standalone: false,
  templateUrl: './resultados-areas.html',
  styleUrl: './resultados-areas.scss',
})
export class ResultadosAreas {
  constructor(
    private cctService: GetCctInfoSErvice,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private breadCrumbService: BreadCrumService,
    private crypto: CryptoJsService,
    private catalogoService: CatalogoService,
    private resultadosService: ResultadosDirectorService,
  ) {}

  /*
   * ============================================================
   * GENERALES
   * ============================================================
   */

  public cct: string = '';

  public grupo: string = '';

  public loader: boolean = false;

  public nivel: number = 0;

  /*
   * ============================================================
   * CATÁLOGOS
   * ============================================================
   */

  public ciclos: CatalogoCiclos[] = [];

  public examenes: CatalogoExamen[] = [];

  public cicloSelected: number = 0;

  public examenSelected: number = 0;

  public examenActual?: CatalogoExamen;

  /*
   * ============================================================
   * MATERIAS
   * ============================================================
   */

  public materias: DesempenioMateriaGrupo[] = [];

  public materiaSelected: number = 0;

  public materiaActual?: DesempenioMateriaGrupo;

  /*
   * ============================================================
   * PREGUNTAS
   * ============================================================
   */

  public preguntas: ResultadoPregunta[] = [];

  /*
   * ============================================================
   * GRÁFICAS
   * ============================================================
   */

  public dataChart: UnidadChartData[] = [];

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

      this.grupo = (params.get('grupo') || '').toUpperCase();

      if (!this.cct || !this.grupo) {
        return;
      }

      /*
       * Guardamos CCT y grupo como ya lo venías haciendo.
       */

      this.cctService.setCct(this.cct);

      this.cctService.setGrupo(this.grupo);

      /*
       * Breadcrumb
       */

      this.breadCrumbService.addItem({
        jerarquia: 5,

        label: 'Grupo área ' + this.grupo,

        urlLink:
          'prim_2/resultados-grupo-area/' + this.crypto.Encriptar(this.cct) + '/' + this.grupo,

        icon: '',
      });

      /*
       * Nueva inicialización
       */

      this.inicializar();
    });
  }

  /*
   * ============================================================
   * INICIALIZACIÓN
   * ============================================================
   */

  inicializar(): void {
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
            console.warn('No se encontró la CCT:', this.cct);

            this.loader = false;

            return;
          }

          const centro: DatosCct = datosCct[0];

          /*
           * Guardamos CCT
           */

          this.cctService.setCentroTrabajo(centro);

          /*
           * Nivel
           */

          this.nivel = centro.nivelId;

          /*
           * Seleccionamos ciclo
           */

          this.seleccionarCicloActual();

          /*
           * Seleccionamos examen correspondiente
           * al ciclo + nivel.
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
           * Ahora cargamos las materias reales
           * que tiene este examen para el grupo.
           */

          this.getMaterias();
        },

        error: (error) => {
          console.error('Error inicializando resultados por área', error);

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

    const ciclo = [...this.ciclos].sort((a, b) => b.anio - a.anio)[0];

    this.cicloSelected = ciclo.id;
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
   * OBTENER MATERIAS DEL GRUPO
   * ============================================================
   */

  getMaterias(): void {
    if (!this.cct || !this.grupo || !this.examenSelected) {
      this.loader = false;

      return;
    }

    this.loader = true;

    this.resultadosService
      .getDesempenioGrupo(this.cct, this.grupo, this.examenSelected)
      .pipe(
        catchError((error) => {
          console.error('Error obteniendo materias', error);

          return of([]);
        }),

        finalize(() => {
          this.cd.markForCheck();
        }),
      )
      .subscribe({
        next: (resp) => {
          this.materias = resp ?? [];

          /*
           * Si no tenemos materias
           */

          if (!this.materias.length) {
            this.materiaSelected = 0;

            this.materiaActual = undefined;

            this.preguntas = [];

            this.dataChart = [];

            this.loader = false;

            return;
          }

          /*
           * Seleccionamos automáticamente
           * la primera materia.
           */

          const primeraMateria = this.materias[0];

          this.materiaSelected = primeraMateria.materiaId;

          this.materiaActual = primeraMateria;

          /*
           * Obtenemos preguntas
           */

          this.getPreguntasMateria();
        },
      });
  }

  /*
   * ============================================================
   * CAMBIO DE MATERIA
   * ============================================================
   */

  onPick(materiaId: number): void {
    /*
     * Evitar llamada innecesaria
     */

    if (this.materiaSelected === materiaId) {
      return;
    }

    this.materiaSelected = materiaId;

    this.materiaActual = this.materias.find((item) => item.materiaId === materiaId);

    /*
     * Limpiamos antes de cargar
     */

    this.preguntas = [];

    this.dataChart = [];

    this.getPreguntasMateria();
  }

  /*
   * ============================================================
   * PREGUNTAS DE LA MATERIA
   * ============================================================
   */

  getPreguntasMateria(): void {
    if (!this.cct || !this.grupo || !this.examenSelected || !this.materiaSelected) {
      return;
    }

    this.loader = true;

    this.resultadosService
      .getPreguntasMateria(this.cct, this.grupo, this.materiaSelected, this.examenSelected)
      .pipe(
        catchError((error) => {
          console.error('Error obteniendo preguntas de la materia', error);

          return of([]);
        }),

        finalize(() => {
          this.loader = false;

          this.cd.markForCheck();
        }),
      )
      .subscribe({
        next: (resp) => {
          this.preguntas = resp ?? [];

          /*
           * Transformamos la nueva respuesta
           * a la estructura que espera tu gráfica.
           */

          this.dataChart = this.buildChartDataPorPorcentaje(this.preguntas);
        },
      });
  }

  /*
   * ============================================================
   * SUBTÍTULO
   * ============================================================
   */

  get getSubtitle(): string {
    if (this.materiaActual) {
      return 'Resultados de ' + this.materiaActual.materia;
    }

    return 'Resultados por área';
  }

  /*
   * ============================================================
   * CONSTRUIR GRÁFICAS POR UNIDAD
   * ============================================================
   */

  buildChartDataPorPorcentaje(data: ResultadoPregunta[]): UnidadChartData[] {
    /*
     * Agrupar por unidadId.
     *
     * Es mejor usar el ID como llave en vez
     * del texto de la unidad.
     */

    const porUnidad = new Map<number, ResultadoPregunta[]>();

    for (const item of data ?? []) {
      const key = item.unidadId ?? 0;

      if (!porUnidad.has(key)) {
        porUnidad.set(key, []);
      }

      porUnidad.get(key)!.push(item);
    }

    const salida: UnidadChartData[] = [];

    /*
     * Construimos una gráfica por unidad.
     */

    for (const [, preguntas] of porUnidad.entries()) {
      /*
       * Ordenar preguntas
       */

      preguntas.sort((a, b) => a.numeroPregunta - b.numeroPregunta);

      const base = preguntas[0];

      /*
       * Categorías:
       *
       * P1, P2, P3...
       */

      const categorias = preguntas.map((pregunta) => `P${pregunta.numeroPregunta}`);

      /*
       * El backend ya proporciona porcentaje.
       */

      const porcentajeObtenido = preguntas.map((pregunta) =>
        Number((pregunta.porcentaje ?? 0).toFixed(2)),
      );

      /*
       * Para evaluaciones RESPUESTA_CORRECTA,
       * el restante representa desaciertos.
       *
       * Para ESCALA_0_3 será simplemente
       * porcentaje restante.
       */

      const porcentajeRestante = preguntas.map((pregunta) => {
        const porcentaje = pregunta.porcentaje ?? 0;

        return Number(Math.max(0, 100 - porcentaje).toFixed(2));
      });

      /*
       * Cálculo acumulado correcto de la unidad.
       *
       * No tomamos el porcentaje de la primera
       * pregunta como hacía la versión anterior.
       */

      const puntajeObtenidoUnidad = preguntas.reduce(
        (total, pregunta) => total + (pregunta.puntajeObtenido ?? 0),
        0,
      );

      const puntajeMaximoUnidad = preguntas.reduce(
        (total, pregunta) => total + (pregunta.puntajeMaximo ?? 0),
        0,
      );

      const porcentajeUnidad =
        puntajeMaximoUnidad > 0
          ? Number(((puntajeObtenidoUnidad / puntajeMaximoUnidad) * 100).toFixed(2))
          : 0;

      const porcentajeRestanteUnidad = Number(Math.max(0, 100 - porcentajeUnidad).toFixed(2));

      /*
       * Participantes reales de la unidad.
       */

      const totalParticipantes = Math.max(
        ...preguntas.map((pregunta) => pregunta.totalParticipantes ?? 0),
        0,
      );

      salida.push({
        unidad: base?.unidad ?? '(Sin unidad)',

        totalAlumnos: totalParticipantes,

        porcentajeAciertos: porcentajeUnidad,

        porcentajeDesaciertos: porcentajeRestanteUnidad,

        dataChart: {
          categorias,

          firstLeyend: this.esRespuestaCorrecta() ? 'Aciertos (%)' : 'Resultado (%)',

          secondLeyend: this.esRespuestaCorrecta() ? 'Desaciertos (%)' : 'Restante (%)',

          firstDataSet: porcentajeObtenido,

          secondDataSet: porcentajeRestante,

          title: base?.unidad ?? 'Unidad',

          description: `Resultado por pregunta en ${base?.unidad ?? 'la unidad'}`,
        },
      });
    }

    return salida;
  }

  /*
   * ============================================================
   * TIPO DE EVALUACIÓN
   * ============================================================
   */

  esRespuestaCorrecta(): boolean {
    return this.examenActual?.tipoEvaluacion === 'RESPUESTA_CORRECTA';
  }

  /*
   * ============================================================
   * TOTAL PREGUNTAS
   * ============================================================
   */

  get totalPreguntas(): number {
    return this.preguntas?.length ?? 0;
  }

  /*
   * ============================================================
   * TOTAL UNIDADES
   * ============================================================
   */

  get totalUnidades(): number {
    return this.dataChart?.length ?? 0;
  }

  /*
   * ============================================================
   * PORCENTAJE DE LA MATERIA
   * ============================================================
   */

  get porcentajeMateria(): number {
    return this.materiaActual?.porcentaje ?? 0;
  }
}
