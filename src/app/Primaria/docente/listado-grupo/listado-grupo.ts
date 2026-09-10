import { ChangeDetectorRef, Component } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { catchError, finalize, forkJoin, of } from 'rxjs';

import { GetCctInfoSErvice } from '../../../core/services/Cct/GetCctInfo.service';

import { listadoAlumnosService } from '../../../core/services/listadoAlumnos.service';

import { BreadCrumService } from '../../../core/services/breadCrumbs/bread-crumb-service';

import { CryptoJsService } from '../../../core/services/CriptoJs/cryptojs.service';

import { CatalogoService } from '../../../core/services/Catalogos/catalogo.service';

import { CatalogoCiclos, CatalogoExamen } from '../../../core/Interfaces/catalogo.interface';
import { AlumnoGrupoV2 } from '../../../core/Interfaces/listadoAlumnoV2.interface';
import { StorageService } from '../../../core/services/storage/sesionStorage.service';

@Component({
  selector: 'app-listado-grupo',
  standalone: false,
  templateUrl: './listado-grupo.html',
  styleUrl: './listado-grupo.scss',
})
export class ListadoGrupo {
  constructor(
    private route: ActivatedRoute,
    private listadoAlumnosService: listadoAlumnosService,
    private cd: ChangeDetectorRef,
    private cctService: GetCctInfoSErvice,
    private breadCrumbService: BreadCrumService,
    private crypto: CryptoJsService,
    private catalogoService: CatalogoService,
    private router: Router,
    private storage:StorageService
  ) {}

  public cct: string = '';

  public grupo: string = '';

  public nivel: number = 0;

  public loader: boolean = false;

  public ciclos: CatalogoCiclos[] = [];

  public examenes: CatalogoExamen[] = [];

  public cicloSelected: number = 0;

  public examenSelected: number = 0;

  public examenActual?: CatalogoExamen;

  public alumnos: AlumnoListadoVista[] = [];

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

      this.cctService.setCct(this.cct);

      this.cctService.setGrupo(this.grupo);

      this.breadCrumbService.addItem({
        jerarquia: 5,

        label: 'Listado grupo ' + this.grupo,

        urlLink: '/prim_2/listado-grupo/' + this.crypto.Encriptar(this.cct) + '/' + this.grupo,

        icon: '',
      });

      this.inicializar();
    });
  }

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
          this.ciclos = ciclos ?? [];

          this.examenes = examenes ?? [];

          if (!datosCct?.length) {
            this.loader = false;

            return;
          }

          const centro = datosCct[0];

          this.cctService.setCentroTrabajo(centro);

          this.nivel = centro.nivelId;

          this.seleccionarCicloActual();

          this.seleccionarExamen();

          if (!this.examenSelected) {
            console.warn('No existe examen para el ciclo y nivel seleccionados');

            this.loader = false;

            return;
          }

          this.getListadoAlumnos();
        },

        error: (error) => {
          console.error('Error inicializando listado de grupo', error);

          this.loader = false;

          this.cd.markForCheck();
        },
      });
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

  getListadoAlumnos(): void {
    this.loader = true;

    this.listadoAlumnosService
      .obtenerAlumnosPorGrupo(this.cct, this.grupo, this.examenSelected, 0, 100)
      .pipe(
        catchError((error) => {
          console.error('Error obteniendo alumnos del grupo', error);

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
      )
      .subscribe({
        next: (resp) => {
          const alumnos = resp.content ?? [];

          if (!alumnos.length) {
            this.alumnos = [];

            this.loader = false;

            this.cd.markForCheck();

            return;
          }

          this.getPromediosAlumnos(alumnos);
        },
      });
  }

  getPromediosAlumnos(alumnos: AlumnoGrupoV2[]): void {
    const requests = alumnos.map((alumno) =>
      this.listadoAlumnosService.obtenerResultadoAlumno(alumno.alumnoId, this.examenSelected).pipe(
        catchError((error) => {
          console.error(`Error obteniendo resultado del alumno ${alumno.alumnoId}`, error);

          return of(undefined);
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
        next: (resultados) => {
          this.alumnos = alumnos
            .map((alumno, index) => {
              const resultado = resultados[index];

              return {
                alumnoId: alumno.alumnoId,

                alumnoExamenId: alumno.alumnoExamenId,

                folio: alumno.folio,

                curp: alumno.curp,

                nombre: alumno.nombre,

                apellidoPaterno: alumno.apellidoPaterno,

                apellidoMaterno: alumno.apellidoMaterno,

                nombreCompleto: alumno.nombreCompleto,

                sexo: alumno.sexo,

                cct: alumno.cct,

                nombreEscuela: alumno.nombreEscuela,

                grupo: alumno.grupo,

                turno: alumno.turno,

                examen: alumno.examen,

                examenId: alumno.examenId,

                ciclo: alumno.ciclo,

                nivel: alumno.nivel,

                promedio: resultado?.porcentajeGeneral ?? null,

                puntajeObtenido: resultado?.puntajeObtenido ?? null,

                puntajeMaximo: resultado?.puntajeMaximo ?? null,

                totalPreguntas: resultado?.totalPreguntas ?? null,

                totalAciertos: resultado?.totalAciertos ?? null,
              };
            })
            .sort((a, b) => a.apellidoPaterno.localeCompare(b.apellidoPaterno));
        },
      });
  }

  getSexo(sexo: string): string {
    switch (sexo?.toUpperCase()) {
      case 'H':
        return 'Hombre';

      case 'M':
        return 'Mujer';

      default:
        return 'Sin especificar';
    }
  }

  getClasePromedio(promedio: number | null): string {
    if (promedio === null) {
      return 'bg-slate-100 text-slate-500';
    }

    if (promedio >= 80) {
      return 'bg-emerald-50 text-emerald-700';
    }

    if (promedio >= 60) {
      return 'bg-blue-50 text-blue-700';
    }

    if (promedio >= 40) {
      return 'bg-amber-50 text-amber-700';
    }

    return 'bg-rose-50 text-rose-700';
  }

 verResultadoAlumno(alumno: AlumnoListadoVista): void {
  this.storage.saveAlumnoSeleccionado(
    alumno.alumnoId,
    alumno.examenId,
    alumno.alumnoExamenId,
  );

  this.router.navigate([
    '/s/principal_alumno',
    this.crypto.Encriptar(alumno.cct),
    alumno.grupo,
    this.crypto.Encriptar(alumno.alumnoId.toString()),
    this.crypto.Encriptar(alumno.examenId.toString()),
  ]);
}
}

export interface AlumnoListadoVista {
  alumnoId: number;
  alumnoExamenId: number;
  examenId: number;

  folio: string;
  curp: string;

  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto: string;

  sexo: string;

  cct: string;
  nombreEscuela: string;

  grupo: string;
  turno: string;

  examen: string;
  ciclo: number;
  nivel: string;

  promedio: number | null;
  puntajeObtenido: number | null;
  puntajeMaximo: number | null;
  totalPreguntas: number | null;
  totalAciertos: number | null;
}