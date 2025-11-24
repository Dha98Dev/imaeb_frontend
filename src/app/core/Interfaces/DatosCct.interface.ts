export interface DatosCct {
    cct:         string;
    nombre:      string;
    modalidad:   string;
    turnos:      Turno[];
    nivel:       string;
    idNivel:     number
    localidad:   string;
    municipio:   string;
    sector:      string;
    zonaEscolar: number;
    tipoZona:    string;
    grupos:      null;
}

export interface Turno {
    nombre: string;
    grupos: string[];
    idCctTurno:number
}
