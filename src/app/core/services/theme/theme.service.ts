import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {

  private readonly storageKey = 'theme';

  private readonly darkModeSubject =
    new BehaviorSubject<boolean>(false);

  public readonly darkMode$ =
    this.darkModeSubject.asObservable();

  constructor() {
    this.inicializarTema();
  }

  private inicializarTema(): void {
    const temaGuardado =
      localStorage.getItem(this.storageKey);

    if (temaGuardado) {
      this.aplicarTema(
        temaGuardado === 'dark',
      );

      return;
    }

    const prefiereOscuro =
      window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;

    this.aplicarTema(prefiereOscuro);
  }

  toggleTheme(): void {
    this.aplicarTema(
      !this.darkModeSubject.value,
    );
  }

  setDarkMode(
    dark: boolean,
  ): void {
    this.aplicarTema(dark);
  }

  isDarkMode(): boolean {
    return this.darkModeSubject.value;
  }

  private aplicarTema(
    dark: boolean,
  ): void {

    document.documentElement
      .classList
      .toggle('dark', dark);

    localStorage.setItem(
      this.storageKey,
      dark ? 'dark' : 'light',
    );

    this.darkModeSubject.next(dark);
  }
}