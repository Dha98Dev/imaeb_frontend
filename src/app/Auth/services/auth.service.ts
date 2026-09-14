import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';

import { Enviroments } from '../../enviroments/env';

import {
  AuthAlcance,
  AuthCentro,
  AuthMeResponse,
  LoginResponse,
} from '../../core/Interfaces/auth.interface';

import { paramsFilters } from '../../core/Interfaces/paramsFilters.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url: string = Enviroments.UrlServiceBackend;

  private readonly ACCESS_TOKEN_KEY = 'access_token';

  private authState = new BehaviorSubject<boolean>(this.hasToken());

  private usuarioSubject = new BehaviorSubject<AuthMeResponse | null>(null);

  public isLoggedIn$ = this.authState.asObservable();

  public usuario$ = this.usuarioSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(data: any): Observable<AuthMeResponse> {
    return this.http.post<LoginResponse>(this.url + 'auth/login', data).pipe(
      tap((resp) => {
        this.setTokens(resp.token);

        this.authState.next(true);
      }),

      switchMap(() => this.getMe()),

      tap(() => {
        this.router.navigate([this.generateUrlBase()]);
      }),
    );
  }

  getMe(): Observable<AuthMeResponse> {
    return this.http.get<AuthMeResponse>(this.url + 'auth/me').pipe(
      tap((resp) => {
        this.usuarioSubject.next(resp);
      }),
    );
  }

  cargarUsuario(): Observable<AuthMeResponse | null> {
    if (!this.getAccessToken()) {
      this.usuarioSubject.next(null);

      return of(null);
    }

    return this.getMe().pipe(
      catchError((error) => {
        console.error('Error obteniendo usuario autenticado', error);

        this.usuarioSubject.next(null);

        return of(null);
      }),
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

    this.usuarioSubject.next(null);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return this.authState.value;
  }

  getUsuario(): AuthMeResponse | null {
    return this.usuarioSubject.value;
  }

  getScope(): string {
    return this.usuarioSubject.value?.scope ?? '';
  }

  getAutoridades(): string[] {
    return this.usuarioSubject.value?.autoridades ?? [];
  }

  getAlcances(): AuthAlcance[] {
    return this.usuarioSubject.value?.alcances ?? [];
  }

  getCentros(): AuthCentro[] {
    return this.usuarioSubject.value?.centros ?? [];
  }

  getPrimerAlcance(): AuthAlcance | null {
    return this.getAlcances()[0] ?? null;
  }

  getNivel(): number {
    return this.getPrimerAlcance()?.nivelId ?? 0;
  }

  getModalidad(): number {
    return this.getPrimerAlcance()?.modalidadId ?? 0;
  }

  getSector(): number {
    return this.getPrimerAlcance()?.sectorId ?? 0;
  }

  getZona(): number {
    return this.getPrimerAlcance()?.zonaId ?? 0;
  }

  getEscuela(): number {
    return this.getPrimerAlcance()?.escuelaId ?? 0;
  }

  getEscuelaGrupo(): number {
    return this.getPrimerAlcance()?.escuelaGrupoId ?? 0;
  }

  getPersona(): number {
    return this.getPrimerAlcance()?.personaId ?? 0;
  }

  getDependencia(): number {
    return this.getPrimerAlcance()?.dependenciaId ?? 0;
  }

  tieneAccesoGlobal(): boolean {
    return this.getAlcances().some((item) => item.accesoGlobal);
  }

  getObjectParams(): paramsFilters {
    const alcance = this.getPrimerAlcance();

    if (!alcance) {
      return {} as paramsFilters;
    }

    return {
      nivelId: alcance.nivelId ?? undefined,

      modalidadId: alcance.modalidadId ?? undefined,

      sectorId: alcance.sectorId ?? undefined,

      zonaId: alcance.zonaId ?? undefined,

      escuelaId: alcance.escuelaId ?? undefined,

      scope: this.getScope(),

      sub: this.usuarioSubject.value?.id?.toString(),

      nivelIds: this.getNivelIds(),

      modalidadIds: this.getModalidadIds(),
    } as paramsFilters;
  }

  getNivelIds(): number[] {
    return [
      ...new Set(
        this.getAlcances()
          .map((item) => item.nivelId)
          .filter((item): item is number => item != null),
      ),
    ];
  }

  getModalidadIds(): number[] {
    return [
      ...new Set(
        this.getAlcances()
          .map((item) => item.modalidadId)
          .filter((item): item is number => item != null),
      ),
    ];
  }

  getSectorIds(): number[] {
    return [
      ...new Set(
        this.getAlcances()
          .map((item) => item.sectorId)
          .filter((item): item is number => item != null),
      ),
    ];
  }

  getZonaIds(): number[] {
    return [
      ...new Set(
        this.getAlcances()
          .map((item) => item.zonaId)
          .filter((item): item is number => item != null),
      ),
    ];
  }

  getEscuelaIds(): number[] {
    return [
      ...new Set(
        this.getAlcances()
          .map((item) => item.escuelaId)
          .filter((item): item is number => item != null),
      ),
    ];
  }

  logout(): void {
    this.clearTokens();

    this.authState.next(false);

    this.router.navigate(['/Auth/login']);
  }

  getAuthorizationHeader() {
    const token = this.getAccessToken();

    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  }

  generateUrlBase(): string {
    const scope = this.getScope();

    if (scope === 'NIVEL') {
      return '/e/estadistica-general';
    }

    return '/Auth/main-filter';
  }
}
