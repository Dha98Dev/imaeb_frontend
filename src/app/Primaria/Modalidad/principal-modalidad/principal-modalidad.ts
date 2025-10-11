import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BreadCrumService } from '../../../core/services/breadCrumbs/bread-crumb-service';
import { CryptoJsService } from '../../../core/services/CriptoJs/cryptojs.service';
import { CatalogoService } from '../../../core/services/Catalogos/catalogo.service';
import { GetEstadisticaService } from '../../../core/services/EstadisticaPromedios/getEstadistica.service';
import { dataModalidad, resultadosModalidad, SectoresModalidad, zonasModalidad } from '../../../core/Interfaces/ResultadosModalidad.interface';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { CentrosTrabajo } from '../../../core/Interfaces/catalogo.interface';
import { DinamicTableData, TableColumn } from '../../../core/Interfaces/TablaDinamica.interface';
import { GetBackgroundService } from '../../../core/services/getColors/getBackground.service';
import { promedio } from '../../../sharedPages/estadistica-principal/estadistica-principal';

@Component({
  selector: 'app-principal-modalidad',
  standalone: false,
  templateUrl: './principal-modalidad.html',
  styleUrl: './principal-modalidad.scss'
})
export class PrincipalModalidad {
  constructor(private route: ActivatedRoute, private breadCrumbService: BreadCrumService, private cryptoJs: CryptoJsService, private catalogo: CatalogoService, private estadistica: GetEstadisticaService, private cd: ChangeDetectorRef, private getBgMateriaService: GetBackgroundService) { }
  public modalidad: string = ''
  public nivel: string = ''
  private idModalidad: string = ''
  public loader: boolean = false
  public resultados: resultadosModalidad[] = []
  public dataModalidad: dataModalidad = {} as dataModalidad
  public tableDinamica: DinamicTableData = {} as DinamicTableData
  public promediosMateriaByNivelAndModalidad:promedio[]=[]

  ngOnInit(): void {
    this.loader = true
    this.route.paramMap.subscribe(params => {
      this.idModalidad = params.get('modalidad') || '';
      this.nivel = params.get('nivel') || '';
      this.modalidad = this.cryptoJs.Desencriptar(this.cryptoJs.fromBase64Url(params.get('mod_des')!)) || ''
      this.getSectoresAndZonasAndCct()
      this.getPromedioMateriasByModalidadAndNivel()
      this.breadCrumbService.addItem({ jerarquia: 2, label: this.getnivelDescription() + ' ' + this.modalidad, urlLink: '/m/resultadosModalidad/' + this.nivel + '/' + this.idModalidad, icon: '' })

    });
  }


getPromedioMateriasByModalidadAndNivel(): void {
  const materias = this.nivel === '1' ? [1, 2] : [1, 3, 4];
  const nivelId = parseInt(this.nivel, 10);
  const modalidadId = parseInt(this.idModalidad, 10);

  // Limpia resultados anteriores (opcional)
  this.promediosMateriaByNivelAndModalidad = [];

  const requests$ = materias.map(m =>
    this.estadistica
      .getPromedioEstatalByNivel({ materiaId: m, nivelId, modalidadId })
      .pipe(
        map((resp: any[]) => ({
          materia: this.getNombreMateria(m),
          promedio: resp?.[0]?.promedio ?? 0,
          nivel: this.getnivelDescription()
        }))
      )
  );

  forkJoin(requests$).subscribe({
    next: (result) => {
      this.promediosMateriaByNivelAndModalidad = result;
      console.log(this.promediosMateriaByNivelAndModalidad);
    },
    error: (err) => console.error('Error obteniendo promedios por materia:', err)
  });
}

