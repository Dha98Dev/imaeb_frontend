import { ChangeDetectorRef, Component } from '@angular/core';
import { ModalidadesService } from '../../../core/services/Modalidades/Modalidades.service';
import { GetEstadisticaService } from '../../../core/services/EstadisticaPromedios/getEstadistica.service';
import { CatalogoService } from '../../../core/services/Catalogos/catalogo.service';
import { modalidad } from '../../../core/Interfaces/Modalidad.interface';
import { DataGraficaBarra } from '../../../core/Interfaces/grafica.interface';
import { PromedioEstatalCct } from '../../../core/Interfaces/promediosEstatales.interface';
import { firstValueFrom, forkJoin, map } from 'rxjs';
import { MunicipiosOrLocalidades } from '../../../core/Interfaces/catalogo.interface';
import { GetBackgroundService } from '../../../core/services/getColors/getBackground.service';
interface promedio {
  nivel: string,
  promedio: number,
  materia?: string,
  municipio?:string
}

@Component({
  selector: 'app-principal-estadistica-general',
  standalone: false,
  templateUrl: './principal-estadistica-general.html',
  styleUrl: './principal-estadistica-general.scss'
})
export class PrincipalEstadisticaGeneral {
  constructor(private modalidadesService: ModalidadesService, private estadisticaService: GetEstadisticaService, private cd: ChangeDetectorRef, private catalogoService: CatalogoService, private getBgMateriaService:GetBackgroundService) { }
  public nivelSeleccionado: number = 0
  public modalidades: modalidad[] = []
  public dataChartModalidades: DataGraficaBarra = {} as DataGraficaBarra
  public dataChartNivelAndMunicipio: DataGraficaBarra = {} as DataGraficaBarra
  public promediosGeneralesEstatales: promedio[] = []
  public promedioGeneralesEstatalesBynivelAndMateria: promedio[] = []
  public municipios:MunicipiosOrLocalidades[]=[]
  public PromedioByNivelAndMunicipioAndMateria:promedio[][]=[]


  ngOnInit() {
    // this.getEstadistica(1)
    this.getPromediosEstatales()
    this.getMunicipio()
  }

  getMunicipio() {
    this.catalogoService.getMunicipios().subscribe({
      next: resp => {
        this.municipios=resp
      },
      error: error => {

      }
    })
  }

  getEstadistica(nivel: number) {
    this.nivelSeleccionado = nivel
    this.modalidadesService.getModalidadesNivel(nivel).subscribe({
      next: resp => {
        console.log(resp)
        this.modalidades = resp
        this.getPromediosEstatalesPorModalidad(this.getModalidadesUnicas())
        this.getPromedioGeneralByMateriaAndNivel()
        this.getEstadisticaByNivelAndMunicipio()
        this.getPromedioByNivelAndMunicipioAndMateria()
      },
      error: error => {

      }
    })
  }


  getModalidadesUnicas() {
    let modalidadesUnicas = Array.from(
      new Map(this.modalidades.map(m => [m.idModalidad, { id: m.idModalidad, descripcion: m.descripcionModalidad }]))
        .values()
    );
    console.log(modalidadesUnicas)
    return modalidadesUnicas
  }

  async getPromediosEstatalesPorModalidad(modalidadesUnicas: any[]) {
    if (!modalidadesUnicas?.length) {
      this.dataChartModalidades = {
        categorias: [],
        firstDataSet: [],
        secondDataSet: [],
        firstLeyend: 'Promedios por Modalidades',
        secondLeyend: '',
        title: 'Promedios por Modalidades',
        description: 'listado de promedios agrupados por modalidad y nivel'
      };
      return;
    }

    const nivelId = +this.nivelSeleccionado;

    try {
      // Dispara todas las peticiones en paralelo
      const requests = modalidadesUnicas.map(m =>
        firstValueFrom(
          this.estadisticaService.getPromedioEstatalByNivel({
            nivelId,
            modalidadId: m.id
          })
        ).then(resp => ({
          categoria: m.descripcion,
          promedio: Number(resp?.[0]?.promedio ?? 0)
        }))
      );

      const resultados = await Promise.all(requests);

      // Construye los arreglos para la gráfica
      const categorias = resultados.map(r => r.categoria);
      const dataSet = resultados.map(r => Number(r.promedio.toFixed(2)));

      this.dataChartModalidades = {
        categorias,
        firstDataSet: dataSet,
        secondDataSet: [],
        firstLeyend: 'Promedios por Modalidades',
        secondLeyend: '',
        title: 'Promedios por Modalidades',
        description: `Listado de promedios por modalidad para el nivel ${nivelId}`
      };

      this.cd?.markForCheck?.();
    } catch (err) {
      console.error('Error obteniendo promedios por modalidad:', err);
      // Manejo mínimo en caso de error
    }
  }

