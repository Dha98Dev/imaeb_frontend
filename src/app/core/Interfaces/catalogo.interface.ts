export interface catalogo {
    nivelId?: number,
    sector?: number,
    zonaEscolar?: number,
    modalidadId?:number
}

export interface responseCatalogo {
    centrosTrabajo: CentrosTrabajo[];
    sectores:       Sectores[];
    niveles:        Nivele[];
    zonas:          Zona[]
    modalidades:    singleModalidad[]
}
export interface singleModalidad{
    id:number,
    descripcion:string
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

export interface Zona {
    zonaEscolar: number;
}
export interface MunicipiosOrLocalidades{
    id:number,
    nombre:string
}
