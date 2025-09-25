export interface NivelesDempenio {
    materia: string;
    filas:   Fila[];
}

export interface Fila {
    grupo:  string;
    conteo: Conteo;
}

export interface Conteo {
    insuficiente:  number;
    elemental:     number;
    basico:        number;
    satisfactorio: number;
}
