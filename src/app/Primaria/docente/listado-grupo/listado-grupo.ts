import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { listadoAlumnosService } from '../../../core/services/listadoAlumnos.service';
import { Alumno, AlumnoFormateado, Respuesta } from '../../../core/Interfaces/listadoAlumno.interface';
import { GetCctInfoSErvice } from '../../../core/services/Cct/GetCctInfo.service';
import { BreadCrumService } from '../../../core/services/breadCrumbs/bread-crumb-service';
import { CryptoJsService } from '../../../core/services/CriptoJs/cryptojs.service';

@Component({
  selector: 'app-listado-grupo',
  standalone: false,
  templateUrl: './listado-grupo.html',
  styleUrl: './listado-grupo.scss'
})
export class ListadoGrupo {
  cct: string = '';
  grupo: string = '';
  public loader: boolean = false
  private listadoAlumnos: Alumno[] = []
  public registrosFormateados: AlumnoFormateado[] = []
  public nivel: string | number = ''

  constructor(private route: ActivatedRoute, private listadoAlumnosService: listadoAlumnosService, private cd: ChangeDetectorRef, private cctService: GetCctInfoSErvice, private breadCrumbService: BreadCrumService, private crypto:CryptoJsService) { }

  ngOnInit(): void {
    this.loader = true


    // Opción 2: Suscribiéndose a cambios (para parámetros dinámicos)
    this.route.paramMap.subscribe(params => {
      this.cct = this.crypto.Desencriptar(params.get('cct')!) || '';
      this.grupo = params.get('grupo') || '';
      this.cctService.setCct(this.cct)
      this.cctService.setGrupo(this.grupo)
      this.getlistadoAlumnos()
      this.getDatosCct()
      this.breadCrumbService.addItem({ jerarquia: 5, label: 'listado grupo  ' + this.grupo, urlLink: '/prim_2/listado-grupo/' + this.cct + '/' + this.grupo, icon: '' })

    });
  }

  getlistadoAlumnos() {
    this.listadoAlumnosService.obtenerAlumnosPorCctYGrupo(this.cct, this.grupo).subscribe({
      next: (response) => {
        this.listadoAlumnos = response
        this.registrosFormateados = this.formatearAlumnos(this.listadoAlumnos)
        this.loader = false

        this.cd.detectChanges();
      },
      error: (error) => {

      }
    })
  }


formatearAlumnos(alumnos: Alumno[]): AlumnoFormateado[] {
  return alumnos
    .map((alumno) => {
      const respuestas: Respuesta[] = [];

      alumno.materias.forEach((materia) => {
        materia.preguntas.forEach((pregunta) => {
          respuestas.push({
            pregunta: pregunta.numeroPregunta,
            encabezado: `${materia.nombre.charAt(0).toUpperCase()}${pregunta.numeroPregunta}`,
            respuesta: Number(pregunta.respuesta ?? 0), // asegura número
            inicialMateria: materia.nombre.charAt(0).toUpperCase(),
          });
        });
      });

      // Variables que se usarán en el return
      let promedio_porcentaje = 0;
      let promedio_estatal = 0; // si luego tienes el valor real, cámbialo aquí

      if (this.nivel === 1) {
        // PREESCOLAR: respuestas en rango 0..3
        const totalPreguntas = respuestas.length;
        const sumaRespuestas = respuestas.reduce((acc, r) => acc + (r.respuesta ?? 0), 0);
        const promedio_base = totalPreguntas > 0 ? (sumaRespuestas / totalPreguntas) : 0; // 0..3
        promedio_porcentaje = (promedio_base / 3) * 100; // 0..100
      } else {
        // PRIMARIA/SECUNDARIA: respuestas 0/1
        const totalPreguntas = respuestas.length;
        const respuestasCorrectas = respuestas.filter((r) => r.respuesta === 1).length;
        promedio_porcentaje = totalPreguntas > 0 ? (respuestasCorrectas / totalPreguntas) * 100 : 0;
      }

      return {
        nombre: alumno.nombre,
        apellido_paterno: alumno.apellidoPaterno,
        apellido_materno: alumno.apellidoMaterno,
        promedioAlumno: Number(promedio_porcentaje.toFixed(1)),
        promedio_estatal: promedio_estatal,
        respuestas,
        sexo: alumno.sexo,
        idAlumno: alumno.idAlumno,
      };
    })
    .sort((a, b) => a.apellido_paterno.localeCompare(b.apellido_paterno));
}


  getDatosCct() {
    this.cctService.getInfoCct(this.cct).subscribe({
      next: (resp) => {
        this.cctService.setCentroTrabajo(resp[0])
        this.nivel = resp[0].idNivel
        this.cd.detectChanges()
      },
      error: (error) => {

      }
    })
  }

}
