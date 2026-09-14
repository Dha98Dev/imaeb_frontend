import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  finalize,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
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

  private meRequest$: Observable<AuthMeResponse | null> | null = null;

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
      }),

      switchMap(() => this.getMe()),

      tap(() => {
        this.authState.next(true);

        void this.router.navigateByUrl(this.generateUrlBase());
      }),

      catchError((error) => {
        this.clearTokens();

        return throwError(() => error);
      }),
    );
  }

  getMe(): Observable<AuthMeResponse> {
    return this.http.get<AuthMeResponse>(this.url + 'auth/me').pipe(
      tap((resp) => {
        this.usuarioSubject.next(resp);

        this.authState.next(true);
      }),
    );
  }

  ensureUsuario(): Observable<AuthMeResponse | null> {
    const token = this.getAccessToken();

    if (!token) {
      this.clearTokens();

      return of(null);
    }

    const usuarioActual = this.getUsuario();

    if (usuarioActual) {
      this.authState.next(true);

      return of(usuarioActual);
    }

    if (this.meRequest$) {
      return this.meRequest$;
    }

    this.meRequest$ = this.getMe().pipe(
      catchError((error) => {
        console.error('No se pudo recuperar /auth/me', error);

        this.clearTokens();

        return of(null);
      }),

      finalize(() => {
        this.meRequest$ = null;
      }),

      shareReplay({
        bufferSize: 1,
        refCount: false,
      }),
    );

    return this.meRequest$;
  }

  cargarUsuario(): Observable<AuthMeResponse | null> {
    return this.ensureUsuario();
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

    this.authState.next(false);

    this.meRequest$ = null;
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return this.authState.value && !!this.getAccessToken();
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

  getDependenciaIds(): number[] {
    return [
      ...new Set(
        this.getAlcances()
          .map((item) => item.dependenciaId)
          .filter((item): item is number => item != null),
      ),
    ];
  }

  getObjectParams(): paramsFilters {
    const alcance = this.getPrimerAlcance();

    return {
      nivelId: alcance?.nivelId ?? undefined,

      modalidadId: alcance?.modalidadId ?? undefined,

      sectorId: alcance?.sectorId ?? undefined,

      zonaId: alcance?.zonaId ?? undefined,

      escuelaId: alcance?.escuelaId ?? undefined,

      dependenciaId: alcance?.dependenciaId ?? undefined,

      scope: this.getScope(),

      sub: this.usuarioSubject.value?.id?.toString(),

      nivelIds: this.getNivelIds(),

      modalidadIds: this.getModalidadIds(),

      sectorIds: this.getSectorIds(),

      zonaIds: this.getZonaIds(),

      escuelaIds: this.getEscuelaIds(),

      dependenciaIds: this.getDependenciaIds(),
    } as paramsFilters;
  }

  logout(): void {
    this.clearTokens();

    void this.router.navigateByUrl('/Auth/login');
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

    switch (scope) {
      case 'NIVEL':
        return '/e/estadistica-general';

      case 'MODALIDAD':
      case 'SECTOR':
      case 'ZONA':
      case 'ESCUELA':
      case 'PERSONALIZADO':
      case 'EJECUTIVO':
      case 'ADMIN':
        return '/Auth/main-filter';

      default:
        return '/Auth/main-filter';
    }
  }
}
