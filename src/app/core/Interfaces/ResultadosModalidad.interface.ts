import { CentrosTrabajo } from './catalogo.interface';

export interface zonasModalidad {
  zonaId: number;
  zona: number;
  cct: CentrosTrabajo[];
}

export interface SectoresModalidad {
  sectorId: number;
  sector: number;
  zonas: zonasModalidad[];
}

export interface dataModalidad {
  nivel: string;
  modalidad: string;
  sectores: SectoresModalidad[];
}

export interface resultadosModalidad {
  nivel: string;
  promedioNivel: number;

  modalidad: string;
  promedioModalidad: number;

  sector: number;
  promedioSector: number;

  zona: number;
  promedioZona: number;

  cct: string;
  promedioCct: number;
}
