import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';
import { CatalogoService } from '../../../core/services/Catalogos/catalogo.service';
import {
  CatalogoCiclos,
  CatalogoExamen,
  Nivele,
} from '../../../core/Interfaces/catalogo.interface';
import { GetEstadisticaService } from '../../../core/services/EstadisticaPromedios/getEstadistica.service';
import { DataGraficaBarra } from '../../../core/Interfaces/grafica.interface';
import { AuthService } from '../../../Auth/services/auth.service';

@Component({
  selector: 'app-resumen-nivel',
  standalone: false,
  templateUrl: './resumen-nivel.html',
  styleUrl: './resumen-nivel.scss',
})
export class ResumenNivel implements OnInit {
  public ciclos: CatalogoCiclos[] = [];
  public examenes: CatalogoExamen[] = [];
  public niveles: Nivele[] = [];

  public cicloSeleccionado: number | null = null;
  public examenSeleccionado: number | null = null;
  public nivelSeleccionado: number = 0;

  public materiaUnidadSeleccionada: number | null = null;
  public vistaUnidades: 'grafica' | 'tarjetas' = 'grafica';
  public unidadesFiltradas: any[] = [];

  public municipioSeleccionado: number = 0;
  public municipiosOpciones: any[] = [];
  public municipiosFiltrados: any[] = [];

  public resumenNivel: any = null;
  public loader: boolean = false;

  public dataChartModalidades: DataGraficaBarra = {} as DataGraficaBarra;
  public dataChartMunicipios: DataGraficaBarra = {} as DataGraficaBarra;
  public dataChartUnidades: DataGraficaBarra = {} as DataGraficaBarra;
  public scope: string = '';
  public nivelesPermitidosIds: number[] = [];
  public accesoTodosLosNiveles: boolean = false;

  constructor(
    private catalogoService: CatalogoService,
    private estadisticaService: GetEstadisticaService,
    private cd: ChangeDetectorRef,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    this.loader = true;

    forkJoin({
      usuario: this.authService.ensureUsuario(),

      ciclos: this.catalogoService.getCiclos(),

      examenes: this.catalogoService.getExamenes(),

      catalogo: this.catalogoService.getCatalogo({}),
    }).subscribe({
      next: ({ usuario, ciclos, examenes, catalogo }) => {
        if (!usuario) {
          this.loader = false;
          this.cd.markForCheck();
          return;
        }

        this.scope = this.authService.getScope();

        this.nivelesPermitidosIds = this.authService.getNivelIds();

        this.accesoTodosLosNiveles = this.puedeVerTodosLosNiveles();

        this.ciclos = ciclos ?? [];

        const nivelesCatalogo = catalogo.niveles ?? [];

        const examenesCatalogo = examenes ?? [];

        /*
         * Aquí aplicamos la restricción
         * del usuario autenticado.
         */
        this.niveles = this.filtrarNivelesPermitidos(nivelesCatalogo);

        this.examenes = this.filtrarExamenesPermitidos(examenesCatalogo);

        if (!this.niveles.length || !this.examenes.length) {
          this.loader = false;

          this.resumenNivel = null;

          this.limpiarGraficas();

          this.cd.markForCheck();

          return;
        }

        /*
         * Seleccionamos automáticamente
         * el último nivel de los que
         * realmente puede consultar.
         */
        const ultimoNivel = this.niveles[this.niveles.length - 1];

        this.getEstadistica(ultimoNivel.id);
      },

      error: (error) => {

        this.loader = false;

        this.resumenNivel = null;

        this.limpiarGraficas();

        this.cd.markForCheck();
      },
    });
  }
  private puedeVerTodosLosNiveles(): boolean {
    const scope = this.authService.getScope();

    if (scope === 'ADMIN' || scope === 'EJECUTIVO') {
      return true;
    }

    return this.authService.tieneAccesoGlobal();
  }
  private filtrarNivelesPermitidos(niveles: Nivele[]): Nivele[] {
    if (this.accesoTodosLosNiveles) {
      return niveles;
    }

    const nivelIds = this.authService.getNivelIds();

    if (!nivelIds.length) {
      return [];
    }

    return niveles.filter((nivel) => nivelIds.includes(nivel.id));
  }
  private filtrarExamenesPermitidos(examenes: CatalogoExamen[]): CatalogoExamen[] {
    if (this.accesoTodosLosNiveles) {
      return examenes;
    }

    const nivelIds = this.authService.getNivelIds();

    if (!nivelIds.length) {
      return [];
    }

    return examenes.filter((examen) => nivelIds.includes(examen.nivelId));
  }
  private puedeConsultarNivel(nivelId: number): boolean {
    if (this.accesoTodosLosNiveles) {
      return true;
    }

    return this.authService.getNivelIds().includes(nivelId);
  }
  getEstadistica(nivelId: number): void {
    this.nivelSeleccionado = nivelId;
    this.resumenNivel = null;
    this.materiaUnidadSeleccionada = null;
    this.unidadesFiltradas = [];
    this.municipioSeleccionado = 0;
    this.municipiosOpciones = [];
    this.municipiosFiltrados = [];

    const examenesNivel = this.examenes.filter((examen) => examen.nivelId === nivelId);

    if (!examenesNivel.length) {
      this.examenSeleccionado = null;
      this.cicloSeleccionado = null;
      this.loader = false;
      this.limpiarGraficas();
      this.cd.markForCheck();
      return;
    }

    const ultimoExamen = examenesNivel[examenesNivel.length - 1];

    this.examenSeleccionado = ultimoExamen.id;
    this.cicloSeleccionado = ultimoExamen.cicloId ?? this.obtenerUltimoCicloId();
    this.obtenerResumenNivel();
  }

