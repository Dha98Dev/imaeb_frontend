import { Component, DestroyRef, inject } from '@angular/core';

import { Router } from '@angular/router';

import { MenuItem } from 'primeng/api';

import { catchError, finalize, of } from 'rxjs';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { StorageService } from '../../core/services/storage/sesionStorage.service';

import { DatosCct } from '../../core/Interfaces/DatosCct.interface';

import { GetCctInfoSErvice } from '../../core/services/Cct/GetCctInfo.service';

import { CryptoJsService } from '../../core/services/CriptoJs/cryptojs.service';

import { listadoAlumnosService } from '../../core/services/listadoAlumnos.service';

import {
  ResultadoAlumnoV2,
  ResultadoMateriaAlumnoV2,
} from '../../core/Interfaces/listadoAlumnoV2.interface';

@Component({
  selector: 'app-layout-page-padre-familia',
  standalone: false,
  templateUrl: './layout-page-padre-familia.html',
  styleUrl: './layout-page-padre-familia.scss',
})
export class LayoutPagePadreFamilia {
  public items: MenuItem[] = [];

  public tabActivo: string = 'Inicio';

  public datosCct: DatosCct = {} as DatosCct;

  public resultadoAlumno?: ResultadoAlumnoV2;

  public materias: ResultadoMateriaAlumnoV2[] = [];

  public cargandoMaterias: boolean = true;

  public menuCargado: boolean = false;

  private alumnoId: number = 0;

  private examenId: number = 0;

  private alumnoSeleccionadoCript: string = '';

  private destroyRef = inject(DestroyRef);

  constructor(
    private router: Router,
    private storage: StorageService,
    private cctService: GetCctInfoSErvice,
    private cripto: CryptoJsService,
    private listadoAlumnosService: listadoAlumnosService,
  ) {}

  ngOnInit(): void {
    this.obtenerAlumnoSeleccionado();

    this.escucharCentroTrabajo();

    /*
     * Aunque no tengamos alumno o examen,
     * mostramos el tab de Inicio.
     */
    if (!this.alumnoId || !this.examenId) {
      this.construirMenuMaterias([]);

      this.cargandoMaterias = false;

      this.menuCargado = true;

      return;
    }

    this.getMateriasAlumno();
  }

  private obtenerAlumnoSeleccionado(): void {
    const alumnoCript = this.storage.getCriptAlSeleccionado();

    const alumno = this.storage.getAlSeleccionado();

    const examen = this.storage.getExamenSeleccionado();

    if (alumnoCript) {
      this.alumnoSeleccionadoCript = alumnoCript;
    }

    if (alumno) {
      this.alumnoId = Number(alumno);
    }

    if (examen) {
      this.examenId = Number(examen);
    }
  }

  private escucharCentroTrabajo(): void {
    this.cctService.centroTrabajo$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      if (!data?.cct) {
        return;
      }

      /*
       * Evita cambios durante el mismo
       * ciclo de detección provocado
       * por app-header.
       */
      queueMicrotask(() => {
        this.datosCct = data;
      });
    });
  }

  getMateriasAlumno(): void {
    this.cargandoMaterias = true;

    this.menuCargado = false;

    this.listadoAlumnosService
      .obtenerResultadoAlumno(this.alumnoId, this.examenId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),

        catchError((error) => {
          console.error('Error obteniendo resultados del alumno', error);

          return of(undefined);
        }),

        finalize(() => {
          this.cargandoMaterias = false;

          this.menuCargado = true;
        }),
      )
      .subscribe({
        next: (resp) => {
          if (!resp) {
            this.resultadoAlumno = undefined;

            this.materias = [];

            this.construirMenuMaterias([]);

            return;
          }

          this.resultadoAlumno = resp;

          this.materias = resp.resultadosPorMateria ? [...resp.resultadosPorMateria] : [];

          this.construirMenuMaterias(this.materias);
        },
      });
  }

  private construirMenuMaterias(materias: ResultadoMateriaAlumnoV2[]): void {
    const inicio: MenuItem = {
      label: 'Inicio',

      icon: 'pi pi-home',

      command: () => {
        this.router.navigate(['/s/principal_alumno', this.alumnoSeleccionadoCript]);
      },
    };

    const materiasMenu: MenuItem[] = materias.map((materia) => ({
      label: materia.materia,

      icon: this.getIconMateria(materia.materia),

      command: () => {
        this.irResultadoMateria(materia);
      },
    }));

    /*
     * Reemplazamos siempre el arreglo.
     *
     * No utilizamos push() sobre this.items,
     * así evitamos tabs duplicados.
     */
    this.items = [inicio, ...materiasMenu];
  }

  seleccionarTab(item: MenuItem, event: Event): void {
    this.tabActivo = item.label ?? '';

    item.command?.({
      originalEvent: event,
      item,
    });
  }

  irResultadoMateria(materia: ResultadoMateriaAlumnoV2): void {
    const alumnoExamenId = this.storage.getAlumnoExamenId();

    if (!alumnoExamenId) {
      return;
    }

    this.router.navigate([
      '/s/resultados_area',

      this.cripto.Encriptar(materia.materiaId.toString()),

      this.alumnoSeleccionadoCript,

      this.cripto.Encriptar(alumnoExamenId.toString()),
    ]);
  }

  getIconMateria(materia: string): string {
    const nombre = materia
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (nombre.includes('matemat')) {
      return 'pi pi-calculator';
    }

    if (nombre.includes('ciencia')) {
      return 'pi pi-atom';
    }

    if (nombre.includes('saberes')) {
      return 'pi pi-sparkles';
    }

    if (nombre.includes('lengua')) {
      return 'pi pi-book';
    }

    return 'pi pi-file';
  }
}