  getSectoresAndZonasAndCct(): void {
    const nivelId = parseInt(this.nivel, 10);
    const modalidadId = parseInt(this.idModalidad, 10);

    // Si es Secundaria (id = 3), no hay sectores: ir directo a zonas
    const source$ = (nivelId === 3)
      ? this.catalogo.getCatalogo({ nivelId, modalidadId }).pipe(
        map((resp: any) => resp?.zonas ?? []),
        // Por cada zona, obtener sus CCT
        switchMap((zonas: any[]) => {
          if (!zonas.length) return of<SectoresModalidad[]>([]);
          const zonaRequests = zonas.map((z: any) =>
            this.catalogo.getCatalogo({
              nivelId,
              modalidadId,
              zonaEscolar: z.zonaEscolar
            }).pipe(
              map((resp3: any) => {
                const ccts: CentrosTrabajo[] = resp3?.cct ?? resp3?.centrosTrabajo ?? resp3?.data ?? [];
                const zonaObj: zonasModalidad = { zona: z.zonaEscolar, cct: ccts };
                return zonaObj;
              })
            )
          );

          // Creamos un "sector virtual" (p.ej. 0) que agrupa todas las zonas
          return forkJoin(zonaRequests).pipe(
            map((zonasArr: zonasModalidad[]) => {
              const sectorVirtual: SectoresModalidad = { sector: 0, zonas: zonasArr };
              return [sectorVirtual];
            })
          );
        })
      )
      : this.catalogo.getCatalogo({ nivelId, modalidadId }).pipe(
        map((resp: any) => resp?.sectores ?? []),
        // Por cada sector, obtener sus zonas
        switchMap((sectores: any[]) => {
          if (!sectores.length) return of<SectoresModalidad[]>([]);
          const sectorRequests = sectores.map((sectorItem: any) =>
            this.catalogo.getCatalogo({ nivelId, modalidadId, sector: sectorItem.sector }).pipe(
              map((resp2: any) => resp2?.zonas ?? []),
              // Por cada zona del sector, obtener sus CCT
              switchMap((zonas: any[]) => {
                if (!zonas.length) {
                  const sectorObj: SectoresModalidad = { sector: sectorItem.sector, zonas: [] };
                  return of(sectorObj);
                }

                const zonaRequests = zonas.map((z: any) =>
                  this.catalogo.getCatalogo({
                    nivelId,
                    modalidadId,
                    sector: sectorItem.sector,
                    zonaEscolar: z.zonaEscolar
                  }).pipe(
                    map((resp3: any) => {
                      const ccts: CentrosTrabajo[] = resp3?.cct ?? resp3?.centrosTrabajo ?? resp3?.data ?? [];
                      const zonaObj: zonasModalidad = { zona: z.zonaEscolar, cct: ccts };
                      return zonaObj;
                    })
                  )
                );

                return forkJoin(zonaRequests).pipe(
                  map((zonasArr: zonasModalidad[]) => {
                    const sectorObj: SectoresModalidad = {
                      sector: sectorItem.sector,
                      zonas: zonasArr
                    };
                    return sectorObj;
                  })
                );
              })
            )
          );

          return forkJoin(sectorRequests);
        })
      );

    source$.subscribe({
      next: (sectoresConstruidos: SectoresModalidad[]) => {
        this.dataModalidad = {
          nivel: this.getnivelDescription(),
          modalidad: this.modalidad,
          sectores: sectoresConstruidos
        };
        this.cargarResultadosPromedios(); // si necesitas seguir el flujo
      },
      error: (err) => {
        this.dataModalidad = {
          nivel: this.getnivelDescription(),
          modalidad: this.modalidad,
          sectores: []
        };
      }
    });
  }


