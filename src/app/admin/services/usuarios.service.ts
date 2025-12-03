import { Injectable } from '@angular/core';
import { Enviroments } from '../../enviroments/env';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TipoUsuario, Usuario } from '../interfaces/usuarios.interface';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  constructor(private http: HttpClient) {}
  private url: string = Enviroments.UrlServiceBackend;
  private urlPhp: string = 'http://localhost/imaeb/getListadoUsuarios.php';

  getListadoUsuarios(): Observable<any> {
    return this.http.get<any>(this.url+'admin/usuarios', {});
  }
  getListadoTipoUsuarios(): Observable<TipoUsuario[]> {
    return this.http.get<TipoUsuario[]>(this.url + 'api/tipos-personas', {});
  }
  saveUsuario(data: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post<any>(this.url + 'api/usuarios', JSON.stringify(data), { headers });
  }
  actualizarEstadoUsuario(id: number, activo: boolean): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.patch<any>(`${this.url}admin/usuarios/${id}/estado`, { activo }, { headers });
  }
  actualizarPassword(id: number, nuevaPassword: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.patch<any>(
      `${this.url}admin/usuarios/${id}/password`,
      { nuevaPassword },
      { headers }
    );
  } 
}
