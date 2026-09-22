import { Component, DestroyRef, inject } from '@angular/core';

import { Router } from '@angular/router';

import { MenuItem } from 'primeng/api';

import { combineLatest, distinctUntilChanged, filter } from 'rxjs';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { GetCctInfoSErvice } from '../../../core/services/Cct/GetCctInfo.service';

@Component({
  selector: 'app-layout-zona',
  standalone: false,
  templateUrl: './layout-zona.html',
  styleUrl: './layout-zona.scss',
})
export class LayoutZona {
  public nivel: string = '';
  public zona: string = '';
  public modalidad: string = '';

  public items: MenuItem[] = [];

  public tabActivo: string = 'Resultados de zona';

  private destroyRef = inject(DestroyRef);

  constructor(
    private router: Router,
    private cctService: GetCctInfoSErvice,
  ) {}

  ngOnInit(): void {
    combineLatest([this.cctService.nivel$, this.cctService.zona$, this.cctService.modalidad$])
      .pipe(
        filter(
          ([nivel, zona, modalidad]) =>
            nivel !== undefined &&
            nivel !== null &&
            nivel !== '' &&
            zona !== undefined &&
            zona !== null &&
            zona !== '' &&
            modalidad !== undefined &&
            modalidad !== null &&
            modalidad !== '',
        ),

        distinctUntilChanged(
          (anterior, actual) =>
            anterior[0] === actual[0] && anterior[1] === actual[1] && anterior[2] === actual[2],
        ),

        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(([nivel, zona, modalidad]) => {
        queueMicrotask(() => {
          this.nivel = String(nivel);

          this.zona = String(zona);

          this.modalidad = String(modalidad);

          this.construirTabs();
        });
      });
  }

  private construirTabs(): void {
    this.items = [
      {
        label: 'Resultados de zona',

        icon: 'pi pi-chart-bar',

        command: () => {
          this.router.navigate([
            '/sz/resultados-zona',
            btoa(this.nivel),
            btoa(this.zona),
            btoa(this.modalidad),
          ]);
        },
      },

      {
        label: `CCT de zona ${this.zona}`,

        icon: 'pi pi-building',

        command: () => {
          this.router.navigate([
            '/sz/cctstByZona',
            btoa(this.nivel),
            btoa(this.zona),
            btoa(this.modalidad),
          ]);
        },
      },
    ];
  }

  seleccionarTab(item: MenuItem, event: Event): void {
    this.tabActivo = item.label ?? '';

    item.command?.({
      originalEvent: event,
      item,
    });
  }
}
