import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { listadoAlumnosService } from '../../../core/services/listadoAlumnos.service';
import { Alumno, AlumnoFormateado, Respuesta } from '../../../core/Interfaces/listadoAlumno.interface';

@Component({
  selector: 'app-listado-grupo',
  standalone: false,
  templateUrl: './listado-grupo.html',
  styleUrl: './listado-grupo.scss'
})
export class ListadoGrupo {
  cct: string = '';
  grupo: string = '';
  private listadoAlumnos: Alumno[] = []
  public registrosFormateados: AlumnoFormateado[] = []
  public loader: boolean = false


  constructor(private route: ActivatedRoute, private listadoAlumnosService: listadoAlumnosService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loader = true
    // Opción 1: Usando snapshot (para parámetros estáticos)
    this.cct = this.route.snapshot.paramMap.get('cct') || '';
    this.grupo = this.route.snapshot.paramMap.get('grupo') || '';

    // Opción 2: Suscribiéndose a cambios (para parámetros dinámicos)
    this.route.paramMap.subscribe(params => {
      this.cct = params.get('cct') || '';
      this.grupo = params.get('grupo') || '';
      this.getlistadoAlumnos()
    });
  }

  getlistadoAlumnos() {
    this.listadoAlumnosService.obtenerAlumnosPorCctYGrupo(this.cct, this.grupo).subscribe({
      next: (response) => {
        this.listadoAlumnos = response
        this.registrosFormateados = this.formatearAlumnos(this.listadoAlumnos)
        this.loader = false
        console.log('se recibio la respuesta del backend' + this.listadoAlumnos.length)
        
        this.cd.detectChanges();
      },
      error: (error) => {

      }
    })
  }


  formatearAlumnos(alumnos: Alumno[]): AlumnoFormateado[] {
    return alumnos.map(alumno => {
      const respuestas: Respuesta[] = [];

      alumno.materias.forEach(materia => {
        materia.preguntas.forEach(pregunta => {
          respuestas.push({
            pregunta: pregunta.numeroPregunta,
            encabezado: materia.nombre.charAt(0).toUpperCase() + pregunta.numeroPregunta,
            respuesta: Number(pregunta.respuesta), // Convertimos a número si es necesario
            inicialMateria: materia.nombre.charAt(0).toUpperCase() // Inicial de la materia
          });
        });
      });

      // Aquí puedes calcular el promedio_porcentaje y promedio_estatal si lo deseas
        const totalPreguntas = respuestas.length;
    const respuestasCorrectas = respuestas.filter(r => r.respuesta === 1).length;
    const promedio_porcentaje = totalPreguntas > 0
      ? (respuestasCorrectas / totalPreguntas) * 100
      : 0;
      const promedio_estatal = 0; // placeholder

      return {
        nombre: alumno.nombre,
        apellido_paterno: alumno.apellidoPaterno,
        apellido_materno: alumno.apellidoMaterno,
        promedioAlumno:parseFloat(promedio_porcentaje.toFixed(1)),// por ejemplo, usar el CCT como ID
        promedio_estatal,
        respuestas,
        sexo:alumno.sexo,
        idAlumno:alumno.idAlumno

      };
    }) .sort((a, b) => a.apellido_paterno.localeCompare(b.apellido_paterno));;

  }

}
