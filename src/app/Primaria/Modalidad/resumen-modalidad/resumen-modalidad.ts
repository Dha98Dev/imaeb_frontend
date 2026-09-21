import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, finalize, forkJoin, of } from 'rxjs';

import { CatalogoService } from '../../../core/services/Catalogos/catalogo.service';
import { GetEstadisticaService } from '../../../core/services/EstadisticaPromedios/getEstadistica.service';
import { BreadCrumService } from '../../../core/services/breadCrumbs/bread-crumb-service';

import { CatalogoCiclos, CatalogoExamen } from '../../../core/Interfaces/catalogo.interface';
import {
  EscuelaModalidad,
  EscuelasModalidadResponse,
  PromedioMateriaModalidad,
  ResultadoModalidadTabla,
  ResumenEstadistico,
  ResumenNivelResponse,
  ResumenUnidad,
} from '../../../core/Interfaces/resumenModalidad.interface';
import { ToastMessageService } from '../../../core/components/shared/toast-message/toast-message.service';

@Component({
  selector: 'app-resumen-modalidad',
  standalone: false,
  templateUrl: './resumen-modalidad.html',
  styleUrl: './resumen-modalidad.scss',
})
export class ResumenModalidad implements OnInit {
  public loader: boolean = false;

  public ciclos: CatalogoCiclos[] = [];
  public examenes: CatalogoExamen[] = [];
  public examenActual?: CatalogoExamen;

  public nivel: string = '';
  public modalidad: string = '';
  private idModalidad: string = '';

  public cicloSelected: number = 0;
  public examenSelected: number = 0;

  public resumenNivel: ResumenNivelResponse | null = null;
  public modalidadActual: ResumenEstadistico | null = null;

  public promedioNivel: number = 0;
  public promedioModalidad: number = 0;
  public promediosMaterias: PromedioMateriaModalidad[] = [];

  public escuelas: EscuelaModalidad[] = [];
  public resultados: ResultadoModalidadTabla[] = [];

  public paginaActual: number = 0;
  public tamanoPagina: number = 25;
  public totalElementos: number = 0;
  public totalPaginas: number = 0;

  public materiaUnidadSeleccionada: number | null = null;
  public unidadesFiltradas: ResumenUnidad[] = [];

  public mostrarMunicipios: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private catalogoService: CatalogoService,
    private estadisticaService: GetEstadisticaService,
    private breadCrumbService: BreadCrumService,
    private cd: ChangeDetectorRef,
    private toast: ToastMessageService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      try {
        this.nivel = atob(params.get('nivel') || '');
        this.idModalidad = atob(params.get('modalidad') || '');

        if (!this.nivel || !this.idModalidad) {
          return;
        }

        this.breadCrumbService.addItem({
          jerarquia: 2,
          label: 'Resumen de modalidad',
          urlLink: '',
          icon: '',
        });

        this.inicializar();
      } catch (error) {
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

            this.loader = false;
            this.cd.markForCheck();
            return;
          }