  obtenerResumenNivel(): void {
    if (
      this.examenSeleccionado === null ||
      this.cicloSeleccionado === null ||
      this.nivelSeleccionado === 0
    ) {
      this.loader = false;
      return;
    }

    this.loader = true;

    const params = {
      examenId: this.examenSeleccionado,
      cicloId: this.cicloSeleccionado,
      nivelId: this.nivelSeleccionado,
    };

    this.estadisticaService
      .getResumenNivel(params)
      .pipe(
        finalize(() => {
          this.loader = false;
          this.cd.markForCheck();
        }),
      )
      .subscribe({
        next: (resp) => {
          this.resumenNivel = resp ?? null;

          if (!this.resumenNivel) {
            this.limpiarGraficas();
            return;
          }

          this.prepararGraficaModalidades();
          this.prepararMunicipios();
          this.seleccionarPrimeraMateriaUnidades();
          this.cd.markForCheck();
        },
        error: (error) => {
          this.resumenNivel = null;
          this.limpiarGraficas();
          this.cd.markForCheck();
        },
      });
  }

  prepararGraficaModalidades(): void {
    const modalidades = this.resumenNivel?.modalidades ?? [];

    this.dataChartModalidades = {
      categorias: modalidades.map((item: any) => item.descripcion),
      firstDataSet: modalidades.map((item: any) => Number(item.porcentaje)),
      firstLeyend: 'Resultado',
      title: 'Porcentaje',
      description: 'Resultados por modalidad',
    } as DataGraficaBarra;
  }

  seleccionarPrimeraMateriaUnidades(): void {
    const materias = this.resumenNivel?.materias ?? [];

    if (!materias.length) {
      this.materiaUnidadSeleccionada = null;
      this.unidadesFiltradas = [];
      this.dataChartUnidades = {} as DataGraficaBarra;
      return;
    }

    this.seleccionarMateriaUnidades(materias[0].id);
  }

  seleccionarMateriaUnidades(materiaId: number): void {
    this.materiaUnidadSeleccionada = materiaId;

    this.unidadesFiltradas = (this.resumenNivel?.unidades ?? []).filter(
      (unidad: any) => unidad.materiaId === materiaId,
    );

    const materia = this.resumenNivel?.materias?.find((item: any) => item.id === materiaId);

    this.dataChartUnidades = {
      categorias: this.unidadesFiltradas.map((item: any) => item.unidad),
      firstDataSet: this.unidadesFiltradas.map((item: any) => Number(item.porcentaje)),
      firstLeyend: materia?.descripcion ?? 'Resultado',
      title: 'Porcentaje',
      description: `Resultados por unidad de análisis de ${materia?.descripcion ?? ''}`,
    } as DataGraficaBarra;

    this.cd.markForCheck();
  }

