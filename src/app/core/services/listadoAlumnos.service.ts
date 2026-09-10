import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Enviroments } from '../../enviroments/env';
import { Alumno } from '../Interfaces/listadoAlumno.interface';
import { AlumnoGrupoResponseV2, ResultadoAlumnoV2, ResultadoPreguntaAlumnoV2 } from '../Interfaces/listadoAlumnoV2.interface';

@Injectable({ providedIn: 'root' })
export class listadoAlumnosService {
  constructor(private http: HttpClient) {}
  private apiUrl: string = Enviroments.UrlServiceBackend;

  obtenerAlumnosPorCctYGrupo(cct: string, grupo: string): Observable<Alumno[]> {
    // Crear parámetros de consulta
    const params = new HttpParams().set('cct', cct).set('grupo', grupo);

    return this.http.get<Alumno[]>(this.apiUrl + 'api/alumnos/grupo', { params });
  }
  obtenerAlumnosPorGrupo(
    cct: string,
    grupo: string,
    examenId: number,
    page: number = 0,
    size: number = 100,
  ): Observable<AlumnoGrupoResponseV2> {
    const params = new HttpParams()
      .set('cct', cct)
      .set('grupo', grupo)
      .set('examenId', examenId)
      .set('page', page)
      .set('size', size);

    return this.http.get<AlumnoGrupoResponseV2>(`${this.apiUrl}api/alumnos/grupo`, { params });
  }
  obtenerResultadoAlumno(alumnoId: number, examenId: number): Observable<ResultadoAlumnoV2> {
    const params = new HttpParams().set('examenId', examenId);

    return this.http.get<ResultadoAlumnoV2>(`${this.apiUrl}api/alumnos/${alumnoId}/resultados`, {
      params,
    });
  }
  obtenerPreguntasAlumnoMateria(
  alumnoExamenId: number,
  materiaId: number,
): Observable<ResultadoPreguntaAlumnoV2> {

  return this.http.get<ResultadoPreguntaAlumnoV2>(
    `${this.apiUrl}api/resultados/alumnos/${alumnoExamenId}/materias/${materiaId}/preguntas`,
  );
}
}