          this.cargarInformacionInicial();
        },
        error: (error) => {
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
    const examenesNivel = this.examenes.filter(
      (item) => item.cicloId === this.cicloSelected && item.nivelId === this.nivelId,
    );

    if (!examenesNivel.length) {
      this.examenSelected = 0;
      this.examenActual = undefined;
      return;
    }

    const examen = examenesNivel[examenesNivel.length - 1];

    this.examenSelected = examen.id;
    this.examenActual = examen;
  }

  cargarInformacionInicial(): void {
    this.loader = true;

    forkJoin({
      resumen: this.estadisticaService
        .getResumenNivel({
          examenId: this.examenSelected,
          nivelId: this.nivelId,
        })
        .pipe(
          catchError((error) => {
            return of(null);
          }),
        ),

      escuelas: this.estadisticaService
        .getEscuelasModalidad({
          examenId: this.examenSelected,
          modalidadId: this.modalidadId,
          pagina: this.paginaActual,
          tamano: this.tamanoPagina,
        })
        .pipe(
          catchError((error) => {
            return of(null);
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
        next: ({ resumen, escuelas }) => {
          this.procesarResumenNivel(resumen);
          this.procesarEscuelasModalidad(escuelas);
        },
      });
  }

  private procesarResumenNivel(respuesta: ResumenNivelResponse | null): void {
    if (!respuesta) {
      this.resumenNivel = null;
      this.modalidadActual = null;
      this.promedioNivel = 0;
      this.promedioModalidad = 0;
      this.promediosMaterias = [];
      this.materiaUnidadSeleccionada = null;
      this.unidadesFiltradas = [];
      return;
    }

    this.resumenNivel = respuesta;
    this.promedioNivel = Number(respuesta.resumenGeneral?.porcentaje ?? 0);

    this.modalidadActual =
      respuesta.modalidades?.find((item) => item.id === this.modalidadId) ?? null;

    this.promedioModalidad = Number(this.modalidadActual?.porcentaje ?? 0);

    if (this.modalidadActual) {
      this.modalidad = this.modalidadActual.descripcion;
    }

    this.promediosMaterias = (respuesta.materias ?? []).map((materia) => ({
      materiaId: materia.id,
      materia: materia.descripcion,
      porcentaje: Number(materia.porcentaje ?? 0),
    }));

    this.seleccionarPrimeraMateriaUnidades();
  }

  private procesarEscuelasModalidad(respuesta: EscuelasModalidadResponse | null): void {
    if (!respuesta) {
      this.escuelas = [];
      this.resultados = [];
      this.totalElementos = 0;
      this.totalPaginas = 0;
      return;
    }

    this.modalidad = respuesta.modalidad ?? this.modalidad;
    this.escuelas = respuesta.escuelas ?? [];

    this.paginaActual = respuesta.paginacion?.pagina ?? 0;
    this.tamanoPagina = respuesta.paginacion?.tamano ?? this.tamanoPagina;
    this.totalElementos = respuesta.paginacion?.totalElementos ?? 0;
    this.totalPaginas = respuesta.paginacion?.totalPaginas ?? 0;

    this.construirResultados();
  }

  private construirResultados(): void {
    this.resultados = this.escuelas.map(
      (escuela): ResultadoModalidadTabla => ({
        nivel: escuela.nivel?.descripcion ?? this.getnivelDescription(),
        promedioNivel: this.promedioNivel,
        modalidad: escuela.modalidad?.descripcion ?? this.modalidad,
        promedioModalidad: this.promedioModalidad,

        sector: escuela.sector?.numero ?? null,

        promedioSector: escuela.sector?.resultadoGeneralSector?.tieneResultados
          ? Number(escuela.sector.resultadoGeneralSector.porcentaje ?? 0)
          : 0,

        zona: escuela.zona?.numero ?? null,

        promedioZona: escuela.zona?.resultadoGeneralZona?.tieneResultados
          ? Number(escuela.zona.resultadoGeneralZona.porcentaje ?? 0)
          : 0,

        escuela: escuela.nombre,
        cct: escuela.cct,
        turno: escuela.turno?.descripcion ?? '',
        municipio: escuela.municipio?.descripcion ?? '',

        promedioCct: escuela.resultadoGeneralCentro?.tieneResultados
          ? Number(escuela.resultadoGeneralCentro.porcentaje ?? 0)
          : 0,

        tieneResultados: escuela.resultadoGeneralCentro?.tieneResultados ?? false,
      }),
    );
  }

  private seleccionarPrimeraMateriaUnidades(): void {
    if (!this.promediosMaterias.length) {
      this.materiaUnidadSeleccionada = null;
      this.unidadesFiltradas = [];
      return;
    }

    this.seleccionarMateriaUnidades(this.promediosMaterias[0].materiaId);
  }

  seleccionarMateriaUnidades(materiaId: number): void {
    this.materiaUnidadSeleccionada = materiaId;

    this.unidadesFiltradas = (this.resumenNivel?.unidades ?? []).filter(
      (unidad) => unidad.materiaId === materiaId,
    );

    this.cd.markForCheck();
  }

  getMateriaUnidadSeleccionada(): string {
    return (
      this.promediosMaterias.find((materia) => materia.materiaId === this.materiaUnidadSeleccionada)
        ?.materia ?? ''
    );
  }

  getBarWidth(porcentaje: number): number {
    const value = Number(porcentaje ?? 0);
    return Math.min(Math.max(value, 0), 100);
  }

  toggleMunicipios(): void {
    this.mostrarMunicipios = !this.mostrarMunicipios;
  }

  cambiarPagina(event: any): void {
    this.paginaActual = event.page ?? 0;
    this.tamanoPagina = event.rows ?? this.tamanoPagina;
    this.cargarEscuelasModalidad();
  }

  cargarEscuelasModalidad(): void {
    if (!this.examenSelected || !this.modalidadId) {
      return;
    }

    // this.loader = true;

    this.estadisticaService
      .getEscuelasModalidad({
        examenId: this.examenSelected,
        modalidadId: this.modalidadId,
        pagina: this.paginaActual,
        tamano: this.tamanoPagina,
      })
      .pipe(
        finalize(() => {
          this.loader = false;
          this.cd.markForCheck();
        }),
      )
      .subscribe({
        next: (respuesta) => {
          this.procesarEscuelasModalidad(respuesta);

          this.toast.success(
            'Información actualizada',
            'Los resultados de las escuelas se cargaron correctamente.',
            {
              duration: 3500,
            },
          );
        },

        error: (error) => {

          this.escuelas = [];
          this.resultados = [];

          this.toast.error(
            'No fue posible cargar la información',
            'Ocurrió un problema al consultar las escuelas de la modalidad seleccionada.',
            {
              duration: 5000,
            },
          );
        },
      });
  }

  private limpiarDatos(): void {
    this.resumenNivel = null;
    this.modalidadActual = null;

    this.promedioNivel = 0;
    this.promedioModalidad = 0;

    this.promediosMaterias = [];
    this.materiaUnidadSeleccionada = null;
    this.unidadesFiltradas = [];

    this.escuelas = [];
    this.resultados = [];

    this.paginaActual = 0;
    this.totalElementos = 0;
    this.totalPaginas = 0;

    this.mostrarMunicipios = false;
  }

  get nivelId(): number {
    return Number(this.nivel);
  }

  get modalidadId(): number {
    return Number(this.idModalidad);
  }

  getnivelDescription(): string {
    if (this.resumenNivel?.nivel) {
      return this.formatearTexto(this.resumenNivel.nivel);
    }

    return this.catalogoService.getNivelDescription(this.nivel);
  }

  formatearTexto(texto: string): string {
    if (!texto) return '';

    return texto
      .toLowerCase()
      .split(' ')
      .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  }

  formatearTipoEvaluacion(tipo: string): string {
    if (!tipo) return '';

    return tipo
      .replaceAll('_', ' ')
      .toLowerCase()
      .split(' ')
      .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  }
}
