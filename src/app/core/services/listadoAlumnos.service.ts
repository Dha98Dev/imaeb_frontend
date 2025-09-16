import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Enviroments } from '../../enviroments/env';
import { Alumno } from '../Interfaces/listadoAlumno.interface';

@Injectable({providedIn: 'root'})
export class listadoAlumnosService {
    constructor(private http:HttpClient) { }
    private apiUrl:string=Enviroments.UrlServiceBackend
    
      obtenerAlumnosPorCctYGrupo(cct: string, grupo: string): Observable<Alumno[]> {
    // Crear parámetros de consulta
    const params = new HttpParams()
      .set('cct', cct)
      .set('grupo', grupo);

    return this.http.get<Alumno[]>(this.apiUrl+'api/alumnos/grupo', { params });
  }
}