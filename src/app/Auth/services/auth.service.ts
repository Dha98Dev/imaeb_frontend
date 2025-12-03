import { ChangeDetectorRef, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Enviroments } from '../../enviroments/env';
import { Router } from '@angular/router';
import { paramsFilters } from '../../core/Interfaces/paramsFilters.interface';

export interface LoginResponse {
  token: string;
  scope: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private url: string = Enviroments.UrlServiceBackend;
  private readonly ACCESS_TOKEN_KEY = 'access_token';

  /** BehaviorSubject: emite el estado actual del login */
  private authState = new BehaviorSubject<boolean>(this.hasToken());
  private scope = new BehaviorSubject<string>(this.getScope());

  isLoggedIn$ = this.authState.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(data: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.url + 'auth/login', data).pipe(
      tap((resp) => {
        this.setTokens(resp.token);
        this.authState.next(true);
        this.router.navigate([this.generateUrlBase()])
      })
    );
  }

  private setTokens(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  public getScope(): string {
    if (this.isLoggedIn()) {
      return this.getJwtPayload()!.scope;
    }
    return ''
  }

  public getNivel(): number {
    if (this.getScope() == 'NIVEL') {
      return this.getJwtPayload()!.nivelId;
    }
    return 0;
  }

  isLoggedIn(): boolean {
    return this.authState.value;
  }

  /** Logout global */
  logout(): void {
    this.clearTokens();
    this.authState.next(false);
    this.router.navigate(['/Auth/login']);
  }

  /** Header listo para API */
  getAuthorizationHeader() {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  /** Decodifica el JWT y retorna el payload como objeto */
  getJwtPayload(): paramsFilters  {
    const token = this.getAccessToken();
    if (!token) return {} as paramsFilters;

    try {
      const payload = token.split('.')[1]; // tomar la parte central
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error al decodificar JWT:', error);
      return {} as paramsFilters;
    }
  }

  getObjectParams():paramsFilters{
    let data:paramsFilters={} as paramsFilters
    if (this.isLoggedIn() && this.getJwtPayload() !=null) {
      let jwt = this.getJwtPayload()
      data={
        nivelId:jwt.nivelId,
        modalidadId:jwt.modalidadId,
        sectorId:jwt.sectorId,
        zonaId:jwt.zonaId,
        escuelaId:jwt.escuelaId,
        scope:jwt.scope,
        sub:jwt.sub
      }
    }
    return data
  }

  generateUrlBase():string{
    let  url='/Auth/login'
    if (this.getScope() == 'NIVEL') {
      url='/e/estadistica-general'
    }else{
      url='/Auth/main-filter'
    }
    return url
  }
}
