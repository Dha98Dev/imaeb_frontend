export interface catalogo {
    nivelId?: number,
    sector?: number,
    zonaEscolar?: number
}

export interface responseCatalogo {
    centrosTrabajo: CentrosTrabajo[];
    sectores:       Sectores[];
    niveles:        Nivele[];
}

export interface CentrosTrabajo {
    id:     number;
    cct:    string;
    nombre: null;
}

export interface Nivele {
    id:          number;
    descripcion: string;
}

export interface Sectores {
    sector: number;
}
