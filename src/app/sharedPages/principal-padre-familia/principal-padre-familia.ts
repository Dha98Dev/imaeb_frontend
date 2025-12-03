import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CryptoJsService } from '../../core/services/CriptoJs/cryptojs.service';
import { GetResultadosAlumnosService } from '../../core/services/Preguntas/GetResultadosAlumnos.service';
import { Resultado, ResultadoPreguntasMateriaAumno } from '../../core/Interfaces/resultadoPorcentajeAciertosMateria.interface';
import { Alumno } from '../../core/Interfaces/listadoAlumno.interface';
import { GetBackgroundService } from '../../core/services/getColors/getBackground.service';
import { GetCctInfoSErvice } from '../../core/services/Cct/GetCctInfo.service';
import { DatosCct } from '../../core/Interfaces/DatosCct.interface';
import { GetEstadisticaService } from '../../core/services/EstadisticaPromedios/getEstadistica.service';
import { itemPorcentajeAreaEvaluadaInterface } from '../../core/components/item-porcentaje-area-evaluada/item-porcentaje-area-evaluada.component';
import { ParamsPromediosEstatales } from '../../core/Interfaces/promediosEstatales.interface';
import { BreadCrumService } from '../../core/services/breadCrumbs/bread-crumb-service';
import { firstValueFrom, forkJoin } from 'rxjs';

@Component({
  selector: 'app-principal-padre-familia',
  standalone: false,
  templateUrl: './principal-padre-familia.html',
  styleUrl: './principal-padre-familia.scss'
})
export class PrincipalPadreFamilia {
  constructor(private route: ActivatedRoute, private crypto: CryptoJsService, private resultadosAlumnos: GetResultadosAlumnosService, private cd: ChangeDetectorRef, private getBg: GetBackgroundService, private cctInfo: GetCctInfoSErvice, private estadisticaService: GetEstadisticaService, private breadCrumbService: BreadCrumService) { }


  private alumnoParam: string = ''
  private alumnoID: number = 0
  public promedioAlumno = 0
  public loader: boolean = false
  public resultadosPorcentajes: Resultado[] = []
  public datosAlumno: Alumno = {} as Alumno
  public DatosCct: DatosCct = {} as DatosCct
  public nivel: number = 0
  public promedioEstatal: number = 0
  public porcentajesAreaEvaluada: itemPorcentajeAreaEvaluadaInterface[] = []
  public resultadoPreguntasMateriaAlumno:ResultadoPreguntasMateriaAumno[]=[]

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      try {
        this.alumnoParam = params.get('idAlumno') || ''
        if (this.alumnoParam != "") {
          this.alumnoID = parseInt(this.crypto.Desencriptar(this.alumnoParam))
          this.getPorcentajeAciertosAlumno()
          this.loader = true
        }
      } catch (error) {
      }
    })


  }
  getPorcentajeAciertosAlumno() {

    this.resultadosAlumnos.getPorcentajeAciertosAlumno(this.alumnoID).subscribe({
      next: (resp) => {
        this.datosAlumno = resp[0]
        let nombre = this.datosAlumno.nombre + ' ' + this.datosAlumno.apellidoPaterno + ' ' + this.datosAlumno.apellidoMaterno
        this.breadCrumbService.addItem({ jerarquia: 6, label: nombre, urlLink: '/s/principal_alumno/' + this.alumnoParam, icon: '' })
        this.cctInfo.setAlumno(nombre)
        this.getDataCentroTrabajo(this.datosAlumno.datosEscolares.cct)
        this.resultadosPorcentajes = this.datosAlumno.resultados!
        // this.calcularPorcentajeEstatalMateria()

        this.promedioAlumno = this.datosAlumno.promedioGeneral
        this.loader = false
        this.cd.detectChanges();
      },
      error: (error) => {

      }
    })
  }

  calcularPorcentajeEstatalMateria() {
    this.resultadosPorcentajes=this.resultadosPorcentajes.reverse()
    this.resultadosPorcentajes.forEach(element => {
      let params: ParamsPromediosEstatales = {} as ParamsPromediosEstatales
      params.materiaId = element.idMateria;
      params.nivelId = this.nivel
      this.estadisticaService.getPromedioEstatalByNivel(params).subscribe({
        next: resp => {
          let data: itemPorcentajeAreaEvaluadaInterface = {
            firstLeyendPercent: 'Porcentaje Aciertos',
            firstPercent: element.porcentajeAciertos,
            secondLeyendPercent: 'Promedio Estatal',
            secondPercent: resp[0].promedio,
            title: element.materia + '',
            bgTitle: this.getBgMateria(element.materia)
          }
          this.porcentajesAreaEvaluada.push(data)
          this.cd.detectChanges()
        },
        error: error => {

        }
      })

    });
  }

  getDataCentroTrabajo(cct: string) {
    this.cctInfo.getInfoCct(cct).subscribe({
      next: (resp) => {
        this.DatosCct = resp[0]
        this.cctInfo.setCentroTrabajo(this.DatosCct)
        this.nivel = resp[0].idNivel
        this.calcularPorcentajeEstatalMateria()
        this.calcularPromedioEstatal()
        if (resp[0].idNivel == 1) {
          this.calcularPromedioAlumnoPreescolar()
          this.resultadosbyAlumnoAndMateria()
        } else {

        }
      },
      error: (error) => {

      }
    })
  }

  calcularPromedioAlumnoPreescolar() {
    this.estadisticaService.getPromedioEstatalByNivel({ personaId: this.alumnoID }).subscribe({
      next: resp => {
        this.promedioAlumno = resp[0].promedio
        this.cd.detectChanges()
      },
      error: error => {

      }
    })
  }

  calcularPromedioEstatal() {
    this.estadisticaService.getPromedioEstatalByNivel({ nivelId: this.nivel }).subscribe({
      next: resp => {
        this.promedioEstatal = resp[0].promedio
        this.cd.detectChanges()
      },
      error: error => {

      }
    })
  }

async resultadosbyAlumnoAndMateria(): Promise<void> {

  try {
    const materiasPreescolar = [1, 2];

    // Lanza ambas peticiones en paralelo
    const requests = materiasPreescolar.map(m =>
      firstValueFrom(
        this.resultadosAlumnos.resultadosbyAlumnoAndMateria(
          String(this.alumnoID),
          String(m)
        )
      )
    );

    const respuestas = await Promise.all(requests);

    // Aquí procesas las respuestas (en el mismo orden que materiasPreescolar)
 respuestas.forEach(resp =>{
  this.resultadoPreguntasMateriaAlumno.push(resp[0])
 })
 this.cd.detectChanges();
    // Ejemplo: this.resultados = respuestas;

  } catch (error) {
  } finally {
  }
}

  getBgMateria(materia: string) {
    return this.getBg.getBackgroundMateria(materia)
  }
}
