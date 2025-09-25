import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Enviroments } from '../../../enviroments/env';
import { Alumno } from '../../Interfaces/listadoAlumno.interface';

@Injectable({ providedIn: 'root' })
export class GetResultadosAlumnosService {
    constructor(private http: HttpClient) { }
    private urlService = Enviroments.UrlServiceBackend
    getPorcentajeAciertosAlumno(idAlumno: number) {
        const params = new HttpParams()
            .set('idAlumno', idAlumno)

        return this.http.get<Alumno[]>(this.urlService + 'api/alumnos/resultadosPorcentajes', { params })
    }

    resultadosbyAlumnoAndMateria(alumnoId: string, materiaId: string) {
        const params = new HttpParams()
            .set('idAlumno', alumnoId)
            .set('idMateria', materiaId)

        return this.http.get<any>(this.urlService + 'api/materias/resultadosbyAlumnoAndMateria', { params })
    }

    resultadosbyAlumnoAndMateriaAndUnidadAnalisis(alumnoId: string, materiaId: string) {
        const params = new HttpParams()
            .set('idAlumno', alumnoId)
            .set('idMateria', materiaId)

        return this.http.get<any>(this.urlService + 'api/materias/resultadosbyAlumnoAndMateriaAndUnidadAnalisis', { params })
    }
}