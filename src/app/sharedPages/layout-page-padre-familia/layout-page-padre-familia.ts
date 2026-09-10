import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { catchError, finalize, of } from 'rxjs';

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
export class LayoutPagePadreFamilia implements OnInit {
  constructor(
    private router: Router,
    private storage: StorageService,
    private cctService: GetCctInfoSErvice,
    private cd: ChangeDetectorRef,
    private cripto: CryptoJsService,
    private listadoAlumnosService: listadoAlumnosService,
  ) {}

  public items: MenuItem[] = [];

  public datosCct: DatosCct = {} as DatosCct;

  public resultadoAlumno?: ResultadoAlumnoV2;

  public materias: ResultadoMateriaAlumnoV2[] = [];

  public cargandoMaterias: boolean = true;

  public menuCargado: boolean = false;

  private alumnoId: number = 0;

  private examenId: number = 0;

  private alumnoSeleccionadoCript: string = '';

  ngOnInit(): void {
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
      this.examenId = examen;
    }

    this.cctService.centroTrabajo$.subscribe((data) => {
      if (!data?.cct) {
        return;
      }

      this.datosCct = data;

      this.cd.markForCheck();
    });

    if (!this.alumnoId || !this.examenId) {
      console.error('No se pudo cargar el menú de materias', {
        alumnoId: this.alumnoId,
        examenId: this.examenId,
      });

      this.construirMenuMaterias([]);

      this.cargandoMaterias = false;

      return;
    }

    this.getMateriasAlumno();
  }

  getMateriasAlumno(): void {
    this.cargandoMaterias = true;

    this.menuCargado = false;

    this.listadoAlumnosService
      .obtenerResultadoAlumno(this.alumnoId, this.examenId)
      .pipe(
        catchError((error) => {
          console.error('Error obteniendo resultados del alumno', error);

          return of(undefined);
        }),

        finalize(() => {
          this.cargandoMaterias = false;

          this.menuCargado = true;

          this.cd.markForCheck();
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

          console.log('Materias recibidas:', this.materias);

          this.construirMenuMaterias(this.materias);
        },
      });
  }

  construirMenuMaterias(materias: ResultadoMateriaAlumnoV2[]): void {
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

      tooltipOptions: {
        tooltipLabel: materia.materia,
        tooltipPosition: 'bottom',
      },

      command: () => {
        this.irResultadoMateria(materia);
      },
    }));

    this.items = [inicio, ...materiasMenu];

    console.log('Items del SpeedDial:', this.items);

    this.cd.markForCheck();
  }

  irResultadoMateria(materia: ResultadoMateriaAlumnoV2): void {
    const alumnoExamenId = this.storage.getAlumnoExamenId();

    if (!alumnoExamenId) {
      console.error('No existe alumnoExamenId en sessionStorage');

      return;
    }

    console.log('Datos para navegación:', {
      materiaId: materia.materiaId,
      alumnoId: this.storage.getAlSeleccionado(),
      alumnoExamenId,
      examenId: this.storage.getExamen(),
    });

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
      return 'pi pi-chart-pie';
    }

    if (nombre.includes('ciencia')) {
      return 'pi pi-building';
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
