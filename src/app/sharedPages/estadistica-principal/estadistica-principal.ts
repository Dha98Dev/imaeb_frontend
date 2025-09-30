import { ChangeDetectorRef, Component } from '@angular/core';
import { ModalidadesService } from '../../core/services/Modalidades/Modalidades.service';
import { modalidad } from '../../core/Interfaces/Modalidad.interface';
import { GetEstadisticaService } from '../../core/services/EstadisticaPromedios/getEstadistica.service';
import { DataGraficaBarra } from '../../core/Interfaces/grafica.interface';
import { firstValueFrom } from 'rxjs';
import { CatalogoService } from '../../core/services/Catalogos/catalogo.service';

interface promedio {
  nivel: string,
  promedio: number,
  materia?:string
}

@Component({
  selector: 'app-estadistica-principal',
  standalone: false,
  templateUrl: './estadistica-principal.html',
  styleUrl: './estadistica-principal.scss'
})
export class EstadisticaPrincipal {
  constructor(private modalidadesService: ModalidadesService, private estadisticaService: GetEstadisticaService, private cd: ChangeDetectorRef, private catalogoService: CatalogoService) { }
  public nivelSeleccionado: number = 0
  public modalidades: modalidad[] = []
  public dataChartModalidades: DataGraficaBarra = {} as DataGraficaBarra
  public promediosGeneralesEstatales: promedio[] = []
  public promedioGeneralesEstatalesBynivelAndMateria:promedio[]=[]


  ngOnInit() {
    // this.getEstadistica(1)
    this.getPromediosEstatales()
  }

  getEstadistica(nivel: number) {
    this.nivelSeleccionado = nivel
    this.modalidadesService.getModalidadesNivel(nivel).subscribe({
      next: resp => {
        console.log(resp)
        this.modalidades = resp
        this.getPromediosEstatalesPorModalidad(this.getModalidadesUnicas())
        this.getPromedioGeneralByMateriaAndNivel()
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
          this.estadisticaService.getPromedioEstatalByNivel({nivelId: this.nivelSeleccionado,materiaId}));
        return {
          promedio: resp?.[0]?.promedio ?? 0,
          materia: this.getNombreMateria(materiaId),
          nivel
        } as promedio;
      })
    );
    // guarda los resultados en tu arreglo
    this.promedioGeneralesEstatalesBynivelAndMateria = responses;
    console.log('Resultados:', this.promedioGeneralesEstatalesBynivelAndMateria);

  } catch (err) {
    console.error('Error obteniendo promedios por materia y nivel:', err);
    this.promedioGeneralesEstatalesBynivelAndMateria = [];
  }
}


  getNivelDescription(nivel: string) {
    return this.catalogoService.getNivelDescription(nivel)
  }
  getNombreMateria(materia: number) {
    return this.catalogoService.getNombreMateria(materia)
  }


}