  async getPromediosEstatales() {
    const niveles = [1, 2, 3];
    try {
      // Dispara todas las peticiones en paralelo
      const responses = await Promise.all(
        niveles.map(nivelId =>
          firstValueFrom(this.estadisticaService.getPromedioEstatalByNivel({ nivelId }))
            .then(resp => ({
              nivelId,
              promedio: Number(resp?.[0]?.promedio ?? 0)
            }))
        )
      );

      // Orden garantizado por niveles y mapeo a tu estructura
      const data: promedio[] = responses
        .sort((a, b) => a.nivelId - b.nivelId)
        .map(r => ({
          nivel: this.getNivelDescription(String(r.nivelId)),
          promedio: r.promedio
        }));
      this.promediosGeneralesEstatales = data
      this.cd.detectChanges()


      console.log(this.promediosGeneralesEstatales)
    } catch (err) {
      console.error('Error cargando promedios estatales:', err);
      this.promediosGeneralesEstatales = [];
    }
  }

  async getPromedioGeneralByMateriaAndNivel() {
    const materias = this.nivelSeleccionado == 1 ? [1, 2] : [1, 3, 4];
    const nivel = this.getNivelDescription(this.nivelSeleccionado.toString());

    try {
      // dispara todas las llamadas en paralelo
      const responses = await Promise.all(
        materias.map(async materiaId => {
          const resp = await firstValueFrom(
            this.estadisticaService.getPromedioEstatalByNivel({ nivelId: this.nivelSeleccionado, materiaId }));
          return {
            promedio: resp?.[0]?.promedio ?? 0,
            materia: this.getNombreMateria(materiaId),
            nivel
          } as promedio;
        })
      );
      // guarda los resultados en tu arreglo
      this.promedioGeneralesEstatalesBynivelAndMateria = responses;
      this.cd.detectChanges()
      console.log('Resultados:', this.promedioGeneralesEstatalesBynivelAndMateria);

    } catch (err) {
      console.error('Error obteniendo promedios por materia y nivel:', err);
      this.promedioGeneralesEstatalesBynivelAndMateria = [];
    }
  }

async getEstadisticaByNivelAndMunicipio(): Promise<void> {
  const nivelId = this.nivelSeleccionado;

  // Lanza todas las promesas en paralelo
  const promesas = this.municipios.map(async (m) => {
    const resp: any[] = await firstValueFrom(
      this.estadisticaService.getPromedioEstatalByNivel({ nivelId, municipioId: m.id })
    );
    return { categoria: m.nombre, valor: resp?.[0]?.promedio ?? 0 };
  });

  try {
    const results = await Promise.all(promesas);
    const categorias = results.map(r => r.categoria);
    const dataSet    = results.map(r => r.valor);

    this.dataChartNivelAndMunicipio = {
      firstLeyend: `Promedios de nivel ${this.getNivelDescription(String(nivelId))}`,
      secondLeyend: '',
      firstDataSet: dataSet,
      secondDataSet: [],
      title: `Promedios de nivel ${this.getNivelDescription(String(nivelId))}`,
      description: 'Promedios',
      categorias
    };
    this.cd.detectChanges()
    console.log(this.dataChartNivelAndMunicipio);
  } catch (err) {
    console.error('Error obteniendo promedios:', err);
  }
}

getPromedioByNivelAndMunicipioAndMateria(): void {
  // Limpia acumulado previo si corresponde
  this.PromedioByNivelAndMunicipioAndMateria = [];

  const materias = this.nivelSeleccionado === 1 ? [1, 2] : [1, 3, 4];
  const nivelDesc = this.getNivelDescription(String(this.nivelSeleccionado));

  // Para cada municipio construimos un forkJoin de sus materias
  const porMunicipio$ = this.municipios.map((mun: any) => {
    const porMateria$ = materias.map((matId) =>
      this.estadisticaService
        .getPromedioEstatalByNivel({
          nivelId: this.nivelSeleccionado,
          materiaId: matId,
          municipioId: mun.id,
        })
        .pipe(
          map((resp: any[]) => {
            const promedio = resp?.[0]?.promedio ?? 0;
            const item: promedio = {
              nivel: nivelDesc,
              promedio,
              materia: this.getNombreMateria(matId),
              municipio: mun.nombre,
            };
            return item;
          })
        )
    );

    // Regresa un observable que emite el array de Promedios de este municipio
    return forkJoin(porMateria$);
  });

  // Ejecuta todos los municipios en paralelo
  forkJoin(porMunicipio$).subscribe({
    next: (resultadoPorMunicipio: promedio[][]) => {
      // resultadoPorMunicipio es Promedio[][] con el mismo orden que this.municipios
      this.PromedioByNivelAndMunicipioAndMateria = resultadoPorMunicipio;
      this.cd.detectChanges()
      console.log('PromedioByNivelAndMunicipioAndMateria', this.PromedioByNivelAndMunicipioAndMateria);
    },
    error: (err) => {
      console.error('Error obteniendo promedios:', err);
    },
  });
}

  getNivelDescription(nivel: string) {
    return this.catalogoService.getNivelDescription(nivel)
  }
  getNombreMateria(materia: number) {
    return this.catalogoService.getNombreMateria(materia)
  }
  getBgMateria(materia:string){
    return this.getBgMateriaService.getBackgroundMateria(materia)
  }



}
