export interface TableColumn {
  key: string;
  label: string;
  filterable?: boolean;
  type?: 'text' | 'number';
  className?: string;
  icon?:string,
  iconClass?:string
}
 export interface DinamicTableData{
  columns:TableColumn[],
  data:any,
  globalSearchKeys:string[]
 }

export type Row = Record<string, any>;
