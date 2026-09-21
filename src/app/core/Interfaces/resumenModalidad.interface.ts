export interface ResumenNivelResponse {
  examenId: number;

  examen: string;

  nivelId: number;

  nivel: string;

  ciclo: number;

  tipoEvaluacion: string;

  generacion: number;

  resumenGeneral: ResumenEstadistico;

  modalidades: ResumenEstadistico[];

  materias: ResumenEstadistico[];

  unidades: ResumenUnidad[];

  municipios: ResumenMunicipio[];
}

export interface ResumenEstadistico {
  id: number;

  descripcion: string;

  totalAsistieron: number;

  totalParticipantes: number;

  totalSinRespuestas: number;

  puntajeObtenido: number;

  puntajeMaximo: number;

  porcentaje: number;
}

export interface ResumenUnidad {
  unidadId: number;

  unidad: string;

  materiaId: number;

  materia: string;

  totalAsistieron: number;

  totalParticipantes: number;

  totalSinRespuestas: number;

  puntajeObtenido: number;

  puntajeMaximo: number;

  porcentaje: number;
}

export interface ResumenMunicipio {
  municipioId: number;

  municipio: string;

  totalAsistieron: number;

  totalParticipantes: number;

  totalSinRespuestas: number;

  puntajeObtenido: number;

  puntajeMaximo: number;

  porcentaje: number;

  materias: ResumenEstadistico[];
}

/* ============================================================
   ESCUELAS MODALIDAD
============================================================ */

export interface EscuelasModalidadResponse {
  examenId: number;

  examen: string;

  nivelId: number;

  nivel: string;

  cicloId: number;

  ciclo: number;

  tipoEvaluacion: string;

  modalidadId: number;

  modalidad: string;

  generacion: number;

  paginacion: PaginacionModalidad;

  escuelas: EscuelaModalidad[];
}

export interface PaginacionModalidad {
  pagina: number;

  tamano: number;

  totalElementos: number;

  totalPaginas: number;

  primera: boolean;

  ultima: boolean;
}

export interface EscuelaModalidad {
  escuelaId: number;

  nombre: string;

  cct: string;

  turno: ReferenciaCatalogo | null;

  nivel: ReferenciaCatalogo | null;

  modalidad: ReferenciaCatalogo | null;

  dependencia: ReferenciaCatalogo | null;

  municipio: ReferenciaCatalogo | null;

  resultadoGeneralCentro: ResultadoGeneral | null;

  zona: ZonaEscuelaModalidad | null;

  sector: SectorEscuelaModalidad | null;
}

export interface ReferenciaCatalogo {
  id: number;

  descripcion: string;
}

export interface ResultadoGeneral {
  tieneResultados: boolean;

  totalAsistieron: number;

  totalParticipantes: number;

  totalSinRespuestas: number;

  puntajeObtenido: number;

  puntajeMaximo: number;

  porcentaje: number;
}

export interface ZonaEscuelaModalidad {
  id: number;

  numero: number;

  resultadoGeneralZona: ResultadoGeneral | null;
}

export interface SectorEscuelaModalidad {
  id: number;

  numero: number;

  resultadoGeneralSector: ResultadoGeneral | null;
}

/* ============================================================
   MODELOS DE VISTA
============================================================ */

export interface PromedioMateriaModalidad {
  materiaId: number;

  materia: string;

  porcentaje: number;
}

export interface ResultadoModalidadTabla {
  nivel: string;

  promedioNivel: number;

  modalidad: string;

  promedioModalidad: number;

  sector: number | null;

  promedioSector: number;

  zona: number | null;

  promedioZona: number;

  escuela: string;

  cct: string;

  turno: string;

  municipio: string;

  promedioCct: number;

  tieneResultados: boolean;
}
export interface ParamsEscuelasModalidad {
  modalidadId: number;
  examenId?: number;
  nivelId?: number;
  cicloId?: number;
  pagina?: number;
  tamano?: number;
}