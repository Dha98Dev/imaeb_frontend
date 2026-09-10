import { ChangeDetectorRef, Component } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { catchError, finalize, forkJoin, map, of, switchMap } from 'rxjs';

import { CryptoJsService } from '../../core/services/CriptoJs/cryptojs.service';

import { GetCctInfoSErvice } from '../../core/services/Cct/GetCctInfo.service';

import { GetEstadisticaService } from '../../core/services/EstadisticaPromedios/getEstadistica.service';

import { BreadCrumService } from '../../core/services/breadCrumbs/bread-crumb-service';

import { listadoAlumnosService } from '../../core/services/listadoAlumnos.service';

import {
  AlumnoGrupoV2,
  ResultadoAlumnoV2,
  ResultadoMateriaAlumnoV2,
} from '../../core/Interfaces/listadoAlumnoV2.interface';

@Component({
  selector: 'app-principal-padre-familia',
  standalone: false,
  templateUrl: './principal-padre-familia.html',
  styleUrl: './principal-padre-familia.scss',
})
export class PrincipalPadreFamilia {
  constructor(
    private route: ActivatedRoute,
    private crypto: CryptoJsService,
    private cd: ChangeDetectorRef,
    private cctInfo: GetCctInfoSErvice,
    private estadisticaService: GetEstadisticaService,
    private breadCrumbService: BreadCrumService,
    private listadoAlumnosService: listadoAlumnosService,
  ) {}

  /*
   * ============================================================
   * PARÁMETROS
   * ============================================================
   */

  private alumnoParam: string = '';

  private examenParam: string = '';

  public alumnoID: number = 0;

  public examenId: number = 0;

  public cct: string = '';

  public grupo: string = '';

  /*
   * ============================================================
   * ESTADO
   * ============================================================
   */

  public loader: boolean = false;

  public nivel: number = 0;

  /*
   * ============================================================
   * ALUMNO
   * ============================================================
   */

  public alumno?: AlumnoGrupoV2;

  public resultadoAlumno?: ResultadoAlumnoV2;

  /*
   * ============================================================
   * PROMEDIOS
   * ============================================================
   */

  public promedioAlumno: number = 0;

  public promedioEstatal: number = 0;

  /*
   * ============================================================
   * MATERIAS
   * ============================================================
   */

  public materias: MateriaResultadoVista[] = [];

