import { Pregunta } from "./listadoAlumno.interface";

export interface Resultado {
    materia: string;
    idMateria: number;
    porcentajeAciertos: number;
}

export interface PorcentajeResultadoUnidadAnalisis {
    porcentajeAciertos: number,
    porcentajeDesaciertos: number,
    preguntas: Pregunta[],
    unidadDescripcion: string
    porcentajeEstatal?:number

}

export interface ResultadoPreguntasMateriaAumno {
    idMateria: string,
    nombre: string,
    preguntas: Pregunta[]
}
