export interface PromedioEstatalCct {
    cct: String,
    promedio: number,
    turno: string
}

export interface ParamsPromediosEstatales {
    nivelId?: number;
    materiaId?: number;
    escuelaId?: number;
    grupoId?: number;
    personaId?: number;
    modalidadId?: number;
    sectorId?: number;
    zonaId?: number;
    localidadId?:number;
    municipioId?:number;
}