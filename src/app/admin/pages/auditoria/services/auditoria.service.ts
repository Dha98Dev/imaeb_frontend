import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  AuditoriaEvento,
  AuditoriaFiltros,
  AuditoriasResponse,
} from '../interfaces/auditoria.interface';
import { Enviroments } from '../../../../enviroments/env';

@Injectable({
  providedIn: 'root',
})
export class AuditoriaService {
  private readonly url: string = Enviroments.UrlServiceBackend;

  constructor(private http: HttpClient) {}

  getAuditorias(filtros: AuditoriaFiltros = {}): Observable<AuditoriasResponse> {
    let params = new HttpParams();

    if (filtros.desde) {
      params = params.set('desde', filtros.desde);
    }

    if (filtros.hasta) {
      params = params.set('hasta', filtros.hasta);
    }

    if (filtros.actorId !== undefined && filtros.actorId !== null) {
      params = params.set('actorId', filtros.actorId.toString());
    }

    if (filtros.usuarioDestinoId !== undefined && filtros.usuarioDestinoId !== null) {
      params = params.set('usuarioDestinoId', filtros.usuarioDestinoId.toString());
    }

    if (filtros.accion && filtros.accion.trim().length > 0) {
      params = params.set('accion', filtros.accion);
    }

    if (filtros.resultado) {
      params = params.set('resultado', filtros.resultado);
    }

    params = params.set('page', (filtros.page ?? 0).toString());

    params = params.set('size', (filtros.size ?? 20).toString());

    return this.http.get<AuditoriasResponse>(`${this.url}api/auditorias`, { params });
  }

  getAuditoria(id: string): Observable<AuditoriaEvento> {
    return this.http.get<AuditoriaEvento>(`${this.url}api/auditorias/${id}`);
  }
}
