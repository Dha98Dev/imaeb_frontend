import { Component, Input } from '@angular/core';
import { Alumno } from '../../Interfaces/listadoAlumno.interface';

@Component({
  selector: 'app-datos-alumno',
  standalone: false,
  templateUrl: './datos-alumno.html',
  styleUrl: './datos-alumno.scss'
})
export class DatosAlumno {
@Input()
public datosAlumnos:Alumno={} as Alumno
}
