import { ChangeDetectorRef, Component } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { catchError, finalize, of } from 'rxjs';

import { CryptoJsService } from '../../core/services/CriptoJs/cryptojs.service';

import { BreadCrumService } from '../../core/services/breadCrumbs/bread-crumb-service';

import { listadoAlumnosService } from '../../core/services/listadoAlumnos.service';

import {
  ResultadoPreguntaAlumnoV2,
  PreguntaAlumnoV2,
} from '../../core/Interfaces/listadoAlumnoV2.interface';

import { DataGraficaBarra } from '../../core/Interfaces/grafica.interface';

@Component({
  selector: 'app-resultados-materia',
  standalone: false,
  templateUrl: './resultados-materia.html',
  styleUrl: './resultados-materia.scss',
})
export class ResultadosMateria {
  constructor(
    private route: ActivatedRoute,
    private crypto: CryptoJsService,
    private cd: ChangeDetectorRef,
    private breadCrumbService: BreadCrumService,
    private listadoAlumnosService: listadoAlumnosService,
  ) {}

  private alumnoParam: string = '';

  private alumnoExamenParam: string = '';

  private materiaParam: string = '';

  public alumnoId: number = 0;

  public alumnoExamenId: number = 0;

  public materiaId: number = 0;

  public loader: boolean = false;

  public resultadoMateria?: ResultadoPreguntaAlumnoV2;

  public preguntas: PreguntaAlumnoV2[] = [];

  public unidades: UnidadResultadoAlumno[] = [];

  public porcentajeAciertos: number = 0;

  public porcentajeDesaciertos: number = 0;

  public dataGrafica: DataGraficaBarra = {} as DataGraficaBarra;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      try {
        this.alumnoParam = params.get('idAlumno') || '';

        this.alumnoExamenParam = params.get('alumnoExamenId') || '';

        this.materiaParam = params.get('area') || '';

        if (!this.alumnoParam || !this.alumnoExamenParam || !this.materiaParam) {
          return;
        }

        this.alumnoId = Number(this.crypto.Desencriptar(this.alumnoParam));

        this.alumnoExamenId = Number(this.crypto.Desencriptar(this.alumnoExamenParam));

        this.materiaId = Number(this.crypto.Desencriptar(this.materiaParam));

        if (!this.alumnoId || !this.alumnoExamenId || !this.materiaId) {
          return;
        }

        this.getResultadoMateria();
      } catch (error) {
        console.error('Error leyendo parámetros', error);
      }
    });
  }

  getResultadoMateria(): void {
    this.loader = true;

    this.listadoAlumnosService
      .obtenerPreguntasAlumnoMateria(this.alumnoExamenId, this.materiaId)
      .pipe(
        catchError((error) => {
          console.error('Error obteniendo resultados de materia', error);

          return of(undefined);
        }),

        finalize(() => {
          this.loader = false;

          this.cd.markForCheck();
        }),
      )
      .subscribe({
        next: (resp) => {
          if (!resp) {
            this.resultadoMateria = undefined;

            this.preguntas = [];

            this.unidades = [];

            return;
          }

          this.resultadoMateria = resp;

          this.preguntas = resp.preguntas ?? [];

          this.porcentajeAciertos = resp.porcentaje ?? 0;

          this.porcentajeDesaciertos = Number(
            Math.max(0, 100 - this.porcentajeAciertos).toFixed(2),
          );

          this.unidades = this.agruparPorUnidad(this.preguntas);

          this.dataGrafica = this.buildDataGrafica(this.unidades);

          this.breadCrumbService.addItem({
            jerarquia: 7,

            label: resp.materia,

            urlLink:
              '/s/resultados_area/' +
              this.materiaParam +
              '/' +
              this.alumnoParam +
              '/' +
              this.alumnoExamenParam,

            icon: '',
          });

          this.cd.markForCheck();
        },
      });
  }

  agruparPorUnidad(preguntas: PreguntaAlumnoV2[]): UnidadResultadoAlumno[] {
    const map = new Map<number, PreguntaAlumnoV2[]>();

    for (const pregunta of preguntas) {
      const unidadId = pregunta.unidadId ?? 0;

      if (!map.has(unidadId)) {
        map.set(unidadId, []);
      }

      map.get(unidadId)!.push(pregunta);
    }

    const salida: UnidadResultadoAlumno[] = [];

    for (const [unidadId, preguntasUnidad] of map.entries()) {
      preguntasUnidad.sort((a, b) => a.numeroPregunta - b.numeroPregunta);

      const base = preguntasUnidad[0];

      const puntajeObtenido = preguntasUnidad.reduce(
        (total, pregunta) => total + (pregunta.puntajeObtenido ?? 0),
        0,
      );

      const puntajeMaximo = preguntasUnidad.reduce(
        (total, pregunta) => total + (pregunta.puntajeMaximo ?? 0),
        0,
      );

      const porcentaje =
        puntajeMaximo > 0 ? Number(((puntajeObtenido / puntajeMaximo) * 100).toFixed(2)) : 0;

      const aciertos = preguntasUnidad.filter((pregunta) => pregunta.esCorrecta === true).length;

      const respondidas = preguntasUnidad.filter((pregunta) => pregunta.respondida).length;

      salida.push({
        unidadId,

        unidad: base?.unidad ?? 'Sin unidad',

        totalPreguntas: preguntasUnidad.length,

        respondidas,

        aciertos,

        puntajeObtenido,

        puntajeMaximo,

        porcentaje,

        preguntas: preguntasUnidad,
      });
    }

    return salida;
  }

  buildDataGrafica(unidades: UnidadResultadoAlumno[]): DataGraficaBarra {
    if (!unidades.length) {
      return {} as DataGraficaBarra;
    }

    return {
      categorias: unidades.map((unidad) => unidad.unidad),

      firstDataSet: unidades.map((unidad) => unidad.porcentaje),

      secondDataSet: unidades.map((unidad) =>
        Number(Math.max(0, 100 - unidad.porcentaje).toFixed(2)),
      ),

      firstLeyend: this.esRespuestaCorrecta ? 'Aciertos (%)' : 'Resultado (%)',

      secondLeyend: this.esRespuestaCorrecta ? 'Desaciertos (%)' : 'Restante (%)',

      title: this.resultadoMateria
        ? `Resultados de ${this.resultadoMateria.materia}`
        : 'Resultados',

      description: 'Resultado obtenido por unidad de análisis',
    };
  }

  get esRespuestaCorrecta(): boolean {
    return this.resultadoMateria?.tipoEvaluacion === 'RESPUESTA_CORRECTA';
  }

  get esPreescolar(): boolean {
    return this.resultadoMateria?.tipoEvaluacion === 'ESCALA_0_3';
  }

  getClaseResultado(porcentaje: number): string {
    if (porcentaje >= 80) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }

    if (porcentaje >= 60) {
      return 'bg-blue-50 text-blue-700 border-blue-100';
    }

    if (porcentaje >= 40) {
      return 'bg-amber-50 text-amber-700 border-amber-100';
    }

    return 'bg-rose-50 text-rose-700 border-rose-100';
  }
}

export interface UnidadResultadoAlumno {
  unidadId: number;

  unidad: string;

  totalPreguntas: number;

  respondidas: number;

  aciertos: number;

  puntajeObtenido: number;

  puntajeMaximo: number;

  porcentaje: number;

  preguntas: PreguntaAlumnoV2[];
}