  cambiarVistaUnidades(vista: 'grafica' | 'tarjetas'): void {
    this.vistaUnidades = vista;
    this.cd.markForCheck();
  }

  prepararMunicipios(): void {
    const municipios = this.resumenNivel?.municipios ?? [];

    this.municipiosOpciones = [
      { municipioId: 0, municipio: 'TODOS LOS MUNICIPIOS' },
      ...municipios,
    ];

    this.municipioSeleccionado = 0;
    this.municipiosFiltrados = municipios;
    this.prepararGraficaMunicipios();
  }

  cambiarMunicipio(): void {
    const municipios = this.resumenNivel?.municipios ?? [];

    if (this.municipioSeleccionado === 0) {
      this.municipiosFiltrados = municipios;
      this.prepararGraficaMunicipios();
      this.cd.markForCheck();
      return;
    }

    const municipio = municipios.find(
      (item: any) => item.municipioId === this.municipioSeleccionado,
    );

    this.municipiosFiltrados = municipio ? [municipio] : [];

    if (municipio) {
      this.prepararGraficaMunicipioSeleccionado(municipio);
    }

    this.cd.markForCheck();
  }

  prepararGraficaMunicipios(): void {
    const municipios = this.resumenNivel?.municipios ?? [];

    this.dataChartMunicipios = {
      categorias: municipios.map((item: any) => this.formatearTexto(item.municipio)),
      firstDataSet: municipios.map((item: any) => Number(item.porcentaje)),
      firstLeyend: 'Resultado',
      title: 'Porcentaje',
      description: 'Resultados por municipio',
    } as DataGraficaBarra;
  }

  prepararGraficaMunicipioSeleccionado(municipio: any): void {
    const materias = municipio?.materias ?? [];

    this.dataChartMunicipios = {
      categorias: materias.map((item: any) => item.descripcion),
      firstDataSet: materias.map((item: any) => Number(item.porcentaje)),
      firstLeyend: this.formatearTexto(municipio.municipio),
      title: 'Porcentaje',
      description: `Resultados por área de ${this.formatearTexto(municipio.municipio)}`,
    } as DataGraficaBarra;
  }

  private limpiarGraficas(): void {
    this.dataChartModalidades = {} as DataGraficaBarra;
    this.dataChartMunicipios = {} as DataGraficaBarra;
    this.dataChartUnidades = {} as DataGraficaBarra;
    this.unidadesFiltradas = [];
    this.municipiosFiltrados = [];
    this.municipiosOpciones = [];
    this.materiaUnidadSeleccionada = null;
    this.municipioSeleccionado = 0;
  }

  private obtenerUltimoCicloId(): number | null {
    if (!this.ciclos.length) return null;
    return this.ciclos[this.ciclos.length - 1].id;
  }

  getIconNivel(nivel: string): string {
    const descripcion = nivel?.toUpperCase() ?? '';

    if (descripcion.includes('PREESCOLAR')) return 'pi pi-sparkles';
    if (descripcion.includes('PRIMARIA')) return 'pi pi-book';
    if (descripcion.includes('SECUNDARIA')) return 'pi pi-graduation-cap';

    return 'pi pi-chart-bar';
  }

  formatearNivel(nivel: string): string {
    if (!nivel) return '';
    return nivel.charAt(0).toUpperCase() + nivel.slice(1).toLowerCase();
  }

  formatearTexto(texto: string): string {
    if (!texto) return '';

    return texto
      .toLowerCase()
      .split(' ')
      .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  }

  getColorMateria(materia: string): string {
    const descripcion = materia?.toUpperCase() ?? '';

    if (descripcion.includes('LENGUAJE')) return '#8B5CF6';
    if (descripcion.includes('MATEM')) return '#3B82F6';
    if (descripcion.includes('CIENCIA')) return '#10B981';

    return '#886849';
  }
}
