import { Component, DestroyRef, inject } from '@angular/core';

import { Router } from '@angular/router';

import { MenuItem } from 'primeng/api';

import { combineLatest, distinctUntilChanged, filter } from 'rxjs';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { GetCctInfoSErvice } from '../../../core/services/Cct/GetCctInfo.service';

@Component({
  selector: 'app-layout-sector',
  standalone: false,
  templateUrl: './layout-sector.html',
  styleUrl: './layout-sector.scss',
})
export class LayoutSector {
  public nivel: string = '';
  public sector: string = '';
  public modalidad: string = '';

  public items: MenuItem[] = [];

  public tabActivo: string = 'Resultados del sector';

  private destroyRef = inject(DestroyRef);

  constructor(
    private router: Router,
    private cctService: GetCctInfoSErvice,
  ) {}

  ngOnInit(): void {
    combineLatest([this.cctService.nivel$, this.cctService.sector$, this.cctService.modalidad$])
      .pipe(
        filter(
          ([nivel, sector, modalidad]) =>
            nivel !== undefined &&
            nivel !== null &&
            nivel !== '' &&
            sector !== undefined &&
            sector !== null &&
            sector !== '' &&
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
      .subscribe(([nivel, sector, modalidad]) => {
        /*
         * Dejamos terminar el ciclo actual
         * de Angular antes de modificar
         * elementos que crean vistas.
         */
        queueMicrotask(() => {
          this.nivel = String(nivel);

          this.sector = String(sector);

          this.modalidad = String(modalidad);

          this.construirTabs();
        });
      });
  }

  private construirTabs(): void {
    this.items = [
      {
        label: 'Resultados del sector',

        icon: 'pi pi-chart-bar',

        command: () => {
          this.router.navigate([
            '/ss/resultados-sector',
            btoa(this.nivel),
            btoa(this.sector),
            btoa(this.modalidad),
          ]);
        },
      },

      {
        label: `Zonas del sector ${this.sector}`,

        icon: 'pi pi-list',

        command: () => {
          this.router.navigate([
            '/ss/zonasFromSector',
            btoa(this.nivel),
            btoa(this.sector),
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
