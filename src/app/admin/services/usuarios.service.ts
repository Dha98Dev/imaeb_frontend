import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Enviroments } from '../../enviroments/env';

import {
  ActualizarUsuarioRequest,
  CambiarEstadoUsuarioRequest,
  CambiarPasswordUsuarioRequest,
  TipoUsuario,
  UsuarioActualizadoResponse,
  UsuariosAdminFiltros,
  UsuariosAdminResponse,
} from '../interfaces/usuarios.interface';

import { CrearPersonaRequest, Persona, PersonaPage } from '../interfaces/persona.interface';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private url: string = Enviroments.UrlServiceBackend;

  constructor(private http: HttpClient) {}

  getListadoTipoUsuarios(): Observable<TipoUsuario[]> {
    return this.http.get<TipoUsuario[]>(`${this.url}api/tipos-personas`);
  }

  /*
   * Se conserva any únicamente porque todavía no tenemos
   * el contrato completo del endpoint de creación.
   * No modificamos esa operación para no romper register.
   */
  saveUsuario(data: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post<any>(`${this.url}api/usuarios`, JSON.stringify(data), { headers });
  }

  getListadoUsuarios(filtros: UsuariosAdminFiltros = {}): Observable<UsuariosAdminResponse> {
    let params = new HttpParams();

    if (filtros.username?.trim()) {
      params = params.set('username', filtros.username.trim());
    }

    if (filtros.scope) {
      params = params.set('scope', filtros.scope);
    }

    if (filtros.activo !== undefined && filtros.activo !== null) {
      params = params.set('activo', filtros.activo.toString());
    }

    filtros.nivelId?.forEach((nivelId) => {
      params = params.append('nivelId', nivelId.toString());
    });

    filtros.modalidadId?.forEach((modalidadId) => {
      params = params.append('modalidadId', modalidadId.toString());
    });

    if (filtros.sectorId !== undefined) {
      params = params.set('sectorId', filtros.sectorId.toString());
    }

    if (filtros.zonaId !== undefined) {
      params = params.set('zonaId', filtros.zonaId.toString());
    }

    params = params.set('page', (filtros.page ?? 0).toString());

    params = params.set('size', (filtros.size ?? 20).toString());

    filtros.sort?.forEach((sort) => {
      params = params.append('sort', sort);
    });

    return this.http.get<UsuariosAdminResponse>(`${this.url}admin/usuarios`, { params });
  }

  actualizarUsuario(
    usuarioId: number,
    payload: ActualizarUsuarioRequest,
  ): Observable<UsuarioActualizadoResponse> {
    return this.http.patch<UsuarioActualizadoResponse>(
      `${this.url}api/usuarios/${usuarioId}`,
      payload,
    );
  }

  actualizarPassword(usuarioId: number, nuevaPassword: string): Observable<void> {
    const body: CambiarPasswordUsuarioRequest = {
      nuevaPassword,
    };

    return this.http.patch<void>(`${this.url}admin/usuarios/${usuarioId}/password`, body);
  }

  actualizarEstadoUsuario(usuarioId: number, activo: boolean): Observable<void> {
    const body: CambiarEstadoUsuarioRequest = {
      activo,
    };

    return this.http.patch<void>(`${this.url}admin/usuarios/${usuarioId}/estado`, body);
  }

  buscarPersonaPorCurp(curp: string): Observable<PersonaPage> {
    const params = new HttpParams()
      .set('curp', curp.trim().toUpperCase())
      .set('activo', true)
      .set('page', 0)
      .set('size', 20);

    return this.http.get<PersonaPage>(`${this.url}api/personas`, { params });
  }

  getPersona(id: number): Observable<Persona> {
    return this.http.get<Persona>(`${this.url}api/personas/${id}`);
  }

  crearPersona(payload: CrearPersonaRequest): Observable<Persona> {
    return this.http.post<Persona>(`${this.url}api/personas`, payload);
  }
}
