export interface ConteoUtilizacionExamen {
  cct: string;
  grupo: string;
  noUtilizadas: number;
  porcentajeUtilizacion: number; // 0–100
  total: number;
  utilizadas: number;
}