  /*
   * ============================================================
   * INIT
   * ============================================================
   */

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      try {
        const cctParam = params.get('cct');

        this.alumnoParam = params.get('idAlumno') || '';

        this.examenParam = params.get('examenId') || '';

        this.grupo = (params.get('grupo') || '').toUpperCase();

        if (!cctParam || !this.alumnoParam || !this.examenParam || !this.grupo) {
          return;
        }

        /*
         * Desencriptamos
         */

        this.cct = this.crypto.Desencriptar(cctParam) || '';

        this.alumnoID = Number(this.crypto.Desencriptar(this.alumnoParam));

        this.examenId = Number(this.crypto.Desencriptar(this.examenParam));

        if (!this.cct || !this.alumnoID || !this.examenId) {
          return;
        }

        /*
         * Datos compartidos
         */

        this.cctInfo.setCct(this.cct);

        this.cctInfo.setGrupo(this.grupo);

        /*
         * Cargar datos
         */

        this.loadData();
      } catch (error) {
        console.error('Error obteniendo parámetros del alumno', error);
      }
    });
  }

  /*
   * ============================================================
   * CARGA INICIAL
   * ============================================================
   */

  loadData(): void {
    this.loader = true;

    /*
     * Obtenemos simultáneamente:
     *
     * 1. Información del CCT
     * 2. Listado del grupo
     * 3. Resultado individual del alumno
     */

    forkJoin({
      datosCct: this.cctInfo.getInfoCct(this.cct).pipe(
        catchError((error) => {
          console.error('Error obteniendo CCT', error);

          return of([]);
        }),
      ),

      alumnos: this.listadoAlumnosService
        .obtenerAlumnosPorGrupo(this.cct, this.grupo, this.examenId, 0, 100)
        .pipe(
          catchError((error) => {
            console.error('Error obteniendo alumnos', error);

            return of({
              content: [],
              page: {
                size: 100,
                number: 0,
                totalElements: 0,
                totalPages: 0,
              },
            });
          }),
        ),

      resultado: this.listadoAlumnosService
        .obtenerResultadoAlumno(this.alumnoID, this.examenId)
        .pipe(
          catchError((error) => {
            console.error('Error obteniendo resultado del alumno', error);

            return of(undefined);
          }),
        ),
    })
      .pipe(
        switchMap(({ datosCct, alumnos, resultado }) => {
          /*
           * ======================================================
           * CCT / NIVEL
           * ======================================================
           */

          if (datosCct?.length) {
            this.cctInfo.setCentroTrabajo(datosCct[0]);

            this.nivel = datosCct[0].nivelId;
          }

          /*
           * ======================================================
           * ALUMNO
           * ======================================================
           */

          this.alumno = alumnos.content.find((item) => item.alumnoId === this.alumnoID);

          /*
           * ======================================================
           * RESULTADO GENERAL
           * ======================================================
           */

          this.resultadoAlumno = resultado;

          this.promedioAlumno = resultado?.porcentajeGeneral ?? 0;

          /*
           * Nombre para breadcrumb
           */

          const nombre = this.alumno?.nombreCompleto ?? resultado?.nombreCompleto ?? 'Alumno';

          this.cctInfo.setAlumno(nombre);

          this.breadCrumbService.addItem({
            jerarquia: 6,

            label: nombre,

            urlLink:
              '/s/principal_alumno/' +
              this.crypto.Encriptar(this.cct) +
              '/' +
              this.grupo +
              '/' +
              this.alumnoParam +
              '/' +
              this.examenParam,

            icon: '',
          });

          /*
           * ======================================================
           * PROMEDIO ESTATAL GENERAL
           * ======================================================
           *
           * El examenId es obligatorio.
           */

          const promedioEstatal$ = this.estadisticaService
            .getPromedioEstatalByNivel({
              examenId: this.examenId,

              nivelId: this.nivel,
            })
            .pipe(
              catchError((error) => {
                console.error('Error obteniendo promedio estatal', error);

                return of([]);
              }),
            );

          /*
           * ======================================================
           * PROMEDIOS ESTATALES POR MATERIA
           * ======================================================
           */

          const materias = resultado?.resultadosPorMateria ?? [];

          /*
           * Si no hay materias,
           * solamente obtenemos el promedio general.
           */

          if (!materias.length) {
            return promedioEstatal$.pipe(
              map((promedioEstatal) => ({
                promedioEstatal,

                materias: [] as MateriaResultadoVista[],
              })),
            );
          }

          /*
           * Una petición por materia
           */

          const promediosMateria = materias.map((materia) =>
            this.estadisticaService
              .getPromedioEstatalByNivel({
                examenId: this.examenId,

                nivelId: this.nivel,

                materiaId: materia.materiaId,
              })
              .pipe(
                map((resp) => {
                  return {
                    ...materia,

                    promedioEstatal: resp?.[0]?.porcentaje ?? 0,
                  } as MateriaResultadoVista;
                }),

                catchError((error) => {
                  console.error(`Error obteniendo promedio estatal de ${materia.materia}`, error);

                  return of({
                    ...materia,
                    promedioEstatal: 0,
                  } as MateriaResultadoVista);
                }),
              ),
          );

          /*
           * Ejecutamos general + materias.
           */

          return forkJoin({
            promedioEstatal: promedioEstatal$,

            materias: forkJoin(promediosMateria),
          });
        }),

        finalize(() => {
          this.loader = false;

          this.cd.markForCheck();
        }),
      )
      .subscribe({
        next: ({ promedioEstatal, materias }) => {
          /*
           * Promedio general estatal
           */

          this.promedioEstatal = promedioEstatal?.[0]?.porcentaje ?? 0;

          /*
           * Materias
           */

          this.materias = materias ?? [];

          this.cd.markForCheck();
        },

        error: (error) => {
          console.error('Error cargando información del alumno', error);
        },
      });
  }

  /*
   * ============================================================
   * TIPO EVALUACIÓN
   * ============================================================
   */

  get esPreescolar(): boolean {
    return this.resultadoAlumno?.tipoEvaluacion === 'ESCALA_0_3';
  }

  /*
   * ============================================================
   * SEXO
   * ============================================================
   */

  getSexo(sexo: string | undefined): string {
    switch (sexo?.toUpperCase()) {
      case 'H':
        return 'Hombre';

      case 'M':
        return 'Mujer';

      default:
        return 'Sin especificar';
    }
  }

  /*
   * ============================================================
   * CLASE POR RESULTADO
   * ============================================================
   */

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

  /*
   * ============================================================
   * ESTADO MATERIA
   * ============================================================
   */

  getEstadoMateria(materia: ResultadoMateriaAlumnoV2): string {
    if (!materia.asistio) {
      return 'No asistió';
    }

    switch (materia.estado) {
      case 'EVALUADO':
        return 'Evaluado';

      default:
        return materia.estado;
    }
  }
}

/*
 * ==============================================================
 * VIEW MODEL
 * ==============================================================
 */

export interface MateriaResultadoVista extends ResultadoMateriaAlumnoV2 {
  promedioEstatal: number;
}
