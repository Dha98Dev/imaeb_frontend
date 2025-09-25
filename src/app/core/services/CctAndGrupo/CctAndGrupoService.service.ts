import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Enviroments } from '../../../enviroments/env';
import { conteoAlumnosGrupo } from '../../Interfaces/conteoAlumnosGrupo.interface';
import { Observable } from 'rxjs';
import { ConteoUtilizacionExamen } from '../../Interfaces/ConteoUtilizacionExamen.interface';
import { conteoNivelDesempenioByGrupoAndCct } from '../../Interfaces/conteoNivelDespempenioByGrupoAndCct.interface';

@Injectable({ providedIn: 'root' })
export class CctAndGrupoService {
    constructor(private http: HttpClient) { }

    private url: string = Enviroments.UrlServiceBackend

    contarAlumnosEvaluadosByCctAndGrupo(cct: string, grupo: string): Observable<conteoAlumnosGrupo> {
        const params = new HttpParams()
            .set('cct', cct)
            .set('grupo', grupo.toUpperCase())
        return this.http.get<conteoAlumnosGrupo>(this.url + 'api/alumnos/conteo-sexo', { params })
    }

    contarExamenesUtilizadosByCctAndGrupo(cct: string, grupo: string): Observable<ConteoUtilizacionExamen> {
        const params = new HttpParams()
            .set('cct', cct)
            .set('grupo', grupo.toUpperCase())
        return this.http.get<ConteoUtilizacionExamen>(this.url + 'api/resultadosCct/examenesUsados', { params })
    }
    conteoNivelDesempenioByGrupoAndCct(cct: string, grupo: string): Observable<conteoNivelDesempenioByGrupoAndCct[]> {
        const params = new HttpParams()
            .set('cct', cct)
            .set('grupo', grupo.toUpperCase())
        return this.http.get<conteoNivelDesempenioByGrupoAndCct[]>(this.url + 'api/resultadosCct/desempenioGruposCct', { params })
    }
    conteoNumeroAciertosByPreguntaByMateria(cct: string, grupo: string, materiaId:number): Observable<any[]> {
        const params = new HttpParams()
            .set('cct', cct)
            .set('grupo', grupo.toUpperCase())
            .set('materia', materiaId)
        return this.http.get<any[]>(this.url + 'api/resultadosCct/preguntas/cctGrupoMateria', { params })
    }
}
