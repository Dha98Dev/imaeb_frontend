import { Injectable } from '@angular/core';
import { Enviroments } from '../../enviroments/env';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { CambiarEstadoUsuarioRequest, CambiarPasswordUsuarioRequest, TipoUsuario, UsuariosAdminFiltros, UsuariosAdminResponse } from '../interfaces/usuarios.interface';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  constructor(private http: HttpClient) {}
  private url: string = Enviroments.UrlServiceBackend;
  private urlPhp: string = 'http://localhost/imaeb/getListadoUsuarios.php';

  getListadoTipoUsuarios(): Observable<TipoUsuario[]> {
    return this.http.get<TipoUsuario[]>(this.url + 'api/tipos-personas', {});
  }
  saveUsuario(data: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post<any>(this.url + 'api/usuarios', JSON.stringify(data), { headers });
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

    return this.http.get<UsuariosAdminResponse>(this.url + 'admin/usuarios', {
      params,
    });
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
}
