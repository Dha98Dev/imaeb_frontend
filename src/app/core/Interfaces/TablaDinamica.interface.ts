export interface TableColumn {
  key: string;
  label: string;
  filterable?: boolean;
  type?: 'text' | 'number' ;
  className?: string;
  icon?:string,
  iconClass?:string,
    // ✅ NUEVO: clase dinámica por celda
  cellClass?: (value: any, row: Row, col: TableColumn) => string | string[] | Record<string, boolean>;

}
 export interface DinamicTableData{
  columns:TableColumn[],
  data:any,
  globalSearchKeys:string[]
 }

export type Row = Record<string, any>;
