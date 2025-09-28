import { Component, computed, EventEmitter, Input, Output, signal, SimpleChanges } from '@angular/core';
import { Row, TableColumn } from '../../Interfaces/TablaDinamica.interface';



@Component({
  selector: 'app-tabla-dinamica',
  standalone: false,
  templateUrl: './tabla-dinamica.html',
  styleUrl: './tabla-dinamica.scss'
})
export class TablaDinamica {
 @Input() data: Row[] = [];
  @Input() columns: TableColumn[] = [];
  /** Si lo pasas, la búsqueda global se limitará a estas llaves; si no, busca en todas */
  @Input() globalSearchKeys?: string[];

  @Output() rowClick = new EventEmitter<Row>();

  // estado
  filtroGlobal = signal<string>('');
  filtrosPorCol = signal<Record<string, string>>({});
  sortKey = signal<string>('');
  sortDir = signal<'asc' | 'desc'>('asc');

  // normaliza acentos
  private normalize = (v: any) =>
    String(v ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  // dataset filtrado + ordenado (reactivo)
  visibleData = computed(() => {
    let rows = [...(this.data ?? [])];

    // global filter
    const g = this.normalize(this.filtroGlobal());
    if (g) {
      const keys = this.globalSearchKeys?.length
        ? this.globalSearchKeys
        : Array.from(new Set(this.columns.map(c => c.key)));

      rows = rows.filter(r =>
        keys.some(k => this.normalize(r[k]).includes(g))
      );
    }

    // column filters
    const colFilters = this.filtrosPorCol();
    const colKeys = Object.keys(colFilters).filter(k => (colFilters[k] ?? '').toString().trim() !== '');
    if (colKeys.length) {
      rows = rows.filter(r =>
        colKeys.every(k => this.normalize(r[k]).includes(this.normalize(colFilters[k])))
      );
    }

    // sort
    const key = this.sortKey();
    if (key) {
      const dir = this.sortDir();
      rows.sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        if (av == null && bv == null) return 0;
        if (av == null) return dir === 'asc' ? -1 : 1;
        if (bv == null) return dir === 'asc' ? 1 : -1;

        // numérico si ambos son números, si no, string
        const an = typeof av === 'number' && !isNaN(av);
        const bn = typeof bv === 'number' && !isNaN(bv);
        if (an && bn) return dir === 'asc' ? av - bv : bv - av;

        const as = this.normalize(av);
        const bs = this.normalize(bv);
        return dir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as);
      });
    }

    return rows;
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns']) {
      // inicializa filtros por columna
      const init: Record<string, string> = {};
      for (const c of this.columns) init[c.key] = '';
      this.filtrosPorCol.set(init);
    }
  }

  onHeaderClick(col: TableColumn) {
    if (!col?.key) return;
    if (this.sortKey() === col.key) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(col.key);
      this.sortDir.set('asc');
    }
  }

  onRowClick(row: Row) {
    this.rowClick.emit(row);
  }

  trackByIndex = (_: number, __: any) => _;
  updateFiltro(key: string, value: string) {
    this.filtrosPorCol.set({
      ...this.filtrosPorCol(),
      [key]: value
    });
  }
}
