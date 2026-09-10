export interface catalogo {
  nivelId?: number;
  modalidadId?: number;
  sector?: number;
  zonaEscolar?: number;
}

export interface responseCatalogo {
  niveles: Nivele[] | null;
  modalidades: singleModalidad[] | null;
  sectores: Sectores[] | null;
  zonas: Zona[] | null;
  centrosTrabajo: CentrosTrabajo[] | null;
}

export interface singleModalidad {
  id: number;
  descripcion: string;
}

export interface Nivele {
  id: number;
  descripcion: string;
}

export interface Sectores {
  id: number;
  numero: number;
}

export interface Zona {
  id: number;
  numero: number;
}

export interface CentrosTrabajo {
  id: number;
  cct: string;
  nombre: string | null;
  turnoId: number;
  turno: string;
  nivelId: number;
  modalidadId: number;
  sector: number;
  zonaEscolar: number;
}

export interface MunicipiosOrLocalidades {
  id: number;
  nombre: string;
}

export interface CatalogoCiclos {
  id: number;
  anio: number;
}

export interface CatalogoExamen {
  id: number;
  descripcion: string;
  cicloId: number;
  ciclo: number;
  nivelId: number;
  nivel: string;
  tipoEvaluacion: string;
  puntajeMaximoPregunta: number;
}