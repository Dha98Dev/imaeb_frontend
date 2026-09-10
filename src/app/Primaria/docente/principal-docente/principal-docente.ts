import { ChangeDetectorRef, Component } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { catchError, finalize, forkJoin, of } from 'rxjs';

import { GetCctInfoSErvice } from '../../../core/services/Cct/GetCctInfo.service';

import { CatalogoService } from '../../../core/services/Catalogos/catalogo.service';

import { CryptoJsService } from '../../../core/services/CriptoJs/cryptojs.service';

import { BreadCrumService } from '../../../core/services/breadCrumbs/bread-crumb-service';


import { GetEstadisticaService } from '../../../core/services/EstadisticaPromedios/getEstadistica.service';

import { DatosCct } from '../../../core/Interfaces/DatosCct.interface';

import { CatalogoCiclos, CatalogoExamen } from '../../../core/Interfaces/catalogo.interface';
import { ResultadosDirectorService } from '../../../core/services/resultados-director.service';
import { ConteoSexoGrupo, DesempenioMateriaGrupo, ParticipacionGrupo, PromedioGrupo } from '../../../core/Interfaces/resultados-director.interface';


@Component({
  selector: 'app-principal-docente',
  standalone: false,
  templateUrl: './principal-docente.html',
  styleUrl: './principal-docente.scss',
})
export class PrincipalDocente {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cctService: GetCctInfoSErvice,
    private cd: ChangeDetectorRef,
    private breadCrumbService: BreadCrumService,
    private crypto: CryptoJsService,
    private catalogoService: CatalogoService,
    private resultadosService: ResultadosDirectorService,
    private estadisticaService: GetEstadisticaService,
  ) {}

  /*
   * ============================================================
   * GENERALES
   * ============================================================
   */

  public loader: boolean = false;

  public cct: string = '';

  public grupo: string = '';

  public nivel: number = 0;

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
   * INFORMACIÓN DEL GRUPO
   * ============================================================
   */

  public conteoSexo?: ConteoSexoGrupo;

  public participacionGrupo?: ParticipacionGrupo;

  public promedioGrupo?: PromedioGrupo;

  /*
   * ============================================================
   * RESULTADOS POR MATERIA
   * ============================================================
   */

  public resultadosMaterias: DesempenioMateriaGrupo[] = [];

  /*
   * ============================================================
   * PROMEDIOS
   * ============================================================
   */

  public promedioEstatal: number = 0;

  /*
   * ============================================================
   * TOTALES
   * ============================================================
   */

  public totalAlumnos: number = 0;

  public totalHombres: number = 0;

  public totalMujeres: number = 0;

  public totalSinEspecificar: number = 0;

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
       * Mantener comportamiento actual
       */

      this.cctService.setCct(this.cct);

      this.cctService.setGrupo(this.grupo);

      /*
       * Breadcrumb
       */

      this.breadCrumbService.addItem({
        jerarquia: 5,
        label: 'Grupo ' + this.grupo,

        urlLink: '/prim_2/resultados-grupo/' + this.crypto.Encriptar(this.cct) + '/' + this.grupo,

        icon: '',
      });

      /*
       * Inicializar nueva versión
       */

      this.inicializarDocente();
    });
  }

  /*
   * ============================================================
   * CARGA INICIAL
   * ============================================================
   */

  inicializarDocente(): void {
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
            console.warn('No se encontró información para la CCT', this.cct);

            this.loader = false;

            return;
          }

          const centro: DatosCct = datosCct[0];

          /*
           * Guardar CCT
           */

          this.cctService.setCentroTrabajo(centro);

          /*
           * Nivel
           *
           * En tu versión nueva estás utilizando nivelId.
           */

          this.nivel = centro.nivelId;

          /*
           * Seleccionar ciclo
           */

          this.seleccionarCicloActual();

          /*
           * Seleccionar examen
           */

          this.seleccionarExamen();

          /*
           * Validar
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
           * Cargar datos del grupo
           */

          this.loadData();
        },

        error: (error) => {
          console.error('Error inicializando la vista del docente', error);

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

    /*
     * Seleccionamos el año mayor,
     * sin depender del orden del backend.
     */

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
   * CARGAR INFORMACIÓN DEL GRUPO
   * ============================================================
   */

  loadData(): void {
    if (!this.cct || !this.grupo || !this.examenSelected) {
      return;
    }

    this.loader = true;

    this.limpiarResultados();

    forkJoin({
      /*
       * Conteo por sexo.
       *
       * El endpoint devuelve todos los grupos de la CCT,
       * por eso después buscamos el grupo actual.
       */

      conteoSexo: this.resultadosService.getConteoSexo(this.cct, this.examenSelected).pipe(
        catchError((error) => {
          console.error('Error obteniendo conteo por sexo', error);

          return of([]);
        }),
      ),

      /*
       * Promedios de grupos.
       *
       * Después buscamos el registro del grupo actual.
       */

      promedios: this.resultadosService.getPromediosGrupos(this.cct, this.examenSelected).pipe(
        catchError((error) => {
          console.error('Error obteniendo promedio del grupo', error);

          return of([]);
        }),
      ),

      /*
       * Participación específica del grupo
       */

      participacion: this.resultadosService
        .getParticipacionGrupo(this.cct, this.grupo, this.examenSelected)
        .pipe(
          catchError((error) => {
            console.error('Error obteniendo participación del grupo', error);

            return of(undefined);
          }),
        ),

      /*
       * Resultado / desempeño por materia
       */

      desempenio: this.resultadosService
        .getDesempenioGrupo(this.cct, this.grupo, this.examenSelected)
        .pipe(
          catchError((error) => {
            console.error('Error obteniendo desempeño por materia', error);

            return of([]);
          }),
        ),

      /*
       * Promedio estatal nuevo.
       *
       * El endpoint nuevo necesita examenId.
       */

promedioEstatal:
  this.estadisticaService
    .getPromedioEstatalByNivel({
      examenId: this.examenSelected,
      nivelId: this.nivel,
    })
    .pipe(
      catchError((error) => {
        console.error(
          'Error obteniendo promedio estatal',
          error,
        );

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
        next: ({ conteoSexo, promedios, participacion, desempenio, promedioEstatal }) => {
          /*
           * ======================================================
           * SEXO
           * ======================================================
           */

          this.conteoSexo = conteoSexo.find(
            (item) => item.grupo.toUpperCase() === this.grupo.toUpperCase(),
          );

          if (this.conteoSexo) {
            this.totalAlumnos = this.conteoSexo.totalParticipantes;

            this.totalHombres = this.conteoSexo.hombres;

            this.totalMujeres = this.conteoSexo.mujeres;

            this.totalSinEspecificar = this.conteoSexo.sinEspecificar;
          }

          /*
           * ======================================================
           * PROMEDIO DEL GRUPO
           * ======================================================
           */

          this.promedioGrupo = promedios.find(
            (item) => item.grupo.toUpperCase() === this.grupo.toUpperCase(),
          );

          /*
           * ======================================================
           * PARTICIPACIÓN
           * ======================================================
           */

          this.participacionGrupo = participacion;

          /*
           * ======================================================
           * MATERIAS
           * ======================================================
           */

          this.resultadosMaterias = desempenio;

          /*
           * ======================================================
           * PROMEDIO ESTATAL
           * ======================================================
           */

          if (promedioEstatal?.length) {
            this.promedioEstatal =
              promedioEstatal[0].porcentaje ?? promedioEstatal[0].promedio ?? 0;
          }

          this.cd.markForCheck();
        },
      });
  }

  /*
   * ============================================================
   * LIMPIAR
   * ============================================================
   */

  limpiarResultados(): void {
    this.conteoSexo = undefined;

    this.participacionGrupo = undefined;

    this.promedioGrupo = undefined;

    this.resultadosMaterias = [];

    this.promedioEstatal = 0;

    this.totalAlumnos = 0;

    this.totalHombres = 0;

    this.totalMujeres = 0;

    this.totalSinEspecificar = 0;
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
   * CLASE RESULTADO
   * ============================================================
   */

  getClasePorcentaje(porcentaje: number): string {
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
   * MATERIA SELECCIONADA
   * ============================================================
   */

  materiaSelected(materia: DesempenioMateriaGrupo): void {
    /*
     * El endpoint nuevo de preguntas necesita:
     *
     * cct
     * grupo
     * materiaId
     * examenId
     *
     * Podemos utilizar estos datos en la siguiente pantalla.
     */

    console.log('Materia seleccionada:', materia);

    /*
     * Más adelante podemos navegar a:
     *
     * /resultados-grupo-area/:cct/:grupo/:materiaId
     */

    // this.router.navigate([
    //   '/prim_2/resultados-grupo-area',
    //   this.crypto.Encriptar(this.cct),
    //   this.grupo,
    //   materia.materiaId,
    // ]);
  }
}
