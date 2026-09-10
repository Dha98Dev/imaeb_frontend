import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Enviroments } from '../../enviroments/env';
import { ConteoSexoGrupo, PromedioGrupo, DesempenioMateriaGrupo, ResultadoPregunta, ParticipacionGrupo } from '../Interfaces/resultados-director.interface';
import { AlumnoGrupoResponseV2, ResultadoAlumnoV2 } from '../Interfaces/listadoAlumnoV2.interface';

@Injectable({
  providedIn: 'root',
})
export class ResultadosDirectorService {

  private url: string = Enviroments.UrlServiceBackend;

  constructor(
    private http: HttpClient,
  ) {}

  /**
   * Conteo de participantes por sexo y grupo.
   */
  getConteoSexo(
    cct: string,
    examenId: number,
  ): Observable<ConteoSexoGrupo[]> {

    const params = new HttpParams()
      .set('examenId', examenId);

    return this.http.get<ConteoSexoGrupo[]>(
      `${this.url}api/resultados/centros/${cct}/grupos/conteo-sexo`,
      { params },
    );
  }

  /**
   * Promedios de los grupos del CCT.
   */
  getPromediosGrupos(
    cct: string,
    examenId: number,
  ): Observable<PromedioGrupo[]> {

    const params = new HttpParams()
      .set('examenId', examenId);

    return this.http.get<PromedioGrupo[]>(
      `${this.url}api/resultados/centros/${cct}/grupos/promedios`,
      { params },
    );
  }

  /**
   * Desempeño por materia de un grupo.
   */
  getDesempenioGrupo(
    cct: string,
    grupo: string,
    examenId: number,
  ): Observable<DesempenioMateriaGrupo[]> {

    const params = new HttpParams()
      .set('examenId', examenId);

    return this.http.get<DesempenioMateriaGrupo[]>(
      `${this.url}api/resultados/centros/${cct}/grupos/${grupo}/desempenio`,
      { params },
    );
  }

  /**
   * Estadísticas de las preguntas de una materia.
   */
  getPreguntasMateria(
    cct: string,
    grupo: string,
    materiaId: number,
    examenId: number,
  ): Observable<ResultadoPregunta[]> {

    const params = new HttpParams()
      .set('examenId', examenId);

    return this.http.get<ResultadoPregunta[]>(
      `${this.url}api/resultados/centros/${cct}/grupos/${grupo}/materias/${materiaId}/preguntas`,
      { params },
    );
  }

  /**
   * Participación de un grupo.
   */
  getParticipacionGrupo(
    cct: string,
    grupo: string,
    examenId: number,
  ): Observable<ParticipacionGrupo> {

    const params = new HttpParams()
      .set('examenId', examenId);

    return this.http.get<ParticipacionGrupo>(
      `${this.url}api/resultados/centros/${cct}/grupos/${grupo}/participacion`,
      { params },
    );
  }

  /**
   * Participación de todos los grupos del CCT.
   */
  getParticipacionCct(
    cct: string,
    examenId: number,
  ): Observable<ParticipacionGrupo[]> {

    const params = new HttpParams()
      .set('examenId', examenId);

    return this.http.get<ParticipacionGrupo[]>(
      `${this.url}api/resultados/centros/${cct}/participacion`,
      { params },
    );
  }
}

