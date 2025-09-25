export interface conteoNivelDesempenioByGrupoAndCct {
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

export interface FilaPlano {
  grupo: string;
  insuficiente: number;
  elemental: number;
  basico: number;
  satisfactorio: number;
}

export interface MateriaPlano {
  materia: string;
  filas: FilaPlano[];
}