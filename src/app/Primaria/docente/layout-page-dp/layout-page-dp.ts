import { Component, DestroyRef, inject } from '@angular/core';

import { Router } from '@angular/router';

import { MenuItem } from 'primeng/api';

import { combineLatest, distinctUntilChanged, filter } from 'rxjs';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { GetCctInfoSErvice } from '../../../core/services/Cct/GetCctInfo.service';

import { datosCct } from '../../../core/Interfaces/listadoAlumno.interface';

import { CryptoJsService } from '../../../core/services/CriptoJs/cryptojs.service';

@Component({
  selector: 'app-layout-page-dp',
  standalone: false,
  templateUrl: './layout-page-dp.html',
  styleUrl: './layout-page-dp.scss',
})
export class LayoutPageDP {
  public items: MenuItem[] = [];

  public tabActivo: string = 'Resultados del grupo';

  public grupo: string = '';

  public cct: string = '';

  public datosCct: datosCct = {} as datosCct;

  private destroyRef = inject(DestroyRef);

  constructor(
    private router: Router,
    private cctService: GetCctInfoSErvice,
    private crypto: CryptoJsService,
  ) {}

  ngOnInit(): void {
    combineLatest([this.cctService.cct$, this.cctService.grupo$, this.cctService.centroTrabajo$])
      .pipe(
        filter(
          ([cct, grupo, centroTrabajo]) =>
            cct !== undefined &&
            cct !== null &&
            cct !== '' &&
            grupo !== undefined &&
            grupo !== null &&
            grupo !== '' &&
            centroTrabajo !== undefined &&
            centroTrabajo !== null,
        ),

        distinctUntilChanged(
          (anterior, actual) =>
            anterior[0] === actual[0] && anterior[1] === actual[1] && anterior[2] === actual[2],
        ),

        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(([cct, grupo, centroTrabajo]) => {
        queueMicrotask(() => {
          this.cct = String(cct);

          this.grupo = String(grupo);

          this.datosCct = centroTrabajo;

          this.construirTabs();
        });
      });
  }

  private construirTabs(): void {
    const items: MenuItem[] = [
      {
        label: 'Resultados del grupo',

        icon: 'pi pi-chart-bar',

        command: () => {
          this.router.navigate([
            '/prim_2/resultados-grupo',
            this.crypto.Encriptar(this.cct),
            this.grupo,
          ]);
        },
      },

      {
        label: 'Listado de alumnos',

        icon: 'pi pi-users',

        command: () => {
          this.router.navigate([
            '/prim_2/listado-grupo',
            this.crypto.Encriptar(this.cct),
            this.grupo,
          ]);
        },
      },
    ];

    /*
     * Para Preescolar no mostramos
     * resultados por área.
     */
    if (this.datosCct?.nivel?.toLowerCase() !== 'preescolar') {
      items.push({
        label: 'Resultados por área',

        icon: 'pi pi-chart-line',

        command: () => {
          this.router.navigate([
            '/prim_2/resultados-grupo-area',
            this.crypto.Encriptar(this.cct),
            this.grupo,
          ]);
        },
      });
    }

    /*
     * Reemplazamos todo el arreglo.
     *
     * No hacemos this.items.push()
     * para evitar duplicados.
     */
    this.items = items;
  }

  seleccionarTab(item: MenuItem, event: Event): void {
    this.tabActivo = item.label ?? '';

    item.command?.({
      originalEvent: event,
      item,
    });
  }
}