  cargarResultadosPromedios(): void {
    if (!this.dataModalidad || !this.dataModalidad.sectores?.length) {
      // No hay estructura; evita llamadas vacías
      this.resultados = [];
      return;
    }

    const nivelId = parseInt(this.nivel, 10);
    const modalidadId = parseInt(this.idModalidad, 10);
    const modalidadNombre = this.dataModalidad.modalidad ?? '';
    const esSecundaria = nivelId === 3;

    // 1) Promedios base (nivel y modalidad)
    const promNivel$ = this.estadistica.getPromedioEstatalByNivel({ nivelId }).pipe(
      map((resp: any[]) => resp?.[0]?.promedio ?? 0)
    );

    const promModalidad$ = this.estadistica.getPromedioEstatalByNivel({ nivelId, modalidadId }).pipe(
      map((resp: any[]) => resp?.[0]?.promedio ?? 0)
    );

    forkJoin({ promNivel: promNivel$, promModalidad: promModalidad$ })
      .pipe(
        // 2) Por cada “sector” (o sector virtual en secundaria), pedir su promedio/zonas/CCTs
        switchMap(({ promNivel, promModalidad }) => {
          const sectores = this.dataModalidad.sectores;

          const sectores$ = sectores.map(sectorItem => {
            // En secundaria NO hay sector: usar 0 y NO llamar promedio de sector
            const sectorId = esSecundaria ? 0 : sectorItem.sector;

            const promSector$ = esSecundaria
              ? of(0)
              : this.estadistica
                .getPromedioEstatalByNivel({ nivelId, modalidadId, sectorId })
                .pipe(map((r: any[]) => r?.[0]?.promedio ?? 0));

            // Por cada zona, pedir su promedio y luego cada CCT
            const zonas$ = sectorItem.zonas.map(z => {
              const zonaId = z.zona;

              const promZona$ = this.estadistica
                .getPromedioEstatalByNivel({ nivelId, modalidadId, zonaId })
                .pipe(map((r: any[]) => r?.[0]?.promedio ?? 0));

              const ccts$ = z.cct?.length
                ? forkJoin(
                  z.cct.map(ct =>
                    this.estadistica
                      .getPromedioEstatalByNivel({ escuelaId: ct.id })
                      .pipe(
                        map((r: any[]) => ({
                          cct: ct.cct,
                          promedioCct: r?.[0]?.promedio ?? 0
                        }))
                      )
                  )
                )
                : of([]); // sin CCTs

              return forkJoin({ promZona: promZona$, ccts: ccts$ }).pipe(
                map(({ promZona, ccts }) => ({
                  zonaId,
                  promZona,
                  ccts
                }))
              );
            });

            // Combinar zonas y el promedio de sector (0 si secundaria)
            return forkJoin(zonas$).pipe(
              switchMap(zonasInfo =>
                promSector$.pipe(
                  map(promSector => ({
                    promNivel,
                    promModalidad,
                    promSector,
                    sectorId,
                    zonasInfo
                  }))
                )
              )
            );
          });

          return forkJoin(sectores$);
        }),

        // 3) Aplanar a resultadosModalidad[]
        map((sectoresCompletos) => {
          const out: resultadosModalidad[] = [];

          sectoresCompletos.forEach(sec => {
            const { promNivel, promModalidad, promSector, sectorId, zonasInfo } = sec;

            zonasInfo.forEach(z => {
              const { zonaId, promZona, ccts } = z;

              if (ccts.length) {
                ccts.forEach(ct => {
                  out.push({
                    nivel: this.getnivelDescription(),
                    promedioNivel: promNivel,
                    modalidad: modalidadNombre,
                    promedioModalidad: promModalidad,
                    // En secundaria: valores 0 y las columnas se ocultan en la tabla
                    sector: sectorId,
                    promedioSector: promSector,
                    zona: zonaId,
                    promedioZona: promZona,
                    cct: ct.cct,
                    promedioCct: ct.promedioCct
                  });
                });
              } else {
                // Zona sin CCT: fila sin CCT (promedioCct = 0)
                out.push({
                  nivel: this.getnivelDescription(),
                  promedioNivel: promNivel,
                  modalidad: modalidadNombre,
                  promedioModalidad: promModalidad,
                  sector: sectorId,
                  promedioSector: promSector,
                  zona: zonaId,
                  promedioZona: promZona,
                  cct: '',
                  promedioCct: 0
                });
              }
            });
          });

          return out;
        })
      )
      .subscribe({
        next: (rows: resultadosModalidad[]) => {
          this.resultados = rows;

          // Para secundaria ocultamos columnas de sector con className (o condicional en template)
          const esSec = esSecundaria;

          this.tableDinamica = {
            columns: [
              { key: 'nivel', label: 'Nivel', type: 'number', filterable: false },
              { key: 'promedioNivel', label: 'Promedio Nivel', type: 'number' },
              { key: 'modalidad', label: 'Modalidad', type: 'text', filterable: true },

              // Oculta columnas de sector si es secundaria
              { key: 'sector', label: 'Sector', type: 'number', filterable: true, },
              { key: 'promedioSector', label: 'Promedio Sector', type: 'number', },

              { key: 'zona', label: 'Zona', type: 'number', filterable: true },
              { key: 'promedioZona', label: 'Promedio Zona', type: 'number' },
              { key: 'cct', label: 'Centro de Trabajo', type: 'text', filterable: true },
              { key: 'promedioCct', label: 'Promedio CCT', type: 'number' },
            ],
            data: this.resultados,
            globalSearchKeys: ['nivel', 'modalidad', 'sector', 'zona', 'cct']
          };
          this.cd.detectChanges()

        },
        error: (err) => {
          this.resultados = [];
        }
      });
  }


  getnivelDescription() {
    switch (this.nivel) {
      case '1': return 'Preescolar'
      case '2': return 'Primaria'
      case '3': return 'Secundaria'
      default: return ''
    }
  }
  getNombreMateria(materia: number) {
    return this.catalogo.getNombreMateria(materia)
  }
  getBgMateria(materia: string) {
    return this.getBgMateriaService.getBackgroundMateria(materia)
  }


}


