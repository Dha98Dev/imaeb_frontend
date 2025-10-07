import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { breadCrumb } from '../../Interfaces/BreadCrum.interface';

@Injectable({ providedIn: 'root' })
export class BreadCrumService {
  private readonly STORAGE_KEY = 'breadcrumbs';

  // Estado interno reactivo
  private readonly _breadcrumbs$ = new BehaviorSubject<breadCrumb[]>(this.loadFromSession());
  // Observable público
  readonly breadcrumbs$ = this._breadcrumbs$.asObservable();

  constructor() {
    // Cada vez que cambia el valor, lo guardamos en sessionStorage
    this._breadcrumbs$.subscribe(items => {
      this.saveToSession(items);
    });
  }

  /** Devuelve el valor actual */
  get value(): breadCrumb[] {
    return this._breadcrumbs$.getValue();
  }

  /** Reemplaza completamente el estado (ordenado y normalizado). */
  private setState(items: breadCrumb[]) {
    const ordenados = [...items].sort((a, b) => a.jerarquia - b.jerarquia);

    // Si hay dos primeros con misma URL, elimina duplicado de home
    if (ordenados.length > 1 && ordenados[0].urlLink === ordenados[1].urlLink) {
      ordenados.splice(1, 1);
    }

    this._breadcrumbs$.next(ordenados);
  }

  /** Inicializa con Home (jerarquia = 0). */
  addHome(home: breadCrumb) {
    const homeFixed: breadCrumb = { ...home, jerarquia: 0 };
    this.setState([homeFixed]);
  }

  /**
   * Agrega/actualiza un item.
   * Elimina todos los niveles >= jerarquia y agrega el nuevo link.
   */
  addItem(link: breadCrumb) {
    const jer = link.jerarquia;
    const prev = this.value.filter(i => i.jerarquia < jer);
    const sinMismoNivel = prev.filter(i => i.jerarquia !== jer);
    this.setState([...sinMismoNivel, { ...link }]);
  }

  /** Elimina items desde una jerarquia dada (conserva los inferiores). */
  deleteFrom(jerarquia: number) {
    const filtered = this.value.filter(i => i.jerarquia < jerarquia);
    this.setState(filtered);
  }

  /** Limpia todo el breadcrumb. */
  clear() {
    this._breadcrumbs$.next([]);
    sessionStorage.removeItem(this.STORAGE_KEY);
  }

  // ===============================
  // Métodos de persistencia
  // ===============================

  /** Guarda en sessionStorage */
  private saveToSession(items: breadCrumb[]): void {
    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
    }
  }

  /** Carga desde sessionStorage */
  private loadFromSession(): breadCrumb[] {
    try {
      const data = sessionStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }
}
