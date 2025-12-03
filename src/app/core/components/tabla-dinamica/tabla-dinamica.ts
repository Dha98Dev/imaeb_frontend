import { Component, computed, EventEmitter, Input, Output, signal, SimpleChanges } from '@angular/core';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TableColumn } from '../../Interfaces/TablaDinamica.interface';


export interface DinamicTableData{
  columns:TableColumn[],
  data:any,
  globalSearchKeys:string[]
}
export type Row = Record<string, any>;

@Component({
  selector: 'app-tabla-dinamica',
  standalone: false,
  templateUrl: './tabla-dinamica.html',
  styleUrl: './tabla-dinamica.scss'
})
export class TablaDinamica {
  @Input() data: Row[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() globalSearchKeys?: string[];
  @Output() rowClick = new EventEmitter<Row>();

  // ===== Estado existente =====
  filtroGlobal = signal<string>('');
  filtrosPorCol = signal<Record<string, string>>({});
  sortKey = signal<string>('');
  sortDir = signal<'asc' | 'desc'>('asc');

  // ===== 🆕 Estado de paginación =====
  page = signal<number>(1);
  pageSize = signal<number>(10);
  pageSizeOptions = [10, 25, 50, 100];

  // Helpers normalización
  private normalize = (v: any) =>
    String(v ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  // ===== Pipeline de datos: filtro/orden =====
  filteredSortedData = computed(() => {
    let rows = [...(this.data ?? [])];

    // filtro global
    const g = this.normalize(this.filtroGlobal());
    if (g) {
      const keys = this.globalSearchKeys?.length
        ? this.globalSearchKeys
        : Array.from(new Set(this.columns.map(c => c.key)));
      rows = rows.filter(r => keys.some(k => this.normalize(r[k]).includes(g)));
    }

    // filtros por columna
    const colFilters = this.filtrosPorCol();
    const colKeys = Object.keys(colFilters).filter(k => (colFilters[k] ?? '').toString().trim() !== '');
    if (colKeys.length) {
      rows = rows.filter(r =>
        colKeys.every(k => this.normalize(r[k]).includes(this.normalize(colFilters[k])))
      );
    }

    // orden
    const key = this.sortKey();
    if (key) {
      const dir = this.sortDir();
      rows.sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        if (av == null && bv == null) return 0;
        if (av == null) return dir === 'asc' ? -1 : 1;
        if (bv == null) return dir === 'asc' ? 1 : -1;

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

  // ===== 🆕 Paginación sobre el dataset ya filtrado/ordenado =====
  totalItems = computed(() => this.filteredSortedData().length);
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));

  pagedData = computed(() => {
    const p = Math.min(this.page(), this.totalPages());
    const size = this.pageSize();
    const start = (p - 1) * size;
    return this.filteredSortedData().slice(start, start + size);
  });

  // Rangos mostrados ("Mostrando X–Y de N")
  startIndex = computed(() => this.totalItems() ? (this.page() - 1) * this.pageSize() + 1 : 0);
  endIndex   = computed(() => Math.min(this.page() * this.pageSize(), this.totalItems()));

  // Ventana de páginas (ej. 2 antes y 2 después)
  pagesWindow = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    const from = Math.max(1, current - 2);
    const to = Math.min(total, current + 2);
    const arr: number[] = [];
    for (let i = from; i <= to; i++) arr.push(i);
    return arr;
  });

  // ===== Ciclo de vida =====
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns']) {
      const cols = changes['columns'].currentValue as TableColumn[] | undefined;
      if (!Array.isArray(cols) || cols.length === 0) {
        this.filtrosPorCol.set({});
        return;
      }
      const init: Record<string, string> = {};
      for (const c of cols) init[c.key] = '';
      this.filtrosPorCol.set(init);
      this.page.set(1); // reset paginación cuando cambian columnas
    }
  }

  // ===== Interacciones =====
  onHeaderClick(col: TableColumn) {
    if (!col?.key) return;
    if (this.sortKey() === col.key) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(col.key);
      this.sortDir.set('asc');
    }
    this.page.set(1); // reset página al ordenar
  }

  onRowClick(row: Row) {
    this.rowClick.emit(row);
  }

  trackByIndex = (_: number, __: any) => _;

  // 🔎 Búsqueda global con reset de página
  setFiltroGlobal(value: string) {
    this.filtroGlobal.set(value ?? '');
    this.page.set(1);
  }

  updateFiltro(key: string, value: string) {
    this.filtrosPorCol.set({ ...this.filtrosPorCol(), [key]: value ?? '' });
    this.page.set(1);
  }

  // 🆕 Paginación: handlers
  onChangePageSize(val: number) {
    const parsed = Number(val) || 10;
    this.pageSize.set(parsed);
    this.page.set(1);
  }
  goToPage(p: number) { this.page.set(Math.min(Math.max(1, p), this.totalPages())); }
  nextPage()          { this.goToPage(this.page() + 1); }
  prevPage()          { this.goToPage(this.page() - 1); }
  goToFirst()         { this.goToPage(1); }
  goToLast()          { this.goToPage(this.totalPages()); }

  // ===== Exportaciones / copiar =====
  private getVisibleRows(): Row[] {
    // Exportar/copiar SIEMPRE usa el dataset filtrado/ordenado completo (no sólo la página actual)
    return this.filteredSortedData();
  }

  private asLabeledRows(): any[] {
    const rows = this.getVisibleRows();
    const cols = this.columns ?? [];
    return rows.map(r => {
      const obj: any = {};
      cols.forEach(c => obj[c.label] = r[c.key] ?? '');
      return obj;
    });
  }

  exportToExcel(): void {
    const labeled = this.asLabeledRows();
    const ws = XLSX.utils.json_to_sheet(labeled);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    const file = `tabla_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.xlsx`;
    XLSX.writeFile(wb, file);
  }

  async copyToClipboard(): Promise<void> {
    const rows = this.getVisibleRows();
    const cols = this.columns ?? [];
    const header = cols.map(c => c.label).join('\t');
    const body = rows.map(r => cols.map(c => (r[c.key] ?? '')).join('\t')).join('\n');
    const tsv = `${header}\n${body}`;
    await navigator.clipboard.writeText(tsv);
  }

  exportToPDF(): void {
    const rows = this.getVisibleRows();
    const cols = this.columns ?? [];
    const head = [cols.map(c => c.label)];
    const body = rows.map(r => cols.map(c => r[c.key] ?? ''));

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt' });
    autoTable(doc, {
      head,
      body,
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [240, 240, 240], textColor: 20 },
      didDrawPage: () => {
        doc.setFontSize(10);
        doc.text('Exportación de tabla', 40, 30);
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.text(new Date().toLocaleString(), pageWidth - 40, 30, { align: 'right' });
      },
      margin: { top: 50, right: 30, bottom: 30, left: 30 },
    });

    const file = `tabla_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.pdf`;
    doc.save(file);
  }
}
