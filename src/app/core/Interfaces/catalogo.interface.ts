export interface catalogo {
  nivelId?: number;
  sector?: number;
  zonaEscolar?: number;
  modalidadId?: number;
}

export interface responseCatalogo {
  centrosTrabajo: CentrosTrabajo[];
  sectores: Sectores[];
  //   sectores: Sector[];
  niveles: Nivele[];
  zonas: Zona[];
  modalidades: singleModalidad[];
}
export interface singleModalidad {
  id: number;
  descripcion: string;
}

export interface CentrosTrabajo {
  id: number;
  cct: string;
  nombre: null;
}

export interface Nivele {
  id: number;
  descripcion: string;
}

// export interface Sectores {
//   sector: number;
// }
export interface Sectores {
  id: number;
  numero: number;
}

export interface Zona {
  id: number;
  zona: number;
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